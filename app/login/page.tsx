// app/login/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithCandidateId } from "./actions";

import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  BadgeRounded as BadgeRoundedIcon,
  KeyRounded as KeyRoundedIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [pending, startTransition] = React.useTransition();
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const res = await loginWithCandidateId(fd);
      if (res.ok) router.replace(next);
      else setError(res.message ?? "ログインに失敗しました");
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            backdropFilter: "blur(6px)",
          }}
          component="section"
        >
          {/* ヘッダー */}
          <Stack spacing={1} sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700}>
              内定者コミュニティ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              内定者ID と パスワードを入力してください
            </Typography>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* エラー表示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* フォーム */}
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              <TextField
                name="candidateId"
                label="内定者ID"
                // placeholder="N2025-001 など"
                autoComplete="username"
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="password"
                label="パスワード"
                type={showPw ? "text" : "password"}
                // placeholder="••••••••"
                autoComplete="current-password"
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="パスワードを表示"
                        onClick={() => setShowPw((v) => !v)}
                        edge="end"
                      >
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={pending}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {pending ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={18} />
                    <span>ログイン中…</span>
                  </Stack>
                ) : (
                  "ログイン"
                )}
              </Button>
            </Stack>
          </Box>

          {/* フッターリンク（任意で有効化） */}
          {/* <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Link href="/reset-password">パスワードをお忘れですか？</Link>
            <Link href="/help">ヘルプ</Link>
          </Stack> */}
        </Paper>
      </Container>
    </Box>
  );
}
