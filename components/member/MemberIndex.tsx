"use client";

import { useState } from "react";
import Grid from "@mui/material/Grid";
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
      <Grid container spacing={3}>
        {members.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <MemberCard
              member={member}
              onClick={() => setSelectedMember(member)}
            />
          </Grid>
        ))}
      </Grid>

      <MemberDialog
        open={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
