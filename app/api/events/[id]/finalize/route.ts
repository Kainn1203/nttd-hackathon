import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/action";
import { getMe } from "@/lib/supabase/me";
import { createParticipantSlackChannel } from "@/lib/slack/channel";

interface VoteData {
  id: number;
  event_member_id: number;
  candidate_id: number;
  is_yes: boolean;
  created_at: string;
}

interface CandidateData {
  id: number;
  event_id: number;
  candidate_date: string;
  created_at: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== Event Finalize API Called ===");
    const supabase = await createActionClient();
    const me = await getMe();
    const { id } = await params;

    console.log("Authenticated user:", me?.id);
    console.log("Event ID from params:", id);

    if (!me) {
      console.log("No authenticated user");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const eventId = Number(id);
    console.log("Parsed event ID:", eventId);
    if (!Number.isFinite(eventId)) {
      console.log("Invalid event ID");
      return NextResponse.json(
        { error: "無効なイベントIDです" },
        { status: 400 }
      );
    }

    // イベントの存在確認と権限チェック
    console.log("Fetching event with ID:", eventId);
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Event fetch error:", eventError);
      return NextResponse.json(
        { error: "イベントの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!event) {
      console.log("Event not found");
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    console.log("Event found:", event.name, "Owner:", event.owner_id);

    if (event.owner_id !== me.id) {
      console.log(
        "Permission denied. Event owner:",
        event.owner_id,
        "Current user:",
        me.id
      );
      return NextResponse.json(
        { error: "イベントの確定権限がありません" },
        { status: 403 }
      );
    }

    if (event.is_finalized) {
      console.log("Event already finalized");
      return NextResponse.json(
        { error: "このイベントは既に確定済みです" },
        { status: 400 }
      );
    }

    console.log("Permission check passed, proceeding with finalization");

    // 候補日と投票データを取得
    console.log("Fetching candidates for event:", eventId);
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidate_date")
      .select("*")
      .eq("event_id", eventId);

    if (candidatesError) {
      console.error("Fetch candidates error:", candidatesError);
      return NextResponse.json(
        { error: "候補日データの取得に失敗しました" },
        { status: 500 }
      );
    }

    console.log("Candidates found:", candidates?.length || 0);

    // イベントメンバーを取得
    console.log("Fetching members for event:", eventId);
    const { data: members, error: membersError } = await supabase
      .from("event_members")
      .select("*")
      .eq("event_id", eventId);

    if (membersError) {
      console.error("Members fetch error:", membersError);
      return NextResponse.json(
        { error: "メンバーデータの取得に失敗しました" },
        { status: 500 }
      );
    }

    console.log("Members found:", members?.length || 0);

    console.log("Fetching votes for event:", eventId);
    // メンバーIDを取得してから投票を取得
    const memberIds = members?.map((m) => m.id) || [];
    const { data: votes, error: votesError } =
      memberIds.length > 0
        ? await supabase
            .from("vote_date")
            .select("*")
            .in("event_member_id", memberIds)
        : { data: [], error: null };

    if (votesError) {
      console.error("Fetch votes error:", votesError);
      return NextResponse.json(
        { error: "投票データの取得に失敗しました" },
        { status: 500 }
      );
    }

    console.log("Votes found:", votes?.length || 0);

    // 主催者のメンバーIDを取得
    console.log("Looking for owner member. Owner ID:", me.id);
    const ownerMember = members?.find((m) => m.user_id === me.id);
    let ownerVotes: VoteData[] = [];
    let ownerYesCandidates: number[] = [];

    if (!ownerMember) {
      console.log("Owner not found in members, creating new member");
      // 主催者がメンバーに登録されていない場合は、自動的に登録
      const { data: newMember, error: memberCreateError } = await supabase
        .from("event_members")
        .insert({
          event_id: eventId,
          user_id: me.id,
          joind_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (memberCreateError || !newMember) {
        console.error("Failed to create owner member:", memberCreateError);
        return NextResponse.json(
          { error: "主催者のメンバー登録に失敗しました" },
          { status: 500 }
        );
      }

      console.log("Owner member created with ID:", newMember.id);
      // 新しく作成したメンバー情報を使用（投票なし）
      ownerVotes = [];
      ownerYesCandidates = [];
    } else {
      console.log("Owner member found with ID:", ownerMember.id);
      // 既存のメンバーの場合
      const ownerMemberId = ownerMember.id;

      // 主催者の投票を確認
      ownerVotes =
        (votes as VoteData[])?.filter(
          (v) => v.event_member_id === ownerMemberId
        ) || [];
      ownerYesCandidates = ownerVotes
        .filter((v) => v.is_yes === true)
        .map((v) => v.candidate_id);

      console.log(
        "Owner votes found:",
        ownerVotes.length,
        "Yes votes:",
        ownerYesCandidates.length
      );
    }

    if (ownerYesCandidates.length === 0) {
      // 主催者が投票していない場合は、全候補日を対象とする
      ownerYesCandidates = candidates?.map((c) => c.id) || [];
      console.log(
        "Owner has no votes, using all candidates:",
        ownerYesCandidates
      );
    }

    // 各候補日の参加可能人数を計算
    const candidateStats = new Map<number, number>();
    ownerYesCandidates.forEach((candidateId) => {
      const yesCount =
        (votes as VoteData[])?.filter(
          (v) => v.candidate_id === candidateId && v.is_yes === true
        ).length || 0;
      candidateStats.set(candidateId, yesCount);
    });

    // 参加人数が最大の候補日を選択（同点の場合は最も早い日）
    let recommendedCandidateId = ownerYesCandidates[0];
    let maxCount = candidateStats.get(recommendedCandidateId) || 0;

    ownerYesCandidates.forEach((candidateId) => {
      const count = candidateStats.get(candidateId) || 0;
      const candidate = (candidates as CandidateData[])?.find(
        (c) => c.id === candidateId
      );
      const recommendedCandidate = (candidates as CandidateData[])?.find(
        (c) => c.id === recommendedCandidateId
      );

      if (
        count > maxCount ||
        (count === maxCount &&
          candidate &&
          recommendedCandidate &&
          candidate.candidate_date < recommendedCandidate.candidate_date)
      ) {
        recommendedCandidateId = candidateId;
        maxCount = count;
      }
    });

    const recommendedCandidate = (candidates as CandidateData[])?.find(
      (c) => c.id === recommendedCandidateId
    );
    const recommendedDate = recommendedCandidate?.candidate_date;

    // イベントを確定
    const { error: updateError } = await supabase
      .from("events")
      .update({
        is_finalized: true,
        finalized_date: recommendedDate,
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Event finalization error:", updateError);
      return NextResponse.json(
        { error: "イベントの確定に失敗しました" },
        { status: 500 }
      );
    }

    // 参加者専用Slackチャンネルを作成
    if (recommendedDate) {
      console.log("Creating participant Slack channel...");
      try {
        await createParticipantSlackChannel({
          event,
          votes: votes as VoteData[],
          finalizedDate: recommendedDate,
          members: members || [],
        });
        console.log("Slack channel created successfully");
      } catch (error) {
        console.error("Failed to create Slack channel:", error);
        // Slackチャンネル作成に失敗してもイベント確定は続行
      }
    }

    return NextResponse.json({
      message: "イベントが確定されました",
      recommended_date: recommendedDate,
      participant_count: Math.round(maxCount),
    });
  } catch (error) {
    console.error("=== Event finalization error ===");
    console.error("Error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
