import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { BeamsBackground } from '../ui/beams-background';

interface FinalCTAProps {
  onStartAssessment: () => void;
  onConsultAdvisor: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onStartAssessment,
  onConsultAdvisor,
}) => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-[#0B1320] text-white py-20 md:py-24 overflow-hidden border-t border-slate-800">
      {/* Animated subtle beams background continuity */}
      <BeamsBackground
        intensity="subtle"
        colorVariant="teal"
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Subtle background ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal direction="up" delay={0}>
          <div className="inline-flex items-center px-3.5 py-1 bg-teal-500/10 text-teal-300 rounded-full text-xs font-semibold mb-6 border border-teal-400/30">
            Pure Protection Clarity
          </div>

          <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t.landing.finalHeading}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.landing.finalSubheading}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartAssessment}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {t.landing.finalCtaBtn}
            </button>

            <button
              type="button"
              onClick={onConsultAdvisor}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              {t.landing.finalSecondaryBtn}
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Free educational assessment · Takes 3 minutes · No personal data stored
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

