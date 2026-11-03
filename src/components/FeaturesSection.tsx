import React from 'react';
import { 
  Gift, 
  Percent, 
  Layers, 
  Coins, 
  Sparkles, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';
import { CORE_FEATURES } from '../data/landingData';

interface FeaturesSectionProps {
  darkMode: boolean;
  onFeatureClick: (featureId: string) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  darkMode,
  onFeatureClick,
}) => {
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gift':
        return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section 
      id="features"
      className={`py-16 md:py-24 transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Check className="w-3.5 h-3.5" />
            <span>The Persuasion Blueprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Engineered for Maximum Player Value
          </h2>
          <p className={`mt-3 text-base sm:text-lg ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Every feature is architected to remove friction, reverse purchase anxiety, and stack compounding rewards across your entire gaming library.
          </p>
        </div>

        {/* Feature Grid (5 Cards: 2 on top row or 3+2 grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((feature, index) => {
            const isWide = index === 0 || index === 1;
            return (
              <div
                key={feature.id}
                id={`feature-card-${feature.id}`}
                onClick={() => onFeatureClick(feature.id)}
                className={`group relative rounded-2xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 ${
                  isWide ? 'lg:col-span-1.5' : ''
                } ${
                  darkMode 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-500/5' 
                    : 'bg-slate-50 border-slate-200 hover:border-cyan-500 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5'
                }`}
              >
                <div>
                  {/* Top Bar with Icon and Metric Badge */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      {getFeatureIcon(feature.iconName)}
                    </div>
                    <div className="text-right">
                      <span className="block text-lg sm:text-xl font-black text-cyan-400 font-mono leading-none">
                        {feature.metric}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {feature.metricLabel}
                      </span>
                    </div>
                  </div>

                  {/* Feature Name */}
                  <h3 className={`text-xl font-extrabold tracking-tight mb-2 group-hover:text-cyan-400 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {feature.name}
                  </h3>

                  {/* PRD SPEC: One-line benefit (focus on OUTCOME, not functionality) */}
                  <p className="text-sm font-semibold text-emerald-400 mb-3 leading-snug">
                    {feature.benefit}
                  </p>

                  {/* Functional description */}
                  <p className={`text-xs leading-relaxed ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>

                {/* Card footer micro-link */}
                <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs font-bold text-cyan-500">
                  <span>Learn how it works</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
