import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type JoinBody = {
  lastName?: string;
  origin?: string; 
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = (await req.json()) as JoinBody;

  
  // 3) upsert で冪等に参加（複合主キー community_id,user_id 前提）
  const { error } = await supabase
    .from("user")
    .upsert(
      { name:body.lastName, origin: body.origin, },
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
