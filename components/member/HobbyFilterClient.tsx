"use client";
import { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  Button,
  Typography,
  TextField,
} from "@mui/material";
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
  currentUserId: number; // ← 追加（自分のユーザーID）
}

export default function HobbyFilter({
  hobbies,
  members,
  university,
  currentUserId,
}: Props) {
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);
  const [universityFilterActive, setUniversityFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // フィルター処理
  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        const hobbyMatch =
          selectedHobbyIds.length === 0 ||
          selectedHobbyIds.every((id) => member.hobbyIds.includes(id));

        const universityMatch =
          !universityFilterActive || member.university === university;

        const searchMatch =
          searchQuery === "" ||
          member.last_name.includes(searchQuery) ||
          member.first_name.includes(searchQuery) ||
          member.handle_name.includes(searchQuery);

        return hobbyMatch && universityMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return 0;
      });
  }, [
    selectedHobbyIds,
    universityFilterActive,
    searchQuery,
    members,
    university,
    currentUserId,
  ]);

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
      {/* 検索バー + フィルターメニュー */}
      <AppBar
        position="static"
        color="default"
        elevation={1}
        sx={{
          mb: 3,
          p: 3,
          bgcolor: "white", // 背景色を白に
          borderRadius: 2, // 角を少し丸く
          width: "fit-content", // 必要に応じて幅調整（全幅を避けたい場合）
          mx: "auto", // 中央寄せ（任意）
        }}
      >
        <Toolbar sx={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            名前で検索
          </Typography>
          <TextField
            placeholder="メンバーを検索"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Typography variant="subtitle1" fontWeight="bold">
            趣味で絞り込み
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {hobbies.map((h) => (
              <Grid item key={h.id}>
                <Button
                  variant={
                    selectedHobbyIds.includes(h.id) ? "contained" : "outlined"
                  }
                  onClick={() => toggleHobby(h.id)}
                >
                  #{h.hobby}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold">
            大学で絞り込み
          </Typography>
          <Button
            variant={universityFilterActive ? "contained" : "outlined"}
            onClick={toggleUniversityFilter}
            disabled={!university}
          >
            同じ大学
          </Button>
        </Toolbar>
      </AppBar>

      {/* メンバー一覧 */}
      <MembersIndex members={filteredMembers} />
    </>
  );
}
