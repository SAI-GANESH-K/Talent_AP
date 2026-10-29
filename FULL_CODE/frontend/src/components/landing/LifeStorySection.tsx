import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LIFE_STORY_CONTENT } from '../../i18n/educationContent';
import { ScrollReveal } from '../ui/ScrollReveal';
import { LifeInsuranceStory } from '../education/LifeInsuranceStory';

interface LifeStorySectionProps {
  onStartAssessment: () => void;
}

export const LifeStorySection: React.FC<LifeStorySectionProps> = ({ onStartAssessment }) => {
  const { language } = useLanguage();
  const content = LIFE_STORY_CONTENT[language] || LIFE_STORY_CONTENT.en;
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-b from-[#0F172A] to-[var(--color-offwhite)] py-12 sm:py-16 border-b border-slate-200/60 relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="rounded-3xl bg-gradient-to-r from-[#111E31] via-[#162942] to-[#111E31] border border-teal-500/30 p-7 sm:p-10 shadow-2xl shadow-teal-950/40 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Subtle Ambient Radial Highlight */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Left Column: Heading & Description */}
              <div className="text-left max-w-2xl relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-500/15 border border-teal-400/30 rounded-full text-xs font-bold text-teal-300">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>{content.sectionTag}</span>
                </div>

                <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  {content.sectionHeading}
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                  {content.sectionSubheading}
                </p>
              </div>

              {/* Right Column: Interactive Story Trigger Button */}
              <div className="shrink-0 relative z-10 flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsStoryOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/25 transition-all duration-200 hover:shadow-teal-500/40 hover:-translate-y-0.5 cursor-pointer text-center group"
                >
                  {/* Play / Story Icon */}
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span>{content.openStoryBtn}</span>
                </button>

                <div className="text-[11px] text-slate-400 text-center sm:text-right">
                  Interactive 4-Scene Story · Available in 5 Languages
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Interactive Modal Component */}
      <LifeInsuranceStory
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onStartAssessment={onStartAssessment}
      />
    </>
  );
};

