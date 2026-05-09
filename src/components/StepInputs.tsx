"use client";

import { useState } from "react";
import { EIGHT_DOORS, NINE_STARS, LIU_JIA } from "@/lib/types";
import type { LiuJia, NineStar, EightDoor } from "@/lib/types";
import { LIU_JIA_GAN } from "@/lib/calendar";

// ============================================================
// 定局步骤
// ============================================================
interface BureauInputProps {
  onAnswer: (yangDun: boolean, bureau: number) => void;
  initialYangDun?: boolean;
  initialBureau?: number;
}

export function BureauInput({ onAnswer, initialYangDun, initialBureau }: BureauInputProps) {
  const [yangDun, setYangDun] = useState(initialYangDun ?? true);
  const [bureau, setBureau] = useState(initialBureau ?? 1);

  return (
    <div className="space-y-3 p-4 bg-gray-800 border-2 border-amber-500/60 rounded-lg max-w-[420px] mx-auto shadow-lg">
      <h3 className="text-sm text-amber-400 font-medium flex items-center gap-1">
        <span>📋</span> 第一步：定局
      </h3>
      <div className="flex gap-2">
        <button onClick={() => setYangDun(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            yangDun ? "bg-amber-600 text-white shadow-md" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
          阳遁（冬至→芒种）
        </button>
        <button onClick={() => setYangDun(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            !yangDun ? "bg-amber-600 text-white shadow-md" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
          阴遁（夏至→大雪）
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">{yangDun ? "阳遁" : "阴遁"}</span>
        <select value={bureau} onChange={e => setBureau(+e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white cursor-pointer">
          {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}局</option>)}
        </select>
      </div>
      <button onClick={() => onAnswer(yangDun, bureau)}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
        确认
      </button>
    </div>
  );
}

// ============================================================
// 旬首步骤
// ============================================================
interface XunShouInputProps {
  onAnswer: (xunShou: LiuJia, zhiFu: NineStar, zhiShi: EightDoor) => void;
}

export function XunShouInput({ onAnswer }: XunShouInputProps) {
  const [xunShou, setXunShou] = useState<LiuJia>("甲子");
  const [zhiFu, setZhiFu] = useState<NineStar>("天蓬");
  const [zhiShi, setZhiShi] = useState<EightDoor>("休");

  return (
    <div className="space-y-3 p-4 bg-gray-800 border-2 border-amber-500/60 rounded-lg max-w-[420px] mx-auto shadow-lg">
      <h3 className="text-sm text-amber-400 font-medium flex items-center gap-1">
        <span>🔍</span> 第三步：旬首 / 值符 / 值使
      </h3>
      <div>
        <label className="text-xs text-gray-400 block mb-1">旬首（六甲）</label>
        <div className="flex flex-wrap gap-1">
          {LIU_JIA.map(lj => (
            <button key={lj} onClick={() => setXunShou(lj)}
              className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                xunShou === lj ? "bg-amber-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
              {lj}({LIU_JIA_GAN[lj]})
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">值符（天盘领头星）</label>
        <div className="flex flex-wrap gap-1">
          {NINE_STARS.map(s => (
            <button key={s} onClick={() => setZhiFu(s)}
              className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                zhiFu === s ? "bg-amber-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">值使（人盘领头门）</label>
        <div className="flex flex-wrap gap-1">
          {EIGHT_DOORS.map(d => (
            <button key={d} onClick={() => setZhiShi(d)}
              className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                zhiShi === d ? "bg-amber-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onAnswer(xunShou, zhiFu, zhiShi)}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
        确认
      </button>
    </div>
  );
}

// ============================================================
// 节气速查表弹窗
// ============================================================
interface SolarTermDialogProps { onClose: () => void; }

const YANG_TERMS = [
  ["冬至","1-7-4"],["小寒","2-8-5"],["大寒","3-9-6"],["立春","8-5-2"],["雨水","9-6-3"],
  ["惊蛰","1-7-4"],["春分","3-9-6"],["清明","4-1-7"],["谷雨","5-2-8"],["立夏","4-1-7"],
  ["小满","5-2-8"],["芒种","6-3-9"],
];
const YIN_TERMS = [
  ["夏至","9-3-6"],["小暑","8-2-5"],["大暑","7-1-4"],["立秋","2-5-8"],["处暑","1-4-7"],
  ["白露","9-3-6"],["秋分","7-1-4"],["寒露","6-9-3"],["霜降","5-8-2"],["立冬","6-9-3"],
  ["小雪","5-8-2"],["大雪","4-7-1"],
];

export function SolarTermDialog({ onClose }: SolarTermDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-400 font-medium">二十四节气局数速查</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg cursor-pointer">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ title: "☀ 阳遁（冬至→芒种）", color: "text-green-400", terms: YANG_TERMS, numColor: "text-amber-400" },
            { title: "🌙 阴遁（夏至→大雪）", color: "text-blue-400", terms: YIN_TERMS, numColor: "text-blue-400" }]
            .map(({ title, color, terms, numColor }) => (
            <div key={title}>
              <h4 className={`text-sm ${color} mb-1 font-medium`}>{title}</h4>
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-1">节气</th>
                  <th className="text-right">上元</th>
                  <th className="text-right">中元</th>
                  <th className="text-right">下元</th>
                </tr></thead>
                <tbody>
                  {terms.map(([name, nums]) => {
                    const [shang, zhong, xia] = nums.split("-");
                    return (
                      <tr key={name} className="border-b border-gray-800/50">
                        <td className="py-0.5 text-gray-300">{name}</td>
                        <td className={`text-right ${numColor}`}>{shang}</td>
                        <td className={`text-right ${numColor}`}>{zhong}</td>
                        <td className={`text-right ${numColor}`}>{xia}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
