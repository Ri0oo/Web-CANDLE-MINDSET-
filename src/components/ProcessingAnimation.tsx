import React from 'react';
import { SIGNAL_STAGES } from '../types/signal';
import { Cpu, ShieldCheck } from 'lucide-react';

interface ProcessingAnimationProps {
  currentStage: number; // 1 to 8
  entryTimePreview?: string;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  currentStage,
  entryTimePreview,
}) => {
  const stageInfo = SIGNAL_STAGES[currentStage] || SIGNAL_STAGES[1];
  const progressPercent = Math.min(100, Math.round((currentStage / 8) * 100));

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4 transition-all duration-300">
      <div className="liquid-glass-glow rounded-2xl p-5 border border-cyan-500/40 relative overflow-hidden shadow-2xl">
        {/* Animated laser glow beam at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />

        {/* Header indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 animate-pulse">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 tracking-widest font-terminal">
                {stageInfo.number} / STAGE 08
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide font-terminal">
                {stageInfo.label}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm sm:text-base font-extrabold text-cyan-300 font-terminal">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic stage subtext */}
        <p className="text-xs text-slate-300 mb-3 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span>{stageInfo.description}</span>
        </p>

        {/* Stage step indicators grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-terminal text-center">
          {Object.entries(SIGNAL_STAGES).map(([numStr, info]) => {
            const stepNum = Number(numStr);
            const isCompleted = stepNum < currentStage;
            const isCurrent = stepNum === currentStage;

            return (
              <div
                key={stepNum}
                className={`py-1 px-1 rounded transition-all font-semibold ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : isCompleted
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900/40 text-slate-500 border border-slate-850'
                }`}
              >
                <span>S{stepNum < 10 ? `0${stepNum}` : stepNum}</span>
              </div>
            );
          })}
        </div>

        {entryTimePreview && (
          <div className="mt-3 pt-2 text-center text-xs font-terminal text-slate-400">
            Target Entry Lock: <span className="text-cyan-300 font-bold">{entryTimePreview}</span>
          </div>
        )}
      </div>
    </div>
  );
};
