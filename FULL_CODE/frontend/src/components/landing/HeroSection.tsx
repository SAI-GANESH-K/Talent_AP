import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';
import { BeamsBackground } from '../ui/beams-background';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onConsultAdvisor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAssessment,
  onConsultAdvisor,
}) => {
  const { t } = useLanguage();

  return (
    <header className="relative w-full overflow-hidden border-b border-slate-800/80">
      <BeamsBackground intensity="medium" className="bg-[#070D18] py-16 sm:py-24 md:py-28">
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
          
          {/* Subtle Institutional Brand Pill */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 backdrop-blur-md mb-6 shadow-lg shadow-teal-950/30"
          >
            <img src="/logo.png" alt="CoverWise" className="w-5 h-5 object-contain" />
            <span className="text-xs font-bold text-teal-300 tracking-wide">
              Objective Actuarial Models · Zero Commission Bias
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="font-[var(--font-heading)] text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.12] text-white max-w-4xl"
          >
            {t.landing.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              {t.landing.heroTitle2}
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mt-6"
          >
            {t.landing.heroDesc}
          </motion.p>

          {/* Primary & Secondary Action CTAs */}
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={onStartAssessment}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-9 py-4 rounded-2xl text-base font-extrabold shadow-xl shadow-teal-500/25 transition-all duration-200 hover:shadow-teal-500/40 hover:-translate-y-0.5 cursor-pointer text-center flex items-center justify-center gap-2 group"
            >
              <span>{t.landing.ctaFindCover}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              type="button"
              onClick={onConsultAdvisor}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/35 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 backdrop-blur-sm cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>{t.landing.ctaTalkAdvisor}</span>
              <svg className="w-4 h-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>

          {/* Reassurance Micro-copy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2.5 text-xs sm:text-sm text-slate-400 mt-6"
          >
            <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{t.landing.reassurance}</span>
          </motion.div>

        </div>
      </BeamsBackground>
    </header>
  );
};
