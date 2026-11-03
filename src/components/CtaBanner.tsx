import React from 'react';
import { 
  Download, 
  Gift, 
  ShieldCheck, 
  Sparkles, 
  Monitor, 
  Apple, 
  ArrowRight,
  RotateCcw,
  Calendar
} from 'lucide-react';

interface CtaBannerProps {
  darkMode: boolean;
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
  onOpenScheduler?: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  darkMode,
  onPrimaryCta,
  onSecondaryCta,
  onOpenScheduler,
}) => {
  return (
    <section 
      id="cta-section"
      className="relative py-16 md:py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-8 sm:p-12 md:p-16 text-white text-center shadow-2xl relative overflow-hidden border border-blue-500/30">
          {/* Ambient Lighting elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-200 border border-white/20 backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Access • 100% Free Account Setup</span>
          </div>

          {/* Big Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Stop Paying Full Price. Start Stacking Rewards.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl mx-auto font-normal">
            Download the Epic Games Launcher today to claim this week’s 100% free game and access exclusive seasonal sales up to 75% off.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* PRD SPEC: Primary CTA button with action-oriented text */}
            <button
              id="cta-primary-download-btn"
              onClick={onPrimaryCta}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 shadow-xl shadow-cyan-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2.5"
            >
              <Download className="w-5 h-5" />
              <span>Download Epic Games Launcher</span>
            </button>

            {/* PRD SPEC: Secondary CTA */}
            <button
              id="cta-secondary-free-btn"
              onClick={onSecondaryCta}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5 text-emerald-300" />
              <span>Browse Free Games Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Agendar Reunião CTA */}
            {onOpenScheduler && (
              <button
                id="cta-schedule-meeting-btn"
                onClick={onOpenScheduler}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Agendar Demonstração</span>
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>14-Day Self-Service Refund Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-300" />
              <span>5% Epic Rewards On Every Purchase</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-300" />
              <span>Windows 10/11 & macOS Compatible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
