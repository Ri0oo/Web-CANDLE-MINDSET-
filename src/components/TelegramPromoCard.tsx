import React from 'react';
import { Send, ExternalLink, Sparkles } from 'lucide-react';

export const TelegramPromoCard: React.FC = () => {
  const TELEGRAM_URL = 'https://t.me/CANDLEMINDSET';

  const handleClick = () => {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className="liquid-glass rounded-2xl p-4 sm:p-5 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_-2px_rgba(6,182,212,0.4)] cursor-pointer transition-all duration-300 transform active:scale-[0.98] group relative overflow-hidden"
      >
        {/* Subtle cyan/blue ambient backlight */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />

        <div className="flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3.5">
            {/* Telegram Icon with pulsing glow */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,136,204,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(41,182,246,0.7)] transition-all shrink-0">
              <Send className="w-5 h-5 sm:w-6 sm:h-6 -translate-x-0.5 translate-y-0.5 fill-white stroke-none" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-cyan-400 tracking-wider uppercase font-terminal">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>OFFICIAL COMMUNITY</span>
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-wide group-hover:text-cyan-200 transition">
                JOIN TELEGRAM CHANNEL FOR MORE ACCURATE SIGNAL
              </h3>
              <p className="text-[11px] text-slate-400 font-terminal mt-0.5 flex items-center gap-1">
                <span>t.me/CANDLEMINDSET</span>
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shrink-0 shadow-md">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
