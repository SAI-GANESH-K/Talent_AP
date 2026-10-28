import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
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
  currentUser: User | null;
  onNavigate: (view: ViewMode) => void;
  onStartAssessment: () => void;
  hasAssessmentResult: boolean;
}

type InfoModalType = 'how-it-works' | 'privacy' | 'disclaimer' | null;

export const Footer: React.FC<FooterProps> = ({
  currentUser,
  onNavigate,
  onStartAssessment,
  hasAssessmentResult,
}) => {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);

  const isCustomerOrGuest = !currentUser || currentUser.role === 'customer';

  return (
    <>
      <footer
        role="contentinfo"
        aria-label="Site Footer"
        className="relative bg-[#0B1320] text-slate-300 border-t border-slate-800/80 pt-16 pb-12 mt-20 overflow-hidden"
      >
        {/* Subtle, restrained teal ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-teal-500/10 blur-[110px] rounded-full"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content Grid: 12-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">
            {/* SECTION A: Brand Area (5 Cols on Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Brand Logo - Clean Text-only Wordmark */}
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl"
                aria-label="CoverWise Home"
              >
                <span className="font-[var(--font-heading)] font-extrabold text-2xl text-white tracking-tight group-hover:text-teal-300 transition-colors">
                  Cover<span className="text-teal-400">Wise</span>
                </span>
              </button>

              {/* Tagline */}
              <p className="text-teal-300 font-medium text-sm tracking-tight">
                {t.footer.tagline}
              </p>

              {/* Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                {t.footer.description}
              </p>

              {/* Trust Indicators: Subtle Understated Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
                  <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t.footer.trustExpl}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
                  <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{t.footer.trustLangs}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
                  <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{t.footer.trustPrivacy}</span>
                </div>
              </div>
            </div>

            {/* SECTION B: Simple Navigation (3 Cols on Desktop: 2 Sub-columns) */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-6 sm:gap-8">
              {/* Explore Links */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {t.footer.navExplore}
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('landing')}
                      className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                    >
                      {t.footer.navHome}
                    </button>
                  </li>
                  {isCustomerOrGuest && (
                    <li>
                      <button
                        type="button"
                        onClick={onStartAssessment}
                        className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                      >
                        {t.footer.navFindCover}
                      </button>
                    </li>
                  )}
                  {hasAssessmentResult && isCustomerOrGuest && (
                    <li>
                      <button
                        type="button"
                        onClick={() => onNavigate('recommendations')}
                        className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                      >
                        {t.footer.navExplorePlans}
                      </button>
                    </li>
                  )}
                  {isCustomerOrGuest && (
                    <li>
                      <button
                        type="button"
                        onClick={() => onNavigate('advisors')}
                        className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                      >
                        {t.footer.navFindAdvisor}
                      </button>
                    </li>
                  )}
                  {currentUser?.role === 'advisor' && (
                    <li>
                      <button
                        type="button"
                        onClick={() => onNavigate('advisor-portal')}
                        className="text-teal-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                      >
                        {t.footer.navAdvisorDashboard}
                      </button>
                    </li>
                  )}
                  {currentUser?.role === 'admin' && (
                    <li>
                      <button
                        type="button"
                        onClick={() => onNavigate('admin-dashboard')}
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-150 cursor-pointer font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                      >
                        {t.footer.navAdminDashboard}
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Information / Support Links */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {t.footer.navInformation}
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveModal('how-it-works')}
                      className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                    >
                      {t.footer.navHowItWorks}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveModal('privacy')}
                      className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                    >
                      {t.footer.navPrivacy}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveModal('disclaimer')}
                      className="text-slate-400 hover:text-teal-300 transition-colors duration-150 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
                    >
                      {t.footer.navDisclaimer}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* SECTION C: Tasteful Call To Action Panel (4 Cols on Desktop) */}
            <div className="lg:col-span-4">
              {isCustomerOrGuest ? (
                <div className="bg-[#152336] border border-slate-700/60 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-colors duration-200">
                  {/* Subtle interior glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">
                    {t.footer.ctaHeading}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 mb-4 leading-relaxed">
                    {t.footer.ctaSubtext}
                  </p>
                  <button
                    type="button"
                    onClick={onStartAssessment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-teal-900/20 hover:shadow-teal-500/20 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    <span>{t.footer.ctaButton}</span>
                    <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="bg-[#152336] border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                      {currentUser?.role === 'advisor' ? 'Certified Advisor Session' : 'Platform Administration'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentUser?.role === 'advisor'
                      ? 'Access your consultation portal to review client estimates and shared records.'
                      : 'Platform telemetry and booking administration active.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate(currentUser?.role === 'advisor' ? 'advisor-portal' : 'admin-dashboard')}
                    className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors cursor-pointer"
                  >
                    <span>{currentUser?.role === 'advisor' ? t.footer.navAdvisorDashboard : t.footer.navAdminDashboard}</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION D: Professional Bottom Bar */}
          <div className="border-t border-slate-800/80 pt-8 mt-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium tracking-tight">
                {t.footer.copyright}
              </span>
              <span className="text-slate-500 text-[11px]">
                {t.footer.prototypeBadge}
              </span>
            </div>

            {/* Concise Disclaimer */}
            <p className="text-slate-400 text-[11px] leading-relaxed text-center sm:text-left max-w-3xl">
              {t.footer.disclaimerNote}
            </p>
          </div>
        </div>
      </footer>

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

