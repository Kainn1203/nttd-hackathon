// ログイン済みのユーザ情報を取得
import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Me } from "@/types/me";

// 1リクエスト中に何度呼ばれても、最初の結果を共有する
export const getMe = cache(async (): Promise<Me> => {
  const supabase = await createClient();
  
  // First try to get the session (same as middleware)
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session error in getMe:", sessionError);
    return null;
  }
  
  if (!session?.user) {
    console.log("No session found in getMe");
    return null;
  }
  
  const user = session.user;
  console.log("Authenticated user found from session:", user.id);

  // 必要な列だけ取得（*は避ける）
  const { data, error: dbError } = await supabase
    .from("user")
    .select(
      "id, auth_id, email, handle_name, image_path, name, origin, pr, last_name, first_name, last_name_katakana, first_name_katakana, university"
    )
    .eq("auth_id", user.id)
    .single();

  if (dbError) {
    console.error("Database error in getMe:", dbError);
    return null;
  }

  if (!data) {
    console.log("No user data found for auth_id:", user.id);
    return null;
  }

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
