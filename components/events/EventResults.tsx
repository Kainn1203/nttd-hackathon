"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";
import { CheckCircle, Cancel, Event } from "@mui/icons-material";
import type { EventWithCandidates } from "@/types/event";

interface EventResultsProps {
  event: EventWithCandidates;
  isOwner: boolean;
  isDeadlinePassed: boolean;
  members: { id: number; name: string; imageUrl?: string }[];
}

interface CandidateResult {
  candidate_id: number;
  candidate_date: string;
  yes_count: number;
  no_count: number;
  total_count: number;
  is_recommended: boolean;
}

export default function EventResults({
  event,
  isOwner,
  isDeadlinePassed,
  members,
}: EventResultsProps) {
  const [loading, setLoading] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [showVotersDialog, setShowVotersDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 各候補日の結果を計算
  const candidateResults = useMemo(() => {
    const results: CandidateResult[] = [];

    event.candidates.forEach((candidate) => {
      const votes = event.votes.filter((v) => v.candidate_id === candidate.id);

      const yes_count = votes.filter((v) => v.is_yes === true).length;
      const no_count = votes.filter((v) => v.is_yes === false).length;
      const total_count = yes_count + no_count;

      results.push({
        candidate_id: candidate.id,
        candidate_date: candidate.candidate_date,
        yes_count,
        no_count,
        total_count,
        is_recommended: false,
      });
    });

    // 推薦日を決定（主催者が参加可能で、参加人数が最大の日）
    const ownerMember = event.members.find((m) => m.user_id === event.owner_id);
    const ownerVotes = ownerMember
      ? event.votes.filter((v) => v.event_member_id === ownerMember.id)
      : [];
    const ownerYesCandidates = ownerVotes
      .filter((v) => v.is_yes === true)
      .map((v) => v.candidate_id);

    if (ownerYesCandidates.length > 0) {
      const maxYes = Math.max(
        ...results
          .filter((r) => ownerYesCandidates.includes(r.candidate_id))
          .map((r) => r.yes_count)
      );

      results.forEach((result) => {
        if (
          ownerYesCandidates.includes(result.candidate_id) &&
          result.yes_count === maxYes
        ) {
          result.is_recommended = true;
        }
      });
    }

    return results;
  }, [event]);

  const getHeatmapColor = (result: CandidateResult) => {
    const maxYes = Math.max(...candidateResults.map((r) => r.yes_count));
    const ratio = maxYes > 0 ? result.yes_count / maxYes : 0;

    if (result.is_recommended) {
      return {
        background: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
        border: "#ff9800",
        shadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
      };
    }

    if (ratio > 0.8) {
      return {
        background: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
        border: "#ff9800",
        shadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
      };
    }

    if (ratio > 0.5) {
      return {
        background: "linear-gradient(135deg, #ffb74d 0%, #ffcc80 100%)",
        border: "#ff9800",
        shadow: "0 4px 20px rgba(255, 183, 77, 0.3)",
      };
    }

    if (ratio > 0.2) {
      return {
        background: "linear-gradient(135deg, #ffcc80 0%, #ffe0b2 100%)",
        border: "#ff9800",
        shadow: "0 4px 20px rgba(255, 204, 128, 0.3)",
      };
    }

    return {
      background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
      border: "#ff9800",
      shadow: "0 2px 10px rgba(255, 204, 128, 0.2)",
    };
  };

  const handleFinalize = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "イベントの確定に失敗しました");
      }

      setSuccess(
        !isDeadlinePassed
          ? "早期締切・確定が完了しました！参加者専用のSlackチャンネルが作成されました。"
          : "イベントが確定されました！参加者専用のSlackチャンネルが作成されました。"
      );
      setShowFinalizeDialog(false);
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
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const handleCandidateClick = (result: CandidateResult) => {
    setSelectedCandidate(result);
    setShowVotersDialog(true);
  };

  const getVotersForCandidate = (candidateId: number) => {
    const yesVotes = event.votes.filter(
      (v) => v.candidate_id === candidateId && v.is_yes === true
    );
    const noVotes = event.votes.filter(
      (v) => v.candidate_id === candidateId && v.is_yes === false
    );
    return { yesVotes, noVotes };
  };

  const getUserName = (eventMemberId: number) => {
    const eventMember = event.members.find((m) => m.id === eventMemberId);
    if (!eventMember) return `ユーザー${eventMemberId}`;

    const member = members.find((m) => m.id === eventMember.user_id);
    return member ? member.name : `ユーザー${eventMember.user_id}`;
  };

  if (event.is_finalized) {
    const finalizedDate = event.finalized_date;
    const participantCount = event.members.length;

    return (
      <Card sx={{
        background: 'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            イベント確定済み
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              このイベントは確定済みです。日程調整は終了しました。
            </Alert>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                p: 2,
                bgcolor: "rgba(76, 175, 80, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  確定日程
                </Typography>
                <Typography variant="h6" color="success.main">
                  {finalizedDate
                    ? new Date(finalizedDate).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })
                    : "未設定"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  参加者数
                </Typography>
                <Typography variant="h6" color="success.main">
                  {participantCount}名
                </Typography>
              </Box>
            </Box>

            {/* 参加者一覧 */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                参加者一覧
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {event.members.map((member) => {
                  const user = members.find((m) => m.id === member.user_id);
                  return (
                    <Box
                      key={member.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        bgcolor: "rgba(76, 175, 80, 0.1)",
                        borderRadius: 1,
                        border: "1px solid rgba(76, 175, 80, 0.2)",
                      }}
                    >
                      {user?.imageUrl && (
                        <Box
                          component="img"
                          src={user.imageUrl}
                          alt={user.name}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.primary">
                        {user?.name || `ユーザー${member.user_id}`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{
        background: 'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)'
      }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">日程調整結果</Typography>
            {isOwner && !event.is_finalized && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {!isDeadlinePassed && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Event />}
                    onClick={() => setShowFinalizeDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    早期締切・確定
                  </Button>
                )}
                {isDeadlinePassed && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Event />}
                    onClick={() => setShowFinalizeDialog(true)}
                  >
                    イベントを確定
                  </Button>
                )}
              </Box>
            )}
          </Box>

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

          {!isDeadlinePassed && (
            <Alert severity="info" sx={{ mb: 2 }}>
              回答締切まで日程調整を続けています
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
            }}
          >
            {candidateResults.map((result) => {
              const isToday =
                new Date(result.candidate_date).toDateString() ===
                new Date().toDateString();
              const heatmapStyle = getHeatmapColor(result);

              return (
                <Box key={result.candidate_id}>
                  <Box
                    onClick={() => handleCandidateClick(result)}
                    sx={{
                      background: heatmapStyle.background,
                      border: `2px solid ${heatmapStyle.border}`,
                      borderRadius: 3,
                      p: 3,
                      textAlign: "center",
                      position: "relative",
                      transition: "all 0.3s ease",
                      boxShadow: heatmapStyle.shadow,
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      },
                      ...(isToday && {
                        border: "3px solid #1976d2",
                        boxShadow:
                          "0 0 0 2px rgba(25, 118, 211, 0.2), " +
                          heatmapStyle.shadow,
                      }),
                      ...(result.is_recommended && {
                        border: "3px solid #ff9800",
                        boxShadow:
                          "0 0 0 2px rgba(255, 152, 0, 0.3), " +
                          heatmapStyle.shadow,
                      }),
                    }}
                  >
                    {/* 推奨バッジ */}
                    {result.is_recommended && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                        }}
                      >
                        <Chip
                          label="推奨"
                          size="small"
                          sx={{
                            bgcolor: "rgba(25, 118, 210, 0.9)",
                            color: "white",
                            fontWeight: "bold",
                            backdropFilter: "blur(10px)",
                            "& .MuiChip-label": {
                              fontSize: "11px",
                              px: 1,
                            },
                          }}
                        />
                      </Box>
                    )}

                    {/* 日付 */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: result.is_recommended ? "white" : "text.primary",
                        textShadow: result.is_recommended
                          ? "0 1px 2px rgba(0,0,0,0.3)"
                          : "none",
                      }}
                    >
                      {formatDate(result.candidate_date)}
                    </Typography>

                    {/* 投票数 */}
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: "bold",
                          color: result.is_recommended
                            ? "white"
                            : "primary.main",
                          textShadow: result.is_recommended
                            ? "0 1px 2px rgba(0,0,0,0.3)"
                            : "none",
                        }}
                      >
                        {result.yes_count}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: result.is_recommended
                            ? "rgba(255,255,255,0.9)"
                            : "text.secondary",
                          textShadow: result.is_recommended
                            ? "0 1px 2px rgba(0,0,0,0.3)"
                            : "none",
                        }}
                      >
                        参加可能
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: 1, background:
            'linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)' }}>
            <Typography variant="body2" color="text.secondary">
              ヒートマップ: 参加可能な人数が多い候補日ほど濃い緑色で表示されます
            </Typography>
            <Typography variant="body2" color="text.secondary">
              推奨日: 主催者が参加可能で、参加人数が最大の候補日
            </Typography>
            <Typography variant="body2" color="text.secondary">
              パネルをクリックすると投票者一覧を確認できます
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 確定確認ダイアログ */}
      <Dialog
        open={showFinalizeDialog}
        onClose={() => setShowFinalizeDialog(false)}
      >
        <DialogTitle>
          {!isDeadlinePassed
            ? "早期締切・確定を実行しますか？"
            : "イベントを確定しますか？"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {!isDeadlinePassed ? (
              <>
                早期締切・確定を実行すると、回答締切日を待たずにイベントが確定されます。
                日程調整は終了し、参加者専用のSlackチャンネルが自動作成されます。
                参加者にはSlackで通知が送信されます。
                この操作は取り消すことができません。
              </>
            ) : (
              <>
                イベントを確定すると、日程調整は終了し、参加者専用のSlackチャンネルが自動作成されます。
                参加者にはSlackで通知が送信されます。
                この操作は取り消すことができません。
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowFinalizeDialog(false)}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleFinalize}
            color={!isDeadlinePassed ? "warning" : "success"}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? "確定中..."
              : !isDeadlinePassed
              ? "早期締切・確定する"
              : "確定する"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 投票者一覧ダイアログ */}
      <Dialog
        open={showVotersDialog}
        onClose={() => setShowVotersDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCandidate && formatDate(selectedCandidate.candidate_date)}{" "}
          の投票者一覧
        </DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  <CheckCircle sx={{ mr: 1, verticalAlign: "middle" }} />
                  参加可能 ({selectedCandidate.yes_count}名)
                </Typography>
                <List dense>
                  {getVotersForCandidate(
                    selectedCandidate.candidate_id
                  ).yesVotes.map((vote) => (
                    <ListItem key={vote.id}>
                      <Avatar sx={{ mr: 2, bgcolor: "success.main" }}>
                        {getUserName(vote.event_member_id).charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={getUserName(vote.event_member_id)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {selectedCandidate.no_count > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="h6" color="error.main" gutterBottom>
                      <Cancel sx={{ mr: 1, verticalAlign: "middle" }} />
                      参加不可 ({selectedCandidate.no_count}名)
                    </Typography>
                    <List dense>
                      {getVotersForCandidate(
                        selectedCandidate.candidate_id
                      ).noVotes.map((vote) => (
                        <ListItem key={vote.id}>
                          <Avatar sx={{ mr: 2, bgcolor: "error.main" }}>
                            {getUserName(vote.event_member_id).charAt(0)}
                          </Avatar>
                          <ListItemText
                            primary={getUserName(vote.event_member_id)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVotersDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
