import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/action";
import { getMe } from "@/lib/supabase/me";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createActionClient();
    const me = await getMe();

    if (!me) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { votes } = body;

    if (!Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: "投票データが不正です" },
        { status: 400 }
      );
    }

    // イベントの存在確認と締切チェック
    const eventId = votes[0].event_id;
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
        { error: "このイベントは確定済みです" },
        { status: 400 }
      );
    }

    if (new Date(event.deadline) < new Date()) {
      return NextResponse.json(
        { error: "投票締切日を過ぎています" },
        { status: 400 }
      );
    }

    // 人数制限チェック
    const { data: currentMembers, error: membersError } = await supabase
      .from("event_members")
      .select("id, user_id")
      .eq("event_id", eventId);

    if (membersError) {
      console.error("Members fetch error:", membersError);
      return NextResponse.json(
        { error: "参加者数の確認に失敗しました" },
        { status: 500 }
      );
    }

    const currentMemberCount = currentMembers?.length || 0;
    const isExistingMember = currentMembers?.some((m) => m.user_id === me.id);

    // 新規参加者の場合のみ人数制限をチェック
    if (!isExistingMember && currentMemberCount >= event.max_participants) {
      return NextResponse.json(
        {
          error: `このイベントの参加者数が上限（${event.max_participants}名）に達しています`,
          current_count: currentMemberCount,
          max_participants: event.max_participants,
        },
        { status: 400 }
      );
    }

    // イベントメンバーを取得または作成
    const { data: existingMember } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", me.id)
      .single();

    let memberId: number;
    if (existingMember) {
      memberId = existingMember.id;
    } else {
      // 新しいメンバーを作成
      const { data: newMember, error: memberError } = await supabase
        .from("event_members")
        .insert({
          event_id: eventId,
          user_id: me.id,
          joind_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (memberError || !newMember) {
        return NextResponse.json(
          { error: "メンバー登録に失敗しました" },
          { status: 500 }
        );
      }
      memberId = newMember.id;
    }

    // 既存の投票を削除
    const { error: deleteError } = await supabase
      .from("vote_date")
      .delete()
      .eq("event_member_id", memberId);

    if (deleteError) {
      console.error("Delete existing votes error:", deleteError);
      return NextResponse.json(
        { error: "既存の投票の削除に失敗しました" },
        { status: 500 }
      );
    }

    // 新しい投票を挿入
    const voteData = votes.map((vote) => ({
      event_member_id: memberId,
      candidate_id: vote.candidate_id,
      is_yes: vote.is_yes,
    }));

    const { data: newVotes, error: insertError } = await supabase
      .from("vote_date")
      .insert(voteData)
      .select();

    if (insertError) {
      console.error("Insert votes error:", insertError);
      return NextResponse.json(
        { error: "投票の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "投票を保存しました",
      votes: newVotes,
    });
  } catch (error) {
    console.error("Event vote error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
