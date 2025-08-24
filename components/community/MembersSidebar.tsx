"use client";

import {
  Avatar,
  Badge,
  Box,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

type MemberView = { id: number; name: string; avatarUrl?: string };

export default function MembersSidebar({ members }: { members: MemberView[] }) {
  return (
    <Paper
      className="dark:invert"
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        position: { md: "sticky" }, // md以上で右カラムを固定
        top: { md: 16 }, // ヘッダ等があれば微調整
        display: "flex",
        flexDirection: "column",
        // 画面高にフィットして内部スクロール
        maxHeight: { xs: "none", md: "calc(100vh - 32px)" },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6" fontWeight={700}>
          メンバー
        </Typography>
        <Chip
          label={`${members.length}人`}
          size="small"
          variant="outlined"
          sx={{ ml: 0.5 }}
        />
      </Stack>

      <Divider sx={{ mb: 1 }} />

      <List
        dense
        sx={{
          overflow: "auto",
          flex: 1,
          pr: 0.5, // スクロールバー分の余白
        }}
      >
        {members.map((m) => (
          <ListItemButton key={m.id} disableGutters>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <Avatar src={m.avatarUrl} alt={m.name}>
                  {getInitials(m.name)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={m.name}
              primaryTypographyProps={{ fontWeight: 600 }}
              // secondary="役割などがあればここに"  // 後で拡張しやすい
            />
          </ListItemButton>
        ))}

        {members.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              color: "text.secondary",
              py: 4,
            }}
          >
            <Typography variant="body2">該当するメンバーがいません</Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
}

/** 日本語/英語名に対応したイニシャル生成（姓名・半角全角をざっくり吸収） */
function getInitials(name?: string) {
  if (!name) return "？";
  const s = name.trim();
  // スペースで分割して先頭と末尾の頭文字を使う（日本語名も1文字目だけでOK）
  const parts = s.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
