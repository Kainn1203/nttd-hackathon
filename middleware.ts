import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // 次の処理へ渡すレスポンスを先に作る（ヘッダを引き継ぐ）
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // リクエストから Cookie を読む
        getAll() {
          return req.cookies.getAll();
        },
        // 認証更新などで Supabase が設定する Cookie をレスポンスへ書く
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // req 側にも反映しておくと、この後の別ミドルウェアにも伝播します
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // セッションを最新化（期限切れなら更新される）
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  // 公開ページを列挙（必要に応じて追加）
  const publicPaths = new Set<string>(["/login", "/api/slack/oauth"]);
  const isPublic = [...publicPaths].some(
    (p) => path === p || path.startsWith(p + "/")
  );

  // 公開ページ以外は保護（未ログイン→/login?next=...）
  if (!isPublic && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // ログイン済みで /login に来たらトップへ
  if (path === "/login" && session) {
    const next = req.nextUrl.searchParams.get("next") || "/";
    const url = req.nextUrl.clone();
    url.pathname = next;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return res;
}

// 静的アセット等を除外（必要なら /api を除外に追加してもOK）
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
