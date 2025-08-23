// import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) return new Response("missing code", { status: 400 });

  // (1) state 検証 ＆ return_to 読み出し
  const store = await cookies();
  const storedState = store.get("slack_oauth_state")?.value;
  const returnTo = store.get("slack_oauth_return_to")?.value || "/";
  if (!state || !storedState || state !== storedState) {
    return new Response("invalid state", { status: 400 });
  }

  // (2) 認可コードをアクセストークンへ交換（SlackのOAuth API）
  const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
    }),
  });
  const json = await tokenRes.json();

  // 失敗なら詳細を返す（デバッグしやすく）
  if (!json.ok) {
    return new Response(JSON.stringify(json, null, 2), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // (3) ユーザーアクセストークン（xoxp）を取り出す
  const userToken = json.authed_user?.access_token as string | undefined;
  if (!userToken) return new Response("no user token", { status: 500 });

  // ★ 相対リダイレクト + Set-Cookie を複数付与
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `slack_user_token=${userToken}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );
  headers.append(
    "Set-Cookie",
    "slack_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  );
  headers.append(
    "Set-Cookie",
    "slack_oauth_return_to=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  );
  headers.append("Location", returnTo); // 例: "/communities/1"（相対パス！）

  return new Response(null, { status: 302, headers });
}
