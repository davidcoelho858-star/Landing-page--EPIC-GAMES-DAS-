import React from 'react';
import { 
  ArrowUp, 
  Gamepad2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="global-footer"
      className={`border-t pt-14 pb-12 transition-colors ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-lg">
                E
              </div>
              <span className={`text-base font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                EPIC GAMES STORE
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm mb-4">
              The premier digital storefront engineered to reward players. Enjoy weekly free games, seasonal discounts up to 75%, and exclusive cross-ecosystem bonuses.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-cyan-500">
              <span>Verified 88/12 Developer Split</span>
              <span>•</span>
              <span>5% Epic Rewards</span>
            </div>
          </div>

          {/* Column 1: Storefront */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Storefront
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-cyan-500 transition-colors">Mega Summer Sale</a></li>
              <li><a href="#discovery" className="hover:text-cyan-500 transition-colors">Spotlight Catalogs</a></li>
              <li><a href="#weekly-vault" className="hover:text-cyan-500 transition-colors">Weekly Free Vault</a></li>
              <li><a href="#ecosystem" className="hover:text-cyan-500 transition-colors">Fortnite Cross-Perks</a></li>
            </ul>
          </div>

          {/* Column 2: Player Support */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#pedido-proposta" className="text-cyan-400 font-bold hover:underline">Pedido de Proposta (IA)</a></li>
              <li><a href="/admin" className="text-slate-300 font-semibold hover:text-white">Área de Administração</a></li>
              <li><a href="#faq" className="hover:text-cyan-500 transition-colors">14-Day Refund Policy</a></li>
              <li><a href="#calculator" className="hover:text-cyan-500 transition-colors">Rewards Calculator</a></li>
            </ul>
          </div>

          {/* Column 3: Ecosystem */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1 hover:text-cyan-500 cursor-pointer">
                <span>Unreal Engine</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center gap-1 hover:text-cyan-500 cursor-pointer">
                <span>Epic Online Services</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center gap-1 hover:text-cyan-500 cursor-pointer">
                <span>Support-A-Creator</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center gap-1 hover:text-cyan-500 cursor-pointer">
                <span>Publish on Epic</span>
                <ExternalLink className="w-3 h-3" />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Back to Top */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] opacity-75">
              © 2026 Epic Games, Inc. All rights reserved. Built to conversion architecture specifications.
            </span>
            <a href="#faq" className="hover:underline">Terms of Service</a>
            <a href="#faq" className="hover:underline">Privacy Policy</a>
            <a href="#faq" className="hover:underline">Store Refund Policy</a>
          </div>

          <button
            id="footer-back-to-top"
            onClick={scrollToTop}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            <span className="font-semibold text-xs">Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
