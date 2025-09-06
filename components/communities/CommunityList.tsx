'use client';

import { useState } from 'react';
import CommunityCard from './CommunityCard';

// Types - 既存の型定義を使用
import type { Community } from '@/types/community';

interface CommunityWithMembers extends Community { //メンバー数情報を追加した拡張型
  member_count?: number;
  is_member?: boolean;
}

interface CommunityListProps { //親から受け取るデータの型
  myCommunities: CommunityWithMembers[];
  otherCommunities: CommunityWithMembers[];
  onCommunityClick: (communityId: number) => void;
}

interface FilterState { //フィルター・ソート条件の型
  search: string;
  sortBy: 'newest' | 'oldest' | 'members' | 'name';
  showJoinedOnly: boolean;
}

export default function CommunityList({
  myCommunities,
  otherCommunities,
  onCommunityClick,
}: CommunityListProps) {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    sortBy: 'newest',
    showJoinedOnly: false
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort communities
  const filterCommunities = (communities: CommunityWithMembers[]) => { // Community[] → CommunityWithMembers[] に変更
    let filtered = communities;

    // 検索フィルター
    if (filter.search) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        (community.description?.toLowerCase() || '').includes(filter.search.toLowerCase()) // null チェック追加
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest': //新しい順（作成日時の降順）
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0); // null チェック
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0); // null チェック
          return dateB.getTime() - dateA.getTime();
        case 'oldest': //古い順（作成日時の昇順）
          const dateAOld = a.created_at ? new Date(a.created_at) : new Date(0); // null チェック
          const dateBOld = b.created_at ? new Date(b.created_at) : new Date(0); // null チェック
          return dateAOld.getTime() - dateBOld.getTime();
        case 'members': // メンバー数の多い順
          return (b.member_count || 0) - (a.member_count || 0); // member_countは CommunityWithMembers で定義済みなのでOK
        case 'name': //名前順
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // 追加：null/undefined な要素を除去（型は CommunityWithMembers で想定）
  const safeMy = (myCommunities ?? []).filter((c): c is CommunityWithMembers => !!c && typeof c.id === 'number');
  const safeOther = (otherCommunities ?? []).filter((c): c is CommunityWithMembers => !!c && typeof c.id === 'number');

  // 既存の filtered 系を safe 系から作るように少し差し替え
  const filteredMyCommunities = filterCommunities(safeMy);
  const filteredOtherCommunities = filterCommunities(safeOther);

  const displayCommunities = filter.showJoinedOnly 
    ? filteredMyCommunities 
    : [...filteredMyCommunities, ...filteredOtherCommunities];

  const isEmpty = displayCommunities.length === 0;
  const hasNoCommunities = myCommunities.length === 0 && otherCommunities.length === 0;

  return (
    // UI
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="コミュニティを検索..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* フィルター切り替え */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filter.showJoinedOnly}
                onChange={(e) => setFilter({ ...filter, showJoinedOnly: e.target.checked })} //チェックボックスで参加中のコミュニティのみ表示を切り替え
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              参加中のみ
            </label>

            {/* Sort */}
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as FilterState['sortBy'] })}  //プルダウンでソート条件を選択
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="members">メンバー数順</option>
              <option value="name">名前順</option>
            </select>

            {/* 表示モード切り替え */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button //グリッド/リスト表示の切り替えボタン
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filter.showJoinedOnly ? (
            <>参加中のコミュニティ: {filteredMyCommunities.length}個</>
          ) : (
            <>
              全{displayCommunities.length}個のコミュニティ 
              (参加中: {filteredMyCommunities.length}個, 参加可能: {filteredOtherCommunities.length}個)
            </>
          )}
        </div>
      </div>

      {/* 条件分岐表示部分 */}
      {hasNoCommunities ? (
        // コミュニティが全く存在しない場合
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            まだコミュニティがありません
          </h3>
          <p className="text-gray-600 mb-6">
            新しいコミュニティを作成して、最初のメンバーになりましょう！
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg inline-block">
            💡 ヒント: 上の「+ 新しいコミュニティを作成」ボタンから始められます
          </div>
        </div>
      ) : isEmpty ? (
        // フィルター結果が空の場合
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            検索結果が見つかりません
          </h3>
          <p className="text-gray-600 mb-4">
            別のキーワードで検索するか、フィルターを変更してみてください。
          </p>
          <button
            onClick={() => setFilter({ search: '', sortBy: 'newest', showJoinedOnly: false })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <>
          {/* コミュニティリスト表示 */}
          {!filter.showJoinedOnly && filteredMyCommunities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">参加中のコミュニティ</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {filteredMyCommunities.length}個
                </span>
              </div>
              
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredMyCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={true}
                    viewMode={viewMode}
                    onCommunityClick={onCommunityClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 他のコミュニティ */}
          {!filter.showJoinedOnly && filteredOtherCommunities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">参加可能なコミュニティ</h2>
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  {filteredOtherCommunities.length}個
                </span>
              </div>
              
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredOtherCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={false}
                    viewMode={viewMode}
                    onCommunityClick={onCommunityClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 参加しているコミュニティのみ */}
          {filter.showJoinedOnly && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">参加中のコミュニティ</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {filteredMyCommunities.length}個
                </span>
              </div>
              
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredMyCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={true}
                    viewMode={viewMode}
                    onCommunityClick={onCommunityClick}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}