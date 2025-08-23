import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // (A) 返り先の相対パスを受け取る（外部URLは拒否）
  const rawReturn = url.searchParams.get("return_to") || "/";
  const returnTo = rawReturn.startsWith("/") ? rawReturn : "/";

  // (B) CSRF対策のランダムstateを発行
  const state = crypto.randomBytes(16).toString("hex");

  // (C) Slack認可URLを作成（ユーザー権限＝user_scope）
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    user_scope: "channels:read channels:history chat:write", // 必要に応じて追加
    redirect_uri: process.env.SLACK_REDIRECT_URI!, // https://.../api/slack/oauth/callback
    state,
  });

  // (D) Slackへリダイレクトするレスポンスを作る
  const res = NextResponse.redirect(
    "https://slack.com/oauth/v2/authorize?" + params.toString()
  );

  // (E) state と return_to を"一時Cookie"で保存（5分など）
  res.cookies.set("slack_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });
  res.cookies.set("slack_oauth_return_to", returnTo, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });

  return res;
}
