import { getUserTokenFromCookie } from "../../_lib/getUserToken";

export async function POST(req: Request) {
  try {
    const token = getUserTokenFromCookie(req);
    if (!token) {
      return new Response("unauthorized", { status: 401 });
    }

    const { channel } = await req.json();
    if (!channel) {
      return new Response("channel parameter is required", { status: 400 });
    }

    console.log("Slackチャンネル参加開始:", channel);

    const res = await fetch("https://slack.com/api/conversations.join", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ channel }),
    });

    const json = await res.json();
    console.log("Slack API レスポンス:", { status: res.status, data: json });

    if (json.ok) {
      console.log("Slackチャンネル参加成功:", channel);
      return Response.json({ ok: true, channel });
    } else {
      // 既に参加している場合も成功として扱う
      if (json.error === "already_in_channel") {
        console.log("既にSlackチャンネルに参加済み:", channel);
        return Response.json({ ok: true, channel, already_joined: true });
      }
      
      console.error("Slackチャンネル参加失敗:", json.error);
      return new Response(JSON.stringify(json), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Slackチャンネル参加エラー:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
