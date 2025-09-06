import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createParticipantSlackChannel } from "@/lib/slack/channel";

export async function POST() {
  try {
    const supabase = await createClient();

    // 締切を過ぎて未確定のイベントを取得
    const now = new Date().toISOString();
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("is_finalized", false)
      .lt("deadline", now);

    if (eventsError) {
      console.error("Events fetch error:", eventsError);
      return NextResponse.json(
        { error: "イベントの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "確定対象のイベントはありません",
        processed_count: 0,
      });
    }

    console.log(`Found ${events.length} events to finalize`);

    const results = [];

    for (const event of events) {
      try {
        console.log(`Processing event: ${event.name} (ID: ${event.id})`);

        // 候補日を取得
        const { data: candidates, error: candidatesError } = await supabase
          .from("candidate_date")
          .select("*")
          .eq("event_id", event.id);

        if (candidatesError) {
          console.error("Candidates fetch error:", candidatesError);
          continue;
        }

        // イベントメンバーを取得
        const { data: members, error: membersError } = await supabase
          .from("event_members")
          .select("*")
          .eq("event_id", event.id);

        if (membersError) {
          console.error("Members fetch error:", membersError);
          continue;
        }

        // 投票を取得
        const memberIds = members?.map((m) => m.id) || [];
        const { data: votes, error: votesError } =
          memberIds.length > 0
            ? await supabase
                .from("vote_date")
                .select("*")
                .in("event_member_id", memberIds)
            : { data: [], error: null };

        if (votesError) {
          console.error("Votes fetch error:", votesError);
          continue;
        }

        // 主催者のメンバーIDを取得
        const ownerMember = members?.find((m) => m.user_id === event.owner_id);
        let ownerYesCandidates: number[] = [];

        if (ownerMember) {
          const ownerVotes =
            votes?.filter((v) => v.event_member_id === ownerMember.id) || [];
          ownerYesCandidates = ownerVotes
            .filter((v) => v.is_yes === true)
            .map((v) => v.candidate_id);
        }

        if (ownerYesCandidates.length === 0) {
          // 主催者が投票していない場合は、全候補日を対象とする
          ownerYesCandidates = candidates?.map((c) => c.id) || [];
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
          .eq("id", event.id);

        if (updateError) {
          console.error("Event update error:", updateError);
          continue;
        }

        // 参加者専用Slackチャンネルを作成
        if (recommendedDate) {
          await createParticipantSlackChannel({
            event,
            votes: votes || [],
            finalizedDate: recommendedDate,
            members: members || [],
          });
        }

        results.push({
          event_id: event.id,
          event_name: event.name,
          recommended_date: recommendedDate,
          participant_count: maxCount,
        });

        console.log(
          `Event ${event.name} finalized with date: ${recommendedDate}`
        );
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      message: "自動確定処理が完了しました",
      processed_count: results.length,
      results,
    });
  } catch (error) {
    console.error("Auto-finalize error:", error);
    return NextResponse.json(
      { error: "自動確定処理でエラーが発生しました" },
      { status: 500 }
    );
  }
}
