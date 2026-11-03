import React, { useState } from 'react';
import { 
  Target, 
  Gift, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Quote, 
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { USER_PERSONAS } from '../data/landingData';
import { UserPersona } from '../types';

interface TargetAudienceSectionProps {
  darkMode: boolean;
  onSelectPersonaAction: (persona: UserPersona) => void;
}

export const TargetAudienceSection: React.FC<TargetAudienceSectionProps> = ({
  darkMode,
  onSelectPersonaAction,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(USER_PERSONAS[0].id);

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="w-6 h-6" />;
      case 'Gift':
        return <Gift className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <section 
      id="personas"
      className={`py-16 md:py-24 border-t transition-colors ${
        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/60 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Target Audience Alignment</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Tailored for Every Type of Player
          </h2>
          <p className={`mt-3 text-base sm:text-lg ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Whether you are hunting massive seasonal price drops, building a zero-cost library, or securing competitive launch advantages.
          </p>
        </div>

        {/* Persona Cards Grid (3 Persona Profiles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {USER_PERSONAS.map((persona) => {
            const isHighlighted = persona.id === selectedPersonaId;
            return (
              <div
                key={persona.id}
                id={`persona-card-${persona.id}`}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  isHighlighted
                    ? darkMode
                      ? 'bg-slate-900 border-cyan-500/80 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-white border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : darkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Persona Identity Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`p-3 rounded-xl border ${persona.avatarBg}`}>
                      {getPersonaIcon(persona.avatarIcon)}
                    </div>
                    <span 
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase"
                      style={{ 
                        backgroundColor: `${persona.accentColor}15`,
                        color: persona.accentColor,
                        border: `1px solid ${persona.accentColor}30`
                      }}
                    >
                      {persona.title}
                    </span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-black ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {persona.role}
                  </h3>

                  {/* Persona Quote */}
                  <div className={`mt-3 p-3 rounded-xl border italic text-xs leading-relaxed flex items-start gap-2 ${
                    darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <Quote className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5 opacity-70" />
                    <span>{persona.quote}</span>
                  </div>

                  {/* Contrast Box: Key Frustration vs Desired Outcome */}
                  <div className="mt-5 space-y-3 text-xs">
                    {/* Key Frustration */}
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                      <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Key Frustration</span>
                      </div>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {persona.keyFrustration}
                      </p>
                    </div>

                    {/* Desired Outcome */}
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Desired Outcome</span>
                      </div>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {persona.desiredOutcome}
                      </p>
                    </div>
                  </div>

                  {/* Preferred Perks Checklist */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Core Value Drivers:
                    </span>
                    <ul className="space-y-1.5 text-xs">
                      {persona.idealPerks.map((perk, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                            {perk}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Conversion Trigger Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/40">
                  <button
                    id={`persona-cta-${persona.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPersonaAction(persona);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:brightness-110'
                        : darkMode
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <span>View Deals for This Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
