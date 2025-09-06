"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
} from "@mui/material";

interface Member {
  id: number;
  last_name: string;
  first_name: string;
  hobby: string[];
  hobbyIds: number[];
  university: string;
  image_path?: string | null;
  last_name_katakana: string;
  first_name_katakana: string;
  handle_name: string;
  origin: string;
  pr: string;
  scores: number;
  diagnosis_result: string;
}

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

interface Diagnosis {
  label: string;
  image: string | null;
  bgcolor: string;
  bodercolor: string;
}

// スコアに応じた診断結果を返す関数
function getDiagnosis(name: string | null): Diagnosis {
  if (name) {
    if (name.includes("ゆる")) {
      return {
        label: "ゆるふわ KAIWAI",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/a.png",
        bgcolor: "#FFF9FA",
        bodercolor: "#CC4B68",
      };
    } else if (name.includes("定時")) {
      return {
        label: "今日、定時に恋しました。",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/b.png",
        bgcolor: "#F6FCFD",
        bodercolor: "#007B8A",
      };
    } else if (name.includes("タイパ")) {
      return {
        label: "タイパ重視",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/c.png",
        bgcolor: "#FFFDF5",
        bodercolor: "#E6A700",
      };
    } else if (name.includes("残業するのは")) {
      return {
        label: "残業するのは、ダメですか？",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/d.png",
        bgcolor: "#F8FCF9",
        bodercolor: "#2F6B3D",
      };
    } else
      return {
        label: "残業が尊い….！",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/e.png",
        bgcolor: "#FBF9FF",
        bodercolor: "#6A4FB6",
      };
  } else
    return {
      label: "診断結果がありません",
      image: null,
      bgcolor: "#ffffff",
      bodercolor: "#ffffff",
    };
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onClick }) => {
  const diagnosis = getDiagnosis(member.diagnosis_result);
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: 1,
        width: "100%",
        maxWidth: 320,
        height: 336,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { boxShadow: 6 },
        backgroundColor: getDiagnosis(member.diagnosis_result).bgcolor,
        border: `2px solid ${getDiagnosis(member.diagnosis_result).bodercolor}`,
        position: "relative",
      }}
    >
      {/* 左上に重ねて表示 */}
      {member.diagnosis_result && diagnosis.image && (
        <Box
          component="img"
          src={diagnosis.image}
          alt={diagnosis.label}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 40,
            height: 40,
            objectFit: "contain",
            zIndex: 2,
          }}
        />
      )}

      <CardContent sx={{ textAlign: "center", overflow: "hidden" }}>
        <Avatar
          src={member.image_path || undefined}
          sx={{
            width: 96,
            height: 96,
            mx: "auto",
            mb: 2,
            border: "2px solid #eee",
            boxShadow: 2,
          }}
        />
        <Typography variant="caption" fontWeight="text">
          {member.last_name_katakana} {member.first_name_katakana}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {member.last_name} {member.first_name}
        </Typography>
        <Typography variant="body2" fontWeight="text.secondary" sx={{ mb: 1 }}>
          {member.handle_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {member.origin} {"出身"}
        </Typography>
        <div
          style={{
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            verticalAlign: "middle",
          }}
        >
          {member.hobby.map((hobby, i) => (
            <Chip
              key={i}
              label={"#" + hobby}
              variant="outlined"
              color="primary"
              sx={{
                backgroundColor: "white",
                flexShrink: 0,
                mr: 1,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
