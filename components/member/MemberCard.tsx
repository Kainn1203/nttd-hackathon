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
  last_name_katakana: string;
  first_name_katakana: string;
  handle_name: string;
  origin: string;
  hobby: string[];
  image_path: string | null;
}

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

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
      }}
    >
      <CardContent sx={{ textAlign: "center", overflow: "hidden" }}>
        <Avatar
          src={member.image_path}
          sx={{ width: 96, height: 96, mx: "auto", mb: 2 }}
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
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {member.hobby.map((hobby, i) => (
            <Chip
              key={i}
              label={"#" + hobby}
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
