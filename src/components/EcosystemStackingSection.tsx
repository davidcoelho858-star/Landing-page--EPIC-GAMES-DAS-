import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Gift, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Layers 
} from 'lucide-react';
import { ECOSYSTEM_BUNDLES } from '../data/landingData';
import { EcosystemBundle } from '../types';

interface EcosystemStackingSectionProps {
  darkMode: boolean;
  onClaimBundle: (bundle: EcosystemBundle) => void;
}

export const EcosystemStackingSection: React.FC<EcosystemStackingSectionProps> = ({
  darkMode,
  onClaimBundle,
}) => {
  return (
    <section 
      id="ecosystem"
      className={`py-16 md:py-24 transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>The Power of Offer Stacking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Buy One Game. Unlock Exclusive Rewards Across Others.
          </h2>
          <p className={`mt-3 text-base sm:text-lg ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Why settle for a standalone game? When you buy on the Epic Games Store, we bundle exclusive high-tier cosmetics and currency in Fortnite, Rocket League, and beyond.
          </p>
        </div>

        {/* Bundle Cards */}
        <div className="space-y-8">
          {ECOSYSTEM_BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              id={`bundle-card-${bundle.id}`}
              className={`rounded-2xl border p-6 sm:p-8 overflow-hidden relative ${
                darkMode 
                  ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/20 border-slate-800 shadow-2xl' 
                  : 'bg-gradient-to-r from-slate-50 via-white to-purple-50/40 border-slate-200 shadow-lg'
              }`}
            >
              {/* Subtle ambient light */}
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Primary Purchased Game */}
                <div className="lg:col-span-4 flex items-center gap-4">
                  <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shrink-0 shadow-lg border border-slate-700/50">
                    <img 
                      src={bundle.featuredGameImage} 
                      alt={bundle.featuredTitle} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Step 1: Buy This Title
                    </span>
                    <h3 className={`text-lg sm:text-xl font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {bundle.featuredTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-500 text-slate-950">
                        -{bundle.discountPercent}%
                      </span>
                      <span className="text-xs line-through text-slate-400">
                        ${bundle.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-lg font-black text-emerald-400">
                        ${bundle.featuredPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: The Math / Plus Symbol */}
                <div className="lg:col-span-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Plus className="w-5 h-5 font-bold" />
                  </div>
                </div>

                {/* Right: Stacked Gift-with-Purchase Item */}
                <div className="lg:col-span-4 flex items-center gap-4">
                  <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shrink-0 shadow-lg border border-purple-500/40 relative">
                    <img 
                      src={bundle.giftImage} 
                      alt={bundle.giftTitle} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-purple-950/90 text-purple-200 text-[9px] font-black uppercase text-center py-1">
                      {bundle.giftGame}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Step 2: Instant Gift Unlocked
                    </span>
                    <h4 className={`text-base sm:text-lg font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {bundle.giftTitle}
                    </h4>
                    <span className="inline-block mt-1 text-xs font-bold text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                      {bundle.giftValue}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                      {bundle.perkDescription}
                    </p>
                  </div>
                </div>

                {/* Far Right: Total Value & Direct CTA */}
                <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center text-center lg:text-right border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 border-slate-800/60">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Effective Combined Value
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                    ${(bundle.featuredPrice).toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 block">
                      (Includes {bundle.giftValue})
                    </span>
                  </div>

                  <button
                    id={`claim-bundle-${bundle.id}`}
                    onClick={() => onClaimBundle(bundle)}
                    className="mt-3 w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Get Game + Gift</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] text-slate-400 mt-2">
                    {bundle.deadline}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
