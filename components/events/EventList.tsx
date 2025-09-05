"use client";

import { useState } from "react";
import EventCard from "./EventCard";

// Types
import type { Event } from "@/types/event";

interface EventWithMembers extends Event {
  member_count?: number;
  is_member?: boolean;
  candidate_date?: [];
}

interface EventListProps {
  myEvents: EventWithMembers[];
  otherEvents: EventWithMembers[];
  onEventClick: (eventId: number) => void;
}

interface FilterState {
  search: string;
  sortBy: "default" | "newest" | "oldest" | "members" | "name";
  showAllEvents: boolean;
}

export default function EventList({
  myEvents,
  otherEvents,
  onEventClick,
}: EventListProps) {
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    sortBy: "default",
    showAllEvents: false,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort events
  const filterEvents = (events: EventWithMembers[]) => {
    let filtered = events;

    // Search filter
    if (filter.search) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(filter.search.toLowerCase()) ||
          (event.description?.toLowerCase() || "").includes(
            filter.search.toLowerCase()
          )
      );
    }

    // 開催済みイベントを非表示にするフィルター（チェックが入っていない場合）
    if (!filter.showAllEvents) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 時間をクリアして日付のみ比較
      filtered = filtered.filter((event) => {
        if (!event.finalized_date) return true; // finalized_date がないものは表示
        const finalizedDate = new Date(event.finalized_date);
        return finalizedDate >= today; // 今日以降のもののみ
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case "default":
          // is_finalized: false を優先
          if (a.is_finalized !== b.is_finalized) {
            return a.is_finalized ? 1 : -1;
          }
          // finalized_date が新しい順
          const finalizedA = a.finalized_date
            ? new Date(a.finalized_date).getTime()
            : 0;
          const finalizedB = b.finalized_date
            ? new Date(b.finalized_date).getTime()
            : 0;
          if (finalizedA !== finalizedB) {
            return finalizedB - finalizedA;
          }
          // created_at が新しい順
          return (
            (b.created_at ? new Date(b.created_at).getTime() : 0) -
            (a.created_at ? new Date(a.created_at).getTime() : 0)
          );

        case "newest":
          return (
            (b.created_at ? new Date(b.created_at).getTime() : 0) -
            (a.created_at ? new Date(a.created_at).getTime() : 0)
          );
        case "oldest":
          return (
            (a.created_at ? new Date(a.created_at).getTime() : 0) -
            (b.created_at ? new Date(b.created_at).getTime() : 0)
          );
        case "members":
          return (b.member_count || 0) - (a.member_count || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const safeMyEvents = (myEvents ?? []).filter(
    (e): e is EventWithMembers => !!e && typeof e.id === "number"
  );
  const safeOtherEvents = (otherEvents ?? []).filter(
    (e): e is EventWithMembers => !!e && typeof e.id === "number"
  );

  const filteredMyEvents = filterEvents(safeMyEvents);
  const filteredOtherEvents = filterEvents(safeOtherEvents);

  const displayEvents = filter.showAllEvents
    ? [...filteredMyEvents, ...filteredOtherEvents]
    : [...filteredMyEvents, ...filteredOtherEvents];

  const isEmpty = displayEvents.length === 0;
  const hasNoEvents = myEvents.length === 0 && otherEvents.length === 0;

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="イベントを検索..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filter.showAllEvents}
                onChange={(e) =>
                  setFilter({ ...filter, showAllEvents: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              開催済みイベントを表示
            </label>

            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">おすすめ順</option>
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="members">メンバー数順</option>
              <option value="name">名前順</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          全{displayEvents.length}個のイベント (参加: {filteredMyEvents.length}
          個, 未参加: {filteredOtherEvents.length}
          個)
        </div>
      </div>

      {hasNoEvents ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            まだイベントがありません
          </h3>
          <p className="text-gray-600 mb-6">
            新しいイベントを作成して、最初のメンバーになりましょう！
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg inline-block">
            💡 ヒント: 上の「+ 新しいイベントを作成」ボタンから始められます
          </div>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            検索結果が見つかりません
          </h3>
          <p className="text-gray-600 mb-4">
            別のキーワードで検索するか、フィルターを変更してみてください。
          </p>
          <button
            onClick={() =>
              setFilter({
                search: "",
                sortBy: "default",
                showAllEvents: false,
              })
            }
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <>
          {filteredMyEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  参加イベント
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {filteredMyEvents.length}個
                </span>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredMyEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isMember={true}
                    viewMode={viewMode}
                    onEventClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredOtherEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  未参加イベント
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {filteredOtherEvents.length}個
                </span>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredOtherEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isMember={false}
                    viewMode={viewMode}
                    onEventClick={onEventClick}
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
