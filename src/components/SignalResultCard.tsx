import React from 'react';
import { SignalData } from '../types/signal';
import { ArrowUp, ArrowDown, CheckCircle2, Clock } from 'lucide-react';

interface SignalResultCardProps {
  signal: SignalData;
}

export const SignalResultCard: React.FC<SignalResultCardProps> = ({ signal }) => {
  const isUp = signal.direction === 'UP';

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4 transition-all duration-300 animate-in fade-in zoom-in-95">
      <div
        className={`rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ${
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
        <div className="text-center mb-5 relative">
          <div className="text-sm font-extrabold tracking-[0.25em] text-slate-300 font-terminal">
            CANDLE MINDSET
          </div>
          <div className="text-xs font-bold tracking-[0.35em] text-cyan-400 font-terminal">
            AI SIGNAL
          </div>
        </div>

        {/* 2. MARKET NAME */}
        <div className="text-center mb-5">
          <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase font-terminal mb-1">
            MARKET
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-wider text-white font-terminal drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {signal.market}
          </div>
        </div>

        {/* 3. TIMEFRAME & ENTRY */}
        <div className="text-center mb-6">
          <div className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase font-terminal mb-1">
            TIMEFRAME & ENTRY
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/70 border border-white/10 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-2xl sm:text-3xl font-black tracking-widest text-cyan-200 font-terminal">
              {signal.entryM1Formatted}
            </span>
          </div>
        </div>

        {/* 4. SIGNAL DIRECTION (Simple & Large) */}
        <div className="text-center my-6 py-2">
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
                  <ArrowUp className="w-11 h-11 sm:w-14 sm:h-14 stroke-[3.5]" />
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-rose-400 font-terminal drop-shadow-[0_0_25px_rgba(248,113,113,0.7)]">
                  DOWN
                </span>
                <span className="inline-flex p-2.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 animate-arrow-down shadow-[0_0_30px_rgba(248,113,113,0.5)]">
                  <ArrowDown className="w-11 h-11 sm:w-14 sm:h-14 stroke-[3.5]" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. SIGNAL GENERATED Badge */}
        <div className="flex items-center justify-center pt-2">
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
      </div>
    </div>
  );
};
