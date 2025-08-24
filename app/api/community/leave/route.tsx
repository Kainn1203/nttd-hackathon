import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LeaveBody = {
  community_id?: number;
  user_id?: number; // ← Auth を使うなら省略可
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = (await req.json()) as LeaveBody;

  if (!body?.community_id) {
    return NextResponse.json(
      { ok: false, error: "missing community_id" },
      { status: 400 }
    );
  }
  if (!body?.user_id) {
    return NextResponse.json(
      { ok: false, error: "missing user_id" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", body.community_id)
    .eq("user_id", body.user_id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
