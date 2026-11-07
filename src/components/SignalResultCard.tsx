import React, { useState } from 'react';
import { SignalData } from '../types/signal';
import { ArrowUp, ArrowDown, CheckCircle2, Clock, Copy, Check, Download, Shield, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface SignalResultCardProps {
  signal: SignalData;
  onLogResult?: (type: 'WIN' | 'LOSS') => void;
}

export const SignalResultCard: React.FC<SignalResultCardProps> = ({ signal, onLogResult }) => {
  const isUp = signal.direction === 'UP';
  const [copied, setCopied] = useState(false);
  const [loggedStatus, setLoggedStatus] = useState<'WIN' | 'LOSS' | null>(null);

  // Calculate MTG1 next minute boundary
  const mtg1Timestamp = signal.entryTimestamp + 60000;
  const mtg1Formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(mtg1Timestamp));

  // Copy signal formatted for Telegram / WhatsApp
  const handleCopy = () => {
    const text = `🔥 CANDLE MINDSET AI SIGNAL 🔥\n📊 Market: ${signal.market}\n⏰ Entry: ${signal.entryM1Formatted}\n🎯 Direction: ${signal.direction} ${isUp ? '⬆️' : '⬇️'}\n🛡️ MTG 1: ${mtg1Formatted} (1-Step Backup)\n👉 Join: https://t.me/CANDLEMINDSET`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution PNG card image
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 600, 700);
    bgGradient.addColorStop(0, '#05070d');
    bgGradient.addColorStop(0.5, isUp ? '#062015' : '#230a10');
    bgGradient.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 700);

    // Glowing border
    ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 680);

    // Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLE MINDSET', 300, 65);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
    ctx.fillText('AI SIGNAL TERMINAL', 300, 95);

    // Market
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "JetBrains Mono", sans-serif';
    ctx.fillText('MARKET ASSET', 300, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "JetBrains Mono", sans-serif';
    ctx.fillText(signal.market, 300, 195);

    // Entry Time
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "JetBrains Mono", sans-serif';
    ctx.fillText('TIMEFRAME & ENTRY', 300, 255);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "JetBrains Mono", sans-serif';
    ctx.fillText(signal.entryM1Formatted, 300, 295);

    // Signal Direction
    ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.font = '900 70px "JetBrains Mono", sans-serif';
    ctx.fillText(`${signal.direction} ${isUp ? '▲' : '▼'}`, 300, 410);

    // MTG 1 Backup
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
    ctx.fillText(`MTG 1 BACKUP: ${mtg1Formatted}`, 300, 480);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('(Execute only if 1st candle closes against signal)', 300, 505);

    // Telegram info
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 15px "JetBrains Mono", sans-serif';
    ctx.fillText('Telegram: t.me/CANDLEMINDSET', 300, 610);

    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.fillText('Binary Options Trading AI Assistance', 300, 640);

    const a = document.createElement('a');
    a.download = `Candle_Mindset_${signal.market.replace('/', '_')}_${signal.direction}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleLog = (type: 'WIN' | 'LOSS') => {
    setLoggedStatus(type);
    if (onLogResult) {
      onLogResult(type);
    } else {
      const current = Number(localStorage.getItem(type === 'WIN' ? 'cm_session_wins' : 'cm_session_losses') || '0');
      localStorage.setItem(type === 'WIN' ? 'cm_session_wins' : 'cm_session_losses', String(current + 1));
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4 transition-all duration-300 animate-in fade-in zoom-in-95">
      <div
        className={`rounded-2xl p-5 sm:p-7 relative overflow-hidden transition-all duration-500 ${
          isUp ? 'liquid-glass-up' : 'liquid-glass-down'
        }`}
      >
        {/* Soft ambient lighting */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 blur-3xl pointer-events-none rounded-full ${
            isUp ? 'bg-emerald-500/25' : 'bg-rose-500/25'
          }`}
        />

        {/* 1. Header Branding */}
        <div className="text-center mb-4 relative">
          <div className="text-sm font-extrabold tracking-[0.25em] text-slate-300 font-terminal">
            CANDLE MINDSET
          </div>
          <div className="text-xs font-bold tracking-[0.35em] text-cyan-400 font-terminal">
            AI SIGNAL
          </div>
          <div className="mt-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-terminal uppercase border ${
                signal.engineUsed === 'v2.1'
                  ? 'bg-purple-950/70 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(192,132,252,0.3)]'
                  : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {signal.engineUsed === 'v2.1' ? '✨ ENGINE v2.1 • GEMINI VISION' : '⚡ ENGINE v2 • LOCAL CHART'}
            </span>
          </div>
        </div>

        {/* 2. MARKET NAME */}
        <div className="text-center mb-4">
          <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase font-terminal mb-1">
            MARKET
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-wider text-white font-terminal drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {signal.market}
          </div>
        </div>

        {/* 3. TIMEFRAME & ENTRY */}
        <div className="text-center mb-4">
          <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase font-terminal mb-1">
            TIMEFRAME & ENTRY
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-2xl sm:text-3xl font-black tracking-widest text-cyan-200 font-terminal">
              {signal.entryM1Formatted}
            </span>
          </div>
        </div>

        {/* FEATURE 1: LIVE ENTRY COUNTDOWN TIMER */}
        <CountdownTimer entryTimestamp={signal.entryTimestamp} direction={signal.direction} />

        {/* 4. SIGNAL DIRECTION */}
        <div className="text-center my-4 py-1">
          <div className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase font-terminal mb-2">
            SIGNAL
          </div>

          <div className="flex items-center justify-center gap-4">
            {isUp ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-emerald-400 font-terminal drop-shadow-[0_0_25px_rgba(52,211,153,0.7)]">
                  UP
                </span>
                <span className="inline-flex p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 animate-arrow-up shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                  <ArrowUp className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3.5]" />
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-rose-400 font-terminal drop-shadow-[0_0_25px_rgba(248,113,113,0.7)]">
                  DOWN
                </span>
                <span className="inline-flex p-2.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 animate-arrow-down shadow-[0_0_30px_rgba(248,113,113,0.5)]">
                  <ArrowDown className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3.5]" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FEATURE 2: 1-STEP MARTINGALE (MTG1) GUIDE */}
        <div className="my-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center font-terminal">
          <div className="flex items-center justify-center gap-1.5 text-purple-300 font-bold text-xs uppercase mb-0.5">
            <Shield className="w-3.5 h-3.5" />
            <span>1-STEP MARTINGALE (MTG 1) GUIDE</span>
          </div>
          <div className="text-xs text-white font-semibold">
            Next Candle Recovery: <span className="text-purple-300 font-bold">{mtg1Formatted}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Only execute MTG1 if the primary 1st candle closes against the signal
          </div>
        </div>

        {/* 5. SIGNAL GENERATED Badge */}
        <div className="flex items-center justify-center pt-1 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase font-terminal shadow-lg ${
              isUp
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SIGNAL GENERATED</span>
          </span>
        </div>

        {/* FEATURE 4 & 6: SHARE & LOG ACTIONS BAR */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-terminal">
          {/* Copy & Image Share */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1 cursor-pointer"
              title="Copy signal text for Telegram"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCard}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1 cursor-pointer"
              title="Download signal card image"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Card</span>
            </button>
          </div>

          {/* Quick Win / Loss Result Logger */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase">Log Trade:</span>
            <button
              type="button"
              onClick={() => handleLog('WIN')}
              disabled={loggedStatus !== null}
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                loggedStatus === 'WIN'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-500/30 disabled:opacity-50'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Win</span>
            </button>
            <button
              type="button"
              onClick={() => handleLog('LOSS')}
              disabled={loggedStatus !== null}
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                loggedStatus === 'LOSS'
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border-rose-500/30 disabled:opacity-50'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>Loss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
