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
    <header className="relative bg-gradient-to-b from-[#0B1320] via-[#0F172A] to-[#131F33] text-white pt-16 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Animated Luminous Gradient Beams Background */}
      <BeamsBackground
        intensity="subtle"
        colorVariant="mixed"
        className="absolute inset-0 z-0 pointer-events-none"
      />

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
          <div className="lg:col-span-7 text-left space-y-6 md:space-y-8">
            
            {/* Main Headline */}
            <motion.h1
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

          {/* RIGHT SIDE: Catchy Welcome & Financial Protection Showcase (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl bg-gradient-to-b from-[#142337] via-[#101C2C] to-[#0B1320] border border-teal-500/25 p-7 sm:p-8 shadow-2xl shadow-teal-950/50 backdrop-blur-md overflow-hidden"
            >
              {/* Subtle Ambient Radial Highlight */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Showcase Header: Brand Shield & Welcome Message */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 via-teal-600/10 to-transparent border border-teal-400/30 flex items-center justify-center p-2 shadow-lg shadow-teal-950/40 shrink-0">
                  <img
                    src="/logo.png"
                    alt="CoverWise Shield"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-teal-300">
                    Welcome to CoverWise
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
                    Protection Decided by Math, Not Agents.
                  </h3>
                </div>
              </div>

              {/* Key Value Propositions */}
              <div className="my-6 space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/40 transition-colors">
                  <div className="font-bold text-white tracking-tight flex items-center justify-between">
                    <span>Pure Protection First</span>
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/40">Zero Cross-Selling</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    We eliminate expensive ULIPs and opaque endowment plans. You receive honest, pure term insurance recommendations.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/40 transition-colors">
                  <div className="font-bold text-white tracking-tight flex items-center justify-between">
                    <span>Dual-Engine Actuarial Math</span>
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/40">HLV + Net Needs</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Simultaneous evaluation of your human life value and net debt/family obligations ensures zero risk of underinsurance.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/40 transition-colors">
                  <div className="font-bold text-white tracking-tight flex items-center justify-between">
                    <span>Fee-Only Verified Advisors</span>
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/40">5 Languages</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Book one-on-one video consultations with certified advisors fluent in your native language without any sales pressure.
                  </p>
                </div>
              </div>

              {/* Bottom Trust Action Strip */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">Free Actuarial Check · 3 Minutes</span>
                </div>
                <button
                  type="button"
                  onClick={onStartAssessment}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Start Now</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </header>
  );
};
