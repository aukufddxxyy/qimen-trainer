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

// ============================================================
// 5. 排盘教程（六步 tab 弹窗）
// ============================================================

const TUTORIAL_TABS = [
  { id: "bureau", label: "① 定局" },
  { id: "dipan",   label: "② 地盘" },
  { id: "xunshou", label: "③ 值符值使" },
  { id: "tianpan", label: "④ 天盘" },
  { id: "renpan",  label: "⑤ 人盘" },
  { id: "shenpan", label: "⑥ 神盘" },
] as const;
type TutorialTab = typeof TUTORIAL_TABS[number]["id"];

function MethodBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3">
      <h4 className="text-xs text-amber-400 font-medium mb-1.5">{title}</h4>
      {children}
    </div>
  );
}

export function TutorialDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TutorialTab>("bureau");

  return (
    <DialogShell title="📖 排盘教程" onClose={onClose}>
      <div className="flex flex-wrap gap-1 mb-3 bg-gray-800 rounded-lg p-1">
        {TUTORIAL_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
              tab === t.id ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bureau"  && <BureauTutorial />}
      {tab === "dipan"   && <DiPanTutorial />}
      {tab === "xunshou" && <XunShouTutorial />}
      {tab === "tianpan" && <TianPanTutorial />}
      {tab === "renpan"  && <RenPanTutorial />}
      {tab === "shenpan" && <ShenPanTutorial />}
    </DialogShell>
  );
}

// ---- ① 定局 ----
function BureauTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="四步走">
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="text-amber-400 font-medium shrink-0">① 查节气：</span>
            <span>公历日期查二十四节气表。如 5月19日 → <span className="text-green-400">立夏</span></span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-medium shrink-0">② 判阴阳：</span>
            <span><span className="text-green-400">冬至→芒种 = 阳遁</span>，<span className="text-blue-400">夏至→大雪 = 阴遁</span></span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-medium shrink-0">③ 定三元：</span>
            <span>算日干支的六十甲子序号，往前找最近的符头（甲/己日）→ 上/中/下元</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-medium shrink-0">④ 查局数：</span>
            <span>节气 + 三元 → 查表得局数（1~9）</span>
          </div>
        </div>
      </MethodBox>

      <MethodBox title="六十甲子序号速算">
        <p className="text-xs mb-1"><code className="bg-gray-700 px-1 rounded">序号 = (天干位×6 - 地支位×5) mod 60</code></p>
        <p className="text-xs text-gray-400">天干：甲0乙1丙2丁3戊4己5庚6辛7壬8癸9 | 地支：子0丑1寅2卯3辰4巳5午6未7申8酉9戌10亥11</p>
        <p className="text-xs mt-1">例：<span className="text-amber-400">壬午</span> → 8×6 − 6×5 = 48−30 = <span className="text-green-400">18</span></p>
      </MethodBox>

      <MethodBox title="三元判断（符头）">
        <p className="text-xs mb-1">符头 = 日干为甲或己。上中下元循环：上→中→下→上…</p>
        <p className="text-xs text-gray-400">符头表：甲子0上 | 己巳5中 | 甲戌10下 | 己卯15上 | 甲申20中 | 己丑25下 | 甲午30上 | 己亥35中 | 甲辰40下 | 己酉45上 | 甲寅50中 | 己未55下</p>
        <p className="text-xs mt-1">例：序号18 → 往前：己卯(15)≤18 ✓ → <span className="text-green-400">上元</span></p>
      </MethodBox>

      <MethodBox title="完整示例">
        <p className="text-xs"><span className="text-gray-400">2025.5.19 壬午日 立夏 → 阳遁 → 上元 →</span> <span className="text-green-400 font-medium text-base">阳遁 4 局</span></p>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 三元判断只检查当天本身是不是符头（甲/己日），不是就默认下元。正确做法是<span className="text-red-300">往前找最近的符头</span>。
      </div>
    </div>
  );
}

// ---- ② 地盘 ----
function DiPanTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="口诀">
        <p className="text-xs"><span className="text-green-400">阳遁顺布</span>（宫号 1→9），<span className="text-blue-400">阴遁逆布</span>（宫号 9→1）</p>
        <p className="text-xs mt-1">三奇六仪顺序永远固定：<span className="text-amber-400 font-medium">戊→己→庚→辛→壬→癸→丁→丙→乙</span></p>
      </MethodBox>

      <MethodBox title="算法">
        <div className="text-xs space-y-1">
          <p>① <span className="text-amber-400">戊</span> 落在<b>局数宫</b>（如阳遁4局 → 戊在宫4）</p>
          <p>② 其余依序排布：<span className="text-green-400">阳遁宫号递增</span>，<span className="text-blue-400">阴遁宫号递减</span></p>
          <p>③ 九宫循环：宫9后回到宫1，宫1逆回到宫9</p>
        </div>
      </MethodBox>

      <MethodBox title="示例：阳遁4局">
        <div className="grid grid-cols-3 gap-1 text-center text-xs">
          {["宫4 戊","宫5 己","宫6 庚","宫3 乙","宫？丁","宫7 辛","宫2 丙","宫1 癸","宫8 壬"].map((s,i) => (
            <div key={i} className={`py-1 rounded ${i===0?"bg-amber-600/30 text-amber-400":i===4?"bg-gray-700 text-gray-400":"bg-gray-800 text-gray-300"}`}>{s}</div>
          ))}
        </div>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 忘记<span className="text-red-300">戊从局数宫开始</span>，或者搞反顺逆方向。
      </div>
    </div>
  );
}

// ---- ③ 旬首/值符值使 ----
function XunShouTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="概念">
        <p className="text-xs">值符 = 九星中的领头星 | 值使 = 八门中的领头门<br/>二者由<span className="text-amber-400">旬首</span>决定，落宫由时干/时支在后续步骤确定。</p>
      </MethodBox>

      <MethodBox title="三步走">
        <div className="text-xs space-y-1.5">
          <div><span className="text-amber-400">① 找旬首：</span>时干支序号 ÷ 10 取整 → 六甲之一。如时柱序号23 → 旬首=甲申(20)</div>
          <div><span className="text-amber-400">② 定六甲干：</span>六甲→天干的映射：<span className="text-green-400">甲子→戊、甲戌→己、甲申→庚、甲午→辛、甲辰→壬、甲寅→癸</span></div>
          <div><span className="text-amber-400">③ 宫位定位：</span>在<b>地盘</b>上找到这个干所在的宫 → 该宫的固定星=值符，固定门=值使</div>
        </div>
      </MethodBox>

      <MethodBox title="示例">
        <p className="text-xs"><span className="text-gray-400">时柱庚申(56) → 旬首甲寅(50) → 甲寅干=癸 → 地盘癸在宫1 →</span></p>
        <p className="text-xs mt-1"><span className="text-green-400">值符=天蓬</span>（宫1星）<span className="text-blue-400 ml-3">值使=休</span>（宫1门）</p>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 找旬首用日柱而不是<span className="text-red-300">时柱</span>。六甲→干的映射记混。
      </div>
    </div>
  );
}

// ---- ④ 天盘 ----
function TianPanTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="口诀">
        <p className="text-xs"><span className="text-amber-400">值符随时干，阳顺阴逆转</span></p>
      </MethodBox>

      <MethodBox title="三步走">
        <div className="text-xs space-y-1.5">
          <div><span className="text-amber-400">① 找时干宫：</span>时干的第一个字（如庚申→庚）在地盘哪个宫 → 目标宫。若时干为<b>甲</b>，甲遁于旬首六仪之下，直接用<span className="text-green-400">值符宫（旬首宫）</span></div>
          <div><span className="text-amber-400">② 值符落宫：</span>值符星放到目标宫</div>
          <div><span className="text-amber-400">③ 其余星排列：</span>其余八星按九星顺序，从目标宫开始阳顺阴逆排布</div>
        </div>
      </MethodBox>

      <MethodBox title="关键规则">
        <p className="text-xs">每颗星携带的<span className="text-amber-400">天盘干</span>，是该星<b>原始宫位</b>的地盘干，<b>不是</b>当前落宫的地盘干！</p>
      </MethodBox>

      <MethodBox title="示例">
        <p className="text-xs text-gray-400">值符=天蓬(宫1星)，时干=庚(在地盘宫6)</p>
        <p className="text-xs mt-1"><span className="text-green-400">天蓬星放在宫6</span>，携带宫1的地盘干（戊）→ 宫6=天蓬+戊</p>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 天盘干用当前宫的地盘干而不是<span className="text-red-300">原始宫的地盘干</span>；时干为甲时忘记甲遁于六仪，在地盘找不到甲而兜底到错误宫位。
      </div>
    </div>
  );
}

// ---- ⑤ 人盘 ----
function RenPanTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="口诀">
        <p className="text-xs"><span className="text-amber-400">值使随时支，阳顺阴逆转，中五寄坤二</span></p>
      </MethodBox>

      <MethodBox title="算法">
        <div className="text-xs space-y-1.5">
          <div><span className="text-amber-400">① 算步数：</span>(时支序号 − 旬首地支序号 + 12) mod 12 → 步数</div>
          <div><span className="text-amber-400">② 值使落宫：</span>从<b>旬首宫</b>（值符的原始宫）开始，走步数步，<span className="text-red-400">跳过中五宫</span></div>
          <div><span className="text-amber-400">③ 其余七门：</span>从值使宫开始，阳顺阴逆排列，同样<span className="text-red-400">跳过中五宫</span></div>
          <div><span className="text-amber-400">④ 最后设置：</span>中五宫的门 = 坤二宫的门</div>
        </div>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 在循环内设中五宫=坤二（会覆盖坤二合法值），必须<span className="text-red-300">循环结束后</span>再设 palaces[5]=palaces[2]。
      </div>
    </div>
  );
}

// ---- ⑥ 神盘 ----
function ShenPanTutorial() {
  return (
    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
      <MethodBox title="口诀">
        <p className="text-xs"><span className="text-amber-400">小值符跟大值符，阳顺阴逆排八神</span></p>
      </MethodBox>

      <MethodBox title="算法">
        <div className="text-xs space-y-1.5">
          <div><span className="text-amber-400">① 起点：</span>神盘值符（小值符）放在<b>天盘值符所在宫</b>（即时干宫）</div>
          <div><span className="text-amber-400">② 排列：</span>从起点开始排八神，<span className="text-red-400">跳过中五宫</span></div>
          <div><span className="text-amber-400">③ 最后设置：</span>中五宫的神 = 坤二宫的神</div>
        </div>
      </MethodBox>

      <MethodBox title="八神顺序">
        <div className="text-xs">
          <p><span className="text-green-400">阳遁：</span>值符→螣蛇→太阴→六合→白虎→玄武→九地→九天</p>
          <p className="mt-1"><span className="text-blue-400">阴遁：</span>值符→九天→九地→玄武→白虎→六合→太阴→螣蛇</p>
        </div>
      </MethodBox>

      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-2 text-xs">
        <span className="text-red-400 font-medium">⚠ 常见错误：</span> 中五寄坤二的处理和人盘一样——循环后再设，不要循环内设。
      </div>
    </div>
  );
}
