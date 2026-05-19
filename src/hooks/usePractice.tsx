"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  TianGan, NineStar, EightDoor, EightSpirit, PalaceId, LiuJia,
  PracticeMode, PracticeStep, QiMenChart, ChartMeta,
} from "@/lib/types";
import { paiPan, getDiPan } from "@/lib/engine";
import { calcRiGanZhi, calcShiGanZhi } from "@/lib/calendar";

// ---- 用户填写的答案 ----
export interface UserAnswer {
  yangDun?: boolean;
  bureau?: number;
  xunShou?: LiuJia;
  zhiFu?: NineStar;
  zhiShi?: EightDoor;
  dipan?: Partial<Record<PalaceId, TianGan>>;
  tianpan?: Partial<Record<PalaceId, { star: NineStar; gan: TianGan }>>;
  renpan?: Partial<Record<PalaceId, EightDoor>>;
  shenpan?: Partial<Record<PalaceId, EightSpirit>>;
}

// ---- 校对结果 ----
export interface CheckResult {
  step: PracticeStep;
  correct: boolean;
  errors: { gongId: PalaceId; field: string; expected: string; got: string }[];
}

interface PracticeState {
  date: Date;
  mode: PracticeMode;
  currentStep: PracticeStep;
  chart: QiMenChart | null;
  answer: UserAnswer;
  results: CheckResult[];
  showAnswer: boolean;
  showPatterns: boolean;
  undoHistory: UserAnswer[];
}

// ---- Context ----
const PracticeCtx = createContext<{
  state: PracticeState;
  setDate: (d: Date) => void;
  setMode: (m: PracticeMode) => void;
  setStep: (s: PracticeStep) => void;
  setAnswer: (a: UserAnswer) => void;
  check: (step?: PracticeStep, overrideAnswer?: UserAnswer) => CheckResult;
  randomDate: () => void;
  reveal: () => void;
  hideAnswer: () => void;
  togglePatterns: () => void;
  resetStep: () => void;
  resetAll: () => void;
  undo: () => void;
} | null>(null);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PracticeState>({
    date: new Date(),
    mode: "step",
    currentStep: "bureau",
    chart: null,
    answer: {},
    results: [],
    showAnswer: false,
    showPatterns: false,
    undoHistory: [],
  });

  const setDate = useCallback((d: Date) => {
    setState(s => ({ ...s, date: d, chart: null, answer: {}, results: [], showAnswer: false, undoHistory: [] }));
  }, []);

  const setMode = useCallback((m: PracticeMode) => {
    setState(s => ({ ...s, mode: m, answer: {}, results: [], showAnswer: false }));
  }, []);

  const stepOrder: PracticeStep[] = ["bureau", "dipan", "xunshou", "tianpan", "renpan", "shenpan"];

  const setStep = useCallback((st: PracticeStep) => {
    setState(s => {
      const targetIdx = stepOrder.indexOf(st);
      const chart = paiPan(s.date);
      const newAnswer = { ...s.answer };

      // 自动填充所有前面步骤的正确答案
      for (let i = 0; i < targetIdx; i++) {
        const stepId = stepOrder[i];
        switch (stepId) {
          case "bureau":
            newAnswer.yangDun = chart.meta.yangDun;
            newAnswer.bureau = chart.meta.bureau;
            break;
          case "dipan": {
            const dp: Partial<Record<PalaceId, TianGan>> = {};
            for (let g = 1; g <= 9; g++) dp[g as PalaceId] = chart.palaces[g as PalaceId].diPan;
            newAnswer.dipan = dp;
            break;
          }
          case "xunshou":
            newAnswer.xunShou = chart.meta.xunShou;
            newAnswer.zhiFu = chart.meta.zhiFu;
            newAnswer.zhiShi = chart.meta.zhiShi;
            break;
          case "tianpan": {
            const tp: Partial<Record<PalaceId, { star: NineStar; gan: TianGan }>> = {};
            for (let g = 1; g <= 9; g++) {
              const p = chart.palaces[g as PalaceId];
              tp[g as PalaceId] = { star: p.tianPanStar, gan: p.tianPanGan };
            }
            newAnswer.tianpan = tp;
            break;
          }
          case "renpan": {
            const rp: Partial<Record<PalaceId, EightDoor>> = {};
            for (let g = 1; g <= 9; g++) rp[g as PalaceId] = chart.palaces[g as PalaceId].renPanDoor;
            newAnswer.renpan = rp;
            break;
          }
          case "shenpan": {
            const sp: Partial<Record<PalaceId, EightSpirit>> = {};
            for (let g = 1; g <= 9; g++) sp[g as PalaceId] = chart.palaces[g as PalaceId].shenPanSpirit;
            newAnswer.shenpan = sp;
            break;
          }
        }
      }

      return { ...s, currentStep: st, results: [], answer: newAnswer, undoHistory: [] };
    });
  }, []);

  const setAnswer = useCallback((a: UserAnswer) => {
    setState(s => ({
      ...s,
      answer: a,
      undoHistory: [...s.undoHistory.slice(-49), s.answer],
    }));
  }, []);

  const randomDate = useCallback(() => {
    const y = 2020 + Math.floor(Math.random() * 10);
    const mo = Math.floor(Math.random() * 12);
    const d = Math.floor(Math.random() * 28) + 1;
    const h = Math.floor(Math.random() * 24);
    const date = new Date(y, mo, d, h, 0, 0);
    setState(s => ({ ...s, date, chart: null, answer: {}, results: [], showAnswer: false }));
  }, []);

  const check = useCallback((step?: PracticeStep, overrideAnswer?: UserAnswer): CheckResult => {
    const chart = paiPan(state.date);
    const stepToCheck = step ?? state.currentStep;
    const ans = overrideAnswer ?? state.answer;
    const errors: CheckResult["errors"] = [];

    if (stepToCheck === "bureau") {
      if (ans.yangDun !== chart.meta.yangDun) {
        errors.push({ gongId: 1, field: "阴阳遁", expected: chart.meta.yangDun ? "阳遁" : "阴遁", got: ans.yangDun ? "阳遁" : "阴遁" });
      }
      if (ans.bureau !== chart.meta.bureau) {
        errors.push({ gongId: 1, field: "局数", expected: String(chart.meta.bureau), got: String(ans.bureau ?? "?") });
      }
    }

    if (stepToCheck === "xunshou") {
      if (ans.xunShou !== chart.meta.xunShou) {
        errors.push({ gongId: 1, field: "旬首", expected: chart.meta.xunShou, got: ans.xunShou ?? "?" });
      }
      if (ans.zhiFu !== chart.meta.zhiFu) {
        errors.push({ gongId: 1, field: "值符", expected: chart.meta.zhiFu, got: ans.zhiFu ?? "?" });
      }
      if (ans.zhiShi !== chart.meta.zhiShi) {
        errors.push({ gongId: 1, field: "值使", expected: chart.meta.zhiShi, got: ans.zhiShi ?? "?" });
      }
    }

    if (stepToCheck === "dipan") {
      for (let g = 1; g <= 9; g++) {
        const gid = g as PalaceId;
        const expected = chart.palaces[gid].diPan;
        const got = ans.dipan?.[gid];
        if (got !== expected) {
          errors.push({ gongId: gid, field: "地盘干", expected, got: got ?? "（未填）" });
        }
      }
    }

    if (stepToCheck === "tianpan") {
      for (let g = 1; g <= 9; g++) {
        const gid = g as PalaceId;
        const cell = ans.tianpan?.[gid];
        const exp = chart.palaces[gid];
        if (!cell) {
          errors.push({ gongId: gid, field: "天盘", expected: `${exp.tianPanStar}+${exp.tianPanGan}`, got: "（未填）" });
        } else {
          if (cell.star !== exp.tianPanStar) errors.push({ gongId: gid, field: "星", expected: exp.tianPanStar, got: cell.star });
          if (cell.gan !== exp.tianPanGan) errors.push({ gongId: gid, field: "天盘干", expected: exp.tianPanGan, got: cell.gan });
        }
      }
    }

    if (stepToCheck === "renpan") {
      for (let g = 1; g <= 9; g++) {
        const gid = g as PalaceId;
        const got = ans.renpan?.[gid];
        const expected = chart.palaces[gid].renPanDoor;
        if (got !== expected) {
          errors.push({ gongId: gid, field: "门", expected, got: got ?? "（未填）" });
        }
      }
    }

    if (stepToCheck === "shenpan") {
      for (let g = 1; g <= 9; g++) {
        const gid = g as PalaceId;
        const got = ans.shenpan?.[gid];
        const expected = chart.palaces[gid].shenPanSpirit;
        if (got !== expected) {
          errors.push({ gongId: gid, field: "神", expected, got: got ?? "（未填）" });
        }
      }
    }

    const result: CheckResult = { step: stepToCheck, correct: errors.length === 0, errors };
    setState(s => ({
      ...s,
      chart,
      results: [...s.results.filter(r => r.step !== stepToCheck), result],
      answer: overrideAnswer ?? s.answer,
    }));
    return result;
  }, [state.date, state.currentStep]);

  const reveal = useCallback(() => {
    const chart = paiPan(state.date);
    setState(s => ({ ...s, chart, showAnswer: true, showPatterns: true }));
  }, [state.date]);

  const hideAnswer = useCallback(() => {
    setState(s => ({ ...s, showAnswer: false, showPatterns: false }));
  }, []);

  const togglePatterns = useCallback(() => {
    setState(s => ({ ...s, showPatterns: !s.showPatterns }));
  }, []);

  // 重置当前步骤
  const resetStep = useCallback(() => {
    setState(s => {
      const newAnswer = { ...s.answer };
      switch (s.currentStep) {
        case "bureau":
          delete newAnswer.yangDun;
          delete newAnswer.bureau;
          break;
        case "dipan":
          newAnswer.dipan = {};
          break;
        case "xunshou":
          delete newAnswer.xunShou;
          delete newAnswer.zhiFu;
          delete newAnswer.zhiShi;
          break;
        case "tianpan":
          newAnswer.tianpan = {};
          break;
        case "renpan":
          newAnswer.renpan = {};
          break;
        case "shenpan":
          newAnswer.shenpan = {};
          break;
      }
      return { ...s, answer: newAnswer, results: [], chart: null };
    });
  }, []);

  // 一键还原全部
  const resetAll = useCallback(() => {
    setState(s => ({
      ...s,
      answer: {},
      results: [],
      currentStep: "bureau",
      showAnswer: false,
      showPatterns: false,
      chart: null,
      undoHistory: [],
    }));
  }, []);

  // 撤销上一步操作
  const undo = useCallback(() => {
    setState(s => {
      if (s.undoHistory.length === 0) return s;
      const prev = s.undoHistory[s.undoHistory.length - 1];
      return {
        ...s,
        answer: prev,
        results: [],
        undoHistory: s.undoHistory.slice(0, -1),
      };
    });
  }, []);

  return (
    <PracticeCtx.Provider value={{ state, setDate, setMode, setStep, setAnswer, check, randomDate, reveal, hideAnswer, togglePatterns, resetStep, resetAll, undo }}>
      {children}
    </PracticeCtx.Provider>
  );
}

export function usePractice() {
  const ctx = useContext(PracticeCtx);
  if (!ctx) throw new Error("usePractice must be used within PracticeProvider");
  return ctx;
}
