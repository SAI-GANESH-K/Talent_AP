import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

interface ValuePropositionProps {
  onStartAssessment?: () => void;
  onExplorePlans?: () => void;
  onConsultAdvisor?: () => void;
}

export const ValueProposition: React.FC<ValuePropositionProps> = ({
  onStartAssessment,
  onExplorePlans,
  onConsultAdvisor,
}) => {
  const { t } = useLanguage();

  const cards = [
    {
      id: 'understand-needs',
      title: t.landing.whyCard1Title,
      desc: t.landing.whyCard1Desc,
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      action: onStartAssessment,
    },
    {
      id: 'discover-plans',
      title: t.landing.whyCard2Title,
      desc: t.landing.whyCard2Desc,
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      action: onExplorePlans || onStartAssessment,
    },
    {
      id: 'speak-advisor',
      title: t.landing.whyCard3Title,
      desc: t.landing.whyCard3Desc,
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: onConsultAdvisor,
    },
  ];

  return (
    <section className="bg-[var(--color-offwhite)] py-20 md:py-28 border-b border-slate-200/70">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center px-4 py-1.5 bg-teal-50 text-teal-800 rounded-full text-xs font-bold mb-3 border border-teal-200/80 shadow-2xs">
              Why CoverWise?
            </div>
            <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] tracking-tight">
              {t.landing.whyHeading}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              {t.landing.whySubheading}
            </p>
          </ScrollReveal>
        </div>

        {/* Feature Cards Grid (Points 1, 2, 3 removed from inside boxes, interactive Learn More wired up) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <ScrollReveal
              key={card.id || idx}
              direction="up"
              delay={0.1 + idx * 0.12}
              className="h-full"
            >
              <div
                onClick={card.action}
                className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center transition-all group-hover:bg-teal-600 group-hover:text-white group-hover:scale-105 shadow-2xs">
                      {card.icon}
                    </div>
                  </div>

                  <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-navy-900)] mb-3 group-hover:text-teal-700 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.action) card.action();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:text-teal-800 transition-colors focus:outline-none focus:underline cursor-pointer"
                  >
                    <span>Learn more</span>
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="w-2 h-2 rounded-full bg-teal-500/20 group-hover:bg-teal-500 transition-colors" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
