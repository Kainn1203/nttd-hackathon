// CreateEventModal.tsx
"use client";
import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";

interface NewEventForm {
  name: string;
  description: string;
  startDate?: Date | null; // 開始日時
  endDate?: Date | null; // 終了日時
  capacity?: number;
  location?: string;
  recruitmentEnd?: Date | null;
}

interface CreateEventModalProps {
  show: boolean;
  newEvent: NewEventForm;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<NewEventForm>>;
}

export default function CreateEventModal({
  show,
  newEvent,
  isSubmitting,
  onSubmit,
  onClose,
  onChange,
}: CreateEventModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            新しいイベントを作成
          </h2>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 space-y-6">
            {/* 名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="例：懇親会@新宿"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 日程 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日程<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ja}
                >
                  <DatePicker
                    label="開始日"
                    value={newEvent.startDate || null}
                    onChange={(newValue) =>
                      onChange((prev) => ({ ...prev, startDate: newValue }))
                    }
                  />
                </LocalizationProvider>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ja}
                >
                  <DatePicker
                    label="終了日"
                    value={newEvent.endDate || null}
                    onChange={(newValue) =>
                      onChange((prev) => ({ ...prev, endDate: newValue }))
                    }
                  />
                </LocalizationProvider>
              </div>
            </div>

            {/* 定員 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                定員<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                min={2}
                value={newEvent.capacity ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    capacity: Number(e.target.value),
                  }))
                }
                placeholder="例：6"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 場所 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                場所<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={newEvent.location ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="例：新宿駅周辺"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 募集期間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                募集締切<span className="text-red-500 ml-1">*</span>
              </label>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ja}
              >
                <DatePicker
                  value={newEvent.recruitmentEnd || null}
                  onChange={(newValue) =>
                    onChange((prev) => ({ ...prev, recruitmentEnd: newValue }))
                  }
                />
              </LocalizationProvider>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="イベントの目的や活動内容を記入してください"
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
              disabled={isSubmitting || !newEvent.name.trim()}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                isSubmitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "作成中…" : "作成する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
