import React, { useEffect, useState, useRef } from 'react';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { triggerSignalCompleteVibration } from '../utils/haptics';

interface CountdownTimerProps {
  entryTimestamp: number;
  direction: 'UP' | 'DOWN';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ entryTimestamp, direction }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.ceil((entryTimestamp - Date.now()) / 1000));
  });

  const [hasTriggeredBell, setHasTriggeredBell] = useState(false);
  const bellFiredRef = useRef(false);

  useEffect(() => {
    bellFiredRef.current = false;
    setHasTriggeredBell(false);

    const updateTimer = () => {
      const diff = Math.ceil((entryTimestamp - Date.now()) / 1000);
      setSecondsRemaining(diff);

      // Play tick beep on final 3 seconds (3, 2, 1)
      if (diff >= 1 && diff <= 3) {
        soundEngine.playTick();
      }

      // Exact entry moment reached!
      if (diff <= 0 && !bellFiredRef.current) {
        bellFiredRef.current = true;
        setHasTriggeredBell(true);
        soundEngine.playEntryBell();
        triggerSignalCompleteVibration(direction);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [entryTimestamp, direction]);

  const isEntryNow = secondsRemaining <= 0 && secondsRemaining >= -60;
  const isExpired = secondsRemaining < -60;

  // Percentage progress from 60s down to 0s
  const progressPercent = Math.max(0, Math.min(100, (Math.max(0, secondsRemaining) / 60) * 100));

  return (
    <div className="w-full my-4 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-terminal flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>M1 ENTRY COUNTDOWN</span>
        </span>

        {isEntryNow ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40 animate-pulse font-terminal flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>ENTRY ACTIVE</span>
          </span>
        ) : isExpired ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-400 font-terminal">
            CANDLE FINISHED
          </span>
        ) : (
          <span className="text-xs font-black text-cyan-300 font-terminal tracking-wider">
            {secondsRemaining < 10 ? `00:0${secondsRemaining}s` : `00:${secondsRemaining}s`}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isEntryNow
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_15px_#34d399]'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
          }`}
          style={{ width: isEntryNow ? '100%' : `${100 - progressPercent}%` }}
        />
      </div>

      {/* Dynamic Subtext */}
      <div className="mt-2 text-center text-xs font-terminal">
        {isEntryNow ? (
          <div className="text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>PLACE TRADE NOW IN QUOTEX!</span>
          </div>
        ) : isExpired ? (
          <span className="text-slate-500 text-[11px]">Next candle completed. Generate new signal.</span>
        ) : (
          <span className="text-slate-400 text-[11px]">
            Prepare trade in Quotex: Execute at <span className="text-cyan-300 font-bold">00s</span> boundary
          </span>
        )}
      </div>
    </div>
  );
};
