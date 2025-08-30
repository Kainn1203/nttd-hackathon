"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Box,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import TextsmsIcon from "@mui/icons-material/Textsms";
import PersonIcon from "@mui/icons-material/Person";

interface Member {
  id: number;
  last_name: string;
  first_name: string;
  last_name_katakana: string;
  first_name_katakana: string;
  handle_name: string;
  origin: string;
  hobby: string[];
  image_path: string | null;
  pr: string | null;
}

interface MemberDialogProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
}

export default function MemberDialog({
  open,
  member,
  onClose,
}: MemberDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 4,
            alignItems: { xs: "center", sm: "flex-start" },
          }}
        >
          <Avatar
            src={member.image_path || undefined}
            alt={member.handle_name}
            sx={{
              width: 200,
              height: 200,
              border: "2px solid #eee",
              boxShadow: 2,
            }}
          />
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography variant="subtitle1">
              {member.last_name_katakana} {member.first_name_katakana}
            </Typography>

            <Typography variant="h5" fontWeight="bold">
              {member.last_name} {member.first_name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <InfoItem
              icon={<PersonIcon fontSize="small" color="action" />}
              label="ハンドルネーム"
              value={member.handle_name}
            />

            <InfoItem
              icon={<LocationOnIcon fontSize="small" color="action" />}
              label="出身"
              value={member.origin}
            />

            {member.hobby?.length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mt: 2 }}
                >
                  <StarIcon fontSize="small" sx={{ mr: 1 }} color="action" />
                  趣味
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: 100,
                    overflowY: "auto",
                    mb: 2,
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
              </>
            )}

            {member.pr && (
              <>
                <Typography variant="subtitle1" fontWeight="bold">
                  <TextsmsIcon fontSize="small" sx={{ mr: 1 }} color="action" />
                  一言PR
                </Typography>
                <Typography variant="body2">{member.pr}</Typography>
              </>
            )}
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
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        {icon} {label}
      </Typography>
      <Typography variant="subtitle1">{value}</Typography>
    </Box>
  );
}
