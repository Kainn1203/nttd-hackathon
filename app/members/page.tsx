import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getPublicImageUrl } from "@/lib/supabase/image";
import React from "react";
import { Box, Typography } from "@mui/material";
import HobbyFilter from "@/components/member/HobbyFilterClient";
import { getMe } from "@/lib/supabase/me";
import { redirect } from "next/navigation";

export default async function MemberPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  const supabase = await createClient();

  // 全メンバー取得
  const { data: members, error: errorMember } = await supabase
    .from("user")
    .select("*")
    .order("last_name");

  if (errorMember) throw new Error(errorMember.message);
  if (!members) return notFound();

  // 趣味一覧取得
  const { data: hobbies, error: errorHobby } = await supabase
    .from("hobbies")
    .select("id, hobby");

  if (errorHobby) throw new Error(errorHobby.message);
  if (!hobbies) return notFound();

  // メンバーごとの趣味取得＆image_pathをpublic URLに変換
  const updatedMembers = await Promise.all(
    members.map(async (member) => {
      const supabase = await createClient();
      const { data: memberHobby } = await supabase
        .from("user_hobbies")
        .select("hobby_id")
        .eq("user_id", member.id);

      const hobbyIds = memberHobby?.map((h) => h.hobby_id) || [];
      const hobbyNames = hobbyIds
        .map((id) => hobbies.find((h) => h.id === id)?.hobby)
        .filter(Boolean) as string[];

      let image_path: string | null = member.image_path;
      if (image_path) {
        image_path = image_path.startsWith("http")
          ? image_path
          : getPublicImageUrl("user-images", image_path) ?? null; // 引数順を修正
      }

      return { ...member, image_path, hobby: hobbyNames, hobbyIds };
    })
  );

  return (
    <Box sx={{ p: 6 }}>
      {/* Client Component に趣味一覧とメンバー渡す */}
      <HobbyFilter
        hobbies={hobbies}
        members={updatedMembers}
        university={me.university}
      />
    </Box>
  );
}
