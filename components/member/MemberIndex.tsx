"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import MemberCard from "./MemberCard";
import MemberDialog from "./MemberDialog";

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

export default function MembersIndex({ members }: { members: Member[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          justifyItems: 'center',
          width: '100%',
        }}
      >
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onClick={() => setSelectedMember(member)}
          />
        ))}
      </Box>

      <MemberDialog
        open={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
