// ログイン済みのユーザ情報を取得
import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Me } from "@/types/me";

// 1リクエスト中に何度呼ばれても、最初の結果を共有する
export const getMe = cache(async (): Promise<Me> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 必要な列だけ取得（*は避ける）
  const { data } = await supabase
    .from("user")
    .select(
      "id, auth_id, email, handle_name, image_path, name, origin, pr, last_name, first_name, last_name_katakana, first_name_katakana, university"
    )
    .eq("auth_id", user.id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    authId: data.auth_id,
    name: data.name,
    handleName: data.handle_name ?? undefined,
    email: data.email,
    origin: data.origin,
    imagePath: data.image_path ?? undefined,
    pr: data.pr ?? undefined,
    lastName: data.last_name ?? undefined,
    firstName: data.first_name ?? undefined,
    lastNameKana: data.last_name_katakana ?? undefined,
    firstNameKana: data.first_name_katakana ?? undefined,
    university: data.university ?? undefined,
  } as Me;
});
