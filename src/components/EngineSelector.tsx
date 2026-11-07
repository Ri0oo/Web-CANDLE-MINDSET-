import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

export type EngineType = 'v2' | 'v2.1';

interface EngineSelectorProps {
  currentEngine: EngineType;
  onChangeEngine: (engine: EngineType) => void;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({
  currentEngine,
  onChangeEngine,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-3">
      <div className="liquid-glass rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-terminal flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>SELECT AI ENGINE</span>
          </span>

          <span className="text-[10px] font-terminal font-semibold text-slate-500">
            {currentEngine === 'v2' ? (
              <span className="text-cyan-300">v2 LOCAL ACTIVE</span>
            ) : (
              <span className="text-purple-300">v2.1 GEMINI ACTIVE</span>
            )}
          </span>
        </div>

        {/* Dual Engine Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* v2: Local Chart Engine */}
          <button
            type="button"
            onClick={() => onChangeEngine('v2')}
            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
              currentEngine === 'v2'
                ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black font-terminal tracking-wider ${currentEngine === 'v2' ? 'text-cyan-300' : 'text-slate-300'}`}>
                AI ENGINE v2
              </span>
              {currentEngine === 'v2' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-terminal leading-tight">
              Local Chart Engine (Instant & Direct)
            </div>
          </button>

          {/* v2.1: Gemini Vision AI Engine */}
          <button
            type="button"
            onClick={() => onChangeEngine('v2.1')}
            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
              currentEngine === 'v2.1'
                ? 'bg-purple-950/60 border-purple-400/80 shadow-[0_0_20px_rgba(192,132,252,0.35)]'
                : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black font-terminal tracking-wider flex items-center gap-1 ${currentEngine === 'v2.1' ? 'text-purple-300' : 'text-slate-300'}`}>
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI ENGINE v2.1</span>
              </span>
              {currentEngine === 'v2.1' && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-terminal leading-tight">
              Gemini Vision AI (Reads Asset & Candlesticks)
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
