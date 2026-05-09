"use client";

import { useState, useMemo } from "react";
import { DI_ZHI } from "@/lib/types";

interface GanzhiDatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  onRandom: () => void;
}

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function GanzhiDatePicker({ date, onChange, onRandom }: GanzhiDatePickerProps) {
  const [open, setOpen] = useState(false);

  const y = date.getFullYear();
  const m = date.getMonth();      // 0-based
  const d = date.getDate();
  const h = date.getHours();

  const zhiIdx = Math.floor(((h + 1) % 24) / 2);
  const shiChen = DI_ZHI[zhiIdx];
  const shiStart = String((zhiIdx * 2 + 23) % 24).padStart(2, "0");
  const shiEnd = String(((zhiIdx * 2 + 1) % 24) + 1).padStart(2, "0");

  // Calendar grid
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDayOfWeek = new Date(y, m, 1).getDay();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const selectDay = (day: number) => {
    onChange(new Date(y, m, day, h));
    setOpen(false);
  };

  const selectShiChen = (zhi: number) => {
    const hour = zhi * 2;
    onChange(new Date(y, m, d, hour));
    setOpen(false);
  };

  const goMonth = (delta: number) => {
    onChange(new Date(y, m + delta, Math.min(d, new Date(y, m + delta + 1, 0).getDate()), h));
  };

  const goYear = (delta: number) => {
    const newMonth = m;
    const maxDay = new Date(y + delta, newMonth + 1, 0).getDate();
    onChange(new Date(y + delta, newMonth, Math.min(d, maxDay), h));
  };

  const displayDate = `${y}年${String(m + 1).padStart(2, "0")}月${String(d).padStart(2, "0")}日 ${shiChen}时 (${shiStart}:00-${shiEnd}:00)`;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-white transition-colors flex items-center justify-between group"
      >
        <span className="truncate">{displayDate}</span>
        <span className="text-gray-500 text-xs group-hover:text-gray-300 ml-1 shrink-0">▼</span>
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-sm w-full mx-3"
            onClick={e => e.stopPropagation()}>
            
            {/* Year / Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => goYear(-1)} className="text-gray-400 hover:text-white text-lg px-1">◀◀</button>
              <button onClick={() => goMonth(-1)} className="text-gray-400 hover:text-white text-lg px-1">◀</button>
              <span className="text-amber-400 font-medium text-lg">
                {y}年{String(m + 1).padStart(2, "0")}月
              </span>
              <button onClick={() => goMonth(1)} className="text-gray-400 hover:text-white text-lg px-1">▶</button>
              <button onClick={() => goYear(1)} className="text-gray-400 hover:text-white text-lg px-1">▶▶</button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map(w => (
                <div key={w} className="text-center text-xs text-gray-500 py-1">{w}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (day === null) return <div key={`${wi}-${di}`} />;
                  const isToday = day === d;
                  const isSelected = day === d;
                  return (
                    <button
                      key={day}
                      onClick={() => selectDay(day)}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                        isSelected
                          ? "bg-amber-600 text-white font-medium"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })
              )}
            </div>

            {/* 时辰 selector */}
            <div className="border-t border-gray-800 pt-3">
              <div className="text-xs text-gray-500 mb-2">选择时辰</div>
              <div className="grid grid-cols-6 gap-1">
                {DI_ZHI.map((z, i) => {
                  const hStart = (i * 2 + 23) % 24;
                  const hEnd = (hStart + 1) % 24;
                  const isActive = i === zhiIdx;
                  return (
                    <button
                      key={z}
                      onClick={() => selectShiChen(i)}
                      className={`py-1.5 text-xs rounded-lg transition-colors ${
                        isActive
                          ? "bg-amber-600 text-white font-medium"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div>{z}</div>
                      <div className="text-[10px] opacity-60">
                        {String(hStart).padStart(2, "0")}-{String((hStart + 2) % 24).padStart(2, "0")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  onChange(new Date());
                  setOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                📍 现在
              </button>
              <button
                onClick={() => {
                  onRandom();
                  setOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                🎲 随机
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
