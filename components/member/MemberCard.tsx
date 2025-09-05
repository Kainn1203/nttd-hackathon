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

const getBackgroundColor = (score: number | null): string => {
  if (score === null) return "#ffffff"; // 白
  if (score <= 20) return "#FFF9FA"; // 赤系
  if (score <= 40) return "#F6FCFD"; // 青系
  if (score <= 60) return "#FFFDF5"; // 黄系
  if (score <= 80) return "#F8FCF9"; // 緑系
  return "#FBF9FF"; // 紫系
};

const getBorderColor = (score: number | null): string => {
  if (score === null) return "#ffffff"; // 白
  if (score <= 20) return "#CC4B68"; // 赤系
  if (score <= 40) return "#007B8A"; // 青系
  if (score <= 60) return "#E6A700"; // 黄系
  if (score <= 80) return "#2F6B3D"; // 緑系
  return "#6A4FB6"; // 紫系
};

const MemberCard: React.FC<MemberCardProps> = ({ member, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: 1,
        width: 320,
        height: 336,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { boxShadow: 6 },
        backgroundColor: getBackgroundColor(member.scores),
        border: `2px solid ${getBorderColor(member.scores)}`,
      }}
    >
      <CardContent sx={{ textAlign: "center", overflow: "hidden" }}>
        <Avatar
          src={member.image_path}
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
