"use client";

import { TIAN_GAN, DI_ZHI, LIU_JIA, PALACE_GUA, PALACE_STAR, PALACE_DOOR } from "@/lib/types";
import type { PalaceId } from "@/lib/types";
import { LIU_JIA_GAN } from "@/lib/calendar";

// ============================================================
// 通用弹窗外壳
// ============================================================
function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
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
  // 构建每个旬的干支列表
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

  // 10列6行显示
  const columns = 10;
  const rows: typeof pairs[] = [];
  for (let r = 0; r < 6; r++) {
    rows.push(pairs.slice(r * columns, (r + 1) * columns));
  }

  // 符头标记
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
