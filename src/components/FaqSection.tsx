import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FAQ_ITEMS } from '../data/landingData';

interface FaqSectionProps {
  darkMode: boolean;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ darkMode }) => {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Free Games', 'Savings & Pricing', 'Rewards & Perks', 'Launcher & Account'];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="faq"
      className={`py-16 md:py-24 border-t transition-colors ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Friction-Free Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className={`mt-2 text-sm sm:text-base ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Everything you need to know about pricing, free games, refund policies, and ecosystem perks.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <input
              type="text"
              id="faq-search-input"
              placeholder="Search questions (e.g. 'refunds', 'Steam comparison', 'free games')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`faq-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                    : darkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List (12 Q&As) */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No questions found matching "{searchQuery}". Try searching for another term.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-accordion-item-${faq.id}`}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? darkMode
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                        : 'bg-slate-50 border-cyan-500 shadow-md'
                      : darkMode
                        ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-cyan-500 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className={`text-sm sm:text-base font-bold ${
                        isOpen 
                          ? 'text-cyan-400' 
                          : darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                    }`} />
                  </button>

                  {isOpen && (
                    <div className={`px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                      darkMode ? 'border-slate-800/60 text-slate-300' : 'border-slate-200 text-slate-700'
                    }`}>
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{faq.objectionResolved}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
