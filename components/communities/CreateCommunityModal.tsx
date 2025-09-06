// CreateCommunityModal.tsx
'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

interface NewCommunityForm {
  name: string;
  description: string;
  iconFile?: File | null;
  iconPreview?: string | null;
  coverFile?: File | null;
  coverPreview?: string | null;
}

interface CreateCommunityModalProps {
  show: boolean;
  newCommunity: NewCommunityForm;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<NewCommunityForm>>;
}

export default function CreateCommunityModal({
  show,
  newCommunity,
  isSubmitting,
  onSubmit,
  onClose,
  onChange,
}: CreateCommunityModalProps) {
  const handleIconChange = (file: File | null, preview: string | null) => {
    onChange(prev => ({
      ...prev,
      iconFile: file,
      iconPreview: preview
    }));
  };

  const handleCoverChange = (file: File | null, preview: string | null) => {
    onChange(prev => ({
      ...prev,
      coverFile: file,
      coverPreview: preview
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(prev => ({ ...prev, name: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(prev => ({ ...prev, description: e.target.value }));
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" fontWeight={600}>
            新しいコミュニティを作成
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={isSubmitting}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* アイコン画像 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                コミュニティアイコン
              </Typography>
              <ImageUpload
                value={newCommunity.iconPreview}
                onChange={handleIconChange}
                label=""
                description="推奨: 正方形、512×512px以上"
                size="large"
                shape="circle"
                placeholder="アイコンを選択"
              />
            </Box>

            {/* 名称フィールド */}
            <TextField
              label="名称"
              value={newCommunity.name}
              onChange={handleNameChange}
              placeholder="例：BBQ"
              required
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* 説明フィールド */}
            <TextField
              label="説明"
              value={newCommunity.description}
              onChange={handleDescriptionChange}
              placeholder="コミュニティの目的や活動内容など"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !newCommunity.name.trim()}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            {isSubmitting ? '作成中…' : '作成する'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}