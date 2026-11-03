import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  Gift, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface SavingsCalculatorProps {
  darkMode: boolean;
  onCtaClick: () => void;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  darkMode,
  onCtaClick,
}) => {
  const [gamesPerYear, setGamesPerYear] = useState<number>(6);
  const [claimFreeGames, setClaimFreeGames] = useState<boolean>(true);

  // Average retail game price is $69.99
  const avgRetailPrice = 69.99;
  const avgSalePrice = 34.99; // 50% avg seasonal sale discount
  
  const totalRetailCost = gamesPerYear * avgRetailPrice;
  const totalSaleCost = gamesPerYear * avgSalePrice;
  const seasonalSavings = totalRetailCost - totalSaleCost;
  
  // 5% Epic Rewards on spend
  const epicRewardsEarned = totalSaleCost * 0.05;
  
  // Weekly free games: 52 weeks * ~$35 average game MSRP
  const freeGamesValuePerYear = claimFreeGames ? 52 * 29.99 : 0;
  
  const totalNetValueUnlocked = seasonalSavings + epicRewardsEarned + freeGamesValuePerYear;

  return (
    <section 
      id="calculator"
      className={`py-16 md:py-24 border-t transition-colors ${
        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Value Simulator</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Calculate Your Annual Player Savings
          </h2>
          <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            See exactly how much you save on retail costs, earn in Epic Rewards, and accumulate in perpetual free games.
          </p>
        </div>

        <div className={`max-w-4xl mx-auto rounded-3xl border p-6 sm:p-10 shadow-2xl ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Controls (6 cols) */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="games-range-input" className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Games You Buy Per Year:
                  </label>
                  <span className="px-3 py-1 rounded-lg font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 text-sm">
                    {gamesPerYear} {gamesPerYear === 1 ? 'Game' : 'Games'}
                  </span>
                </div>
                <input
                  type="range"
                  id="games-range-input"
                  min="1"
                  max="20"
                  value={gamesPerYear}
                  onChange={(e) => setGamesPerYear(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 Casual</span>
                  <span>10 Enthusiast</span>
                  <span>20 Hardcore</span>
                </div>
              </div>

              {/* Free Games Toggle */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                claimFreeGames 
                  ? darkMode ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
                  : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
              onClick={() => setClaimFreeGames(!claimFreeGames)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Claim Weekly Free Games
                    </div>
                    <div className="text-[11px] text-slate-400">
                      52 curated titles/year at zero cost
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={claimFreeGames}
                  onChange={(e) => setClaimFreeGames(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Breakdown Details */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Retail Store Cost (MSRP):</span>
                  <span className="line-through font-mono font-semibold">${totalRetailCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Epic Sale Cost (-50% avg):</span>
                  <span className="font-mono font-semibold text-white">${totalSaleCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> 5% Epic Rewards Returned:
                  </span>
                  <span className="font-mono">+${epicRewardsEarned.toFixed(2)}</span>
                </div>
                {claimFreeGames && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> Free Games Value (52 titles):
                    </span>
                    <span className="font-mono">+${freeGamesValuePerYear.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Display: Big ROI Result (6 cols) */}
            <div className={`md:col-span-6 p-6 sm:p-8 rounded-2xl border text-center flex flex-col justify-between ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-cyan-500/30' 
                : 'bg-gradient-to-br from-slate-50 to-cyan-50 border-cyan-200'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Total Annual Value Unlocked
                </span>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight my-2">
                  ${totalNetValueUnlocked.toFixed(2)}
                </div>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Including <strong className="text-white font-bold">${seasonalSavings.toFixed(2)}</strong> in direct price cuts + <strong className="text-white font-bold">${epicRewardsEarned.toFixed(2)}</strong> store credit.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  id="calc-start-saving-btn"
                  onClick={onCtaClick}
                  className="w-full py-3 px-5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Unlocking These Savings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-slate-400 block mt-2">
                  Free launcher • No credit card needed for weekly free vault
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
