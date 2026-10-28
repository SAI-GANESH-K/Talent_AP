import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

interface ExplainableGuidanceProps {
  onStartAssessment: () => void;
}

export const ExplainableGuidance: React.FC<ExplainableGuidanceProps> = ({
  onStartAssessment,
}) => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50 py-20 md:py-28 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* LEFT: Context & 3 Core Pillars (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal direction="up" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/70 text-teal-800 rounded-full text-xs font-semibold mb-3 border border-teal-200">
                <span>🔍</span> Audited & Explainable
              </div>
              <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] tracking-tight">
                {t.landing.explainHeading}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {t.landing.explainDesc}
              </p>
            </ScrollReveal>

            {/* 3 Pillars List */}
            <div className="space-y-4 pt-2">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0 text-base">
                    1
                  </div>
                  <div>
                    <h4 className="font-[var(--font-heading)] font-bold text-slate-900 text-base">
                      {t.landing.explainPoint1Title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {t.landing.explainPoint1Desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 text-base">
                    2
                  </div>
                  <div>
                    <h4 className="font-[var(--font-heading)] font-bold text-slate-900 text-base">
                      {t.landing.explainPoint2Title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {t.landing.explainPoint2Desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 text-base">
                    3
                  </div>
                  <div>
                    <h4 className="font-[var(--font-heading)] font-bold text-slate-900 text-base">
                      {t.landing.explainPoint3Title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {t.landing.explainPoint3Desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Action CTA */}
            <ScrollReveal direction="up" delay={0.35} className="pt-2">
              <button
                type="button"
                onClick={onStartAssessment}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t.landing.explainCta}</span>
              </button>
            </ScrollReveal>
          </div>

          {/* RIGHT: Visual Formula Relationship Display (5 Cols) */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Net Needs Equation
                  </span>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold">
                    IRDAI Benchmark
                  </span>
                </div>

                {/* Equation Flow Visual */}
                <div className="space-y-4 my-6">
                  {/* Step A: Gross Obligations */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                      <span>Total Family Future Obligations</span>
                      <span className="text-slate-700 font-bold">100% Need</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-teal-500 w-[60%]" title="Living Expenses"></div>
                      <div className="h-full bg-amber-400 w-[25%]" title="Loans & Debts"></div>
                      <div className="h-full bg-emerald-400 w-[15%]" title="Milestones"></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Living Support (60%)</span>
                      <span>Debt (25%)</span>
                      <span>Goals (15%)</span>
                    </div>
                  </div>

                  {/* Minus Sign */}
                  <div className="flex justify-center -my-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200/90 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs">
                      −
                    </div>
                  </div>

                  {/* Step B: Existing Resources */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                      <span>Current Assets & Existing Insurance</span>
                      <span className="text-amber-800 font-bold">Deducted Fairly</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 w-[35%]"></div>
                    </div>
                  </div>

                  {/* Equals Sign */}
                  <div className="flex justify-center -my-2">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      =
                    </div>
                  </div>

                  {/* Step C: Recommended Cover Gap */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                        Recommended Life Cover
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                        Zero Underinsurance
                      </span>
                    </div>
                    <p className="text-xs text-teal-800/80 mt-2 leading-relaxed">
                      Your family is protected for the exact difference, ensuring no wasted premium and no coverage shortfall.
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    Transparent formulas · Auditable by certified actuaries
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};
