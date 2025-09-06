// components/mypage/ProfileFormWrapper.tsx
"use client";

import { uploadImage } from "@/lib/supabase/uploadImage";
import ProfileForm from "@/components/mypage/ProfileForm";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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
type UserHobby = { hobby_id: number };
type ProfileFormInput = {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  handleName: string;
  origin: string;
  pr: string;
  university: string;
  hobby: string[];
  avatarFile?: File | null;
};

export default function ProfileFormWrapper({
  me,
  hobbyOptions,
  userHobby,
}: {
  me: Me;
  hobbyOptions: HobbyOption[];
  userHobby: UserHobby[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleProfileSubmit = async (data: ProfileFormInput) => {
    try {
      let uploadedImageUrl: string | null = null;
      // 画像アップロード処理
      if (data.avatarFile) {
        try {
          uploadedImageUrl = await uploadImage(data.avatarFile, {
            bucket: "user-images",
          });
          console.log("画像アップロード成功:", uploadedImageUrl);
        } catch (uploadError) {
          console.error("画像アップロード失敗:", uploadError);
          const msg =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          alert(`画像のアップロードに失敗しました: ${msg}`);
          return;
        }
      }

      // プロフィールデータの準備
      const userData = {
        last_name: data.lastName || null,
        first_name: data.firstName || null,
        last_name_katakana: data.lastNameKana || null,
        first_name_katakana: data.firstNameKana || null,
        handle_name: data.handleName || null,
        origin: data.origin || null,
        pr: data.pr || null,
        university: data.university || null,
        image_path: uploadedImageUrl || null,
      };

      // データベース更新
      const { data: updateResult, error: userError } = await supabase
        .from("user")
        .update(userData)
        .eq("id", me.id)
        .select("*");

      if (userError) {
        throw new Error(
          `プロフィールの更新に失敗しました: ${userError.message}`
        );
      }

      console.log("データベース更新成功:", updateResult);

      // 趣味の処理
      await updateUserHobbies(data.hobby);
      alert("保存しました");
      router.push("/");
    } catch (error) {
      console.error("プロフィール更新失敗:", error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`保存に失敗しました: ${msg}`);
    }
  };

  // 趣味更新処理
  const updateUserHobbies = async (selectedHobbies: string[]) => {
    try {
      // 既存の趣味を取得
      const { data: existingHobbies, error: fetchError } = await supabase
        .from("hobbies")
        .select("id, hobby");

      if (fetchError) throw new Error("趣味データの取得に失敗しました");

      const existingMap = new Map(
        existingHobbies?.map((h) => [h.hobby, h.id]) ?? []
      );

      // 新規趣味の追加
      const newHobbyNames = selectedHobbies.filter((h) => !existingMap.has(h));

      if (newHobbyNames.length > 0) {
        const { data: insertedHobbies, error: insertError } = await supabase
          .from("hobbies")
          .insert(newHobbyNames.map((h) => ({ hobby: h, create_user: me.id })))
          .select("id, hobby");

        if (insertError) throw new Error("新しい趣味の追加に失敗しました");

        insertedHobbies?.forEach((h) => existingMap.set(h.hobby, h.id));
      }

      // 趣味名をIDに変換
      const hobbyIds = selectedHobbies
        .map((h) => existingMap.get(h))
        .filter((id): id is number => typeof id === "number");

      const existingIds = (userHobby ?? []).map((h) => h.hobby_id);
      const toAdd = hobbyIds.filter((id) => !existingIds.includes(id));
      const toRemove = existingIds.filter((id) => !hobbyIds.includes(id));

      // 不要な趣味を削除
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_hobbies")
          .delete()
          .eq("user_id", me.id)
          .in("hobby_id", toRemove);

        if (deleteError) throw new Error("趣味の削除に失敗しました");
      }

      // 新しい趣味を追加
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("user_hobbies")
          .insert(
            toAdd.map((hobbyId) => ({
              user_id: me.id,
              hobby_id: hobbyId,
            }))
          );

        if (insertError) throw new Error("趣味の追加に失敗しました");
      }
    } catch (error) {
      throw error;
    }
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
