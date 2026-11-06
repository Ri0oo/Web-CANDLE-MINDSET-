import React from 'react';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

interface HeaderProps {
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLock }) => {
  const LOGO_SRC = '/assets/candle-mindset-logo.jpg';
  const LOGO_FALLBACK = 'https://i.ibb.co/RkPQs2ny/Candle-Mindset-Logo.jpg';

  return (
    <header className="w-full flex flex-col items-center text-center pt-6 pb-4 px-4 relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Lock terminal button on top right */}
      {onLock && (
        <button
          type="button"
          onClick={onLock}
          className="absolute top-4 right-4 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition flex items-center gap-1.5 text-xs font-terminal cursor-pointer shadow-md"
          title="Lock terminal"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      )}

      {/* Top badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
          <span>ONLINE CHART ENGINE</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 bg-slate-900/60 border border-slate-700/50">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>QUOTEX ALIGNED</span>
        </span>
      </div>

      {/* Official Application Name with Profile Logo */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent flex items-center justify-center gap-2.5 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 inline-block overflow-hidden">
          <img
            src={LOGO_SRC}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
            }}
            alt="Candle Mindset Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </span>
        <span>CANDLE MINDSET AI SIGNAL</span>
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium tracking-wide max-w-md">
        Quotex Screenshot Signal Generator
      </p>
    </header>
  );
};
