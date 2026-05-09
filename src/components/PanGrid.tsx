"use client";

import { useState } from "react";
import type { PalaceId } from "@/lib/types";
import { PALACE_GUA, PALACE_WUXING } from "@/lib/types";

interface PalaceCellProps {
  gongId: PalaceId;
  diPan?: string;
  tianPanGan?: string;
  tianPanStar?: string;
  renPanDoor?: string;
  shenPanSpirit?: string;
  isCorrect?: boolean | null;
  errorFields?: string[];
  onClick: (gongId: PalaceId) => void;
  isActive: boolean;
  highlight?: "correct" | "error" | null;
}

export function PalaceCell({
  gongId, diPan, tianPanGan, tianPanStar, renPanDoor, shenPanSpirit,
  isCorrect, errorFields, onClick, isActive, highlight,
}: PalaceCellProps) {
  const borderColor = highlight === "correct" ? "border-green-400 ring-2 ring-green-300"
    : highlight === "error" ? "border-red-400 ring-2 ring-red-300"
    : isActive ? "border-amber-400 ring-2 ring-amber-300"
    : "border-gray-600 hover:border-gray-400";

  const bgColor = highlight === "correct" ? "bg-green-900/20"
    : highlight === "error" ? "bg-red-900/20"
    : "bg-gray-800/50";

  return (
    <button
      onClick={() => onClick(gongId)}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg border-2 w-full h-full
        ${borderColor} ${bgColor} transition-all cursor-pointer select-none
        active:scale-95`}
    >
      {/* 宫位标签 */}
      <span className="absolute top-1 left-1.5 text-[10px] text-gray-500">
        {PALACE_GUA[gongId]}{gongId}
      </span>

      {/* 地盘干（右下角） */}
      <span className={`absolute bottom-1 right-1.5 text-xs font-mono ${diPan ? "text-gray-400" : "text-gray-700"}`}>
        {diPan || "地"}
      </span>

      {/* 天盘：星 + 干 */}
      <div className="flex flex-col items-center gap-0.5">
        {tianPanStar ? (
          <>
            <span className="text-sm font-bold text-yellow-200">{tianPanStar}</span>
            <span className="text-xs text-yellow-300/70 font-mono">{tianPanGan}</span>
          </>
        ) : (
          <span className="text-[10px] text-gray-700">点击填写</span>
        )}
      </div>

      {/* 人盘：门 */}
      <div className="mt-1">
        {renPanDoor ? (
          <span className="text-sm text-emerald-300">{renPanDoor}</span>
        ) : (
          <span className="text-[10px] text-gray-800">门</span>
        )}
      </div>

      {/* 神盘：神 */}
      <div className="mt-0.5">
        {shenPanSpirit ? (
          <span className="text-[11px] text-purple-400">{shenPanSpirit}</span>
        ) : (
          <span className="text-[10px] text-gray-800">神</span>
        )}
      </div>

      {/* 五行 */}
      <span className="absolute top-1 right-1.5 text-[10px] text-gray-600">
        {PALACE_WUXING[gongId]}
      </span>
    </button>
  );
}

// ---- 候选列表弹窗 ----
interface CandidatePopoverProps {
  gongId: PalaceId;
  options: { label: string; value: string; category?: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function CandidatePopover({ gongId, options, onSelect, onClose }: CandidatePopoverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl max-w-[280px] w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-xs text-gray-400 mb-2 text-center">
          选择 {PALACE_GUA[gongId as PalaceId]}{gongId}宫
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="px-2 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-amber-700 text-gray-200
                hover:text-white transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full text-xs text-gray-500 hover:text-gray-300 py-1"
        >
          取消
        </button>
      </div>
    </div>
  );
}

// ---- 洛书布局的九宫格 ----
interface PanGridProps {
  palaces: Record<PalaceId, {
    diPan?: string; tianPanGan?: string; tianPanStar?: string;
    renPanDoor?: string; shenPanSpirit?: string;
  }>;
  highlights?: Partial<Record<PalaceId, "correct" | "error">>;
  markedGong?: PalaceId | null;
  activeGong?: PalaceId | null;
  onCellClick: (gongId: PalaceId) => void;
}

// 洛书顺序：4 9 2 / 3 5 7 / 8 1 6
const LUOSHU_ORDER: PalaceId[] = [4, 9, 2, 3, 5, 7, 8, 1, 6];

export function PanGrid({ palaces, highlights, markedGong, activeGong, onCellClick }: PanGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[420px] mx-auto">
      {LUOSHU_ORDER.map(gongId => (
        <div key={gongId} className="aspect-square relative">
          {markedGong === gongId && (
            <div className="absolute -top-1 -right-1 z-10 bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
              ★
            </div>
          )}
          <PalaceCell
            gongId={gongId}
            diPan={palaces[gongId]?.diPan}
            tianPanGan={palaces[gongId]?.tianPanGan}
            tianPanStar={palaces[gongId]?.tianPanStar}
            renPanDoor={palaces[gongId]?.renPanDoor}
            shenPanSpirit={palaces[gongId]?.shenPanSpirit}
            isActive={activeGong === gongId}
            highlight={highlights?.[gongId]}
            onClick={onCellClick}
          />
        </div>
      ))}
    </div>
  );
}
