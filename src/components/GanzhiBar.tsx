"use client";

import { calcNianZhu, calcYueZhu, calcRiGanZhi, calcShiGanZhi, getSolarTerm, getSanYuan } from "@/lib/calendar";

interface GanzhiBarProps {
  date: Date;
}

export function GanzhiBar({ date }: GanzhiBarProps) {
  const nianZhu = calcNianZhu(date);
  const yueZhu = calcYueZhu(date);
  const riZhu = calcRiGanZhi(date);
  const shiZhu = calcShiGanZhi(date);
  const term = getSolarTerm(date);
  const sanYuan = getSanYuan(date);

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-300 bg-gray-900/50 rounded-lg px-3 py-1.5 mt-2">
      <span>年柱 <b className="text-amber-400">{nianZhu}</b></span>
      <span className="text-gray-600">|</span>
      <span>月柱 <b className="text-amber-400">{yueZhu}</b></span>
      <span className="text-gray-600">|</span>
      <span>日柱 <b className="text-amber-400">{riZhu}</b></span>
      <span className="text-gray-600">|</span>
      <span>时柱 <b className="text-amber-400">{shiZhu}</b></span>
      <span className="text-gray-600">|</span>
      <span>节气 <b className="text-green-400">{term}</b></span>
      <span className="text-gray-600">|</span>
      <span>三元 <b className={`${sanYuan === "上元" ? "text-blue-400" : sanYuan === "中元" ? "text-yellow-400" : "text-red-400"}`}>{sanYuan}</b></span>
    </div>
  );
}
