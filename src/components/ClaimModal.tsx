import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  ArrowRight,
  Gift
} from 'lucide-react';

export interface ModalPayload {
  type: 'download' | 'claim_free' | 'buy_deal' | 'persona_redirect' | 'bundle';
  title: string;
  subtitle?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  perks?: string[];
  ecosystemItem?: string;
}

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ModalPayload | null;
  darkMode: boolean;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  payload,
  darkMode,
}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDownloadProgress(0);
      setIsCompleted(false);

      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCompleted(true);
            return 100;
          }
          return prev + 25;
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

  return (
    <div 
      id="action-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="action-modal-card"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
          darkMode 
            ? 'bg-slate-900 border-slate-700 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors ${
            darkMode 
              ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
              : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
            {payload.type === 'download' 
              ? 'Launcher Installer' 
              : payload.type === 'claim_free' 
                ? 'Vault Activation' 
                : 'Offer Stacking Checkout'}
          </span>
        </div>

        {/* Modal Title */}
        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
          {payload.title}
        </h3>
        {payload.subtitle && (
          <p className={`text-xs sm:text-sm mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {payload.subtitle}
          </p>
        )}

        {/* Price & Savings Anchor */}
        {payload.price !== undefined && (
          <div className={`mt-4 p-4 rounded-2xl border flex items-center justify-between ${
            darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total Due Today:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {payload.price === 0 ? 'FREE' : `$${payload.price.toFixed(2)}`}
                </span>
                {payload.originalPrice && payload.originalPrice > payload.price && (
                  <span className="text-xs line-through text-slate-400 font-semibold">
                    ${payload.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {payload.discountPercent && payload.discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500 text-slate-950">
                SAVE {payload.discountPercent}%
              </span>
            )}
          </div>
        )}

        {/* Ecosystem Bonus Stacked */}
        {payload.ecosystemItem && (
          <div className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <strong className="text-purple-300 font-bold">Stacked Bonus: </strong>
              <span className="text-slate-200">{payload.ecosystemItem}</span>
            </div>
          </div>
        )}

        {/* Simulated Download / Activation Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ready to Launch & Play</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>Preparing Installer & License...</span>
                </>
              )}
            </span>
            <span className="font-mono font-bold text-cyan-400">{downloadProgress}%</span>
          </div>
          
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>

        {/* Perks Checklist */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Permanently added to your Epic Games Account</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Coins className="w-4 h-4 shrink-0" />
            <span>5% Epic Rewards credited automatically</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>14-day hassle-free refund window guaranteed</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            id="modal-confirm-btn"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>{isCompleted ? 'Open Library & Play' : 'Continue to Store'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
