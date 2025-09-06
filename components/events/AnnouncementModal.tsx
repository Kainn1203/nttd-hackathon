"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  onAnnouncementCreated: () => void;
}

export default function AnnouncementModal({
  open,
  onClose,
  eventId,
  onAnnouncementCreated,
}: AnnouncementModalProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("アナウンス内容を入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      const result = await response.json();

      if (!result.ok) {
        console.error("API Error:", result);
        throw new Error(
          result.details || result.error || "アナウンスの作成に失敗しました"
        );
      }

      // 成功時の処理
      setDescription("");
      onAnnouncementCreated();
      onClose();
    } catch (err) {
      console.error("Announcement creation error:", err);
      setError(
        err instanceof Error ? err.message : "アナウンスの作成に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          イベントアナウンス
        </Typography>
        <Typography variant="body2" color="text.secondary">
          参加者に伝えたい情報を入力してください
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例：○○で○○をします！ぜひご参加ください！！"
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !description.trim()}
          variant="contained"
          sx={{ borderRadius: 1 }}
        >
          {isSubmitting ? "送信中..." : "アナウンスを送信"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
