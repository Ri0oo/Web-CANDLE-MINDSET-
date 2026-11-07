import React, { useState } from 'react';
import { DollarSign, ShieldAlert, Check, X, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface MoneyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoneyManagementModal: React.FC<MoneyManagementModalProps> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState<number>(100);

  if (!isOpen) return null;

  const trade1Percent = Math.max(1, Math.round(balance * 0.01 * 10) / 10);
  const trade2Percent = Math.max(1, Math.round(balance * 0.02 * 10) / 10);
  const trade5Percent = Math.max(1, Math.round(balance * 0.05 * 10) / 10);

  // MTG1 is 2.2x of primary entry (standard Quotex 85-87% payout recovery)
  const mtg1Amount = Math.round(trade1Percent * 2.2 * 10) / 10;

  const targetProfit = Math.round(balance * 0.10);
  const stopLoss = Math.round(balance * 0.05);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="liquid-glass rounded-3xl max-w-md w-full p-6 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        {/* Laser glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-terminal tracking-wide">
              CAPITAL RISK MANAGEMENT
            </h3>
            <p className="text-xs text-slate-400 font-terminal">
              Quotex mathematical trade sizing
            </p>
          </div>
        </div>

        {/* Balance Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-terminal mb-1.5">
            YOUR QUOTEX ACCOUNT BALANCE ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="10"
              step="5"
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value) || 0))}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white font-terminal text-base font-bold outline-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBalance(preset)}
                className={`px-2.5 py-1 text-xs rounded-lg font-terminal transition ${
                  balance === preset
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Sizes Grid */}
        <div className="space-y-2.5 mb-5 font-terminal text-xs">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>1% Safe Trade Size (Recommended)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Maximum consistency, lowest drawdown</div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-emerald-400">${trade1Percent}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>2% Moderate Trade Size</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Balanced growth for experienced traders</div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-cyan-300">${trade2Percent}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-purple-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>MTG1 Recovery Bet (2.2x)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Only if 1st candle fails (86% payout recovery)</div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-purple-300">${mtg1Amount}</span>
            </div>
          </div>
        </div>

        {/* Daily Target & Stop Loss Rules */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-terminal text-[11px] mb-5 space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Target (+10%):</span>
            </span>
            <span className="font-bold text-emerald-300">+${targetProfit} (Stop trading when reached)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Daily Stop Loss (-5%):</span>
            </span>
            <span className="font-bold text-rose-400">-${stopLoss} (Never exceed this loss)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider font-terminal hover:from-cyan-400 hover:to-indigo-500 shadow-lg"
        >
          Got It, Apply Money Management
        </button>
      </div>
    </div>
  );
};
