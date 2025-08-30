import { getUserTokenFromCookie } from "../../_lib/getUserToken";

export async function POST(req: Request) {
  const token = getUserTokenFromCookie(req);
  if (!token) return new Response("unauthorized", { status: 401 });

  const { channel } = await req.json(); // 例: "C01234567"
  const res = await fetch("https://slack.com/api/conversations.join", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // ← xoxp（その人）
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ channel }),
  });
  const json = await res.json();

  return json.ok
    ? Response.json(json)
    : new Response(JSON.stringify(json), { status: 400 });
}
import "@/lib/proxy";
