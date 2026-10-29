import React from 'react';
import { ScrollReveal } from '../ui/ScrollReveal';

interface ExplainableGuidanceProps {
  onStartAssessment: () => void;
  onConsultAdvisor?: () => void;
}

export const ExplainableGuidance: React.FC<ExplainableGuidanceProps> = ({
  onStartAssessment,
  onConsultAdvisor,
}) => {

  const keyFeatures = [
    {
      title: 'Dual-Engine Actuarial Math',
      subtitle: 'HLV + Net Needs Combined',
      desc: 'Simultaneous calculation of your Human Life Value (future earning potential) and Net Needs (debt, living expenses, children education) ensures you are never underinsured.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      highlight: 'Zero Underinsurance',
    },
    {
      title: '100% Commission-Free',
      subtitle: 'Pure Unbiased Matching',
      desc: 'We never take sales commissions from insurance companies. Policies are ranked solely by actuarial suitability, solvency ratio, and customer affordability.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      highlight: 'Zero Sales Pressure',
    },
    {
      title: 'Accessible in 5 Languages',
      subtitle: 'Native Regional Support',
      desc: 'Financial security made crystal clear in English, Telugu (తెలుగు), Hindi (हिंदी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ) without intimidating legal jargon.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      highlight: 'Multilingual Clarity',
    },
    {
      title: 'Fee-Only Certified Advisors',
      subtitle: '1-on-1 Video Consultations',
      desc: 'Schedule dedicated consultations with IRDAI-registered fiduciaries who review your protection plan without pushing sales or receiving referral fees.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      highlight: 'Direct Booking',
    },
    {
      title: 'Real-Time Policy Customizer',
      subtitle: 'Interactive Rider Modeler',
      desc: 'Simulate critical illness, accidental disability, and waiver of premium add-ons with immediate recalculation of your annual premium and net safety net.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      highlight: 'Full Control',
    },
    {
      title: 'Zero Spam Guarantee',
      subtitle: 'Bank-Grade Confidentiality',
      desc: 'Your contact details and financial inputs are strictly private. We never share or sell your phone number to insurance telemarketers or call centers.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      highlight: '100% Confidential',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50 py-20 md:py-28 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center px-4 py-1.5 bg-teal-50 text-teal-800 rounded-full text-xs font-bold mb-3 border border-teal-200/80 shadow-2xs">
              CoverWise Advantage
            </div>
            <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--color-navy-900)] tracking-tight">
              Life Insurance Protection,{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Engineered for Real Families
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Everything you need to safeguard your family’s financial future without deceptive sales tactics, complex equations, or unwanted sales calls.
            </p>
          </ScrollReveal>
        </div>

        {/* 6 Core Modern Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {keyFeatures.map((item, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={0.08 + idx * 0.08}
              className="h-full"
            >
              <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1">
                <div>
                  {/* Top Bar: Icon & Pill Highlight */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center transition-all group-hover:bg-teal-600 group-hover:text-white group-hover:scale-105 shadow-2xs">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                      {item.highlight}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-[var(--font-heading)] text-lg sm:text-xl font-bold text-[var(--color-navy-900)] mb-1 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-teal-600 mb-3">
                    {item.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtle indicator bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[11px]">Feature {idx + 1} of 6</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500/30 group-hover:bg-teal-600 transition-colors" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Feature Action Banner */}
        <ScrollReveal direction="up" delay={0.4} className="mt-14">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--color-navy-900)] via-[#132238] to-[var(--color-navy-900)] text-white p-8 sm:p-10 shadow-xl border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-3 py-1 rounded-md border border-teal-800/50">
                100% Free · No Obligations
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white mt-3 tracking-tight">
                Calculate your exact family cover amount in just 3 minutes.
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Objective actuarial formulas ensure zero underinsurance and zero wasted premium.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={onStartAssessment}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-7 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Start Free Assessment →
              </button>
              {onConsultAdvisor && (
                <button
                  type="button"
                  onClick={onConsultAdvisor}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3.5 rounded-xl text-sm font-semibold transition cursor-pointer text-center"
                >
                  Book an Advisor
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
