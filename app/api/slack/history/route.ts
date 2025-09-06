import { getUserTokenFromCookie } from "../../_lib/getUserToken";

type SlackMessage = {
  ts: string;
  text?: string;
  user?: string;
  subtype?: string;
  thread_ts?: string;
};

export async function GET(req: Request) {
  const token = getUserTokenFromCookie(req);
  if (!token) return new Response("unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel")!;
  const cursor = searchParams.get("cursor") ?? undefined;

  // 1) 履歴
  const histRes = await fetch("https://slack.com/api/conversations.history", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      channel,
      limit: "50",
      ...(cursor ? { cursor } : {}),
    }),
  });
  const hist = await histRes.json();
  if (!hist.ok) return new Response(JSON.stringify(hist), { status: 400 });

  const messages: SlackMessage[] = hist.messages ?? [];

  // 2) 自分の Slack ユーザーID
  const meRes = await fetch("https://slack.com/api/auth.test", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(),
  });
  const meJson = await meRes.json();
  const me: string | undefined = meJson?.user_id;

  // 3) メッセージに登場する user をまとめてプロフィール取得
  const ids = Array.from(
    new Set(messages.map((m) => m.user).filter(Boolean) as string[])
  );
  const users: Record<string, { name: string; image: string }> = {};

  await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(
        `https://slack.com/api/users.info?${new URLSearchParams({ user: id })}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const j = await r.json();
      if (j.ok) {
        users[id] = {
          name: j.user.profile.display_name || j.user.real_name || id,
          image: j.user.profile.image_48 || j.user.profile.image_72 || "",
        };
      } else {
        users[id] = { name: id, image: "" }; // フォールバック
      }
    })
  );

  // 4) そのまま返す
  return Response.json({
    ok: true,
    messages,
    response_metadata: hist.response_metadata,
    users, // 追加
    me, // 追加
  });
}
