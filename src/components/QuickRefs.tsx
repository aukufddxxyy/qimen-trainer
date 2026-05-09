"use client";

import { useState } from "react";
import { TIAN_GAN, DI_ZHI, LIU_JIA, PALACE_GUA, PALACE_STAR, PALACE_DOOR } from "@/lib/types";
import type { PalaceId } from "@/lib/types";
import { LIU_JIA_GAN } from "@/lib/calendar";

// ============================================================
// 通用弹窗外壳
// ============================================================
function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-400 font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg cursor-pointer">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// 1. 符头速查
// ============================================================
export function FuTouDialog({ onClose }: { onClose: () => void }) {
  const xunList = LIU_JIA.map((lj, xi) => {
    const baseIdx = xi * 10;
    const pairs: string[] = [];
    for (let i = 0; i < 10; i++) {
      const gan = TIAN_GAN[(baseIdx + i) % 10];
      const zhi = DI_ZHI[(baseIdx + i) % 12];
      pairs.push(gan + zhi);
    }
    return { name: lj, gan: LIU_JIA_GAN[lj], pairs };
  });

  return (
    <DialogShell title="符头（六甲旬首）速查" onClose={onClose}>
      <div className="space-y-3">
        {xunList.map(({ name, gan, pairs }) => (
          <div key={name} className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-amber-400 font-medium mb-2">
              旬首：{name}（{gan}）
            </div>
            <div className="flex flex-wrap gap-1">
              {pairs.map((gz, i) => (
                <span key={gz}
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    i === 0 ? "bg-amber-600 text-white font-medium" : "bg-gray-700 text-gray-300"
                  }`}>
                  {gz}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 text-center">
          每旬第一个干支为符头，时柱所在旬的符头即为旬首
        </p>
      </div>
    </DialogShell>
  );
}

// ============================================================
// 2. 值符值使速查
// ============================================================
export function ZhiFuShiDialog({ onClose }: { onClose: () => void }) {
  const GONG_ORDER: PalaceId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <DialogShell title="九宫固定值符 / 值使速查" onClose={onClose}>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-1 px-2">宫</th>
            <th className="text-left py-1 px-2">卦</th>
            <th className="text-left py-1 px-2">值符（星）</th>
            <th className="text-left py-1 px-2">值使（门）</th>
            <th className="text-left py-1 px-2">备注</th>
          </tr>
        </thead>
        <tbody>
          {GONG_ORDER.map(g => (
            <tr key={g} className="border-b border-gray-800/50">
              <td className="py-1 px-2 text-gray-300">{g}</td>
              <td className="py-1 px-2 text-gray-300">{PALACE_GUA[g]}</td>
              <td className="py-1 px-2 text-green-400">{PALACE_STAR[g]}</td>
              <td className="py-1 px-2 text-blue-400">{PALACE_DOOR[g]}</td>
              <td className="py-1 px-2 text-gray-500">
                {g === 5 ? "寄坤二宫" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 text-center mt-3">
        旬首天干在地盘的宫位 → 该宫固定星即值符，固定门即值使
      </p>
    </DialogShell>
  );
}

// ============================================================
// 3. 六十甲子表
// ============================================================
export function JiaziDialog({ onClose }: { onClose: () => void }) {
  const pairs: { seq: number; gz: string }[] = [];
  for (let i = 0; i < 60; i++) {
    pairs.push({
      seq: i + 1,
      gz: TIAN_GAN[i % 10] + DI_ZHI[i % 12],
    });
  }

  const columns = 10;
  const rows: typeof pairs[] = [];
  for (let r = 0; r < 6; r++) {
    rows.push(pairs.slice(r * columns, (r + 1) * columns));
  }

  const fuTouIdx = [0, 10, 20, 30, 40, 50];

  return (
    <DialogShell title="六十甲子表" onClose={onClose}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="text-gray-500">
              <th className="py-1 px-1 w-8">#</th>
              {Array.from({ length: columns }, (_, c) => (
                <th key={c} className="py-1 px-1">{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const baseIdx = ri * columns;
              return (
                <tr key={ri}>
                  <td className="py-0.5 text-gray-600">{baseIdx + 1}-{baseIdx + columns}</td>
                  {row.map(({ seq, gz }) => {
                    const isFuTou = fuTouIdx.includes(seq - 1);
                    return (
                      <td key={seq}
                        className={`py-0.5 px-1 rounded ${
                          isFuTou
                            ? "bg-amber-600/30 text-amber-400 font-medium"
                            : "text-gray-300"
                        }`}>
                        {gz}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 text-center mt-3">
        黄底标出六甲符头，每旬10个干支
      </p>
    </DialogShell>
  );
}

// ============================================================
// 4. 速查手册（四合一 tab 弹窗）
// ============================================================

const YANG_TERMS_Q = [
  ["冬至","1-7-4"],["小寒","2-8-5"],["大寒","3-9-6"],["立春","8-5-2"],["雨水","9-6-3"],
  ["惊蛰","1-7-4"],["春分","3-9-6"],["清明","4-1-7"],["谷雨","5-2-8"],["立夏","4-1-7"],
  ["小满","5-2-8"],["芒种","6-3-9"],
];
const YIN_TERMS_Q = [
  ["夏至","9-3-6"],["小暑","8-2-5"],["大暑","7-1-4"],["立秋","2-5-8"],["处暑","1-4-7"],
  ["白露","9-3-6"],["秋分","7-1-4"],["寒露","6-9-3"],["霜降","5-8-2"],["立冬","6-9-3"],
  ["小雪","5-8-2"],["大雪","4-7-1"],
];

const TABS = [
  { id: "solarterm", label: "节气局数" },
  { id: "futou", label: "符头旬首" },
  { id: "zhifushi", label: "值符值使" },
  { id: "jiazi", label: "六十甲子" },
] as const;
type TabId = typeof TABS[number]["id"];

export function QuickRefDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("solarterm");

  return (
    <DialogShell title="📚 速查手册" onClose={onClose}>
      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-gray-800 rounded-lg p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
              tab === t.id ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "solarterm" && <SolarTermPanel />}
      {tab === "futou" && <FuTouPanel />}
      {tab === "zhifushi" && <ZhiFuShiPanel />}
      {tab === "jiazi" && <JiaziPanel />}
    </DialogShell>
  );
}

// ---- 子面板 ----

function SolarTermPanel() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[{ title: "☀ 阳遁", color: "text-green-400", terms: YANG_TERMS_Q, numColor: "text-amber-400" },
        { title: "🌙 阴遁", color: "text-blue-400", terms: YIN_TERMS_Q, numColor: "text-blue-400" }]
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
  );
}

function FuTouPanel() {
  const xunList = LIU_JIA.map((lj, xi) => {
    const baseIdx = xi * 10;
    const pairs: string[] = [];
    for (let i = 0; i < 10; i++) {
      pairs.push(TIAN_GAN[(baseIdx + i) % 10] + DI_ZHI[(baseIdx + i) % 12]);
    }
    return { name: lj, gan: LIU_JIA_GAN[lj], pairs };
  });

  return (
    <div className="space-y-3">
      {xunList.map(({ name, gan, pairs }) => (
        <div key={name} className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-amber-400 font-medium mb-2">旬首：{name}（{gan}）</div>
          <div className="flex flex-wrap gap-1">
            {pairs.map((gz, i) => (
              <span key={gz} className={`px-1.5 py-0.5 text-xs rounded ${
                i === 0 ? "bg-amber-600 text-white font-medium" : "bg-gray-700 text-gray-300"
              }`}>{gz}</span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-500 text-center">每旬第一个干支为符头，时柱所在旬的符头即为旬首</p>
    </div>
  );
}

function ZhiFuShiPanel() {
  const GONG_ORDER: PalaceId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-1 px-2">宫</th>
            <th className="text-left py-1 px-2">卦</th>
            <th className="text-left py-1 px-2">值符（星）</th>
            <th className="text-left py-1 px-2">值使（门）</th>
            <th className="text-left py-1 px-2">备注</th>
          </tr>
        </thead>
        <tbody>
          {GONG_ORDER.map(g => (
            <tr key={g} className="border-b border-gray-800/50">
              <td className="py-1 px-2 text-gray-300">{g}</td>
              <td className="py-1 px-2 text-gray-300">{PALACE_GUA[g]}</td>
              <td className="py-1 px-2 text-green-400">{PALACE_STAR[g]}</td>
              <td className="py-1 px-2 text-blue-400">{PALACE_DOOR[g]}</td>
              <td className="py-1 px-2 text-gray-500">{g === 5 ? "寄坤二宫" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 text-center mt-3">旬首天干在地盘的宫位 → 该宫固定星即值符，固定门即值使</p>
    </>
  );
}

function JiaziPanel() {
  const pairs: { seq: number; gz: string }[] = [];
  for (let i = 0; i < 60; i++) {
    pairs.push({ seq: i + 1, gz: TIAN_GAN[i % 10] + DI_ZHI[i % 12] });
  }
  const columns = 10;
  const rows: typeof pairs[] = [];
  for (let r = 0; r < 6; r++) {
    rows.push(pairs.slice(r * columns, (r + 1) * columns));
  }
  const fuTouIdx = [0, 10, 20, 30, 40, 50];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="text-gray-500">
              <th className="py-1 px-1 w-8">#</th>
              {Array.from({ length: columns }, (_, c) => (
                <th key={c} className="py-1 px-1">{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const baseIdx = ri * columns;
              return (
                <tr key={ri}>
                  <td className="py-0.5 text-gray-600">{baseIdx + 1}-{baseIdx + columns}</td>
                  {row.map(({ seq, gz }) => {
                    const isFuTou = fuTouIdx.includes(seq - 1);
                    return (
                      <td key={seq} className={`py-0.5 px-1 rounded ${
                        isFuTou ? "bg-amber-600/30 text-amber-400 font-medium" : "text-gray-300"
                      }`}>{gz}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 text-center mt-3">黄底标出六甲符头，每旬10个干支</p>
    </>
  );
}
