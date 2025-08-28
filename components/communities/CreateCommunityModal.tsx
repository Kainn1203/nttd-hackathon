'use client';

import React from 'react';

interface NewCommunityForm { //フォームデータの型
  name: string; //コミュニティ名（必須）
  description: string; //説明文（オプション扱い）
}

interface CreateCommunityModalProps { //コンポーネントが受け取るpropsの型
  show: boolean; // モーダル表示/非表示の制御
  newCommunity: NewCommunityForm; //現在のフォームデータ
  isSubmitting: boolean; //送信処理中かどうか
  onSubmit: (e: React.FormEvent) => void; //フォーム送信時のハンドラー
  onClose: () => void; //モーダルを閉じる時のハンドラー
  onChange: React.Dispatch<React.SetStateAction<NewCommunityForm>>; //フォーム内容変更時のハンドラー
}

export default function CreateCommunityModal({ //メインコンポーネント
  show,
  newCommunity,
  isSubmitting,
  onSubmit,
  onClose,
  onChange,
}: CreateCommunityModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
        {/* ヘッダー部分 */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">新しいコミュニティを作成</h2>
        </div>
        {/* フォーム開始 */}
        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* 名称入力フィールド */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">名称</label>
              <input
                type="text"
                value={newCommunity.name}
                onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例：BBQ"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* 説明入力フィールド */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">説明</label>
              <textarea
                value={newCommunity.description}
                onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="コミュニティの目的や活動内容など"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* ボタン部分 */}
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
