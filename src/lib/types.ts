// ============================================================
// 奇门排盘练习器 — 类型定义
// ============================================================

// 十天干
export const TIAN_GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
export type TianGan = typeof TIAN_GAN[number];

// 十二地支
export const DI_ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
export type DiZhi = typeof DI_ZHI[number];

// 六甲
export const LIU_JIA = ["甲子","甲戌","甲申","甲午","甲辰","甲寅"] as const;
export type LiuJia = typeof LIU_JIA[number];

// 九宫编号（洛书）
export type PalaceId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// 九星
export const NINE_STARS = ["天蓬","天芮","天冲","天辅","天禽","天心","天柱","天任","天英"] as const;
export type NineStar = typeof NINE_STARS[number];

// 八门
export const EIGHT_DOORS = ["休","生","伤","杜","景","死","惊","开"] as const;
export type EightDoor = typeof EIGHT_DOORS[number];

// 八神
export const EIGHT_SPIRITS = ["值符","螣蛇","太阴","六合","白虎","玄武","九地","九天"] as const;
export type EightSpirit = typeof EIGHT_SPIRITS[number];

// 九宫配卦
export const PALACE_GUA: Record<PalaceId, string> = {
  1: "坎", 2: "坤", 3: "震", 4: "巽", 5: "中", 6: "乾", 7: "兑", 8: "艮", 9: "离",
};

// 九宫配五行
export const PALACE_WUXING: Record<PalaceId, string> = {
  1: "水", 2: "土", 3: "木", 4: "木", 5: "土", 6: "金", 7: "金", 8: "土", 9: "火",
};

// 九宫原始配星（固定）
export const PALACE_STAR: Record<PalaceId, NineStar> = {
  1: "天蓬", 2: "天芮", 3: "天冲", 4: "天辅", 5: "天禽", 6: "天心", 7: "天柱", 8: "天任", 9: "天英",
};

// 九宫原始配门（固定）
export const PALACE_DOOR: Record<PalaceId, EightDoor> = {
  1: "休", 2: "死", 3: "伤", 4: "杜", 5: "死"/* 寄坤二 */, 6: "开", 7: "惊", 8: "生", 9: "景",
};

// 八门顺序（阳遁顺排用）
export const DOOR_ORDER: EightDoor[] = ["休","生","伤","杜","景","死","惊","开"];

// 九星顺序（用于天盘旋转）
export const STAR_ORDER: NineStar[] = ["天蓬","天芮","天冲","天辅","天禽","天心","天柱","天任","天英"];

// 每周期的三奇六仪顺序
export const YI_ORDER: TianGan[] = ["戊","己","庚","辛","壬","癸","丁","丙","乙"];

// 一个宫格的完整信息
export interface PalaceData {
  id: PalaceId;
  diPan: TianGan;           // 地盘干
  tianPanGan: TianGan;      // 天盘干
  tianPanStar: NineStar;    // 天盘星
  renPanDoor: EightDoor;    // 人盘门
  shenPanSpirit: EightSpirit; // 神盘神
}

// 格局定义
export interface Pattern {
  name: string;        // 格局名
  type: "吉" | "凶" | "平";
  gongId: PalaceId;    // 所在宫
  desc: string;        // 简要说明
}

// 排盘元数据
export interface ChartMeta {
  date: Date;
  riGanZhi: string;    // 日柱
  shiGanZhi: string;   // 时柱
  yangDun: boolean;    // true=阳遁, false=阴遁
  bureau: number;      // 局数 1-9
  xunShou: LiuJia;     // 旬首
  zhiFu: NineStar;     // 值符
  zhiShi: EightDoor;   // 值使
  zhiFuGong: PalaceId; // 旬首在地盘的宫位
}

// 完整排盘结果
export interface QiMenChart {
  meta: ChartMeta;
  palaces: Record<PalaceId, PalaceData>;
  patterns: Pattern[];
}

// 一个步骤的用户答案（用于判对错）
export type StepAnswer = Partial<Record<PalaceId, {
  gan?: TianGan;
  star?: NineStar;
  door?: EightDoor;
  spirit?: EightSpirit;
}>>;

// 练习步骤
export type PracticeStep = "bureau" | "dipan" | "xunshou" | "tianpan" | "renpan" | "shenpan";

// 练习模式
export type PracticeMode = "full" | "step";

// 步骤信息
export interface StepInfo {
  id: PracticeStep;
  label: string;
  num: number;
}
