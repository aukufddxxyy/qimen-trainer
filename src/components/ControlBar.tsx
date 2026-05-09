"use client";

import { useState } from "react";
import type { PracticeMode, PracticeStep } from "@/lib/types";
import { GanzhiDatePicker } from "@/components/GanzhiDatePicker";

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
  const [checkClicked, setCheckClicked] = useState(false);

  const handleCheck = () => {
    setCheckClicked(true);
    onCheck();
    setTimeout(() => setCheckClicked(false), 2000);
  };

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

      {/* 时辰选择器 */}
      <GanzhiDatePicker date={date} onChange={onDateChange} onRandom={onRandom} />

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
        <button onClick={handleCheck}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            checkClicked
              ? "bg-yellow-500 text-black"
              : "bg-emerald-700 hover:bg-emerald-600 text-white"
          }`}
        >
          {checkClicked ? "✓ 已点击" : "核对答案"}
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
