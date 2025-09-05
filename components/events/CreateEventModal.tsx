"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { ja } from "date-fns/locale";

import type { NewEventForm } from "@/types/event";

function CustomDay(props: PickersDayProps & { selectedDays?: Date[] }) {
  const { day, selectedDays = [], ...other } = props;
  const isSelected = selectedDays.some(
    (selected) => selected.toDateString() === day.toDateString()
  );
  return (
    <PickersDay
      {...other}
      day={day}
      sx={{
        bgcolor: isSelected ? "primary.main" : undefined,
        color: isSelected ? "white" : undefined,
      }}
    />
  );
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
  // --- 追加: ドラッグ選択用の状態 ---
  const [dragging, setDragging] = useState(false);

  // --- 修正: 日付追加・削除 + 自動ソート ---
  const handleDateSelect = (date: Date | null) => {
    if (!date) return;
    onChange((prev) => {
      const dates = prev.candidate_dates ?? [];
      const exists = dates.some(
        (d) => new Date(d).toDateString() === date.toDateString()
      );
      const updated = exists
        ? dates.filter(
            (d) => new Date(d).toDateString() !== date.toDateString()
          )
        : [...dates, date];

      // 自動ソート
      updated.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      return { ...prev, candidate_dates: updated };
    });
  };

  // --- 追加: 個別削除機能 ---
  const handleRemoveDate = (dateToRemove: Date) => {
    onChange((prev) => ({
      ...prev,
      candidate_dates: prev.candidate_dates?.filter(
        (d) =>
          new Date(d).toDateString() !== new Date(dateToRemove).toDateString()
      ),
    }));
  };

  // --- 追加: ドラッグ中の処理 ---
  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);
  const handleMouseEnter = (date: Date) => {
    if (dragging) handleDateSelect(date);
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>新しいイベントを作成</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent dividers>
          <div className="space-y-6">
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
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                開催候補日<span className="text-red-500 ml-1">*</span>
              </label>

              <div className="flex flex-col lg:flex-row gap-6">
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ja}
                >
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <DateCalendar
                      value={null}
                      onChange={handleDateSelect}
                      slots={{
                        day: (dayProps) => (
                          <div
                            onMouseEnter={() => handleMouseEnter(dayProps.day)}
                            style={{ cursor: dragging ? "pointer" : "default" }}
                          >
                            <CustomDay
                              {...dayProps}
                              selectedDays={
                                newEvent.candidate_dates?.map(
                                  (d) => new Date(d)
                                ) || []
                              }
                            />
                          </div>
                        ),
                      }}
                    />
                  </div>
                </LocalizationProvider>

                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    選択した日付
                  </h3>
                  {newEvent.candidate_dates?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {newEvent.candidate_dates.map((d, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {new Date(d).toLocaleDateString()}
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(d)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      まだ日付が選択されていません
                    </p>
                  )}
                </div>
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
                value={newEvent.max_participants ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    max_participants: Number(e.target.value),
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
                  value={newEvent.deadline || null}
                  onChange={(newValue) =>
                    onChange((prev) => ({ ...prev, deadline: newValue }))
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
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !newEvent.name.trim() ||
              !newEvent.location.trim() ||
              !newEvent.max_participants ||
              !newEvent.deadline ||
              newEvent.candidate_dates.length === 0
            }
            variant="contained"
            color="primary"
          >
            {isSubmitting ? "作成中…" : "作成する"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
