"use client";

import type { Community } from "@/types/community";
import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/material";

type Props = {
  community: Community;
  imageUrl?: string | null;
  ownerName?: string;
};

export default function CommunityDetail({ community, imageUrl, ownerName }: Props) {
  const c = community;

  // 日付をフォーマット（時間を除いて日付のみ表示）
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, border: "none" }}
        className="dark:invert"
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                コミュニティ詳細
              </Typography>
              <Chip label={`ID: ${c.id}`} size="small" color="default" />
            </Stack>
          }
          sx={{ pb: 0 }}
        />

        <CardContent>
          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* 画像 */}
            <Grid size={{ xs: 12, sm: 5 }}>
              {imageUrl ? (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "background.default",
                    border: "none",
                  }}
                >
                  {/* 比率維持でレスポンシブ */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={c.name}
                      fill
                      sizes="(max-width: 600px) 100vw, 360px"
                      style={{ objectFit: "contain" }}
                      className="dark:invert"
                      // unoptimized を使うなら下を残す。不要なら削除可
                      // unoptimized
                    />
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    bgcolor: "grey.100",
                    color: "text.secondary",
                    border: (t) => `1px dashed ${t.palette.divider}`,
                  }}
                >
                  画像なし
                </Box>
              )}
            </Grid>

            {/* 情報 */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <Stack spacing={1.2} sx={{ lineHeight: 1.8 }}>
                <Field label="名前">{c.name}</Field>
                <Field label="概要">{c.description ?? "-"}</Field>

                <Divider sx={{ my: 1.5 }} />

                <Field label="作成者">{ownerName ?? "-"}</Field>
                <Field label="作成日">{formatDate(c.created_at)}</Field>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

/* 小さなラベル＋値の行を作るユーティリティ */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{children}</Typography>
    </Stack>
  );
}
