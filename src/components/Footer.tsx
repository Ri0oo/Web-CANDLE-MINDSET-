import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-xl mx-auto px-4 pt-4 pb-10 text-center text-xs text-slate-500 font-terminal">
      <div className="text-[10px] text-slate-600 font-medium tracking-wider uppercase">
        © {new Date().getFullYear()} CANDLE MINDSET AI SIGNAL • ALL RIGHTS RESERVED
      </div>
    </footer>
  );
};
