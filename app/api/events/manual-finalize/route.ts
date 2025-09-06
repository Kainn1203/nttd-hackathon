import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createParticipantSlackChannel } from "@/lib/slack/channel";

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "イベントIDが必要です" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // イベントの存在確認
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    if (event.is_finalized) {
      return NextResponse.json(
        { error: "このイベントは既に確定済みです" },
        { status: 400 }
      );
    }

    // 候補日を取得
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidate_date")
      .select("*")
      .eq("event_id", eventId);

    if (candidatesError) {
      return NextResponse.json(
        { error: "候補日データの取得に失敗しました" },
        { status: 500 }
      );
    }

    // イベントメンバーを取得
    const { data: eventMembers, error: membersError } = await supabase
      .from("event_members")
      .select("*")
      .eq("event_id", eventId);

    if (membersError) {
      return NextResponse.json(
        { error: "メンバーデータの取得に失敗しました" },
        { status: 500 }
      );
    }

    // メンバーIDを取得してから投票を取得
    const memberIds = eventMembers?.map((m) => m.id) || [];
    const { data: votes, error: votesError } =
      memberIds.length > 0
        ? await supabase
            .from("vote_date")
            .select("*")
            .in("event_member_id", memberIds)
        : { data: [], error: null };

    if (votesError) {
      return NextResponse.json(
        { error: "投票データの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 主催者のメンバーIDを取得
    const ownerMember = eventMembers?.find((m) => m.user_id === event.owner_id);
    if (!ownerMember) {
      return NextResponse.json(
        { error: "主催者がイベントメンバーに登録されていません" },
        { status: 400 }
      );
    }

    // 主催者の投票を確認
    const ownerVotes =
      votes?.filter((v) => v.event_member_id === ownerMember.id) || [];
    const ownerYesCandidates = ownerVotes
      .filter((v) => v.is_yes === true)
      .map((v) => v.candidate_id);

    if (ownerYesCandidates.length === 0) {
      // 主催者が投票していない場合は、全候補日を対象とする
      ownerYesCandidates.push(...(candidates?.map((c) => c.id) || []));
    }

    // 各候補日の参加可能人数を計算
    const candidateStats = new Map<number, number>();
    ownerYesCandidates.forEach((candidateId) => {
      const yesCount =
        votes?.filter(
          (v) => v.candidate_id === candidateId && v.is_yes === true
        ).length || 0;
      candidateStats.set(candidateId, yesCount);
    });

    // 参加人数が最大の候補日を選択（同点の場合は最も早い日）
    let recommendedCandidateId = ownerYesCandidates[0];
    let maxCount = candidateStats.get(recommendedCandidateId) || 0;

    ownerYesCandidates.forEach((candidateId) => {
      const count = candidateStats.get(candidateId) || 0;
      const candidate = candidates?.find((c) => c.id === candidateId);
      const recommendedCandidate = candidates?.find(
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

    const recommendedCandidate = candidates?.find(
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
      return NextResponse.json(
        { error: "イベントの確定に失敗しました" },
        { status: 500 }
      );
    }

    // 参加者専用Slackチャンネルを作成
    if (recommendedDate) {
      await createParticipantSlackChannel({
        event,
        votes: votes || [],
        finalizedDate: recommendedDate,
        members: eventMembers || [],
      });
    }

    return NextResponse.json({
      message: "イベントが確定されました",
      event_id: eventId,
      recommended_date: recommendedDate,
      participant_count: maxCount,
    });
  } catch (error) {
    console.error("Manual finalize error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
