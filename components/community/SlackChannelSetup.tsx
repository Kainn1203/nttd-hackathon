"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Button,
  Container,
  Stack,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Paper,
} from "@mui/material";
import { SiSlack } from "react-icons/si";

// 型定義
interface SlackChannelSetupProps {
  communityId: number;
  communityName: string;
  isOwner: boolean;
  onChannelCreated?: () => void;
}

// 定数
const CONSTANTS = {
  TITLES: {
    SLACK_CHAT: "Slack チャット",
    CHANNEL_CREATION: "Slackチャンネル作成",
  },
  MESSAGES: {
    CHANNEL_NAME_LABEL: "チャンネル名",
    CHANNEL_NAME_PLACEHOLDER: "例: general",
    CHANNEL_DESCRIPTION_LABEL: "説明（オプション）",
    CHANNEL_DESCRIPTION_PLACEHOLDER: "チャンネルの説明を入力してください",
    CREATE_CHANNEL: "チャンネルを作成",
    CREATING_CHANNEL: "作成中...",
    CHANNEL_CREATED: "チャンネルが作成されました！",
  },
  BUTTONS: {
    CREATE_CHANNEL: "チャンネルを作成",
  },
} as const;

// カスタムフック: Slackチャンネル作成
const useSlackChannelCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createChannel = useCallback(
    async (communityId: number, name: string, description: string) => {
      if (!name.trim()) {
        setError("チャンネル名を入力してください");
        return false;
      }

      setIsCreating(true);
      setError(null);
      setSuccess(false);

      try {
        console.log("Slackチャンネル作成開始:", { name, description });

        const response = await fetch("/api/slack/channel/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });

        const data = await response.json();
        console.log("Slackチャンネル作成レスポンス:", {
          status: response.status,
          data,
        });

        if (!response.ok) {
          setError(data.error || "チャンネル作成に失敗しました");
          return false;
        }

        console.log("Slackチャンネル作成成功:", data.channel);

        // チャンネルIDをDBに保存
        const updateResponse = await fetch(
          `/api/community/${communityId}/slack-channel`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slack_channel_id: data.channel.id }),
          }
        );

        if (!updateResponse.ok) {
          const updateErrorData = await updateResponse
            .json()
            .catch(() => ({ error: "レスポンスの解析に失敗" }));
          throw new Error(
            `チャンネルIDの保存に失敗しました: ${updateResponse.status} - ${
              updateErrorData.error || updateResponse.statusText
            }`
          );
        }

        console.log("チャンネルID保存成功");
        setSuccess(true);
        return true;
      } catch (err) {
        console.error("チャンネル作成エラー:", err);
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました"
        );
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isCreating,
    error,
    success,
    createChannel,
    resetState,
  };
};

// チャンネル作成フォーム
const ChannelCreationForm: React.FC<{
  communityName: string;
  onCreateChannel: (name: string, description: string) => Promise<void>;
  isCreating: boolean;
}> = ({ onCreateChannel, isCreating }) => {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!channelName.trim()) return;

      await onCreateChannel(channelName.trim(), description.trim());
    },
    [channelName, description, onCreateChannel]
  );

  return (
    <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
      <Typography variant="h6" fontWeight={700}>
        {CONSTANTS.TITLES.CHANNEL_CREATION}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "80%" }}>
        <Stack spacing={3}>
          <TextField
            label={CONSTANTS.MESSAGES.CHANNEL_NAME_LABEL}
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder={CONSTANTS.MESSAGES.CHANNEL_NAME_PLACEHOLDER}
            fullWidth
            required
            disabled={isCreating}
            size="medium"
          />

          <TextField
            label={CONSTANTS.MESSAGES.CHANNEL_DESCRIPTION_LABEL}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={CONSTANTS.MESSAGES.CHANNEL_DESCRIPTION_PLACEHOLDER}
            fullWidth
            multiline
            rows={3}
            disabled={isCreating}
            size="medium"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!channelName.trim() || isCreating}
            startIcon={
              isCreating ? (
                <CircularProgress size={20} />
              ) : (
                <SiSlack size={18} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: "1rem",
            }}
            size="large"
          >
            {isCreating
              ? CONSTANTS.MESSAGES.CREATING_CHANNEL
              : CONSTANTS.BUTTONS.CREATE_CHANNEL}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

// メインコンポーネント
export default function SlackChannelSetup({
  communityId,
  communityName,
  isOwner,
  onChannelCreated,
}: SlackChannelSetupProps) {
  const [isClient, setIsClient] = useState(false);
  const { createChannel, isCreating, error, success } =
    useSlackChannelCreation();

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsClient(true);
  }, []);

  // チャンネル作成成功時の処理
  useEffect(() => {
    if (success) {
      if (onChannelCreated) {
        onChannelCreated();
      } else {
        window.location.reload();
      }
    }
  }, [success, onChannelCreated]);

  // チャンネル作成処理
  const handleCreateChannel = useCallback(
    async (name: string, description: string) => {
      await createChannel(communityId, name, description);
    },
    [createChannel, communityId]
  );

  // オーナーでない場合は何も表示しない
  if (!isOwner) {
    return null;
  }

  // クライアントサイドでない場合はローディング表示
  if (!isClient) {
    return (
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} margin={2}>
          <Typography variant="h6" fontWeight={700}>
            {CONSTANTS.TITLES.SLACK_CHAT}
          </Typography>
        </Stack>
        <Paper
          variant="outlined"
          elevation={0}
          sx={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1} margin={2}>
        <Typography variant="h6" fontWeight={700}>
          {CONSTANTS.TITLES.SLACK_CHAT}
        </Typography>
      </Stack>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* 成功表示 */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {CONSTANTS.MESSAGES.CHANNEL_CREATED}
          </Typography>
        </Alert>
      )}

      {/* チャンネル作成フォーム */}
      {!success && (
        <Paper
          variant="outlined"
          elevation={0}
          sx={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <ChannelCreationForm
            communityName={communityName}
            onCreateChannel={handleCreateChannel}
            isCreating={isCreating}
          />
        </Paper>
      )}
    </Container>
  );
}
