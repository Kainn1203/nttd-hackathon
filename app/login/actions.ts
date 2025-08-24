"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginWithCandidateId(formData: FormData) {
  const rawId = String(formData.get("candidateId") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  // 数字IDなら number へ、文字列IDならそのまま使う
  const candidateId: string | number = /^\d+$/.test(rawId)
    ? Number(rawId)
    : rawId;

  // 1) user テーブルから email を取得（id＝内定者ID）
  const { data: rows, error: e1 } = await supabase
    .from("user")
    .select("email")
    .eq("id", candidateId)
    .limit(1);

  if (e1 || !rows || rows.length === 0 || !rows[0].email) {
    return { ok: false, message: "ID またはパスワードが違います" };
  }

  const email = rows[0].email as string;

  // 2) Supabase Auth でメール+パスワード認証
  const { error: e2 } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (e2) return { ok: false, message: "ID またはパスワードが違います" };
  return { ok: true };
}
