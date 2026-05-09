// ============================================================
// 日历工具 — 干支计算 / 节气判断 / 定局
// ============================================================

import type { LiuJia, DiZhi, TianGan, PalaceId, NineStar, EightDoor } from "./types";
import { TIAN_GAN, DI_ZHI, LIU_JIA, PALACE_STAR, PALACE_DOOR } from "./types";

// ============================================================
// 公历 → 日干支
// 公式：日干支基数 = (年尾二位数+7)*5 + 15 + (年尾二位数+19)//4
// ============================================================
export function calcRiGanZhi(date: Date): string {
  const y = date.getFullYear() % 100;
  const base = ((y + 7) * 5 + 15 + Math.floor((y + 19) / 4)) % 60;

  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);

  const idx = (base + dayOfYear) % 60;
  return TIAN_GAN[idx % 10] + DI_ZHI[idx % 12];
}

export function riGanIdx(date: Date): number {
  return TIAN_GAN.indexOf(calcRiGanZhi(date)[0] as TianGan);
}

// ============================================================
// 年柱（以立春为界）
// ============================================================
export function calcNianZhu(date: Date): string {
  const year = date.getFullYear();
  const term = getSolarTerm(date);
  // 如果当前日期在立春之前，年柱用上一年
  const isBeforeLiChun = isBeforeTerm(date, "立春");
  const nianYear = isBeforeLiChun ? year - 1 : year;

  // 年柱干支：1864年为甲子年，以此为基准
  // 甲子年 = 1864, 每60年一循环
  const baseYear = 1864;
  const idx = ((nianYear - baseYear) % 60 + 60) % 60;
  return TIAN_GAN[idx % 10] + DI_ZHI[idx % 12];
}

// ============================================================
// 月柱（以节气为界）
// ============================================================
/** 返回当前日期所在的月支（寅=正月…丑=十二月，以节气为界） */
export function getYueZhi(date: Date): DiZhi {
  // 从立春开始，每两个节气一个地支月
  const yueTermMap: [string, DiZhi][] = [
    ["立春", "寅"], ["惊蛰", "卯"], ["清明", "辰"],
    ["立夏", "巳"], ["芒种", "午"], ["小暑", "未"],
    ["立秋", "申"], ["白露", "酉"], ["寒露", "戌"],
    ["立冬", "亥"], ["大雪", "子"], ["小寒", "丑"],
  ];

  // 从立春开始逐个检查，找到当前日期之后（包含相等）的那个节气，
  // 再往前一个就是所处的月
  // 或者：找最后一个 isBeforeTerm=false 的月
  let result: DiZhi = "丑"; // 兜底（1月1日到立春前）
  for (const [termName, zhi] of yueTermMap) {
    if (!isBeforeTerm(date, termName)) {
      result = zhi;
    } else {
      break; // 一旦遇到在当前日期之后的节气，前面那个就是答案
    }
  }
  return result;
}

export function calcYueZhu(date: Date): string {
  const nianZhu = calcNianZhu(date);
  const nianGan = nianZhu[0] as TianGan;
  const yueZhi = getYueZhi(date);

  // 五虎遁：根据年干推出寅月的月干
  // 甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸何方发，甲寅之上好追求
  const yinGanMap: Record<string, number> = {
    "甲": 2, "己": 2,  // → 丙寅 (index 2)
    "乙": 4, "庚": 4,  // → 戊寅 (index 4)
    "丙": 6, "辛": 6,  // → 庚寅 (index 6)
    "丁": 8, "壬": 8,  // → 壬寅 (index 8)
    "戊": 0, "癸": 0,  // → 甲寅 (index 0)
  };

  const yinGanIdx = yinGanMap[nianGan] ?? 0;
  const yueZhiIdx = DI_ZHI.indexOf(yueZhi); // 寅=2, but we need offset from 寅
  const zhiOffset = (yueZhiIdx - 2 + 12) % 12; // 寅=0, 卯=1, ...
  const yueGanIdx = (yinGanIdx + zhiOffset) % 10;

  return TIAN_GAN[yueGanIdx] + yueZhi;
}

// ============================================================
// 节气辅助
// ============================================================

/** 判断当前日期是否在某个节气之前 */
function isBeforeTerm(date: Date, termName: string): boolean {
  const term = findTerm(termName);
  if (!term) return false;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return m < term.month || (m === term.month && d < term.day);
}

function findTerm(name: string): SolarTerm | undefined {
  return SOLAR_TERMS.find(t => t.name === name);
}

// ============================================================
// 时辰 → 时干支（五鼠遁）
// ============================================================
export function calcShiGanZhi(date: Date): string {
  const h = date.getHours();
  // 子时23-1, 丑1-3, 寅3-5...
  const zhiIdx = Math.floor(((h + 1) % 24) / 2);
  const riGan = riGanIdx(date); // 0=甲 1=乙...

  // 五鼠遁：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸壬子发
  const ziGanMap = [0, 2, 4, 6, 8]; // 甲→0, 乙→2, 丙→4, 丁→6, 戊→8
  const ziGan = ziGanMap[riGan % 5];
  const shiGan = (ziGan + zhiIdx) % 10;

  return TIAN_GAN[shiGan] + DI_ZHI[zhiIdx];
}

// 时辰的地支
export function shiZhi(date: Date): DiZhi {
  const h = date.getHours();
  const zhiIdx = Math.floor(((h + 1) % 24) / 2);
  return DI_ZHI[zhiIdx];
}

// ============================================================
// 节气数组（公历近似的节气日，用于判断）
// ============================================================
interface SolarTerm {
  name: string;
  month: number;  // 公历月
  day: number;     // 近似日（每年差异±1天）
}

// 二十四节气近似日期表
const SOLAR_TERMS: SolarTerm[] = [
  { name: "小寒", month: 1, day: 5 },
  { name: "大寒", month: 1, day: 20 },
  { name: "立春", month: 2, day: 4 },
  { name: "雨水", month: 2, day: 19 },
  { name: "惊蛰", month: 3, day: 6 },
  { name: "春分", month: 3, day: 21 },
  { name: "清明", month: 4, day: 5 },
  { name: "谷雨", month: 4, day: 20 },
  { name: "立夏", month: 5, day: 5 },
  { name: "小满", month: 5, day: 21 },
  { name: "芒种", month: 6, day: 6 },
  { name: "夏至", month: 6, day: 21 },
  { name: "小暑", month: 7, day: 7 },
  { name: "大暑", month: 7, day: 23 },
  { name: "立秋", month: 8, day: 7 },
  { name: "处暑", month: 8, day: 23 },
  { name: "白露", month: 9, day: 8 },
  { name: "秋分", month: 9, day: 23 },
  { name: "寒露", month: 10, day: 8 },
  { name: "霜降", month: 10, day: 23 },
  { name: "立冬", month: 11, day: 7 },
  { name: "小雪", month: 11, day: 22 },
  { name: "大雪", month: 12, day: 7 },
  { name: "冬至", month: 12, day: 22 },
];

/** 判断给定日期处于哪个节气区间，返回该节气名称 */
export function getSolarTerm(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 找到日期之后最近的节气
  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const t = SOLAR_TERMS[i];
    if (m > t.month || (m === t.month && d >= t.day)) {
      return t.name;
    }
  }
  // 如果早于小寒（1月1-4日），属于冬至后
  return "冬至";
}

/** 判断阳遁还是阴遁 */
export function isYangDun(termName: string): boolean {
  // 冬至→芒种 = 阳遁，夏至→大雪 = 阴遁
  const yangTerms = ["冬至","小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种"];
  return yangTerms.includes(termName);
}

// ============================================================
// 三元判断 + 定局
// ============================================================

/** 判断三元（上/中/下） */
export function getSanYuan(date: Date): "上元" | "中元" | "下元" {
  const ganzhi = calcRiGanZhi(date);
  // 找到日柱的六十甲子序号
  const ganIdx = TIAN_GAN.indexOf(ganzhi[0] as TianGan);
  const zhiIdx = DI_ZHI.indexOf(ganzhi[1] as DiZhi);
  const idx = (ganIdx % 10) * 6 + ((zhiIdx - ganIdx + 12) % 12);
  // Actually need the exact 60-cycle index. Let's recompute properly.
  // 甲子=0, 乙丑=1, ...
  // Simple approach: find by scanning
  for (let i = 0; i < 60; i++) {
    if (TIAN_GAN[i % 10] === ganzhi[0] && DI_ZHI[i % 12] === ganzhi[1]) {
      return sanYuanFromIdx(i);
    }
  }
  return "中元";
}

function sanYuanFromIdx(idx: number): "上元" | "中元" | "下元" {
  // 所有符头及其六十甲子序号（甲或己日）
  // 按序号升序排列，每个键是元，值是符头数组
  const futou: { yuan: "上元" | "中元" | "下元"; idx: number }[] = [
    { yuan: "上元", idx: 0 },   // 甲子
    { yuan: "中元", idx: 5 },   // 己巳
    { yuan: "下元", idx: 10 },  // 甲戌
    { yuan: "上元", idx: 15 },  // 己卯
    { yuan: "中元", idx: 20 },  // 甲申
    { yuan: "下元", idx: 25 },  // 己丑
    { yuan: "上元", idx: 30 },  // 甲午
    { yuan: "中元", idx: 35 },  // 己亥
    { yuan: "下元", idx: 40 },  // 甲辰
    { yuan: "上元", idx: 45 },  // 己酉
    { yuan: "中元", idx: 50 },  // 甲寅
    { yuan: "下元", idx: 55 },  // 己未
  ];

  // 从后往前找第一个 ≤ idx 的符头（即最近的一个符头）
  for (let i = futou.length - 1; i >= 0; i--) {
    if (futou[i].idx <= idx) return futou[i].yuan;
  }
  // 兜底：如果 idx < 0（不可能），回上元
  return "上元";
}

// ============================================================
// 节气 → 局数速查表
// ============================================================

const YANG_DUN_TABLE: Record<string, [number, number, number]> = {
  "冬至": [1, 7, 4],
  "小寒": [2, 8, 5],
  "大寒": [3, 9, 6],
  "立春": [8, 5, 2],
  "雨水": [9, 6, 3],
  "惊蛰": [1, 7, 4],
  "春分": [3, 9, 6],
  "清明": [4, 1, 7],
  "谷雨": [5, 2, 8],
  "立夏": [4, 1, 7],
  "小满": [5, 2, 8],
  "芒种": [6, 3, 9],
};

const YIN_DUN_TABLE: Record<string, [number, number, number]> = {
  "夏至": [9, 3, 6],
  "小暑": [8, 2, 5],
  "大暑": [7, 1, 4],
  "立秋": [2, 5, 8],
  "处暑": [1, 4, 7],
  "白露": [9, 3, 6],
  "秋分": [7, 1, 4],
  "寒露": [6, 9, 3],
  "霜降": [5, 8, 2],
  "立冬": [6, 9, 3],
  "小雪": [5, 8, 2],
  "大雪": [4, 7, 1],
};

/** 定局 */
export function getBureau(termName: string, sanYuan: "上元" | "中元" | "下元"): { yangDun: boolean; bureau: number } {
  const yangDun = isYangDun(termName);
  const table = yangDun ? YANG_DUN_TABLE : YIN_DUN_TABLE;
  const [shang, zhong, xia] = table[termName];
  if (sanYuan === "上元") return { yangDun, bureau: shang };
  if (sanYuan === "中元") return { yangDun, bureau: zhong };
  return { yangDun, bureau: xia };
}

// ============================================================
// 旬首查找
// ============================================================

/** 根据时柱找旬首 */
export function getXunShou(shiGanZhi: string): { xunShou: LiuJia; xunShouGong: PalaceId; zhiFu: NineStar; zhiShi: EightDoor } | null {
  // 找到时干支的六十甲子序号
  for (let i = 0; i < 60; i++) {
    if (TIAN_GAN[i % 10] === shiGanZhi[0] && DI_ZHI[i % 12] === shiGanZhi[1]) {
      const xunShouIdx = Math.floor(i / 10) * 10; // 旬首序号
      const xunShou = LIU_JIA[xunShouIdx / 10] as LiuJia;
      return { xunShou, ...({ xunShouGong: 0, zhiFu: "天蓬", zhiShi: "休" } as any) };
    }
  }
  return null;
}

/** 六甲对应天干 */
export const LIU_JIA_GAN: Record<LiuJia, TianGan> = {
  "甲子": "戊", "甲戌": "己", "甲申": "庚", "甲午": "辛", "甲辰": "壬", "甲寅": "癸",
};
