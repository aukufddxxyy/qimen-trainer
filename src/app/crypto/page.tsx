"use client";

import { useState, useCallback } from "react";
import { paiPan } from "@/lib/engine";
import { calcRiGanZhi, calcShiGanZhi } from "@/lib/calendar";
import { GanzhiBar } from "@/components/GanzhiBar";
import { TIAN_GAN, NINE_STARS, EIGHT_DOORS, EIGHT_SPIRITS } from "@/lib/types";
import type { PalaceId, TianGan, NineStar, EightDoor, EightSpirit } from "@/lib/types";

// ── 加密核心 ──

function buildCipher(date: Date) {
  const chart = paiPan(date);
  const keys: Record<PalaceId, { offset: number; xor: number; label: string }> = {} as any;

  for (let g = 1; g <= 9; g++) {
    const gid = g as PalaceId;
    const p = chart.palaces[gid];
    const diIdx = TIAN_GAN.indexOf(p.diPan);
    const tianIdx = TIAN_GAN.indexOf(p.tianPanGan);
    const starIdx = NINE_STARS.indexOf(p.tianPanStar);
    const doorIdx = EIGHT_DOORS.indexOf(p.renPanDoor);
    const spiritIdx = EIGHT_SPIRITS.indexOf(p.shenPanSpirit);

    const offset = ((tianIdx - diIdx + 10) % 10 + starIdx + doorIdx + spiritIdx) % 64;
    const xor = ((starIdx << 4) | doorIdx) & 0xFF;

    keys[gid] = {
      offset,
      xor,
      label: `${p.diPan}→${p.tianPanGan} ${p.tianPanStar} ${p.renPanDoor} ${p.shenPanSpirit}`,
    };
  }
  return { chart, keys };
}

function encrypt(text: string, date: Date): string {
  const { keys } = buildCipher(date);
  const bytes = new TextEncoder().encode(text);
  const out = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    const gid = ((i % 9) + 1) as PalaceId;
    const k = keys[gid];
    out[i] = ((bytes[i] + k.offset) & 0xFF) ^ k.xor;
  }

  // Base64 encode for display
  return btoa(String.fromCharCode(...out));
}

function decrypt(cipher: string, date: Date): string {
  const { keys } = buildCipher(date);
  const bytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
  const out = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    const gid = ((i % 9) + 1) as PalaceId;
    const k = keys[gid];
    out[i] = ((bytes[i] ^ k.xor) - k.offset + 256) & 0xFF;
  }

  return new TextDecoder().decode(out);
}

// ── 组件 ──

export default function CryptoPage() {
  const [date, setDate] = useState(new Date());
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [error, setError] = useState("");

  const chart = paiPan(date);
  const { keys } = buildCipher(date);

  const handleEncrypt = useCallback(() => {
    if (!plaintext) return;
    try {
      const c = encrypt(plaintext, date);
      setCiphertext(c);
      setDecrypted("");
      setError("");
    } catch (e: any) {
      setError("加密失败: " + e.message);
    }
  }, [plaintext, date]);

  const handleDecrypt = useCallback(() => {
    if (!ciphertext) return;
    try {
      const p = decrypt(ciphertext, date);
      setDecrypted(p);
      setError("");
    } catch (e: any) {
      setError("解密失败: " + e.message);
    }
  }, [ciphertext, date]);

  const randomDate = () => {
    const y = 2020 + Math.floor(Math.random() * 10);
    const mo = Math.floor(Math.random() * 12);
    const d = Math.floor(Math.random() * 28) + 1;
    const h = Math.floor(Math.random() * 24);
    setDate(new Date(y, mo, d, h, 0, 0));
    setCiphertext("");
    setDecrypted("");
  };

  const m = chart.meta;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-3 py-6">
        <header className="text-center mb-5">
          <h1 className="text-2xl font-bold text-amber-400">🔐 奇门加密器</h1>
          <p className="text-xs text-gray-500 mt-1">年月日时柱 = 密钥 · 不同时辰不同密文</p>
        </header>

        {/* 日期选择 */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="datetime-local"
              value={date.toISOString().slice(0, 16)}
              onChange={e => { setDate(new Date(e.target.value)); setCiphertext(""); setDecrypted(""); }}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white flex-1"
            />
            <button onClick={randomDate}
              className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">
              🎲 随机
            </button>
          </div>
          <GanzhiBar date={date} />
          <p className="text-xs text-gray-400 mt-1">
            {m.yangDun ? "☀ 阳遁" : "🌙 阴遁"}{m.bureau}局 · {m.riGanZhi}日 {m.shiGanZhi}时 · 旬首{m.xunShou} · 值符{m.zhiFu} · 值使{m.zhiShi}
          </p>
        </div>

        {/* 输入 */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <label className="text-xs text-gray-500 mb-1 block">明文</label>
          <input
            type="text"
            value={plaintext}
            onChange={e => { setPlaintext(e.target.value); setCiphertext(""); setDecrypted(""); }}
            placeholder="输入要加密的文字..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white mb-3"
          />
          <button onClick={handleEncrypt}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm font-medium transition-colors">
            🔒 加密
          </button>
        </div>

        {/* 密文 */}
        {ciphertext && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
            <label className="text-xs text-gray-500 mb-1 block">密文 (Base64)</label>
            <div className="bg-gray-800 rounded p-3 text-xs text-green-400 font-mono break-all mb-3">
              {ciphertext}
            </div>
            <button onClick={handleDecrypt}
              className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors">
              🔓 解密验证
            </button>
            {decrypted && (
              <div className="mt-3 bg-gray-800 rounded p-3">
                <span className="text-xs text-gray-500">解密结果：</span>
                <span className={`text-sm ml-1 ${decrypted === plaintext ? "text-green-400" : "text-red-400"}`}>
                  {decrypted}
                </span>
                {decrypted === plaintext && <span className="text-green-500 text-xs ml-2">✓</span>}
              </div>
            )}
          </div>
        )}

        {/* 九宫密钥表 */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h4 className="text-xs text-gray-500 mb-2">九宫密钥表</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {([1, 2, 3, 4, 5, 6, 7, 8, 9] as PalaceId[]).map(g => {
              const p = chart.palaces[g];
              const k = keys[g];
              return (
                <div key={g} className="bg-gray-800 rounded p-2 text-xs">
                  <div className="text-amber-400 font-medium mb-0.5">宫{g}</div>
                  <div className="text-gray-400">
                    <span className="text-gray-500">地</span>{p.diPan}
                    <span className="text-green-400 mx-1">→</span>
                    <span className="text-gray-500">天</span>{p.tianPanGan}
                  </div>
                  <div className="text-gray-500">
                    {p.tianPanStar} · {p.renPanDoor} · {p.shenPanSpirit}
                  </div>
                  <div className="text-emerald-600 mt-0.5">
                    off={k.offset} xor=0x{k.xor.toString(16).padStart(2, "0")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-800/50 rounded p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* 回到练习器 */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← 回到练习器
          </a>
        </div>
      </div>
    </div>
  );
}
