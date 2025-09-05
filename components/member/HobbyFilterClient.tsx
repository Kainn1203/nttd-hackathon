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

interface Props {
  hobbies: Hobby[];
  members: Member[];
  university: string | undefined; // ログインユーザーの大学
}

export default function HobbyFilter({ hobbies, members, university }: Props) {
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);
  const [universityFilterActive, setUniversityFilterActive] = useState(false);

  // 趣味 + 大学フィルターを適用
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 趣味フィルター
      const hobbyMatch =
        selectedHobbyIds.length === 0 ||
        selectedHobbyIds.every((id) => member.hobbyIds.includes(id));

      // 大学フィルター
      const universityMatch =
        !universityFilterActive || member.university === university;

      return hobbyMatch && universityMatch;
    });
  }, [selectedHobbyIds, universityFilterActive, members, university]);

  const toggleHobby = (id: number) => {
    setSelectedHobbyIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleUniversityFilter = () => {
    setUniversityFilterActive((prev) => !prev);
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
      <Button
        variant={universityFilterActive ? "contained" : "outlined"}
        sx={{ mb: 4 }}
        onClick={toggleUniversityFilter}
        disabled={!university}
      >
        同じ大学
      </Button>

      <MembersIndex members={filteredMembers} />
    </>
  );
}
