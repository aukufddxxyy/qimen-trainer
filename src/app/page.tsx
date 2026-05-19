"use client";

import { useState, useCallback, useEffect } from "react";
import { usePractice } from "@/hooks/usePractice";
import { PanGrid, CandidatePopover } from "@/components/PanGrid";
import { ControlBar } from "@/components/ControlBar";
import { GanzhiBar } from "@/components/GanzhiBar";
import { QuickRefDialog } from "@/components/QuickRefs";
import { Toast } from "@/components/Toast";
import { paiPan } from "@/lib/engine";
import { LIU_JIA_GAN } from "@/lib/calendar";
import type { PalaceId, TianGan, NineStar, EightDoor, EightSpirit, LiuJia } from "@/lib/types";
import { TIAN_GAN, NINE_STARS, EIGHT_DOORS, EIGHT_SPIRITS } from "@/lib/types";

type PopoverType = {
  gongId: PalaceId;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
};

// ---- 旬首弹窗（第三步） ----
function XunShouPopover({ gongId, onSelect, onClose }: { gongId: PalaceId; onSelect: (zhiFu: NineStar, zhiShi: EightDoor) => void; onClose: () => void }) {
  const [zhiFu, setZhiFu] = useState<NineStar | null>(null);
  const [zhiShi, setZhiShi] = useState<EightDoor | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-xs w-full mx-3"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-400 font-medium">宫{gongId} · 选择值符值使</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg cursor-pointer">✕</button>
        </div>

        {/* 值符选择 */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">值符（九星）</div>
          <div className="grid grid-cols-3 gap-1">
            {NINE_STARS.map(s => (
              <button key={s}
                onClick={() => setZhiFu(s)}
                className={`py-1.5 text-xs rounded-lg transition-colors ${
                  zhiFu === s ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* 值使选择 */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">值使（八门）</div>
          <div className="grid grid-cols-4 gap-1">
            {EIGHT_DOORS.map(d => (
              <button key={d}
                onClick={() => setZhiShi(d)}
                className={`py-1.5 text-xs rounded-lg transition-colors ${
                  zhiShi === d ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >{d}</button>
            ))}
          </div>
        </div>

        <button
          onClick={() => zhiFu && zhiShi && onSelect(zhiFu, zhiShi)}
          disabled={!zhiFu || !zhiShi}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
        >
          确认
        </button>
      </div>
    </div>
  );
}

// ---- 定局遮罩（第一步） ----
function BureauOverlay({ yangDun, bureau, onYangDun, onBureau }: {
  yangDun: boolean | undefined;
  bureau: number | undefined;
  onYangDun: (v: boolean) => void;
  onBureau: (v: number) => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/30 backdrop-blur-[2px] rounded-xl">
      <div className="bg-gray-900 border border-amber-500/60 rounded-xl p-5 shadow-2xl max-w-xs w-full mx-3">
        <h3 className="text-sm text-amber-400 font-medium mb-3 flex items-center gap-1">
          <span>📋</span> 第一步：定局
        </h3>

        {/* 阴阳遁 */}
        <div className="flex gap-2 mb-1">
          <button
            onClick={() => onYangDun(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              yangDun === true ? "bg-amber-600 text-white shadow-md" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            ☀ 阳遁
          </button>
          <button
            onClick={() => onYangDun(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              yangDun === false ? "bg-amber-600 text-white shadow-md" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            🌙 阴遁
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center mb-2">
          {yangDun === true ? "冬至 → 芒种" : yangDun === false ? "夏至 → 大雪" : "请选择阴阳遁"}
        </p>

        {/* 局数 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">
            {yangDun === undefined ? "请先选择" : yangDun ? "阳遁" : "阴遁"}
          </span>
          <select
            value={bureau ?? 1}
            onChange={e => onBureau(+e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white cursor-pointer text-sm"
          >
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <option key={n} value={n}>{n}局</option>
            ))}
          </select>
        </div>

        <p className="text-[10px] text-gray-600 mt-2 text-center">
          选择完成后点击左侧「核对答案」确认
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { state, setDate, setMode, setStep, setAnswer, check, randomDate, reveal, hideAnswer, togglePatterns, resetStep, resetAll, undo } = usePractice();
  const { date, mode, currentStep, chart, answer, results, showAnswer, showPatterns } = state;

  const [popover, setPopover] = useState<PopoverType | null>(null);
  const [errorHighlights, setErrorHighlights] = useState<Partial<Record<PalaceId, "correct" | "error">>>({});
  const [zhiFuGong, setZhiFuGong] = useState<PalaceId | null>(null);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [toast, setToast] = useState<import("@/hooks/usePractice").CheckResult | null>(null);
  const [aiKey, setAiKey] = useState("");
  const [aiReading, setAiReading] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [xunShouPopover, setXunShouPopover] = useState<PalaceId | null>(null);

  const isStepMode = mode === "step";

  // 切换步骤/日期时清除高亮、值符标记和Toast
  useEffect(() => {
    setErrorHighlights({});
    setZhiFuGong(null);
    setToast(null);
  }, [currentStep, date]);

  // 当前显示的盘
  const displayPalaces = {} as Record<PalaceId, {
    diPan?: string; tianPanGan?: string; tianPanStar?: string;
    renPanDoor?: string; shenPanSpirit?: string;
  }>;

  const correctChart = showAnswer ? paiPan(date) : null;

  for (let g = 1; g <= 9; g++) {
    const gid = g as PalaceId;
    if (showAnswer && correctChart) {
      const cp = correctChart.palaces[gid];
      displayPalaces[gid] = {
        diPan: cp.diPan, tianPanGan: cp.tianPanGan,
        tianPanStar: cp.tianPanStar, renPanDoor: cp.renPanDoor,
        shenPanSpirit: cp.shenPanSpirit,
      };
    } else {
      displayPalaces[gid] = {
        diPan: answer.dipan?.[gid],
        tianPanGan: answer.tianpan?.[gid]?.gan,
        tianPanStar: answer.tianpan?.[gid]?.star,
        renPanDoor: answer.renpan?.[gid],
        shenPanSpirit: answer.shenpan?.[gid],
      };
    }
  }

  // 格子点击
  const handleCellClick = useCallback((gongId: PalaceId) => {
    let options: { label: string; value: string }[] = [];

    if (isStepMode) {
      switch (currentStep) {
        case "dipan":
          options = TIAN_GAN.map(g => ({ label: g, value: g }));
          break;
        case "tianpan":
          options = [
            ...NINE_STARS.map(s => ({ label: s, value: `star:${s}` })),
            ...TIAN_GAN.map(g => ({ label: g, value: `gan:${g}` })),
          ];
          break;
        case "renpan":
          options = EIGHT_DOORS.map(d => ({ label: d, value: d }));
          break;
        case "shenpan":
          options = EIGHT_SPIRITS.map(s => ({ label: s, value: s }));
          break;
        case "xunshou":
          // 点击宫位 → 弹出值符值使选择器
          setXunShouPopover(gongId);
          return;
        default:
          // 定局步骤不弹窗（遮罩处理）
          return;
      }
    } else {
      options = [
        { label: "清除", value: "clear" },
        ...NINE_STARS.map(s => ({ label: `★${s}`, value: `star:${s}` })),
        ...TIAN_GAN.map(g => ({ label: `干${g}`, value: `gan:${g}` })),
        ...EIGHT_DOORS.map(d => ({ label: `门${d}`, value: `door:${d}` })),
        ...EIGHT_SPIRITS.map(s => ({ label: `神${s}`, value: `spirit:${s}` })),
        ...TIAN_GAN.map(g => ({ label: `地${g}`, value: `dipan:${g}` })),
      ];
    }

    setPopover({
      gongId, options,
      onSelect: (value: string) => {
        setPopover(null);
        if (value === "clear") {
          setAnswer({
            ...answer,
            tianpan: { ...answer.tianpan, [gongId]: undefined },
            renpan: { ...answer.renpan, [gongId]: undefined },
            shenpan: { ...answer.shenpan, [gongId]: undefined },
            dipan: { ...answer.dipan, [gongId]: undefined },
          });
          return;
        }
        if (value.startsWith("star:")) {
          const star = value.slice(5) as NineStar;
          setAnswer({ ...answer, tianpan: { ...answer.tianpan, [gongId]: { star, gan: answer.tianpan?.[gongId]?.gan ?? ("甲" as TianGan) } } });
        } else if (value.startsWith("gan:")) {
          const gan = value.slice(4) as TianGan;
          setAnswer({ ...answer, tianpan: { ...answer.tianpan, [gongId]: { star: answer.tianpan?.[gongId]?.star ?? ("天蓬" as NineStar), gan } } });
        } else if (value.startsWith("door:")) {
          setAnswer({ ...answer, renpan: { ...answer.renpan, [gongId]: value.slice(5) as EightDoor } });
        } else if (value.startsWith("spirit:")) {
          setAnswer({ ...answer, shenpan: { ...answer.shenpan, [gongId]: value.slice(7) as EightSpirit } });
        } else if (value.startsWith("dipan:")) {
          setAnswer({ ...answer, dipan: { ...answer.dipan, [gongId]: value.slice(6) as TianGan } });
        } else {
          if (currentStep === "dipan") setAnswer({ ...answer, dipan: { ...answer.dipan, [gongId]: value as TianGan } });
          else if (currentStep === "renpan") setAnswer({ ...answer, renpan: { ...answer.renpan, [gongId]: value as EightDoor } });
          else if (currentStep === "shenpan") setAnswer({ ...answer, shenpan: { ...answer.shenpan, [gongId]: value as EightSpirit } });
        }
      },
    });
  }, [isStepMode, currentStep, answer, setAnswer]);

  // 旬首弹窗选择完成
  const handleXunShouSelect = useCallback((gongId: PalaceId, zhiFu: NineStar, zhiShi: EightDoor) => {
    // 根据点击的宫位，从地盘找到该宫的干 → 推导旬首
    const dipanGan = answer.dipan?.[gongId];
    let xunShou: LiuJia | undefined;
    if (dipanGan) {
      // 反查: 哪个旬首的干 = dipanGan
      for (const [lj, gan] of Object.entries(LIU_JIA_GAN)) {
        if (gan === dipanGan) { xunShou = lj as LiuJia; break; }
      }
    }
    const newAnswer: typeof answer = { ...answer, zhiFu, zhiShi };
    if (xunShou) newAnswer.xunShou = xunShou;
    setAnswer(newAnswer);
    setXunShouPopover(null);
  }, [answer, setAnswer]);

  // 核对答案
  const handleCheck = useCallback(() => {
    try {
      const result = check(undefined, answer);
      setToast(result);
      const hl: Partial<Record<PalaceId, "correct" | "error">> = {};
      if (result.correct) {
        for (let g = 1; g <= 9; g++) hl[g as PalaceId] = "correct";
      } else {
        for (const err of result.errors) hl[err.gongId] = "error";
        for (let g = 1; g <= 9; g++) {
          const gid = g as PalaceId;
          if (!(gid in hl)) hl[gid] = "correct";
        }
      }
      setErrorHighlights(hl);
    } catch (e) {
      setToast({
        step: currentStep,
        correct: false,
        errors: [{ gongId: 1 as PalaceId, field: "系统错误", expected: "", got: String(e) }],
      });
    }
  }, [check, answer, currentStep, date]);

  // AI 解读
  const handleAIInterpret = useCallback(async () => {
    if (!aiKey) return;
    setAiLoading(true);
    setAiReading("");

    const chart = paiPan(date);
    const summary = `
当前奇门遁甲盘：
时间：${chart.meta.riGanZhi}日 ${chart.meta.shiGanZhi}时
局数：${chart.meta.yangDun ? "阳遁" : "阴遁"}${chart.meta.bureau}局
值符：${chart.meta.zhiFu} 值使：${chart.meta.zhiShi}

各宫情况：
${[1,2,3,4,5,6,7,8,9].map(g => {
  const p = chart.palaces[g as PalaceId];
  return `宫${g}(${p.diPan}): 星${p.tianPanStar}+干${p.tianPanGan} | 门${p.renPanDoor} | 神${p.shenPanSpirit}`;
}).join("\n")}

请简要解读此盘的核心要点和关键提示。
`.trim();

    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${aiKey}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是奇门遁甲专家，用简洁的中文解读奇门盘。" },
            { role: "user", content: summary },
          ],
          max_tokens: 500,
        }),
      });
      const data = await res.json();
      setAiReading(data.choices?.[0]?.message?.content ?? "解读失败");
    } catch {
      setAiReading("API 请求失败，请检查 Key 和网络");
    }
    setAiLoading(false);
  }, [date, aiKey]);

  const chartMeta = showAnswer ? correctChart?.meta : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-3 py-4">
          <header className="text-center mb-4">
            <h1 className="text-2xl font-bold text-amber-400">奇门排盘练习器</h1>
            <GanzhiBar date={date} />
            <p className="text-xs text-gray-500 mt-1">
              {chartMeta
                ? `${chartMeta.yangDun ? "阳遁" : "阴遁"}${chartMeta.bureau}局 · ${chartMeta.riGanZhi}日 ${chartMeta.shiGanZhi}时 · 旬首${chartMeta.xunShou} · 值符${chartMeta.zhiFu} · 值使${chartMeta.zhiShi}`
                : "选择一个时间开始练习"}
            </p>
          </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <aside className="space-y-3">
            <ControlBar
              date={date} mode={mode} currentStep={currentStep}
              onDateChange={setDate} onModeChange={setMode}
              onStepChange={setStep} onRandom={randomDate}
              onReveal={reveal} onHideAnswer={hideAnswer} onCheck={handleCheck}
              isStepMode={isStepMode} showAnswer={showAnswer}
              onResetStep={resetStep} onResetAll={resetAll} onUndo={undo}
            />
            <button
              onClick={() => setShowQuickRef(true)}
              className="w-full py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
            >
              📚 速查手册
            </button>
          </aside>

          <main className="flex flex-col items-center gap-4">
            {/* 盘局信息 */}
            <div className="w-full max-w-[420px] bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-1.5">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">当前盘局</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">局数</span>
                <span className={answer.yangDun !== undefined ? (answer.yangDun ? "text-green-400" : "text-blue-400") : "text-gray-700"}>
                  {answer.yangDun !== undefined
                    ? `${answer.yangDun ? "☀ 阳遁" : "🌙 阴遁"} ${answer.bureau ?? "?"}局`
                    : "--"}
                </span>
                <span className="text-gray-500">旬首</span>
                <span className={answer.xunShou ? "text-amber-400" : "text-gray-700"}>
                  {answer.xunShou ?? "--"}
                </span>
                <span className="text-gray-500">值符</span>
                <span className={answer.zhiFu ? "text-green-400" : "text-gray-700"}>
                  {answer.zhiFu ?? "--"}
                </span>
                <span className="text-gray-500">值使</span>
                <span className={answer.zhiShi ? "text-blue-400" : "text-gray-700"}>
                  {answer.zhiShi ?? "--"}
                </span>
              </div>
            </div>
            {/* 九宫格 + 定局遮罩 */}
            <div className="relative w-full max-w-[420px] mx-auto">
              <PanGrid
                palaces={displayPalaces}
                highlights={errorHighlights}
                markedGong={zhiFuGong}
                onCellClick={handleCellClick}
              />
              {/* 定局遮罩 */}
              {isStepMode && currentStep === "bureau" && !showAnswer && (
                <BureauOverlay
                  yangDun={answer.yangDun}
                  bureau={answer.bureau}
                  onYangDun={(v) => setAnswer({ ...answer, yangDun: v })}
                  onBureau={(v) => setAnswer({ ...answer, bureau: v })}
                />
              )}
            </div>

            {/* 判断结果 — 弹窗显示 */}
            {toast && (
              <Toast result={toast} onDismiss={() => setToast(null)} />
            )}

            {/* 格局标注 */}
            {showPatterns && correctChart && correctChart.patterns.length > 0 && (
              <div className="w-full max-w-[420px] p-3 bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium text-amber-400 mb-2">格局标注</h3>
                <div className="space-y-1">
                  {correctChart.patterns.map((p, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded ${
                      p.type === "吉" ? "bg-green-900/50 text-green-300" :
                      p.type === "凶" ? "bg-red-900/50 text-red-300" :
                      "bg-gray-800 text-gray-400"
                    }`}>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-1 text-gray-500">宫{p.gongId}</span>
                      <span className="ml-2">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 解读 */}
            {showAnswer && correctChart && (
              <div className="w-full max-w-[420px] p-3 bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium text-purple-400 mb-2">🤖 AI 解读</h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="password"
                    value={aiKey}
                    onChange={e => setAiKey(e.target.value)}
                    placeholder="输入 DeepSeek API Key"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                  />
                  <button
                    onClick={handleAIInterpret}
                    disabled={aiLoading || !aiKey}
                    className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded transition-colors"
                  >
                    {aiLoading ? "解读中..." : "解读"}
                  </button>
                </div>
                {aiReading && (
                  <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-800/50 rounded p-2">
                    {aiReading}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 弹窗 */}
      {popover && (
        <CandidatePopover
          gongId={popover.gongId}
          options={popover.options}
          onSelect={popover.onSelect}
          onClose={() => setPopover(null)}
        />
      )}

      {showQuickRef && (
        <QuickRefDialog onClose={() => setShowQuickRef(false)} />
      )}

      {/* 旬首弹窗 */}
      {xunShouPopover && (
        <XunShouPopover
          gongId={xunShouPopover}
          onSelect={(zf, zs) => handleXunShouSelect(xunShouPopover, zf, zs)}
          onClose={() => setXunShouPopover(null)}
        />
      )}
    </div>
  );
}
