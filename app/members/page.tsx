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
    .order("last_name_katakana")
    .order("first_name_katakana");

  if (errorMember) throw new Error(errorMember.message);
  if (!members) return notFound();

  // corporate_slave_diagnosis から最新データ取得
  const { data: diagnoses, error: errorDiagnosis } = await supabase
    .from("corporate_slave_diagnosis")
    .select("user_id, scores, diagnosis_result, created_at")
    .order("created_at", { ascending: false }); // 最新が上に来るように

  if (errorDiagnosis) throw new Error(errorDiagnosis.message);

  // user_id ごとに最新データのみ残す
  const latestDiagnosisMap = new Map<
    number,
    { scores: number; diagnosis_result: string | null }
  >();

  for (const d of diagnoses) {
    if (!latestDiagnosisMap.has(d.user_id)) {
      latestDiagnosisMap.set(d.user_id, {
        scores: d.scores,
        diagnosis_result: d.diagnosis_result,
      });
    }
  }

  // members に診断結果をマージ
  const membersWithDiagnosis = members.map((m) => ({
    ...m,
    scores: latestDiagnosisMap.get(m.id)?.scores ?? null,
    diagnosis_result: latestDiagnosisMap.get(m.id)?.diagnosis_result ?? null,
  }));

  // 趣味一覧取得
  const { data: hobbies, error: errorHobby } = await supabase
    .from("hobbies")
    .select("id, hobby");

  if (errorHobby) throw new Error(errorHobby.message);
  if (!hobbies) return notFound();

  // メンバーごとの趣味取得＆image_pathをpublic URLに変換
  const updatedMembers = await Promise.all(
    membersWithDiagnosis.map(async (member) => {
      const supabase = await createClient();
      const { data: memberHobby } = await supabase
        .from("user_hobbies")
        .select("hobby_id")
        .eq("user_id", member.id);

      const hobbyIds = memberHobby?.map((h) => h.hobby_id) || [];
      const hobbyNames = hobbyIds
        .map((id) => hobbies.find((h) => h.id === id)?.hobby)
        .filter(Boolean) as string[];

      let imagePath = member.image_path;
      if (imagePath) {
        imagePath = await getPublicImageUrl(imagePath, "user-images");
      }

      return { ...member, hobby: hobbyNames, hobbyIds };
    })
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        内定者一覧
      </Typography>

      {/* Client Component に趣味一覧とメンバー渡す */}
      <HobbyFilter
        hobbies={hobbies}
        members={updatedMembers}
        university={me.university}
        currentUserId={me.id}
      />
    </Box>
  );
}
