"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Chat } from "@mui/icons-material";

interface SlackChannelInviteProps {
  eventId: number;
  eventName: string;
  finalizedDate: string;
  isParticipant: boolean;
}

export default function SlackChannelInvite({
  eventId,
  eventName,
  isParticipant,
}: SlackChannelInviteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);

  const handleJoinSlackChannel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/slack-channel`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Slackチャンネルの取得に失敗しました");
      }

      if (data.channel_url) {
        setChannelUrl(data.channel_url);
        // 新しいタブでSlackチャンネルを開く
        window.open(data.channel_url, "_blank");
      } else {
        throw new Error("SlackチャンネルURLが取得できませんでした");
      }
    } catch (err) {
      console.error("Slack channel join error:", err);
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isParticipant) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Chat sx={{ mr: 1, color: "#4A154B" }} />
          <Typography variant="h6">Slackチャンネル</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {eventName}{" "}
          の参加者専用Slackチャンネルに参加して、イベントの詳細や連絡を取り合いましょう！
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Chat />}
          onClick={handleJoinSlackChannel}
          disabled={loading}
          sx={{
            bgcolor: "#4A154B",
            "&:hover": {
              bgcolor: "#3A0E3A",
            },
          }}
        >
          {loading ? "接続中..." : "Slackチャンネルに参加"}
        </Button>

        {channelUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="success.main">
              ✅ Slackチャンネルに正常に接続されました
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
