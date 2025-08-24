import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type JoinBody = {
  community_id?: number;
  user_id?: number; // ← Auth を使うなら省略可
};

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
  return NextResponse.json({ ok: true });
}
