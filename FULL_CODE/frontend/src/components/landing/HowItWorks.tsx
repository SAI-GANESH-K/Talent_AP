import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      num: t.landing.step1Num || '01',
      title: t.landing.step1Title,
      desc: t.landing.step1Desc,
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      num: t.landing.step2Num || '02',
      title: t.landing.step2Title,
      desc: t.landing.step2Desc,
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      num: t.landing.step3Num || '03',
      title: t.landing.step3Title,
      desc: t.landing.step3Desc,
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      num: t.landing.step4Num || '04',
      title: t.landing.step4Title,
      desc: t.landing.step4Desc,
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white pt-16 md:pt-20 pb-8 sm:pb-10 border-b border-slate-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center px-3.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold mb-3 border border-teal-200/60">
              How It Works
            </div>
            <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] tracking-tight">
              {t.landing.howHeading}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              {t.landing.howSubheading}
            </p>
          </ScrollReveal>
        </div>

        {/* 4-Stage Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Subtle connecting connector line across desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-teal-200 via-teal-300 to-teal-200 z-0"
          />

          {steps.map((step, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={0.1 + idx * 0.12}
              className="relative z-10 flex flex-col h-full"
            >
              <div className="bg-[var(--color-offwhite)] rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group">
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-teal-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                      {step.icon}
                    </div>
                    <span className="font-[var(--font-heading)] font-black text-2xl text-teal-600/40 group-hover:text-teal-600 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-[var(--font-heading)] text-lg font-bold text-[var(--color-navy-900)] mb-2 group-hover:text-teal-800 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-teal-600 transition-colors">
                  <span>Stage {idx + 1} of 4</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

