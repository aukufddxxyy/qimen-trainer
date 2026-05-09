"use client";

import type { PracticeMode, PracticeStep } from "@/lib/types";
import { DI_ZHI } from "@/lib/types";

const STEPS: { id: PracticeStep; label: string }[] = [
  { id: "bureau", label: "① 定局" },
  { id: "dipan", label: "② 地盘" },
  { id: "xunshou", label: "③ 旬首" },
  { id: "tianpan", label: "④ 天盘" },
  { id: "renpan", label: "⑤ 人盘" },
  { id: "shenpan", label: "⑥ 神盘" },
];

interface ControlBarProps {
  date: Date;
  mode: PracticeMode;
  currentStep: PracticeStep;
  onDateChange: (date: Date) => void;
  onModeChange: (mode: PracticeMode) => void;
  onStepChange: (step: PracticeStep) => void;
  onRandom: () => void;
  onReveal: () => void;
  onHideAnswer: () => void;
  onCheck: () => void;
  isStepMode: boolean;
  showAnswer: boolean;
  onResetStep: () => void;
  onResetAll: () => void;
  onUndo: () => void;
}

export function ControlBar({
  date, mode, currentStep, onDateChange, onModeChange,
  onStepChange, onRandom, onReveal, onHideAnswer, onCheck, isStepMode, showAnswer,
  onResetStep, onResetAll, onUndo,
}: ControlBarProps) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();

  const zhiIdx = Math.floor(((h + 1) % 24) / 2);

  return (
    <div className="space-y-3">
      {/* 模式切换 */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => onModeChange("step")}
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
            mode === "step" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          分步练习
        </button>
        <button
          onClick={() => onModeChange("full")}
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
            mode === "full" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          全盘练习
        </button>
      </div>

      {/* 时间选择 */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="number" value={y} min={2000} max={2030}
          onChange={e => onDateChange(new Date(+e.target.value, m-1, d, h))}
          className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          title="年"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number" value={m} min={1} max={12}
          onChange={e => onDateChange(new Date(y, +e.target.value-1, d, h))}
          className="w-12 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          title="月"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number" value={d} min={1} max={31}
          onChange={e => onDateChange(new Date(y, m-1, +e.target.value, h))}
          className="w-12 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          title="日"
        />
        <select
          value={zhiIdx}
          onChange={e => {
            const zhi = +e.target.value;
            const hour = zhi * 2;
            onDateChange(new Date(y, m-1, d, hour));
          }}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
        >
          {DI_ZHI.map((z, i) => {
            const hStart = (i * 2 + 23) % 24;
            const hEnd = (hStart + 1) % 24;
            return (
              <option key={z} value={i}>
                {z}时 ({String(hStart).padStart(2,"0")}:00-{String((hStart+2)%24).padStart(2,"0")}:00)
              </option>
            );
          })}
        </select>

        <button onClick={onRandom} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">
          随机
        </button>
        <button onClick={() => onDateChange(new Date())} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">
          现在
        </button>
      </div>

      {/* 步骤导航（分步模式） */}
      {isStepMode && (
        <div className="flex gap-1 overflow-x-auto">
          {STEPS.map(s => (
            <button
              key={s.id}
              onClick={() => onStepChange(s.id)}
              className={`whitespace-nowrap px-2 py-1 text-xs rounded transition-colors ${
                currentStep === s.id
                  ? "bg-amber-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button onClick={onCheck} className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
          核对答案
        </button>
        <button onClick={showAnswer ? onHideAnswer : onReveal}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            showAnswer ? "bg-red-700 hover:bg-red-600" : "bg-blue-700 hover:bg-blue-600"
          } text-white`}>
          {showAnswer ? "关闭答案" : "显示答案"}
        </button>
      </div>

      {/* 重置 & 撤销 */}
      <div className="flex gap-2">
        <button onClick={onUndo}
          className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors">
          ↩️ 撤销
        </button>
        <button onClick={onResetStep}
          className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors">
          🔄 重置本步
        </button>
        <button onClick={onResetAll}
          className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors">
          🔁 全部重置
        </button>
      </div>
    </div>
  );
}
