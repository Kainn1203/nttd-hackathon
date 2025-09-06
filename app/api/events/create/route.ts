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
    const {
      name,
      description,
      location,
      deadline,
      max_participants,
      image_path,
      candidate_dates,
    } = body;

    // バリデーション
    if (
      !name ||
      !deadline ||
      !max_participants ||
      !candidate_dates ||
      candidate_dates.length === 0
    ) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // 日付の妥当性チェック
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate <= now) {
      return NextResponse.json(
        { error: "締切日は現在日時より後である必要があります" },
        { status: 400 }
      );
    }

    if (max_participants < 1 || max_participants > 1000) {
      return NextResponse.json(
        { error: "最大参加者数は1〜1000の範囲で指定してください" },
        { status: 400 }
      );
    }

    // イベントを作成
    const { data: event, error: createError } = await supabase
      .from("events")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        deadline: deadlineDate.toISOString(),
        max_participants,
        image_path: image_path?.trim() || null,
        owner_id: me.id,
        is_finalized: false,
      })
      .select()
      .single();

    if (createError) {
      console.error("Event creation error:", createError);
      return NextResponse.json(
        { error: "イベントの作成に失敗しました" },
        { status: 500 }
      );
    }

    // 候補日を作成
    const candidateInserts = candidate_dates.map((date: string) => ({
      event_id: event.id,
      candidate_date: date,
    }));

    const { error: candidatesError } = await supabase
      .from("candidate_date")
      .insert(candidateInserts);

    if (candidatesError) {
      console.error("Candidates creation error:", candidatesError);
      return NextResponse.json(
        { error: "候補日の作成に失敗しました" },
        { status: 500 }
      );
    }

    // Slack連携（オプション）
    try {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      const hasSlackAuth = !!cookieStore.get("slack_user_token")?.value;

      if (hasSlackAuth) {
        // Slackチャンネルを作成してイベントを告知
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/channel/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `event-${event.id}-${name
                .toLowerCase()
                .replace(/\s+/g, "-")}`,
              purpose: `イベント: ${name}`,
              topic: `日程調整中のイベント: ${name}`,
            }),
          }
        );
      }
    } catch (slackError) {
      console.warn("Slack integration failed:", slackError);
      // Slack連携の失敗はイベント作成を妨げない
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
