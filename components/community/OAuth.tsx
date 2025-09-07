"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { SiSlack } from "react-icons/si";

export default function OAuth() {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search?.toString() ? `?${search}` : "");
  const href = `/api/slack/oauth/start?return_to=${encodeURIComponent(
    current
  )}`;

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1} margin={2}>
        <Typography variant="h6" fontWeight={700}>
          Slack チャット
        </Typography>
        <Box flex={1} />
        <Tooltip title="再読込">
          <span>
            <IconButton disabled size="medium" color="primary">
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </span>
        </Tooltip>

        <Button
          variant="outlined"
          size="small"
          startIcon={<SiSlack size={18} />}
          disabled
        >
          Slackで開く
        </Button>
      </Stack>
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          p: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Slack 連携が必要です
          </Typography>

          <Button
            component="a"
            href={href}
            variant="contained"
            size="large"
            startIcon={<SiSlack size={18} />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Slackでログイン（OAuth開始）
          </Button>

          <Typography variant="caption" color="text.secondary" align="center">
            許可後はこのページに戻り、チャットが使えるようになります。
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
