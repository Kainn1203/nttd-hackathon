"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Announcement } from "@mui/icons-material";
import { useEffect, useState } from "react";
import type { EventAnnouncement } from "@/types/event";

interface AnnouncementListProps {
  eventId: number;
}

export default function AnnouncementList({ eventId }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<EventAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}/announcements`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || "アナウンスの取得に失敗しました");
      }

      setAnnouncements(result.data || []);
    } catch (err) {
      console.error("Announcements fetch error:", err);
      setError(
        err instanceof Error ? err.message : "アナウンスの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    // アナウンス作成時のカスタムイベントをリッスン
    const handleAnnouncementCreated = () => {
      fetchAnnouncements();
    };

    window.addEventListener("announcementCreated", handleAnnouncementCreated);

    return () => {
      window.removeEventListener(
        "announcementCreated",
        handleAnnouncementCreated
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card sx={{ mb: 2, background: 'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)' }}>
        <CardContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Announcement
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              まだアナウンスはありません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Announcement color="primary" />
        アナウンス
      </Typography>

      <Stack spacing={2}>
        {announcements.map((announcement) => (
          <Card
            key={announcement.id}
            sx={{
              borderLeft: 4,
              borderLeftColor: "primary.main",
              background:
                'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Chip
                  label="重要"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(announcement.created_at)}
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {announcement.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
