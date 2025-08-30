// app/myPage/page.tsx
import { getMe } from "@/lib/supabase/me";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import { getPublicImageUrl } from "@/lib/supabase/image";
import ProfileFormWrapper from "@/components/mypage/ProfileFormWrapper";

export default async function MyPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  // image_path がフルURLでなければ公開URLに変換
  let processedMe = { ...me };
  if (me.imagePath) {
    processedMe.imagePath = me.imagePath.startsWith("http")
      ? me.imagePath
      : getPublicImageUrl("user-images", me.imagePath) ?? undefined;
  }

  // 趣味マスタ取得
  const supabase = await createClient();
  const { data: hobby, error: error } = await supabase
    .from("hobbies")
    .select("id, hobby");

  // データベース読み込み失敗時
  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>読み込みに失敗しました</AlertTitle>
        {error.message}
      </Alert>
    );
  }
  if (!hobby) {
    return notFound();
  }

  // ログインしているユーザーの趣味情報を取得
  const { data: userHobby, error: errorHobby } = await supabase
    .from("user_hobbies")
    .select("hobby_id")
    .eq("user_id", me.id)
    .order("hobby_id");

  // データベース読み込み失敗時
  if (errorHobby) {
    return (
      <Alert severity="error">
        <AlertTitle>読み込みに失敗しました</AlertTitle>
        {errorHobby.message}
      </Alert>
    );
  }
  if (!userHobby) {
    return notFound();
  }

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h3" fontWeight="bold" mb={4} align="center">
        プロフィール登録
      </Typography>
      <ProfileFormWrapper 
        me={processedMe} 
        hobbyOptions={hobby} 
        userHobby={userHobby} 
      />
    </Box>
  );
}
