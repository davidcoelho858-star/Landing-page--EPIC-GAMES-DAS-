import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Percent, 
  Gift, 
  Zap, 
  Flame, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { HERO_CONTENT, HERO_DEALS } from '../data/landingData';
import { HeroDeal } from '../types';

interface HeroSectionProps {
  darkMode: boolean;
  onDealAction: (deal: HeroDeal) => void;
  onExploreCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  darkMode,
  onDealAction,
  onExploreCatalog,
}) => {
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const activeDeal = HERO_DEALS[activeDealIndex];

  // Countdown timer state calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 45,
    seconds: 18,
  });

  useEffect(() => {
    const updateCountdown = () => {
      // Calculate remaining time against target deadline
      const target = activeDeal.deadlineTimestamp;
      const difference = target - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeDeal]);

  return (
    <section 
      id="hero"
      className={`relative pt-24 sm:pt-28 pb-16 md:pb-24 overflow-hidden transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background ambient light effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeDeal.accentColor }}
        />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Core Pain Point & Emotional Hook Box */}
        <div className="mb-8 md:mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <Percent className="w-3.5 h-3.5" />
            <span>Problem Solved: Never Overpay for Games Again</span>
          </div>

          {/* PRD SPEC: Headline (max 10 words) */}
          <h1 
            id="hero-main-headline"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-4"
          >
            {HERO_CONTENT.headline}
          </h1>

          {/* PRD SPEC: Subheadline (max 25 words) */}
          <p 
            id="hero-subheadline"
            className={`text-base sm:text-lg leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {HERO_CONTENT.subheadline}
          </p>

          {/* Quick value tags */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Weekly Games
            </span>
            <span className="text-slate-500">•</span>
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 5% Epic Rewards Cashback
            </span>
            <span className="text-slate-500">•</span>
            <span className="inline-flex items-center gap-1 text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fortnite & Rocket League Perks
            </span>
          </div>
        </div>

        {/* Dynamic Hero Showcase / Carousel Blueprint */}
        <div 
          id="hero-carousel-container"
          className={`rounded-2xl border transition-all duration-500 overflow-hidden shadow-2xl ${
            darkMode 
              ? 'bg-slate-900/90 border-slate-800 shadow-cyan-950/20' 
              : 'bg-white border-slate-200 shadow-slate-200'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Col: High-Impact Visual Banner & Live Triggers (8 cols on lg) */}
            <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-slate-950 text-white overflow-hidden group">
              {/* Background Art with smooth fade */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={activeDeal.image} 
                  alt={activeDeal.title}
                  className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out brightness-40 sm:brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
              </div>

              {/* Top Bar of Card: Badges & Scarcity Clock */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-slate-950 shadow"
                    style={{ backgroundColor: activeDeal.accentColor }}
                  >
                    {activeDeal.badge}
                  </span>
                  {activeDeal.ecosystemReward && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                      <Sparkles className="w-3 h-3" />
                      {activeDeal.ecosystemReward.badge}
                    </span>
                  )}
                </div>

                {/* PRD SPEC: Specific Temporal Scarcity Countdown */}
                <div 
                  id="scarcity-countdown-box"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-slate-300 hidden sm:inline">Ends in:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.days).padStart(2, '0')}d</span>:
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, '0')}h</span>:
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>
              </div>

              {/* Bottom Content Area: Offer Stacking, Price Anchoring & CTAs */}
              <div className="relative z-10 mt-auto pt-6 space-y-4 max-w-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                    {activeDeal.edition}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mt-1 leading-tight">
                    {activeDeal.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-200 mt-2 font-normal leading-snug">
                    {activeDeal.tagline}
                  </p>
                </div>

                {/* Offer Stacking Detail Banner */}
                {activeDeal.ecosystemReward && (
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 backdrop-blur-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                        {activeDeal.ecosystemReward.game[0]}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                          Ecosystem Cross-Reward
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {activeDeal.ecosystemReward.item}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 whitespace-nowrap">
                      Auto-Credited
                    </span>
                  </div>
                )}

                {/* PRD SPEC: Price Anchoring Formula */}
                <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    {activeDeal.isFree ? (
                      <div className="flex items-baseline gap-2">
                        <span className="line-through text-slate-400 text-sm font-semibold">
                          ${activeDeal.originalPrice.toFixed(2)}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-purple-500 text-white font-black text-xs uppercase tracking-wider">
                          100% OFF
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                          FREE
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-black text-sm tracking-wide">
                          -{activeDeal.discountPercent}%
                        </span>
                        <span className="line-through text-slate-400 text-base font-semibold">
                          ${activeDeal.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                          ${activeDeal.salePrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Primary Call to Action Button */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      id={`hero-cta-btn-${activeDeal.id}`}
                      onClick={() => onDealAction(activeDeal)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm text-slate-950 shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 hover:brightness-110"
                      style={{ backgroundColor: activeDeal.accentColor }}
                    >
                      <span>{activeDeal.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      id="hero-secondary-cta"
                      onClick={onExploreCatalog}
                      className="hidden sm:flex px-4 py-3 rounded-xl font-bold text-xs text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors items-center gap-1.5"
                    >
                      <span>Explore Catalog</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>{activeDeal.deadlineText}</span>
                  <span className="text-cyan-400">+5% Epic Rewards credited upon checkout</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Offer Carousel Selector (4 cols on lg) */}
            <div 
              id="hero-deals-carousel-sidebar"
              className={`lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Featured Highlights
                  </span>
                  <span className="text-xs font-semibold text-cyan-500">
                    {activeDealIndex + 1} of {HERO_DEALS.length}
                  </span>
                </div>

                {/* Tabs representing each featured offer */}
                <div className="space-y-2">
                  {HERO_DEALS.map((deal, idx) => {
                    const isSelected = idx === activeDealIndex;
                    return (
                      <button
                        key={deal.id}
                        id={`hero-deal-tab-${deal.id}`}
                        onClick={() => setActiveDealIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl transition-all border flex items-center gap-3 group ${
                          isSelected
                            ? darkMode
                              ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                              : 'bg-white border-cyan-500 shadow-md shadow-cyan-500/10'
                            : darkMode
                              ? 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/50'
                              : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-950">
                          <img 
                            src={deal.image} 
                            alt={deal.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <span 
                            className="absolute bottom-0 right-0 px-1 py-0.2 text-[9px] font-black rounded-tl"
                            style={{ 
                              backgroundColor: deal.accentColor, 
                              color: deal.accentColor === '#00dfa2' ? '#022c22' : '#ffffff' 
                            }}
                          >
                            {deal.isFree ? 'FREE' : `-${deal.discountPercent}%`}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 truncate">
                              {deal.edition}
                            </span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            )}
                          </div>
                          <h3 className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {deal.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {deal.isFree ? (
                              <span className="text-xs font-black text-emerald-400">FREE</span>
                            ) : (
                              <>
                                <span className="text-[11px] line-through text-slate-400">
                                  ${deal.originalPrice.toFixed(2)}
                                </span>
                                <span className="text-xs font-extrabold text-emerald-400">
                                  ${deal.salePrice.toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-500'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Launcher Quick Benefits Box */}
              <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-cyan-500 mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span>The Epic Advantage</span>
                </div>
                <ul className="space-y-1 text-[11px] opacity-90">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                    Keep weekly free games forever in your account
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                    Self-service 14-day refund window (played &lt;2h)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                    5% rewards returned automatically on checkouts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
