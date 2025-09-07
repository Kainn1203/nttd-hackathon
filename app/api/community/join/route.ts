import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type JoinBody = {
  community_id?: number;
  user_id?: number;
};

// Slackチャンネルに参加する関数
async function joinSlackChannel(communityId: number) {
  try {
    // 1) コミュニティのSlackチャンネルIDを取得
    const supabase = await createClient();
    const { data: community, error: communityError } = await supabase
      .from("community")
      .select("slack_channel_id")
      .eq("id", communityId)
      .single();

    if (communityError || !community?.slack_channel_id) {
      console.log("Slackチャンネルが設定されていません:", communityId);
      return; // Slackチャンネルが設定されていない場合は何もしない
    }

    // 2) ユーザーのSlack認証トークンを取得
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("ユーザーが認証されていません");
      return;
    }

    // 3) ユーザーのSlack認証トークンを取得（Cookieから）
    const cookieStore = await import("next/headers").then(m => m.cookies());
    const slackToken = cookieStore.get("slack_user_token")?.value;
    
    if (!slackToken) {
      console.log("Slack認証トークンがありません");
      return; // Slack認証がない場合は何もしない
    }

    // 4) Slack APIでチャンネルに参加
    const slackResponse = await fetch("https://slack.com/api/conversations.join", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${slackToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ channel: community.slack_channel_id }),
    });

    const slackResult = await slackResponse.json();
    console.log("Slack API レスポンス:", { status: slackResponse.status, data: slackResult });

    if (slackResult.ok) {
      console.log("Slackチャンネル参加成功:", community.slack_channel_id);
    } else if (slackResult.error === "already_in_channel") {
      console.log("既にSlackチャンネルに参加済み:", community.slack_channel_id);
    } else {
      console.warn("Slackチャンネル参加に失敗:", slackResult.error);
      // エラーでも例外は投げない（コミュニティ参加は成功とする）
    }
  } catch (error) {
    console.error("Slackチャンネル参加処理エラー:", error);
    // エラーでも例外は投げない（コミュニティ参加は成功とする）
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = (await req.json()) as JoinBody;

  // 1) バリデーション
  if (!body?.community_id) {
    return NextResponse.json(
      { ok: false, error: "missing community_id" },
      { status: 400 }
    );
  }

  // 2) user_id の決め方
  //    - ここでは「自己申告 user_id を受け取る」簡易版
  //    - Auth で本人特定したい場合は下の「Auth 版」参照
  if (!body.user_id) {
    return NextResponse.json(
      { ok: false, error: "missing user_id" },
      { status: 400 }
    );
  }

  try {
    // 3) upsert で冪等に参加（複合主キー community_id,user_id 前提）
    const { error } = await supabase
      .from("community_members")
      .upsert(
        { community_id: body.community_id, user_id: body.user_id },
        { onConflict: "community_id,user_id" }
      );

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    // 4) Slackチャンネルに自動参加
    await joinSlackChannel(body.community_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("コミュニティ参加エラー:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
