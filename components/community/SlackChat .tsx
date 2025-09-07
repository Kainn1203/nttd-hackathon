"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Container,
} from "@mui/material";
import { SiSlack } from "react-icons/si";
import { Refresh as RefreshIcon } from "@mui/icons-material";

type Msg = { ts: string; text?: string; user?: string; subtype?: string };
type Profiles = Record<string, { name: string; image: string }>;
type SlackChatProps = { channelId: string };

const SUBDOMAIN = process.env.NEXT_PUBLIC_SLACK_WORKSPACE_SUBDOMAIN;

function renderText(text = "", profiles: Profiles) {
  // <@UXXXX> => @表示名
  return text.replace(
    /<@([A-Z0-9]+)>/g,
    (_, id) => `@${profiles[id]?.name ?? id}`
  );
}

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
function formatSlackTs(ts: string) {
  const d = new Date(Math.round(parseFloat(ts) * 1000));
  return {
    date: dateFmt.format(d),
    time: timeFmt.format(d),
    full: d.toISOString(),
  };
}

export default function SlackChat({ channelId }: SlackChatProps) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [me, setMe] = useState<string | undefined>();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      const url = `/api/slack/history?channel=${channelId}${
        cursor ? `&cursor=${cursor}` : ""
      }`;
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      console.log("profiles", j.users);

      // 古い→新しいに並べ替え（最新を下に）
      const sorted = (j.messages ?? [])
        .slice()
        .sort((a: Msg, b: Msg) => parseFloat(a.ts) - parseFloat(b.ts));
      setMsgs(sorted);
      setProfiles(j.users ?? {});
      setMe(j.me);
      setLoading(false);
      requestAnimationFrame(() => {
        const el = scrollerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    },
    [channelId]
  );

  async function send() {
    if (!text.trim()) return;
    const r = await fetch("/api/slack/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelId, text }),
    });
    setText("");
    await load();
    if (!r.ok) alert("送信に失敗しました");
  }

  useEffect(() => {
    load();
  }, [load]);

  const webUrl = SUBDOMAIN
    ? `https://${SUBDOMAIN}.slack.com/archives/${channelId}`
    : undefined;

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} margin={2}>
        <Typography variant="h6" fontWeight={700}>
          Slack チャット
        </Typography>
        <Box flex={1} />
        <Tooltip title="再読込">
          <span>
            <IconButton
              onClick={() => load()}
              disabled={loading}
              size="medium"
              color="primary"
            >
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </span>
        </Tooltip>
        {webUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<SiSlack size={18} />}
            onClick={() => window.open(webUrl, "_blank", "noopener,noreferrer")}
            sx={{ textTransform: "none" }}
          >
            Slackで開く
          </Button>
        )}
      </Stack>

      <Paper
        elevation={0}
        variant="outlined"
        ref={scrollerRef}
        sx={{
          p: 2,
          height: "70vh",
          overflow: "auto",
          bgcolor: "background.paper",
        }}
      >
        {msgs.map((m) => {
          const uid = m.user ?? "";
          const p = profiles[uid];
          const isMe = uid === me;
          const isSystem = !!m.subtype && m.subtype !== "thread_broadcast";
          const sent = formatSlackTs(m.ts);

          return (
            <Box key={m.ts} sx={{ mb: 1.5 }}>
              {/* 吹き出し行 */}
              <Stack
                direction="row"
                justifyContent={isMe ? "flex-end" : "flex-start"}
                spacing={1}
              >
                {!isMe && !isSystem && (
                  <Avatar
                    src={p?.image || undefined}
                    alt={p?.name || ""}
                    sx={{ width: 32, height: 32, alignSelf: "flex-end" }}
                  />
                )}

                <Box
                  sx={{
                    maxWidth: "70%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 3,
                    bgcolor: isSystem
                      ? "grey.100"
                      : isMe
                      ? "primary.main"
                      : "grey.100",
                    color: isSystem
                      ? "text.secondary"
                      : isMe
                      ? "primary.contrastText"
                      : "text.primary",
                    boxShadow: 0,
                    ...(isMe
                      ? { borderTopRightRadius: 6 }
                      : { borderTopLeftRadius: 6 }),
                    fontStyle: isSystem ? "italic" : "normal",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {!isMe && !isSystem && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {p?.name ?? uid}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {renderText(m.text ?? "", profiles)}
                  </Typography>
                </Box>

                {isMe && !isSystem && (
                  <Avatar
                    src={profiles[uid]?.image || undefined}
                    alt={profiles[uid]?.name || ""}
                    sx={{ width: 32, height: 32, alignSelf: "flex-end" }}
                  />
                )}
              </Stack>

              {/* 送信時刻 */}
              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ opacity: 0.7 }}
                  title={sent.full}
                >
                  {sent.date} {sent.time}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Paper>

      {/* 入力欄 */}
      <Stack direction="row" spacing={1} marginTop={2} marginBottom={2}>
        <TextField
          id={channelId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDownCapture={(e) => {
            const composing =
              isComposing ||
              e.nativeEvent?.isComposing === true ||
              e.keyCode === 229;
            if (e.key === "Enter" && !e.shiftKey) {
              if (composing) return;
              e.preventDefault();
              send();
            }
          }}
          placeholder="メッセージを入力"
          fullWidth
          size="small"
          multiline
          minRows={1}
          maxRows={4}
        />
        <Button variant="contained" onClick={send} disableElevation>
          送信
        </Button>
      </Stack>

      {/* 区切り（任意） */}
      <Divider sx={{ my: 1 }} />
    </Container>
  );
}
