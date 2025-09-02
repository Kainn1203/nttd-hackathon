"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";

// Types
import type { Event } from "@/types/event";

interface EventWithMembers extends Event {
  member_count?: number;
  is_member?: boolean;
}

interface EventCardProps {
  event: EventWithMembers;
  isMember: boolean;
  viewMode: "grid" | "list";
  onEventClick: (eventId: number) => void;
}

export default function EventCard({
  event,
  isMember,
  viewMode,
  onEventClick,
}: EventCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  const handleCardClick = () => {
    onEventClick(event.id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "日付未設定";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Grid View
  if (viewMode === "grid") {
    return (
      <Card
        sx={{
          border: isMember ? "2px solid #bfdbfe" : "1px solid #e5e7eb",
          backgroundColor: isMember ? "rgba(191,219,254,0.3)" : "#fff",
          borderRadius: 2,
          boxShadow: 2,
          transition: "all 0.2s",
          "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
          cursor: "pointer",
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="h6" noWrap sx={{ pr: 1 }}>
              {event.name}
            </Typography>
            <Chip
              label={isMember ? "参加中" : "未参加"}
              size="small"
              color={isMember ? "primary" : "default"}
              variant={isMember ? "filled" : "outlined"}
            />
          </Stack>

          {/* Description */}
          <Box mb={2}>
            {event.description ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {showDescription
                    ? event.description
                    : truncateText(event.description, 100)}
                </Typography>
                {event.description.length > 100 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDescription(!showDescription);
                    }}
                    sx={{ mt: 0.5 }}
                  >
                    {showDescription ? "少なく表示" : "もっと見る"}
                  </Button>
                )}
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.disabled"
                fontStyle="italic"
              >
                コミュニティの説明はありません
              </Typography>
            )}
          </Box>

          {/* Stats */}
          <Stack
            direction="row"
            spacing={3}
            mb={2}
            color="text.secondary"
            fontSize="0.875rem"
          >
            <Box display="flex" alignItems="center">
              <GroupIcon fontSize="small" sx={{ mr: 0.5 }} />
              {event.member_count || 0}
              {event.maxParticipants ? "/" + event.maxParticipants : null}人
            </Box>
            <Box display="flex" alignItems="center">
              <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
              {formatDate(event.created_at)}
            </Box>
          </Stack>

          {/* Event Info */}
          {/* <Box mb={2} color="text.secondary" fontSize="0.875rem">
            {event.startDate && event.endDate && (
              <Box>
                🕒 {formatDate(event.startDate)} ～ {formatDate(event.endDate)}
              </Box>
            )}
            {event.maxParticipants && (
              <Box>🎫 定員: {event.maxParticipants}人</Box>
            )}
            {event.location && <Box>📍 場所: {event.location}</Box>}
            {event.recruitmentEnd && (
              <Box>⏳ 募集締切: {formatDate(event.deadline)}</Box>
            )}
          </Box> */}

          {/* Action Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCardClick}
          >
            詳細を見る
          </Button>
        </CardContent>
      </Card>
    );
  }

  // List View
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${isMember ? "#3b82f6" : "#d1d5db"}`,
        backgroundColor: isMember ? "rgba(191,219,254,0.3)" : "#fff",
        borderRadius: 2,
        boxShadow: 2,
        transition: "all 0.2s",
        "&:hover": { boxShadow: 4 },
        cursor: "pointer",
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box flex={1} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="h6" noWrap sx={{ flexShrink: 0 }}>
                {event.name}
              </Typography>
              <Chip
                label={isMember ? "参加中" : "未参加"}
                size="small"
                color={isMember ? "primary" : "default"}
                variant={isMember ? "filled" : "outlined"}
              />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mb: 1 }}
            >
              {event.description || "コミュニティの説明はありません"}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              fontSize="0.75rem"
              color="text.secondary"
            >
              <Box display="flex" alignItems="center">
                👥 {event.member_count || 0}人が参加
              </Box>
              <Box display="flex" alignItems="center">
                📅 {formatDate(event.created_at)}作成
              </Box>
            </Stack>
          </Box>

          {/* Event Info */}
          {/* <Stack
            direction="column"
            spacing={0.5}
            fontSize="0.75rem"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {event.startDate && event.endDate && (
              <Box>
                🕒 {formatDate(event.startDate)} ～ {formatDate(event.endDate)}
              </Box>
            )}
            {event.maxParticipants && (
              <Box>🎫 定員: {event.maxParticipants}人</Box>
            )}
            {event.location && <Box>📍 場所: {event.location}</Box>}
            {event.deadline && (
              <Box>⏳ 募集締切: {formatDate(event.deadline)}</Box>
            )}
          </Stack> */}

          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            詳細
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
