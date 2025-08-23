import { getUserTokenFromCookie } from "../../_lib/getUserToken";

export async function POST(req: Request) {
  const token = getUserTokenFromCookie(req);
  if (!token) return new Response("unauthorized", { status: 401 });

  const { channel, text, thread_ts } = await req.json();
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // ← xoxp（その人）
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text, thread_ts }),
  });
  const json = await res.json();

  return json.ok
    ? Response.json(json)
    : new Response(JSON.stringify(json), { status: 400 });
}
