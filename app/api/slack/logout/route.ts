import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ 
      ok: true, 
      message: "Slack logged out successfully" 
    });

    // Slack関連のCookieを削除
    response.cookies.set("slack_user_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // 即座に削除
      expires: new Date(0), // 過去の日付で確実に削除
    });

    response.cookies.set("slack_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set("slack_oauth_return_to", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    // キャッシュ制御ヘッダーを設定
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;

  } catch (error) {
    console.error("Slack logout failed:", error);
    return NextResponse.json({ ok: false, message: "Slack logout failed" }, { status: 500 });
  }
}
