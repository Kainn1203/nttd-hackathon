"use client";

import { useState } from "react";

// Types - 既存の型定義を使用
import type { Community } from "@/types/community";

interface CommunityWithMembers extends Community {
  //基本のCommunity型に追加情報を付けた型
  member_count?: number; //メンバー数
  is_member?: boolean; //参加中かどうか
}

interface CommunityCardProps {
  //このコンポーネントが受け取るデータの型
  community: CommunityWithMembers; //表示するコミュニティの情報
  isMember: boolean; //現在のユーザーが参加中かどうか
  viewMode: "grid" | "list"; //表示形式（グリッドかリストか）
  onCommunityClick: (communityId: number) => void; //クリック時に実行する関数
}

export default function CommunityCard({
  //上で定義したpropsを受け取る
  community,
  isMember,
  viewMode,
  onCommunityClick,
}: CommunityCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  const handleCardClick = () => {
    //カード全体がクリックされた時の処理
    onCommunityClick(community.id); //コミュニティのIDを渡す（詳細ページに移動するため）
  };

  const formatDate = (dateString: string | null) => {
    // null許容に変更
    if (!dateString) return "日付未設定"; // nullチェック追加
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const truncateText = (text: string, maxLength: number) => {
    //文字切り詰め関数
    if (text.length <= maxLength) return text; //長いテキストを指定した文字数で切る
    return text.substring(0, maxLength) + "...";
  };

  // Grid View （グリッド表示）
  if (viewMode === "grid") {
    return (
      <div
        className={`bg-white rounded-2xl shadow-sm hover:shadow-sm transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${
          isMember
            ? "border-2 border-blue-200 bg-blue-50/30"
            : "border border-gray-200"
        }`}
        onClick={handleCardClick}
      
      style={{ background: "linear-gradient(180deg, rgba(33,150,243,0.06) 0%, rgba(33,150,243,0.02) 100%)" }}>
        <div className="p-6">
          {/* Header (ヘッダー部分)*/}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                {community.name}
              </h3>
            </div>
            <div className="flex-shrink-0">
              {isMember ? (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  参加中
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  未参加
                </span>
              )}
            </div>
          </div>

          {/* Description (説明文部分)*/}
          <div className="mb-4">
            {community.description ? ( //説明があるかチェック(「もっと見る」ボタン)
              <div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {showDescription
                    ? community.description
                    : truncateText(community.description, 100)}
                </p>
                {community.description.length > 100 && (
                  <button
                    onClick={(e) => {
                      //100文字超の場合のみ表示
                      e.stopPropagation(); //カード全体のクリックイベントを止める
                      setShowDescription(!showDescription);
                    }}
                    className="text-blue-600 text-xs mt-1 hover:text-blue-700 font-medium"
                  >
                    {showDescription ? "少なく表示" : "もっと見る"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">
                コミュニティの説明はありません
              </p>
            )}
          </div>

          {/* Stats (統計情報部分)*/}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4H4zM16 13v5h3v-5h-3zM13 13.5h-2V18h2v-4.5zM7 14h3v4H7v-4z" />
                </svg>
                <span>{community.member_count || 0}人</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>{formatDate(community.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Button - 詳細ボタンのみ */}
          <div className="flex justify-center p-2">
            <button
              onClick={handleCardClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-2xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              詳細を見る
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View（リスト表示）
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-sm transition-all duration-200 cursor-pointer ${
        isMember
          ? "border-l-4 border-blue-500 bg-blue-50/30"
          : "border-l-4 border-gray-300"
      }`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate mr-3">
                {community.name}
              </h3>
              {isMember ? (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                  参加中
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex-shrink-0">
                  未参加
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {community.description || "コミュニティの説明はありません"}
            </p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4H4zM16 13v5h3v-5h-3zM13 13.5h-2V18h2v-4.5zM7 14h3v4H7v-4z" />
                </svg>
                <span>{community.member_count || 0}人が参加</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>{formatDate(community.created_at)}作成</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={handleCardClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              詳細
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
