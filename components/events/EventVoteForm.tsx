"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import type {
  Event,
  CandidateDate,
  VoteDate,
  EventMember,
} from "@/types/event";
import type { Me } from "@/types/me";

interface EventVoteFormProps {
  event: Event;
  candidates: CandidateDate[];
  myVotes: VoteDate[];
  me: Me;
}

export default function EventVoteForm({
  event,
  candidates,
  myVotes,
  me,
}: EventVoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [votes, setVotes] = useState<Map<number, boolean>>(new Map());

  // 既存の投票があれば読み込み
  useEffect(() => {
    if (myVotes.length > 0) {
      const newVotes = new Map<number, boolean>();
      myVotes.forEach((vote) => {
        newVotes.set(vote.candidate_id, vote.is_yes);
      });
      setVotes(newVotes);
    }
  }, [myVotes]);

  const handleVoteClick = (candidateId: number, isYes: boolean) => {
    const newVotes = new Map(votes);

    if (newVotes.get(candidateId) === isYes) {
      // 同じ投票をクリックした場合は削除
      newVotes.delete(candidateId);
    } else {
      // 新しい投票を設定
      newVotes.set(candidateId, isYes);
    }

    setVotes(newVotes);
  };

  const getVoteStatus = (candidateId: number): boolean | null => {
    return votes.get(candidateId) ?? null;
  };

  const handleSubmit = async () => {
    if (votes.size === 0) {
      setError("少なくとも1つの候補日に投票してください");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const voteData = Array.from(votes.entries()).map(
        ([candidateId, isYes]) => ({
          event_id: event.id,
          candidate_id: candidateId,
          user_id: me?.id || 0,
          is_yes: isYes,
        })
      );

      const response = await fetch("/api/events/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votes: voteData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "投票の送信に失敗しました");
      }

      setSuccess("投票を送信しました！");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <Card sx={{
      background: 'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          候補日に投票
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          参加可能な候補日を選択してください。
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          投票を送信すると、自動的にイベントに参加登録されます。
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {candidates.map((candidate) => {
            const voteStatus = getVoteStatus(candidate.id);
            const isToday =
              new Date(candidate.candidate_date).toDateString() ===
              new Date().toDateString();

            return (
              <Box key={candidate.id}>
                <Box
                  sx={{
                    border: "2px solid",
                    borderColor:
                      voteStatus === true
                        ? "#4caf50"
                        : voteStatus === false
                        ? "#f44336"
                        : isToday
                        ? "#1976d2"
                        : "#e0e0e0",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    bgcolor:
                      voteStatus === true
                        ? "#e8f5e8"
                        : voteStatus === false
                        ? "#ffebee"
                        : isToday
                        ? "#e3f2fd"
                        : "#fafafa",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                    position: "relative",
                  }}
                >
                  {/* 投票状態インジケーター */}
                  {voteStatus !== null && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: voteStatus ? "#4caf50" : "#f44336",
                        color: "white",
                      }}
                    >
                      {voteStatus ? (
                        <CheckCircle sx={{ fontSize: 16 }} />
                      ) : (
                        <Cancel sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom>
                    {formatDate(candidate.candidate_date)}
                  </Typography>

                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant={voteStatus === true ? "contained" : "outlined"}
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleVoteClick(candidate.id, true)}
                      sx={{
                        minWidth: 80,
                        ...(voteStatus === true && {
                          boxShadow: 2,
                        }),
                      }}
                    >
                      参加可
                    </Button>
                    <Button
                      variant={voteStatus === false ? "contained" : "outlined"}
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleVoteClick(candidate.id, false)}
                      sx={{
                        minWidth: 80,
                        ...(voteStatus === false && {
                          boxShadow: 2,
                        }),
                      }}
                    >
                      参加不可
                    </Button>
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            投票を更新するには、送信ボタンを押してください
          </Typography>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || votes.size === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "送信中..." : "投票を送信"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
