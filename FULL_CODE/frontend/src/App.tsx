import { useState, useEffect } from 'react';
import {
  api,
  type AssessmentRequest,
  type AssessmentResponse,
  type SelectedPlan,
  type User,
} from './api/client';
import { useLanguage } from './i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, type LanguageOption } from './i18n/translations';
import { AssessmentWizard } from './components/assessment/AssessmentWizard';
import { AssessmentResults } from './components/assessment/AssessmentResults';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { AdvisorDirectory } from './components/advisory/AdvisorDirectory';
import { MyAppointments } from './components/advisory/MyAppointments';
import { AdvisorPortal } from './components/advisor/AdvisorPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';

type ViewMode =
  | 'landing'
  | 'wizard'
  | 'results'
  | 'recommendations'
  | 'advisors'
  | 'my-appointments'
  | 'advisor-portal'
  | 'admin-dashboard';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [view, setView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPostLoginAction, setPendingPostLoginAction] = useState<ViewMode | null>(null);

  // Assessment & Plan Selection state — preserved across language and view transitions
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResponse | null>(null);
  const [lastAssessmentRequest, setLastAssessmentRequest] = useState<AssessmentRequest | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);

  // Set document lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Check health and active session on mount with role recovery
  useEffect(() => {
    api.health().catch((err) => console.warn('Health check:', err));

    api.auth.me()
      .then((res) => {
        setCurrentUser(res.user);
        if (res.user.role === 'advisor') {
          setView('advisor-portal');
        } else if (res.user.role === 'admin') {
          setView('admin-dashboard');
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  const handleStartAssessment = () => {
    setAssessmentError(null);
    setView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWizardSubmit = async (request: AssessmentRequest) => {
    setIsLoadingEstimate(true);
    setAssessmentError(null);
    setLastAssessmentRequest(request);
    try {
      const response = await api.estimate(request);
      setAssessmentResult(response);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setAssessmentError(err.message || 'Failed to calculate coverage estimate. Please verify backend is running.');
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const handleRecalculate = () => {
    setView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnHome = () => {
    if (currentUser?.role === 'advisor') {
      setView('advisor-portal');
    } else if (currentUser?.role === 'admin') {
      setView('admin-dashboard');
    } else {
      setView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setSelectedPlan(null);
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAppropriateDashboard = (user: User) => {
    if (user.role === 'admin') {
      setView('admin-dashboard');
    } else if (user.role === 'advisor') {
      setView('advisor-portal');
    } else {
      if (view === 'advisor-portal' || view === 'admin-dashboard') {
        setView('landing');
      }
    }
  };

  // Determine effective view enforcing strict role guards
  const effectiveView: ViewMode = (() => {
    if (currentUser?.role === 'advisor') {
      return 'advisor-portal';
    }
    if (currentUser?.role === 'admin') {
      return 'admin-dashboard';
    }
    if (view === 'advisor-portal' || view === 'admin-dashboard') {
      return 'landing';
    }
    return view;
  })();

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex flex-col justify-between">
      {/* Navigation Bar */}
      <nav className="bg-[var(--color-navy-900)] text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <button
              type="button"
              onClick={handleReturnHome}
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-teal-500)] to-[var(--color-teal-600)] flex items-center justify-center font-bold text-sm shadow-sm text-white">
                CW
              </div>
              <div>
                <span className="font-[var(--font-heading)] font-bold text-xl tracking-tight text-white block">
                  CoverWise
                </span>
              </div>
            </button>

            {/* Role-Specific Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-xs">
              {/* Case A: Guest / Customer Navigation */}
              {(!currentUser || currentUser.role === 'customer') && (
                <>
                  <button
                    type="button"
                    onClick={handleReturnHome}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      effectiveView === 'landing' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.nav.home}
                  </button>

                  <button
                    type="button"
                    onClick={handleStartAssessment}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      effectiveView === 'wizard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.nav.findCover}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setView('advisors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      effectiveView === 'advisors' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.nav.advisors}
                  </button>

                  {currentUser?.role === 'customer' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('my-appointments');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        effectiveView === 'my-appointments'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.nav.myAppointments}
                    </button>
                  )}
                </>
              )}

              {/* Case B: Financial Advisor Navigation */}
              {currentUser?.role === 'advisor' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('advisor-portal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    effectiveView === 'advisor-portal'
                      ? 'bg-white/10 text-teal-300'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🩺 {t.nav.advisorPortal}
                </button>
              )}

              {/* Case C: Administrator Navigation */}
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('admin-dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    effectiveView === 'admin-dashboard'
                      ? 'bg-white/10 text-purple-300'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🛡️ {(t.nav as any).adminDashboard || 'Admin Dashboard'}
                </button>
              )}
            </div>

            {/* Language Switcher & Auth Section */}
            <div className="flex items-center gap-3 text-xs">
              {/* Central 5-Language Switcher */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  aria-label="Select Interface Language"
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l: LanguageOption) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeLabel} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Authentication Status */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => navigateToAppropriateDashboard(currentUser)}
                    className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-medium text-slate-200 hidden sm:inline">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-teal-400 uppercase font-semibold">
                      ({currentUser.role})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-3.5 py-1.5 rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  {t.nav.login} / {t.nav.register}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* LANDING PAGE VIEW */}
        {effectiveView === 'landing' && (
          <div>
            {/* Hero Section */}
            <header className="bg-gradient-to-b from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-teal-500/15 border border-teal-400/40 rounded-full text-xs font-medium text-teal-300 backdrop-blur-md mb-8 shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                  </span>
                  <span className="text-white font-semibold">Available in 5 Languages:</span>
                  <span className="text-teal-200 font-medium">English • తెలుగు • हिन्दी • தமிழ் • ಕನ್ನಡ</span>
                </div>
                <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.landing.heroTitle1}{' '}
                  <span className="text-[var(--color-teal-400)]">{t.landing.heroTitle2}</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {t.landing.heroDesc}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleStartAssessment}
                    className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {t.landing.ctaFindCover}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('advisors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-semibold transition cursor-pointer backdrop-blur-sm"
                  >
                    {t.nav.advisors} →
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  {t.landing.ctaSubtext}
                </p>
              </div>
            </header>

            {/* Core Value Pillars Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-xl font-bold mb-5 border border-teal-100">
                    📐
                  </div>
                  <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-navy-900)] mb-3">
                    {t.landing.card1Title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.landing.card1Desc}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-xl font-bold mb-5 border border-teal-100">
                    🤝
                  </div>
                  <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-navy-900)] mb-3">
                    {t.landing.card2Title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.landing.card2Desc}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-xl font-bold mb-5 border border-teal-100">
                    🔍
                  </div>
                  <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-navy-900)] mb-3">
                    {t.landing.card3Title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.landing.card3Desc}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STAGE 1: ASSESSMENT WIZARD VIEW */}
        {effectiveView === 'wizard' && (
          <div>
            {isLoadingEstimate && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 text-slate-800">
                  <div className="animate-spin w-6 h-6 border-3 border-teal-600 border-t-transparent rounded-full" />
                  <span className="text-sm font-semibold">Computing Actuarial Human Life Value & Net Needs...</span>
                </div>
              </div>
            )}
            {assessmentError && (
              <div className="max-w-3xl mx-auto mt-4 px-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex justify-between items-center">
                  <span>⚠ {assessmentError}</span>
                  <button
                    type="button"
                    onClick={() => setAssessmentError(null)}
                    className="text-red-500 font-bold ml-4 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            <AssessmentWizard
              onSubmit={handleWizardSubmit}
              onCancel={handleReturnHome}
              isLoading={isLoadingEstimate}
            />
          </div>
        )}

        {/* STAGE 2: ASSESSMENT RESULTS VIEW */}
        {effectiveView === 'results' && assessmentResult && (
          <AssessmentResults
            result={assessmentResult}
            onRecalculate={handleRecalculate}
            onExplorePlans={() => {
              setView('recommendations');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTalkToAdvisor={() => {
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* STAGE 3: RECOMMENDATIONS & POLICY CUSTOMIZATION VIEW */}
        {effectiveView === 'recommendations' && assessmentResult && (
          <RecommendationsView
            assessment={assessmentResult}
            initialProfile={{
              age: lastAssessmentRequest?.age || 30,
              annual_income_inr: lastAssessmentRequest?.annual_income_inr || 1000000,
              is_homemaker: lastAssessmentRequest?.is_homemaker || false,
              monthly_household_expenses_inr: lastAssessmentRequest?.monthly_household_expenses_inr || 50000,
              existing_cover_inr: lastAssessmentRequest?.individual_life_cover_inr || 0,
            }}
            selectedPlan={selectedPlan}
            onSelectPlan={(plan) => setSelectedPlan(plan)}
            onBackToResults={() => {
              setView('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onConsultAdvisor={() => {
              if (!currentUser) {
                setPendingPostLoginAction('advisors');
                setIsAuthModalOpen(true);
                return;
              }
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContinueToAdvisor={() => {
              if (!currentUser) {
                setPendingPostLoginAction('advisors');
                setIsAuthModalOpen(true);
                return;
              }
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* STAGE 4: ADVISOR DISCOVERY & BOOKING VIEW */}
        {effectiveView === 'advisors' && (
          <AdvisorDirectory
            currentUser={currentUser}
            assessmentSummary={
              assessmentResult || selectedPlan
                ? {
                    recommended_cover_inr: assessmentResult ? Math.round(parseFloat(assessmentResult.recommended_gap_exact) || 0) : undefined,
                    coverage_gap: assessmentResult ? Math.round(parseFloat(assessmentResult.recommended_gap_rounded) || 0) : undefined,
                    method: assessmentResult?.recommended_method,
                    user_age: lastAssessmentRequest?.age,
                    annual_income_inr: lastAssessmentRequest?.annual_income_inr,
                    selected_plan_id: selectedPlan?.product_id,
                    selected_plan_name: selectedPlan?.product_name,
                    selected_sum_assured_inr: selectedPlan?.sum_assured,
                    selected_tenure_years: selectedPlan?.policy_term_years,
                    selected_premium_mode: selectedPlan?.premium_mode,
                    selected_premium_amount_inr: selectedPlan ? Math.round(parseFloat(selectedPlan.total_instalment_premium) || 0) : undefined,
                    selected_riders: selectedPlan?.riders.map((r) => r.rider_name),
                    remaining_shortfall_inr: selectedPlan?.remaining_shortfall_inr,
                  }
                : undefined
            }
            onRequestAuth={() => setIsAuthModalOpen(true)}
            onBookingSuccess={() => {
              if (currentUser?.role === 'customer') {
                setView('my-appointments');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {/* CUSTOMER APPOINTMENTS VIEW */}
        {effectiveView === 'my-appointments' && (
          <MyAppointments
            onExploreAdvisors={() => {
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ADVISOR PORTAL VIEW */}
        {effectiveView === 'advisor-portal' && currentUser && currentUser.role === 'advisor' && (
          <AdvisorPortal currentUser={currentUser} />
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {effectiveView === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}
      </main>

      {/* Professional Fintech Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Column 1: Brand & Mission */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">
                  CW
                </div>
                <span className="font-[var(--font-heading)] font-bold text-xl text-white tracking-tight">
                  CoverWise
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering Indian families with mathematical clarity and certified digital advisory for optimal life protection.
              </p>
              <div className="text-xs text-teal-400 font-medium">
                5 Languages · Pure Actuarial Precision
              </div>
            </div>

            {/* Column 2: Platform Journey */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Customer Journey
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={handleStartAssessment} className="hover:text-teal-400 transition cursor-pointer">
                    Stage 1: Needs Assessment
                  </button>
                </li>
                <li>
                  <button onClick={handleStartAssessment} className="hover:text-teal-400 transition cursor-pointer">
                    Stage 2: Actuarial Analysis
                  </button>
                </li>
                <li>
                  <button onClick={handleStartAssessment} className="hover:text-teal-400 transition cursor-pointer">
                    Stage 3: Plan Comparison
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setView('advisors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-teal-400 transition cursor-pointer"
                  >
                    Stage 4: Advisor Consultation
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Actuarial Methodology */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Methodology & Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>Human Life Value (HLV) Model</li>
                <li>Net Needs Replacement Approach</li>
                <li>Deterministic 4-Pillar Ranking</li>
                <li>Zero-Bias Independent Calculations</li>
              </ul>
            </div>

            {/* Column 4: Security & Compliance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Security & Privacy
              </h4>
              <ul className="space-y-2 text-xs">
                <li>HttpOnly Encrypted Sessions</li>
                <li>Double-Submit CSRF Defense</li>
                <li>Role-Based Access Control</li>
                <li>Customer Data Privacy Consent</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 CoverWise. All rights reserved.</p>
            <p className="text-center sm:text-right max-w-xl text-[11px] leading-relaxed text-slate-500">
              CoverWise provides educational insurance assessment and objective suitability calculations based on verified actuarial principles. Final policy underwriting and terms are determined solely by authorized life insurers.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'customer' && pendingPostLoginAction === 'advisors') {
            setPendingPostLoginAction(null);
            setView('advisors');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          setPendingPostLoginAction(null);
          navigateToAppropriateDashboard(user);
        }}
      />
    </div>
  );
}

export default App;
