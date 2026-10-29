import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CinematicFooter } from '../ui/motion-footer';
import type { User } from '../../api/client';

export type ViewMode =
  | 'landing'
  | 'wizard'
  | 'results'
  | 'recommendations'
  | 'advisors'
  | 'my-appointments'
  | 'advisor-portal'
  | 'admin-dashboard';

interface FooterProps {
  currentView?: ViewMode;
  currentUser: User | null;
  onNavigate: (view: ViewMode) => void;
  onStartAssessment: () => void;
  hasAssessmentResult: boolean;
}

type InfoModalType = 'how-it-works' | 'privacy' | 'disclaimer' | null;

export const Footer: React.FC<FooterProps> = ({
  currentView = 'landing',
  onNavigate,
  onStartAssessment,
}) => {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);

  const isLanding = currentView === 'landing';

  return (
    <>
      {/* 
        Requirement 1: 
        Cinematic Parallax Motion Footer is rendered ONLY on the main webpage ('landing').
        On remaining pages (wizard, results, recommendations, advisors, portals), 
        render a clean, compact, responsive fintech footer bar so all pages fit neatly.
      */}
      {isLanding ? (
        <CinematicFooter
          brandName="COVERWISE"
          heading={t.footer?.ctaHeading || "Ready to secure tomorrow?"}
          marqueeItems={[
            t.footer?.trustExpl || "Pure Life Protection",
            t.footer?.trustLangs || "Accessible in 5 Languages",
            t.footer?.trustPrivacy || "Zero Data Sold",
            "Human Life Value Guidance",
            "IRDAI Compliant Insights",
          ]}
          onStartAssessment={onStartAssessment}
          onConsultAdvisor={() => onNavigate('advisors')}
          onNavigateHome={() => onNavigate('landing')}
          onOpenPrivacy={() => setActiveModal('privacy')}
          onOpenTerms={() => setActiveModal('how-it-works')}
          onOpenDisclaimer={() => setActiveModal('disclaimer')}
        />
      ) : (
        <footer className="bg-[#0B1320] text-slate-400 py-6 sm:py-8 border-t border-slate-800 text-xs mt-auto w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Brand and Tagline */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-2 text-white hover:text-teal-300 transition-colors cursor-pointer focus:outline-none"
                >
                  <img src="/logo.png" alt="CoverWise Shield" className="w-6 h-6 object-contain" />
                  <span className="font-extrabold text-base tracking-tight font-[var(--font-heading)]">
                    Cover<span className="text-teal-400">Wise</span>
                  </span>
                </button>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  IRDAI Compliant Life Insurance Advisory Platform
                </span>
              </div>

              {/* Quick Navigation Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={onStartAssessment}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Assessment
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('advisors')}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Advisors
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('how-it-works')}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('disclaimer')}
                  className="text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Disclaimer
                </button>
              </div>

              {/* Copyright & Hackathon Info */}
              <div className="text-slate-500 text-[11px] text-center md:text-right">
                © 2026 CoverWise · Team We4
              </div>

            </div>
          </div>
        </footer>
      )}

      {/* Accessible Informational Dialog */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-[#111C2D] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-300 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
              <h3 id="info-modal-title" className="text-lg font-bold text-white font-[var(--font-heading)]">
                {activeModal === 'how-it-works' && t.footer.howItWorksTitle}
                {activeModal === 'privacy' && t.footer.privacyTitle}
                {activeModal === 'disclaimer' && t.footer.disclaimerModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {activeModal === 'how-it-works' && (
                <>
                  <p className="text-slate-400">{t.footer.howItWorksDesc}</p>
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <h4 className="font-semibold text-teal-300 text-xs uppercase tracking-wider mb-1">
                        {t.footer.step1Title}
                      </h4>
                      <p className="text-slate-400 text-xs">{t.footer.step1Desc}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <h4 className="font-semibold text-teal-300 text-xs uppercase tracking-wider mb-1">
                        {t.footer.step2Title}
                      </h4>
                      <p className="text-slate-400 text-xs">{t.footer.step2Desc}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <h4 className="font-semibold text-teal-300 text-xs uppercase tracking-wider mb-1">
                        {t.footer.step3Title}
                      </h4>
                      <p className="text-slate-400 text-xs">{t.footer.step3Desc}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <h4 className="font-semibold text-teal-300 text-xs uppercase tracking-wider mb-1">
                        {t.footer.step4Title}
                      </h4>
                      <p className="text-slate-400 text-xs">{t.footer.step4Desc}</p>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p className="text-slate-400">{t.footer.privacyDesc}</p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-teal-400 font-bold shrink-0">✓</span>
                      <span className="text-xs text-slate-300">{t.footer.privacyPoint1}</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-teal-400 font-bold shrink-0">✓</span>
                      <span className="text-xs text-slate-300">{t.footer.privacyPoint2}</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-teal-400 font-bold shrink-0">✓</span>
                      <span className="text-xs text-slate-300">{t.footer.privacyPoint3}</span>
                    </li>
                  </ul>
                </>
              )}

              {activeModal === 'disclaimer' && (
                <>
                  <p className="text-slate-400">{t.footer.disclaimerModalDesc}</p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-amber-400 font-bold shrink-0">ℹ</span>
                      <span className="text-xs text-slate-300">{t.footer.disclaimerPoint1}</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-amber-400 font-bold shrink-0">ℹ</span>
                      <span className="text-xs text-slate-300">{t.footer.disclaimerPoint2}</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                      <span className="text-amber-400 font-bold shrink-0">ℹ</span>
                      <span className="text-xs text-slate-300">{t.footer.disclaimerPoint3}</span>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                {t.footer.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
