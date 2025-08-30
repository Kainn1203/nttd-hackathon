"use client";
 
import { uploadImage } from "@/lib/supabase/uploadImage";
import ProfileForm from "@/components/mypage/ProfileForm";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
// import { Me, HobbyOption } from "@/myPage/page"; // 型定義を分けておく
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
 
type Me = {
  id: number;
  name?: string | null;
  handleName?: string | null;
  imagePath?: string;
  origin?: string | null;
  pr?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  university?: string | null;
};
 
type HobbyOption = { id: number; hobby: string };
 
export default function ProfileFormWrapper({
  me,
  hobbyOptions,
  userHobby,
}: {
  me: Me;
  hobbyOptions: HobbyOption[];
  userHobby: { hobby_id: number }[];
}) {
  const router = useRouter();
 
  const handleProfileSubmit = async (data: any) => {
    let uploadedImageUrl: string | null = null;
 
    if (data.avatarFile) {
      uploadedImageUrl = await uploadImage(data.avatarFile, {
        bucket: "user-images",
      });
    }
 
    // 1. プロフィール更新
    const { error: userError } = await supabase.from("user").upsert(
      {
        id: me.id,
        last_name: data.lastName,
        first_name: data.firstName,
        last_name_katakana: data.lastNameKana,
        first_name_katakana: data.firstNameKana,
        handle_name: data.handleName,
        origin: data.origin,
        pr: data.pr,
        university: data.university,
        image_path: uploadedImageUrl ?? null,
      },
      { onConflict: "id" }
    );
    if (userError) {
      alert(`保存に失敗しました: ${userError.message}`);
      return;
    }
 
    // 2. 既存の hobbies を取得
    const { data: existingHobbies, error: fetchError } = await supabase
      .from("hobbies")
      .select("id, hobby");
 
    if (fetchError) {
      console.error("Failed to fetch hobbies:", fetchError);
      return;
    }
 
    const existingMap = new Map(
      existingHobbies?.map((h) => [h.hobby, h.id]) ?? []
    );
 
    // 3. 新規 hobby 名を抽出
    const newHobbyNames = data.hobby.filter((h: string) => !existingMap.has(h));
 
    // 4. 新規 hobby を追加
    if (newHobbyNames.length > 0) {
      const { data: insertedHobbies, error: insertError } = await supabase
        .from("hobbies")
        .insert(
          newHobbyNames.map((h: string) => ({ hobby: h, create_user: me.id }))
        )
        .select("id, hobby");
 
      if (insertError) {
        console.error("Failed to insert new hobbies:", insertError);
        return;
      }
 
      insertedHobbies?.forEach((h) => existingMap.set(h.hobby, h.id));
    }
 
    // 5. hobby 名 → ID に変換
    const hobbyIds = data.hobby
      .map((h: string) => existingMap.get(h))
      .filter((id): id is number => typeof id === "number");
 
    // 6. 現在の hobby_id 一覧
    const existingIds = (userHobby ?? []).map((h) => h.hobby_id);
 
    // 7. 追加・削除対象を算出
    const toUpsert = hobbyIds.filter((id) => !existingIds.includes(id));
    const toDelete = existingIds.filter((id) => !hobbyIds.includes(id));
 
    // 8. 削除処理
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("user_hobbies")
        .delete()
        .eq("user_id", me.id)
        .in("hobby_id", toDelete);
 
      if (deleteError) {
        console.error("Failed to delete hobbies:", deleteError);
        return;
      }
    }
 
    // 9. 追加処理
    if (toUpsert.length > 0) {
      const { error: upsertError } = await supabase.from("user_hobbies").upsert(
        toUpsert.map((hobbyId) => ({
          user_id: me.id,
          hobby_id: hobbyId,
        })),
        { onConflict: "user_id, hobby_id" }
      );
 
      if (upsertError) {
        console.error("Failed to upsert hobbies:", upsertError);
        return;
      }
    }
 
    alert("保存しました");
    router.push("/");
  };
 
  return (
    <ProfileForm
      me={me}
      hobbyOptions={hobbyOptions}
      userHobby={userHobby}
      onSubmit={handleProfileSubmit}
    />
  );
}
