"use client";

import { useState, KeyboardEvent } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  Schedule,
  Group,
} from "@mui/icons-material";

// Types
import type { Event } from "@/types/event";

interface EventWithMembers extends Event {
  member_count?: number | null;
  is_member?: boolean | null;
  candidate_date?: (string | Date)[]; // ← 型を明確化
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
    onEventClick(event.id as unknown as number);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const formatDate = (input?: string | Date | null) => {
    if (!input) return "日付未設定";
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) return "日付未設定";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // finalized_date が過去かどうかを判定
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時間情報を無視する
  const isPastFinalized =
    event.finalized_date &&
    new Date(event.finalized_date).getTime() < today.getTime();

  // MemberChip の定義
  const MemberChip = (() => {
    if (isPastFinalized) {
      return (
        <Chip
          label="開催済み"
          size="small"
          color="default"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      );
    } else if (isMember) {
      if (event.finalized_date) {
        return (
          <Chip
            label="開催日決定"
            size="small"
            color="success"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      } else {
        return (
          <Chip
            label="日程調整中"
            size="small"
            color="warning"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    } else {
      if (event.is_finalized) {
        return (
          <Chip
            label="参加不可"
            size="small"
            color="default"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      } else {
        return (
          <Chip
            label="参加可能"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    }
  })();

  // カードのスタイル
  const cardSx = (() => {
    if (isPastFinalized) {
      // 開催済みイベント → グレースケール
      return {
        filter: "grayscale(100%)",
        border: "1px solid #d1d5db",
        background: "#f9fafb",
      };
    } else if (isMember) {
      if (event.finalized_date) {
        return {
          border: "2px solid #bbf7d0",
          background: "#fff",
        };
      } else {
        // isMember かつ finalized_date がない → 赤強調
        return {
          border: "2px solid #fecaca",
          background: "#fff",
        };
      }
    } else {
      if (event.is_finalized) {
        // 参加不可 → グレースケール
        return {
          filter: "grayscale(100%)",
          border: "1px solid #d1d5db",
          background: "#f9fafb",
        };
      } else {
        return {
          border: "1px solid #e5e7eb",
          background: "#fff",
        };
      }
    }
  })();

  // Grid View
  if (viewMode === "grid") {
    return (
      <Card
        role="button"
        tabIndex={0}
        aria-label={`${event.name ?? "イベント"}の詳細へ`}
        onKeyDown={handleKeyDown}
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
          cursor: "pointer",
          outline: "none",
          "&:focus-visible": { boxShadow: 6 },
          ...cardSx,
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Tooltip title={event.name ?? ""} placement="top-start">
              <Typography variant="h6" noWrap sx={{ pr: 1, fontWeight: 700 }}>
                {event.name}
              </Typography>
            </Tooltip>
            {MemberChip}
          </Stack>

          {/* Description */}
          <Box mb={2}>
            {event.description ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {showDescription
                    ? event.description
                    : truncateText(event.description, 120)}
                </Typography>
                {event.description.length > 120 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDescription((v) => !v);
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

          <Divider sx={{ mb: 1.5 }} />

          {/* Meta: people & place */}
          <Stack
            direction="row"
            spacing={2}
            mb={1}
            color="text.secondary"
            fontSize="0.875rem"
            flexWrap="wrap"
          >
            <Box display="flex" alignItems="center" mr={2} gap={0.5}>
              <Group fontSize="small" color="primary" />
              <span>
                {event.member_count ?? 0}
                {event.max_participants ? `/${event.max_participants}` : ""}人
              </span>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOn fontSize="small" color="primary" />
              <span>{event.location || "開催地未設定"}</span>
            </Box>
          </Stack>

          {/* Candidate dates */}
          <Box
            display="flex"
            alignItems="center"
            mb={1}
            color="text.secondary"
            fontSize="0.875rem"
            gap={0.5}
            flexWrap="nowrap" // 候補日を折り返さない
            minWidth={0} // 省略表示を効かせるため
          >
            <CalendarToday fontSize="small" color="primary" />

            {event.finalized_date ? (
              // finalized_date がある場合は確定日を表示
              <Typography variant="body2">
                {formatDate(event.finalized_date)}
              </Typography>
            ) : event.candidate_date && event.candidate_date.length > 0 ? (
              // finalized_date がない場合は候補日を 1 行表示（省略あり）
              <Tooltip
                title={event.candidate_date
                  .map((d) => formatDate(d))
                  .join(" / ")}
                arrow
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%", // 親要素に応じて調整
                  }}
                >
                  {event.candidate_date.map((d) => formatDate(d)).join(" / ")}
                </Typography>
              </Tooltip>
            ) : (
              <span>開催日未設定</span>
            )}
          </Box>

          {/* Deadline */}
          <Box
            display="flex"
            alignItems="center"
            mb={2}
            color="text.secondary"
            fontSize="0.875rem"
            gap={0.5}
          >
            <Schedule fontSize="small" color="primary" />
            <span>{formatDate(event.deadline) || "投票締切未設定"}</span>
          </Box>

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
      role="button"
      tabIndex={0}
      aria-label={`${event.name ?? "イベント"}の詳細へ`}
      onKeyDown={handleKeyDown}
      sx={{
        borderLeft: `4px solid ${isMember ? "#3b82f6" : "#d1d5db"}`,
        background: isMember ? "rgba(191,219,254,0.25)" : "#fff",
        borderRadius: 2,
        boxShadow: 2,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
        cursor: "pointer",
        outline: "none",
        "&:focus-visible": { boxShadow: 6 },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
        >
          <Box flex={1} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Tooltip title={event.name ?? ""} placement="top-start">
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: 700, flexShrink: 0 }}
                >
                  {event.name}
                </Typography>
              </Tooltip>
              {MemberChip}
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
              fontSize="0.8rem"
              color="text.secondary"
              flexWrap="wrap"
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Group fontSize="small" />
                <span>{event.member_count ?? 0}人が参加</span>
              </Box>
              {event.created_at && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarToday fontSize="small" />
                  <span>{formatDate(event.created_at)}作成</span>
                </Box>
              )}
              {event.location && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOn fontSize="small" />
                  <span>{event.location}</span>
                </Box>
              )}
            </Stack>
          </Box>

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
