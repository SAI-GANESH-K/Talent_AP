import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';

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
    <header className="relative bg-gradient-to-b from-[#0B1320] via-[#0F172A] to-[#131F33] text-white pt-16 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Subtle ambient teal & navy glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-teal-500/10 blur-[120px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-40 w-[450px] h-[450px] bg-teal-600/5 blur-[100px] rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Value message & Action CTAs (7 Cols) */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* 5-Language Feature Pill — Prominently Highlighted */}
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-transparent border border-teal-400/30 rounded-full text-xs backdrop-blur-md shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/25 text-teal-200 font-bold text-[11px] border border-teal-300/30 tracking-wide">
                🌐 {(t.landing as any).heroBadgeBadge || '5 Languages'}
              </span>
              <span className="text-slate-200 font-medium text-xs">
                {(t.landing as any).heroBadgeText || 'Accessible in English, Telugu, Hindi, Tamil & Kannada'}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-[var(--font-heading)] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]"
            >
              {t.landing.heroTitle1}{' '}
              <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {t.landing.heroTitle2}
              </span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl"
            >
              {t.landing.heroDesc}
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.55, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                type="button"
                onClick={onStartAssessment}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-7 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-teal-500/40 hover:-translate-y-0.5 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>{t.landing.ctaFindCover}</span>
              </button>

              <button
                type="button"
                onClick={onConsultAdvisor}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/35 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 backdrop-blur-sm cursor-pointer text-center flex items-center justify-center gap-2"
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
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center gap-2 text-xs text-slate-400 pt-1"
            >
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t.landing.reassurance}</span>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Premium Illustrative Dashboard Preview (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl bg-gradient-to-b from-[#152336] to-[#0E1724] border border-slate-700/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-md"
            >
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                    {t.landing.previewProtectionOverview}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  HLV + Net Needs
                </span>
              </div>

              {/* Central Protection Metric Card */}
              <div className="my-5 p-4 rounded-2xl bg-[#1B2B40]/70 border border-teal-500/20">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {t.landing.previewIllustrativeEstimate}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight flex items-baseline gap-2">
                  <span className="text-teal-300">₹1,90,00,000</span>
                  <span className="text-xs font-normal text-slate-400">(₹1.90 Cr)</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-teal-300 font-medium">
                  <svg className="w-3.5 h-3.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t.landing.previewRecommendedStatus}</span>
                </div>
              </div>

              {/* Itemized 3-Pillar Breakdown Preview */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    {t.landing.previewLivingSupport}
                  </span>
                  <span className="font-semibold text-slate-200">₹1.42 Cr</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {t.landing.previewDebtPayoff}
                  </span>
                  <span className="font-semibold text-slate-200">₹35.00 L</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {t.landing.previewMilestoneGoals}
                  </span>
                  <span className="font-semibold text-slate-200">₹28.21 L</span>
                </div>
              </div>

              {/* Floating Bottom Badge */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Objective Actuarial Models
                </span>
                <span className="text-teal-400 font-semibold cursor-pointer hover:underline" onClick={onStartAssessment}>
                  {t.landing.ctaFindCover}
                </span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </header>
  );
};
