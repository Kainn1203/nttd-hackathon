"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { Announcement, Event } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Link from "next/link";

type AnnouncementFeedItem = {
  id: number;
  event_id: number;
  description: string;
  created_at: string;
  event_name: string;
};

export default function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<AnnouncementFeedItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/announcements");
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
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      month: "short",
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
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Announcement
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              新しいアナウンスはありません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Announcement color="primary" />
          <Typography variant="h6" component="h2">
            最新のアナウンス
          </Typography>
        </Box>

        <Stack spacing={2}>
          {announcements.map((announcement) => (
            <Box
              key={announcement.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <MuiLink
                  component={Link}
                  href={`/events/${announcement.event_id}`}
                  color="primary"
                  sx={{ textDecoration: "none", fontWeight: 600 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Event fontSize="small" />
                    {announcement.event_name}
                  </Box>
                </MuiLink>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(announcement.created_at)}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {announcement.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
