import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Gift, 
  Tag, 
  Clock, 
  Star, 
  ArrowRight, 
  Coins, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';
import { DISCOVERY_CATALOG } from '../data/landingData';
import { CatalogGame } from '../types';

interface DiscoveryCatalogSectionProps {
  darkMode: boolean;
  onGameSelect: (game: CatalogGame) => void;
}

export const DiscoveryCatalogSection: React.FC<DiscoveryCatalogSectionProps> = ({
  darkMode,
  onGameSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'discount' | 'price_low' | 'rating'>('discount');

  const categories = [
    { id: 'all', label: 'All Curated Titles', icon: Sparkles },
    { id: 'spotlight', label: 'End of Summer Spotlight', icon: Flame },
    { id: 'free', label: 'Weekly Free Vault', icon: Gift },
    { id: 'top_sellers', label: 'Top Sellers (-50% to -70%)', icon: Tag },
    { id: 'pre_purchase', label: 'Pre-Purchase Exclusives', icon: Clock },
  ];

  const filteredGames = DISCOVERY_CATALOG.filter((game) => {
    if (activeCategory === 'all') return true;
    return game.category === activeCategory;
  }).sort((a, b) => {
    if (sortOption === 'discount') return b.discountPercent - a.discountPercent;
    if (sortOption === 'price_low') return a.salePrice - b.salePrice;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <section 
      id="discovery"
      className={`py-16 md:py-24 border-t transition-colors ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Curation</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Discover Something New
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Segmented catalogs specifically curated to ease the paradox of choice.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Sort by:</span>
            <select
              id="catalog-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="discount">Biggest Discount (-%)</option>
              <option value="price_low">Lowest Price ($)</option>
              <option value="rating">Player Rating</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/20'
                    : darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              id={`game-card-${game.id}`}
              className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Visual Art Header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {game.isFree ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-md">
                        100% FREE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                        -{game.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-md flex items-center gap-1 border border-amber-400/20">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{game.rating}</span>
                  </div>

                  {/* Stacked Perk Banner on Image */}
                  {game.stackedPerk && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-2.5 pt-6">
                      <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">{game.stackedPerk}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                    <span className="truncate">{game.developer}</span>
                    <span className="uppercase text-[10px] tracking-wider text-cyan-500">{game.genre}</span>
                  </div>

                  <h3 className={`font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-cyan-400 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {game.title}
                  </h3>

                  {/* Cashback Callout */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {game.isFree ? 'Zero transaction fee' : `Earn $${game.epicRewardsCashback.toFixed(2)} in Epic Rewards`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Price Anchoring & Micro CTA */}
              <div className={`p-4 sm:p-5 pt-0 border-t mt-2 flex items-center justify-between ${
                darkMode ? 'border-slate-800/80' : 'border-slate-100'
              }`}>
                {/* Price Section */}
                <div>
                  {game.isFree ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 line-through">
                        ${game.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-base font-black text-emerald-400">
                        FREE
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 line-through">
                        ${game.originalPrice.toFixed(2)}
                      </span>
                      <span className={`text-base font-black ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        ${game.salePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Micro-CTA Button aligned with state of awareness */}
                <button
                  id={`buy-btn-${game.id}`}
                  onClick={() => onGameSelect(game)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    game.isFree
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      : game.category === 'pre_purchase'
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  }`}
                >
                  <span>
                    {game.isFree 
                      ? 'Play for Free' 
                      : game.category === 'pre_purchase' 
                        ? 'Pre-Purchase' 
                        : 'Save Now'}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
