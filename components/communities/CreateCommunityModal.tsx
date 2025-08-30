// CreateCommunityModal.tsx
'use client';
import React from 'react';
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
  if (!show) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">新しいコミュニティを作成</h2>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 space-y-6">
            
            {/* アイコン画像 */}
            <ImageUpload
              value={newCommunity.iconPreview}
              onChange={handleIconChange}
              label="コミュニティアイコン"
              description="推奨: 正方形、512×512px以上"
              size="large"
              shape="circle"
              placeholder="アイコンを選択"
            />

            {/* カバー画像 */}
            <ImageUpload
              value={newCommunity.coverPreview}
              onChange={handleCoverChange}
              label="カバー画像（オプション）"
              description="推奨: 16:9、1920×1080px以上"
              size="large"
              shape="rectangle"
              placeholder="カバー画像を選択"
            />

            {/* 既存のフォームフィールド */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={newCommunity.name}
                onChange={(e) => onChange(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例：BBQ"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={newCommunity.description}
                onChange={(e) => onChange(prev => ({ ...prev, description: e.target.value }))}
                placeholder="コミュニティの目的や活動内容など"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newCommunity.name.trim()}
              className={`px-4 py-2 rounded-lg text-white ${
                isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? '作成中…' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}