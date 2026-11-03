import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  Sun, 
  Moon, 
  Flame, 
  Gift, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck,
  Gamepad2,
  Clock,
  Calendar,
  Key
} from 'lucide-react';
import { HERO_CONTENT } from '../data/landingData';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onDownloadClick: () => void;
  onSearchSubmit: (query: string) => void;
  onOpenScheduler?: () => void;
  onOpenApiKeyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onDownloadClick,
  onSearchSubmit,
  onOpenScheduler,
  onOpenApiKeyModal,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header 
      id="global-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? darkMode 
            ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl shadow-black/40'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-md'
          : darkMode 
            ? 'bg-gradient-to-b from-slate-950/95 to-slate-950/60 backdrop-blur-sm'
            : 'bg-gradient-to-b from-white/95 to-slate-50/70 backdrop-blur-sm'
      }`}
    >
      {/* Micro Scarcity Notification Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="tracking-wide">
          END OF SUMMER MEGA SALE: SAVE UP TO 75%
        </span>
        <span className="hidden sm:inline-block opacity-80">|</span>
        <span className="hidden sm:inline-flex items-center gap-1 opacity-95">
          <Clock className="w-3.5 h-3.5 inline" />
          {HERO_CONTENT.liveScarcityText}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <a 
              href="#hero" 
              className="flex items-center gap-2.5 group focus:outline-none"
              id="nav-brand-logo"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <span>E</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-base font-extrabold tracking-tight leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  EPIC GAMES
                </span>
                <span className="text-[10px] font-bold tracking-widest text-cyan-500 uppercase">
                  STORE
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a 
                href="#hero" 
                className={`transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Store
              </a>
              <a 
                href="#discovery" 
                className={`flex items-center gap-1.5 transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                Spotlight Sales
              </a>
              <a 
                href="#weekly-vault" 
                className={`flex items-center gap-1.5 transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <Gift className="w-4 h-4 text-emerald-400" />
                Free Games
              </a>
              <a 
                href="#ecosystem" 
                className={`flex items-center gap-1.5 transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Offer Stacking
              </a>
              <a 
                href="#personas" 
                className={`transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Who It's For
              </a>
              <a 
                href="#pedido-proposta" 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir Proposta</span>
              </a>
              <a 
                href="/admin" 
                className={`transition-colors hover:text-cyan-400 font-bold ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Admin
              </a>
              <a 
                href="#faq" 
                className={`transition-colors hover:text-cyan-500 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                FAQ
              </a>
            </nav>
          </div>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="hidden lg:block relative">
              <input
                type="text"
                id="header-search-input"
                placeholder="Search games, sales, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-60 pl-9 pr-3 py-1.5 text-xs rounded-full border transition-all focus:w-72 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  darkMode 
                    ? 'bg-slate-900/90 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500'
                    : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:bg-white'
                }`}
              />
              <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            </form>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark/light mode"
              className={`p-2 rounded-xl border transition-colors ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/80 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Agendar Reunião Button */}
            {onOpenScheduler && (
              <button
                id="nav-schedule-meeting-btn"
                onClick={onOpenScheduler}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  darkMode
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agendar Reunião</span>
              </button>
            )}

            {/* Primary Action Button (High Contrast Download CTA) */}
            <button
              id="nav-download-cta"
              onClick={onDownloadClick}
              className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span className="whitespace-nowrap tracking-wide">Download Launcher</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border ${
                darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-drawer"
          className={`md:hidden border-b px-4 py-4 space-y-3 ${
            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search store catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                darkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </form>

          <nav className="flex flex-col space-y-2 pt-2 text-sm font-medium">
            <a 
              href="#hero" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" /> Store Highlights
            </a>
            <a 
              href="#discovery" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-400" /> Spotlight Sales (Save 75%)
            </a>
            <a 
              href="#weekly-vault" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-emerald-400" /> Weekly Free Games Vault
            </a>
            <a 
              href="#ecosystem" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> Offer Stacking (Fortnite Bundles)
            </a>
            <a 
              href="#personas" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" /> User Personas & Value
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500"
            >
              Savings & Rewards Calculator
            </a>
            <a 
              href="#pedido-proposta" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> Pedir Proposta (com IA)
            </a>
            <a 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-bold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Área de Administração
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-500"
            >
              Comprehensive FAQs (12 Q&As)
            </a>
            {onOpenScheduler && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenScheduler();
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Agendar Reunião (Google Calendar)
              </button>
            )}
            {onOpenApiKeyModal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApiKeyModal();
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-cyan-400" /> Configurar Chave de API
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
