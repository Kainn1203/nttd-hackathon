import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/action";
import { getMe } from "@/lib/supabase/me";
import { searchSlackChannelByEventName } from "@/lib/slack/search";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createActionClient();
    const me = await getMe();

    if (!me) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "無効なイベントIDです" },
        { status: 400 }
      );
    }

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

    if (!event.is_finalized) {
      return NextResponse.json(
        { error: "イベントが確定されていません" },
        { status: 400 }
      );
    }

    // ユーザーがイベントの参加者かチェック
    const { data: eventMember, error: memberError } = await supabase
      .from("event_members")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", me.id)
      .single();

    if (memberError || !eventMember) {
      return NextResponse.json(
        { error: "このイベントの参加者ではありません" },
        { status: 403 }
      );
    }

    // ユーザーの投票を確認（参加可能な場合のみ）
    const { data: votes, error: votesError } = await supabase
      .from("vote_date")
      .select("*")
      .eq("event_member_id", eventMember.id)
      .eq("is_yes", true);

    if (votesError) {
      console.error("Votes fetch error:", votesError);
      return NextResponse.json(
        { error: "投票データの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 参加可能な投票がない場合は参加者ではない
    if (!votes || votes.length === 0) {
      return NextResponse.json(
        { error: "このイベントの参加者ではありません" },
        { status: 403 }
      );
    }

    // 共通関数を使用してSlackチャンネルを検索
    try {
      const channelInfo = await searchSlackChannelByEventName(event.name);

      if (!channelInfo) {
        return NextResponse.json(
          { error: "Slackチャンネルが見つかりません" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...channelInfo,
        message: "Slackチャンネル情報を取得しました",
      });
    } catch (searchError) {
      console.error("Slack channel search error:", searchError);
      return NextResponse.json(
        {
          error:
            searchError instanceof Error
              ? searchError.message
              : "Slackチャンネルの検索に失敗しました",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Slack channel fetch error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
