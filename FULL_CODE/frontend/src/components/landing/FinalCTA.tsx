import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

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
    <section className="relative bg-[#070D18] text-white pt-6 sm:pt-8 pb-12 sm:pb-16 overflow-hidden">
      {/* Sleek CSS ambient radial glow — pure zero-gap performance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(20,184,166,0.12),rgba(7,13,24,0))]"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal direction="up" delay={0} distance={12} viewportMargin="0px">
          <div className="inline-flex items-center px-3.5 py-1 bg-teal-500/10 text-teal-300 rounded-full text-xs font-semibold mb-3.5 border border-teal-400/30">
            Pure Protection Clarity
          </div>

          <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t.landing.finalHeading}
          </h2>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.landing.finalSubheading}
          </p>

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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

          <p className="mt-5 sm:mt-6 text-xs text-slate-400">
            Free educational assessment · Takes 3 minutes · No personal data stored
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
