"use client";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Divider,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import TextsmsIcon from "@mui/icons-material/Textsms";
import PersonIcon from "@mui/icons-material/Person";

interface Member {
  id: number;
  last_name: string;
  first_name: string;
  hobby: string[];
  hobbyIds: number[];
  university: string;
  image_path?: string | null;
  last_name_katakana: string;
  first_name_katakana: string;
  handle_name: string;
  origin: string;
  pr: string;
  scores: number;
  diagnosis_result: string;
}

interface MemberDialogProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
}

interface Diagnosis {
  label: string;
  image: string | null;
  bgcolor: string;
  bodercolor: string;
}

// スコアに応じた診断結果を返す関数
function getDiagnosis(name: string | null): Diagnosis {
  if (name) {
    if (name.includes("ゆる")) {
      return {
        label: "ゆるふわ KAIWAI",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/a.png",
        bgcolor: "#FFE4E7",
        bodercolor: "#CC4B68",
      };
    } else if (name.includes("定時")) {
      return {
        label: "今日、定時に恋しました。",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/b.png",
        bgcolor: "#E0F7F9",
        bodercolor: "#007B8A",
      };
    } else if (name.includes("タイパ")) {
      return {
        label: "タイパ重視",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/c.png",
        bgcolor: "#FFF4CC",
        bodercolor: "#E6A700",
      };
    } else if (name.includes("残業するのは")) {
      return {
        label: "残業するのは、ダメですか？",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/d.png",
        bgcolor: "#EAF7EC",
        bodercolor: "#2F6B3D",
      };
    } else
      return {
        label: "残業が尊い….！",
        image:
          "https://dxzemwwaldgwnjkviyfn.supabase.co/storage/v1/object/public/diagnosis_images/e.png",
        bgcolor: "#F0E9FF",
        bodercolor: "#6A4FB6",
      };
  } else
    return {
      label: "診断結果がありません",
      image: null,
      bgcolor: "#ffffff",
      bodercolor: "#ffffff",
    };
}

export default function MemberDialog({
  open,
  member,
  onClose,
}: MemberDialogProps) {
  if (!member) return null;

  const diagnosis = getDiagnosis(member.diagnosis_result);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 4,
            alignItems: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* プロフィール画像 */}
          <Avatar
            src={member.image_path || undefined}
            alt={member.handle_name}
            sx={{
              width: 180,
              height: 180,
              border: "2px solid #eee",
              boxShadow: 2,
            }}
          />

          {/* メイン情報 */}
          <Box sx={{ flex: 1, width: "100%" }}>
            {/* 氏名 */}
            <Typography variant="subtitle1" color="text.secondary">
              {member.last_name_katakana} {member.first_name_katakana}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {member.last_name} {member.first_name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* ハンドルネーム */}
            <InfoItem
              icon={<PersonIcon fontSize="small" color="action" />}
              label="ハンドルネーム"
              value={member.handle_name}
            />

            {/* 出身 */}
            <InfoItem
              icon={<LocationOnIcon fontSize="small" color="action" />}
              label="出身"
              value={member.origin}
            />

            {/* 趣味 */}
            {member.hobby?.length > 0 && (
              <InfoItem
                icon={<StarIcon fontSize="small" color="action" />}
                label="趣味"
                value={
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      maxHeight: 100,
                      overflowY: "auto",
                    }}
                  >
                    {member.hobby.map((h, i) => (
                      <Chip
                        key={i}
                        label={`#${h}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                }
              />
            )}

            {/* PR */}
            {member.pr && (
              <InfoItem
                icon={<TextsmsIcon fontSize="small" color="action" />}
                label="一言PR"
                value={member.pr}
              />
            )}

            <Divider sx={{ my: 2 }} />

            {/* 社畜診断結果 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: getDiagnosis(member.diagnosis_result).bgcolor,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  position: "relative",
                  width: 340,
                }}
              >
                {diagnosis.image && (
                  <Avatar
                    src={diagnosis.image}
                    alt={diagnosis.label}
                    sx={{
                      width: 80,
                      height: 80,
                      border: `2px solid ${
                        getDiagnosis(member.diagnosis_result).bodercolor
                      }`,
                    }}
                  />
                )}
                <Box>
                  <Typography variant="subtitle2">社畜度診断結果</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {diagnosis.label}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode | string | null;
}) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        {icon} {label}
      </Typography>
      {typeof value === "string" ? (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
}
