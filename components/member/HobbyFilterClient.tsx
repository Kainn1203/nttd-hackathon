"use client";
import { useState, useMemo } from "react";
import { Grid, Button, Typography } from "@mui/material";
import MembersIndex from "./MemberIndex";

interface Hobby {
  id: number;
  hobby: string;
}

interface Member {
  id: number;
  last_name: string;
  first_name: string;
  hobby: string[];
  hobbyIds: number[];
  image_path?: string | null;
}

interface Props {
  hobbies: Hobby[];
  members: Member[];
}

export default function HobbyFilter({ hobbies, members }: Props) {
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);

  // 選択された趣味で AND フィルター
  const filteredMembers = useMemo(() => {
    if (selectedHobbyIds.length === 0) return members;
    return members.filter((member) =>
      selectedHobbyIds.every((id) => member.hobbyIds.includes(id))
    );
  }, [selectedHobbyIds, members]);

  const toggleHobby = (id: number) => {
    setSelectedHobbyIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        趣味で絞り込み
      </Typography>
      <Grid container spacing={1} mb={4}>
        {hobbies.map((h) => (
          <Button
            key={h.id}
            variant={selectedHobbyIds.includes(h.id) ? "contained" : "outlined"}
            onClick={() => toggleHobby(h.id)}
          >
            #{h.hobby}
          </Button>
        ))}
      </Grid>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        大学で絞り込み
      </Typography>
      <Button variant="outlined" sx={{ mb: 4 }}>
        {"同じ大学"}
      </Button>

      <MembersIndex members={filteredMembers} />
    </>
  );
}
