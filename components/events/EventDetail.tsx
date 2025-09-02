"use client";

import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  Schedule,
  Group,
  Person,
} from "@mui/icons-material";
import type { EventWithCandidates } from "@/types/event";

interface EventDetailProps {
  event: EventWithCandidates;
  ownerName: string;
}

export default function EventDetail({ event, ownerName }: EventDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatCandidateDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

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

  const getStatusColor = () => {
    if (event.is_finalized) return "success";
    if (new Date(event.deadline) < new Date()) return "error";
    return "default";
  };

  const getStatusText = () => {
    if (event.is_finalized) return "確定済み";
    if (new Date(event.deadline) < new Date()) return "締切済み";
    return "募集中";
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {event.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              size="medium"
            />
            {event.image_path && (
              <Chip label="画像あり" variant="outlined" size="small" />
            )}
          </Stack>
        </Box>

        {event.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {event.description}
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <CalendarToday color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    候補日
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {event.candidates.map((candidate) => (
                      <Box
                        key={candidate.id}
                        sx={{
                          bgcolor: "primary.50",
                          color: "primary.main",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        {formatCandidateDate(candidate.candidate_date)}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {event.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      場所
                    </Typography>
                    <Typography variant="body1">{event.location}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Schedule color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    回答締切
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(event.deadline)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Group color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    最大参加者数
                  </Typography>
                  <Typography variant="body1">
                    {event.max_participants}名
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    主催者
                  </Typography>
                  <Typography variant="body1">{ownerName}</Typography>
                </Box>
              </Box>

              {event.finalized_date && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarToday color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      確定日
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(event.finalized_date)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>

          <Box>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                参加状況
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {event.participants_count}名
              </Typography>
              <Typography variant="body2" color="text.secondary">
                現在の投票者数
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
