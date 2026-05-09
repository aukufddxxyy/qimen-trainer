"use client";

import { useEffect } from "react";
import type { CheckResult } from "@/hooks/usePractice";

interface ToastProps {
  result: CheckResult;
  onDismiss: () => void;
}

export function Toast({ result, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isCorrect = result.correct;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`px-5 py-3 rounded-xl border-2 text-sm max-w-md ${
          isCorrect
            ? "bg-green-600 border-green-300 text-white shadow-[0_0_20px_rgba(74,222,128,0.5)]"
            : "bg-red-600 border-red-300 text-white shadow-[0_0_20px_rgba(248,113,113,0.5)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{isCorrect ? "✅" : "❌"}</span>
          <span className="font-medium">
            {isCorrect ? "全部正确！" : `${result.errors.length} 处错误`}
          </span>
          <button
            onClick={onDismiss}
            className="ml-auto text-gray-400 hover:text-gray-200 text-sm leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>
        {!isCorrect && result.errors.length > 0 && (
          <div className="space-y-0.5 mt-1">
            {result.errors.slice(0, 5).map((e, j) => (
              <div key={j} className="text-xs opacity-90">
                宫{e.gongId} {e.field}：你填「{e.got}」，正确答案「{e.expected}」
              </div>
            ))}
            {result.errors.length > 5 && (
              <div className="text-xs opacity-60">
                ...还有 {result.errors.length - 5} 处错误
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
