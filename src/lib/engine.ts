// ============================================================
// 奇门遁甲排盘引擎
// ============================================================

import type {
  TianGan, PalaceId, NineStar, EightDoor, EightSpirit,
  PalaceData, ChartMeta, QiMenChart, Pattern, LiuJia,
} from "./types";
import {
  YI_ORDER, PALACE_STAR, PALACE_DOOR, DOOR_ORDER, STAR_ORDER,
  EIGHT_SPIRITS, TIAN_GAN, DI_ZHI,
} from "./types";
import {
  calcRiGanZhi, calcShiGanZhi, getSolarTerm,
  getSanYuan, getBureau, LIU_JIA_GAN,
} from "./calendar";

// ============================================================
// 工具函数
// ============================================================

/** 获取六甲序数 */
function getLiuJiaIdx(xunShou: LiuJia): number {
  const map: Record<LiuJia, number> = {
    "甲子": 0, "甲戌": 10, "甲申": 20, "甲午": 30, "甲辰": 40, "甲寅": 50,
  };
  return map[xunShou];
}

/** 找时干支在60甲子中的序号 */
function getShiGanZhiIdx(shiGanZhi: string): number {
  for (let i = 0; i < 60; i++) {
    if (TIAN_GAN[i % 10] === shiGanZhi[0] && DI_ZHI[i % 12] === shiGanZhi[1]) {
      return i;
    }
  }
  return 0;
}

/** 找旬首 */
function getXunShouFromShiIdx(idx: number): LiuJia {
  const xunIdx = Math.floor(idx / 10);
  const map: LiuJia[] = ["甲子", "甲戌", "甲申", "甲午", "甲辰", "甲寅"];
  return map[xunIdx];
}

/** 阳遁：顺排（1→9），阴遁：逆排（9→1） */
function walkGong(start: PalaceId, steps: number, yangDun: boolean, skipFive = false): PalaceId {
  let gong = start;
  for (let i = 0; i < steps; i++) {
    do {
      gong = yangDun
        ? (gong % 9 + 1) as PalaceId
        : ((gong + 7) % 9 + 1) as PalaceId;
    } while (skipFive && gong === 5);
  }
  return gong;
}

// ============================================================
// 第一步：定局
// ============================================================

function stepBureau(date: Date): Pick<ChartMeta, "yangDun" | "bureau" | "date"> {
  const term = getSolarTerm(date);
  const sanYuan = getSanYuan(date);
  const { yangDun, bureau } = getBureau(term, sanYuan);
  return { yangDun, bureau, date };
}

// ============================================================
// 第二步：布地盘
// ============================================================

function stepDiPan(yangDun: boolean, bureau: number): Record<PalaceId, TianGan> {
  const dipan = {} as Record<PalaceId, TianGan>;
  for (let i = 0; i < 9; i++) {
    const gong = yangDun
      ? ((bureau - 1 + i) % 9 + 1) as PalaceId   // 阳顺
      : ((bureau - 1 - i + 9) % 9 + 1) as PalaceId; // 阴逆
    dipan[gong] = YI_ORDER[i];
  }
  return dipan;
}

// ============================================================
// 第三步：定值符值使
// ============================================================

function stepZhiFuZhiShi(
  shiGanZhi: string,
  dipan: Record<PalaceId, TianGan>,
): { xunShou: LiuJia; zhiFu: NineStar; zhiShi: EightDoor; zhiFuGong: PalaceId } {
  const shiIdx = getShiGanZhiIdx(shiGanZhi);
  const xunShou = getXunShouFromShiIdx(shiIdx);
  const xunGan = LIU_JIA_GAN[xunShou];

  // 找旬首在地盘哪个宫
  let zhiFuGong: PalaceId = 1;
  for (const [g, gan] of Object.entries(dipan)) {
    if (gan === xunGan) {
      zhiFuGong = Number(g) as PalaceId;
      break;
    }
  }

  const zhiFu = PALACE_STAR[zhiFuGong];
  const zhiShi = PALACE_DOOR[zhiFuGong];

  return { xunShou, zhiFu, zhiShi, zhiFuGong };
}

// ============================================================
// 第四步：转天盘
// ============================================================

function stepTianPan(
  shiGanZhi: string,
  dipan: Record<PalaceId, TianGan>,
  zhiFu: NineStar,
  zhiFuGong: PalaceId,
  yangDun: boolean,
): Record<PalaceId, { gan: TianGan; star: NineStar }> {
  const shiGan = shiGanZhi[0] as TianGan;

  // 找时干在地盘哪个宫（甲遁于旬首六仪之下，用值符宫）
  let shiGanGong: PalaceId;
  if (shiGan === "甲") {
    shiGanGong = zhiFuGong;
  } else {
    shiGanGong = 1;
    for (const [g, gan] of Object.entries(dipan)) {
      if (gan === shiGan) {
        shiGanGong = Number(g) as PalaceId;
        break;
      }
    }
  }

  // 值符星在九星顺序中的位置
  const zhiFuIdx = STAR_ORDER.indexOf(zhiFu);

  // 计算每颗星在天盘的落宫：从值符所在的时干宫开始，其余星按阳顺阴逆排列
  const tianpan = {} as Record<PalaceId, { gan: TianGan; star: NineStar }>;

  for (let i = 0; i < 9; i++) {
    // 第 i 颗星（从值符开始）
    const starIdx = (zhiFuIdx + i) % 9;
    const star = STAR_ORDER[starIdx];

    // 该星对应的地盘宫位（原始宫位）
    const origGong = (starIdx + 1) as PalaceId;
    // 该星携带的地盘干（不是天盘干！携带的是原宫位的地盘干）
    const origGan = dipan[origGong];

    // 天盘落宫 = 时干宫开始，阳顺阴逆走 i 步
    const tianGong = walkGong(shiGanGong, i, yangDun, false);

    tianpan[tianGong] = {
      star,
      gan: origGan, // 携带原宫的地盘干
    };
  }

  return tianpan;
}

// ============================================================
// 第五步：转人盘
// ============================================================

function stepRenPan(
  shiGanZhi: string,
  zhiShi: EightDoor,
  zhiFuGong: PalaceId,
  xunShou: LiuJia,
  yangDun: boolean,
): Record<PalaceId, EightDoor> {
  const shiZhiChar = shiGanZhi[1] as import("./types").DiZhi;
  const xunZhi = xunShou[1] as import("./types").DiZhi;

  const shiZhiIdx = DI_ZHI.indexOf(shiZhiChar);
  const xunZhiIdx = DI_ZHI.indexOf(xunZhi);

  // 地支差距
  let steps = (shiZhiIdx - xunZhiIdx + 12) % 12;

  // 值使门落宫：从旬首宫开始走 steps 步，跳过中五（用坤二代替）
  const zhiShiGong = walkGong(zhiFuGong, steps, yangDun, true);

  // 值使门在八门顺序中的位置
  const zhiShiIdx = DOOR_ORDER.indexOf(zhiShi);

  const renpan = {} as Record<PalaceId, EightDoor>;

  // 8 个门填 8 个宫（跳过中五，中五寄坤二，与坤二同门）
  for (let i = 0; i < 8; i++) {
    const doorIdx = (zhiShiIdx + i) % 8;
    const door = DOOR_ORDER[doorIdx];
    // 走 i 步，跳过中五
    const gong = walkGong(zhiShiGong, i, yangDun, true);
    renpan[gong] = door;
  }

  // 中五宫寄坤二：中五的门跟坤二一样
  renpan[5] = renpan[2] ?? PALACE_DOOR[2];

  return renpan;
}

// ============================================================
// 第六步：转神盘
// ============================================================

function stepShenPan(
  shiGanGong: PalaceId,
  yangDun: boolean,
): Record<PalaceId, EightSpirit> {
  const shenpan = {} as Record<PalaceId, EightSpirit>;

  // 阳遁顺排八神，阴遁逆排八神
  const spiritOrder: EightSpirit[] = yangDun
    ? [...EIGHT_SPIRITS]
    : [EIGHT_SPIRITS[0], ...EIGHT_SPIRITS.slice(1).reverse()];

  // 8 个神填 8 个宫（跳过中五，中五寄坤二）
  for (let i = 0; i < 8; i++) {
    const gong = walkGong(shiGanGong, i, yangDun, true);
    shenpan[gong] = spiritOrder[i];
  }

  // 中五宫寄坤二
  shenpan[5] = shenpan[2] ?? EIGHT_SPIRITS[0];

  return shenpan;
}

// ============================================================
// 格局检测
// ============================================================

function detectPatterns(
  palaces: Record<PalaceId, PalaceData>,
): Pattern[] {
  const patterns: Pattern[] = [];

  for (const [gongStr, p] of Object.entries(palaces)) {
    const gongId = Number(gongStr) as PalaceId;
    const d = p.diPan;
    const t = p.tianPanGan;

    // 天盘戊 + 地盘丙 = 青龙回首
    if (t === "戊" && d === "丙") {
      patterns.push({ name: "青龙回首", type: "吉", gongId, desc: "百事顺利，动作大吉" });
    }
    // 天盘丙 + 地盘戊 = 飞鸟跌穴
    if (t === "丙" && d === "戊") {
      patterns.push({ name: "飞鸟跌穴", type: "吉", gongId, desc: "百事洞彻，谋为有成" });
    }
    // 天盘乙 + 地盘辛 = 青龙逃走
    if (t === "乙" && d === "辛") {
      patterns.push({ name: "青龙逃走", type: "凶", gongId, desc: "奴仆拐带，百事皆凶" });
    }
    // 天盘辛 + 地盘乙 = 白虎猖狂
    if (t === "辛" && d === "乙") {
      patterns.push({ name: "白虎猖狂", type: "凶", gongId, desc: "主客两伤，远行灾殃" });
    }
    // 天盘丁 + 地盘癸 = 朱雀投江
    if (t === "丁" && d === "癸") {
      patterns.push({ name: "朱雀投江", type: "凶", gongId, desc: "文书口舌，音信沉溺" });
    }
    // 天盘癸 + 地盘丁 = 螣蛇夭矫
    if (t === "癸" && d === "丁") {
      patterns.push({ name: "螣蛇夭矫", type: "凶", gongId, desc: "虚惊不宁，文书官司" });
    }
    // 天盘庚 + 地盘丙 = 太白入荧
    if (t === "庚" && d === "丙") {
      patterns.push({ name: "太白入荧", type: "凶", gongId, desc: "贼必来犯，利客不利主" });
    }
    // 天盘丙 + 地盘庚 = 荧入太白
    if (t === "丙" && d === "庚") {
      patterns.push({ name: "荧入太白", type: "凶", gongId, desc: "贼必退去，利主不利客" });
    }
    // 天盘庚 + 地盘癸 = 大格
    if (t === "庚" && d === "癸") {
      patterns.push({ name: "大格", type: "凶", gongId, desc: "百事皆凶，远行失路" });
    }
    // 天盘庚 + 地盘壬 = 小格/上格
    if (t === "庚" && d === "壬") {
      patterns.push({ name: "小格", type: "凶", gongId, desc: "远行失路，求谋破财" });
    }
    // 天盘庚 + 地盘己 = 刑格
    if (t === "庚" && d === "己") {
      patterns.push({ name: "刑格", type: "凶", gongId, desc: "官司受刑，求谋破财" });
    }

    // 三奇得使：三奇 + 值使门所在宫
    // (在后续合盘后可以检测)

    // 天遁：丙+丁+生门
    if (t === "丙" && d === "丁" && p.renPanDoor === "生") {
      patterns.push({ name: "天遁", type: "吉", gongId, desc: "百事生旺，利求官行商" });
    }
    // 地遁：乙+己+开门
    if (t === "乙" && d === "己" && p.renPanDoor === "开") {
      patterns.push({ name: "地遁", type: "吉", gongId, desc: "宜扎寨藏兵、安坟修造" });
    }
  }

  return patterns;
}

// ============================================================
// 主入口：排盘
// ============================================================

export function paiPan(date: Date): QiMenChart {
  const riGanZhi = calcRiGanZhi(date);
  const shiGanZhi = calcShiGanZhi(date);

  // Step 1: 定局
  const { yangDun, bureau } = stepBureau(date);

  // Step 2: 布地盘
  const dipan = stepDiPan(yangDun, bureau);

  // Step 3: 定值符值使
  const { xunShou, zhiFu, zhiShi, zhiFuGong } = stepZhiFuZhiShi(shiGanZhi, dipan);

  // Step 4: 转天盘
  const tianpanPartial = stepTianPan(shiGanZhi, dipan, zhiFu, zhiFuGong, yangDun);

  // 时干所在宫（天盘值符所在宫，用于神盘。甲遁于旬首六仪之下）
  const shiGan = shiGanZhi[0] as TianGan;
  let shiGanGong: PalaceId;
  if (shiGan === "甲") {
    shiGanGong = zhiFuGong;
  } else {
    shiGanGong = 1;
    for (const [g, gan] of Object.entries(dipan)) {
      if (gan === shiGan) { shiGanGong = Number(g) as PalaceId; break; }
    }
  }

  // Step 5: 转人盘
  const renpan = stepRenPan(shiGanZhi, zhiShi, zhiFuGong, xunShou, yangDun);

  // Step 6: 转神盘
  const shenpan = stepShenPan(shiGanGong, yangDun);

  // 合并
  const palaces = {} as Record<PalaceId, PalaceData>;
  for (let g = 1; g <= 9; g++) {
    const gong = g as PalaceId;
    palaces[gong] = {
      id: gong,
      diPan: dipan[gong],
      tianPanGan: tianpanPartial[gong]?.gan ?? dipan[gong],
      tianPanStar: tianpanPartial[gong]?.star ?? PALACE_STAR[gong],
      renPanDoor: renpan[gong] ?? PALACE_DOOR[gong === 5 ? 2 : gong],
      shenPanSpirit: shenpan[gong] ?? shenpan[gong === 5 ? 2 : gong] ?? "值符",
    };
  }

  // 格局检测
  const patterns = detectPatterns(palaces);

  return {
    meta: {
      date,
      riGanZhi,
      shiGanZhi,
      yangDun,
      bureau,
      xunShou,
      zhiFu,
      zhiShi,
      zhiFuGong,
    },
    palaces,
    patterns,
  };
}

// ============================================================
// 导出基础信息（用于出题）
// ============================================================

export function getChartMeta(date: Date): ChartMeta {
  const chart = paiPan(date);
  return chart.meta;
}

/** 仅计算地盘 */
export function getDiPan(date: Date): Record<PalaceId, TianGan> {
  const { yangDun, bureau } = stepBureau(date);
  return stepDiPan(yangDun, bureau);
}
