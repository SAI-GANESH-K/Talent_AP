import { useEffect, useState } from 'react';
import {
  api,
  type AssessmentRequest,
  type AssessmentResponse,
  type HealthResponse,
  type User,
} from './api/client';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdvisorPortal } from './components/advisor/AdvisorPortal';
import { AdvisorDirectory } from './components/advisory/AdvisorDirectory';
import { MyAppointments } from './components/advisory/MyAppointments';
import { AssessmentResults } from './components/assessment/AssessmentResults';
import { AssessmentWizard } from './components/assessment/AssessmentWizard';
import { AuthModal } from './components/auth/AuthModal';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { SUPPORTED_LANGUAGES } from './i18n/translations';
import { useLanguage } from './i18n/LanguageContext';

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
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Assessment state — preserved across language and view transitions
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResponse | null>(null);
  const [lastAssessmentRequest, setLastAssessmentRequest] = useState<AssessmentRequest | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // Check health and active session on mount
  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch((err) => setError(err.message));

    api.auth.me()
      .then((res) => setCurrentUser(res.user))
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
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setView('landing');
  };

  const navigateToAppropriateDashboard = (user: User) => {
    if (user.role === 'admin') {
      setView('admin-dashboard');
    } else if (user.role === 'advisor') {
      setView('advisor-portal');
    } else {
      setView('advisors');
    }
  };

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
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-teal-500)] to-[var(--color-teal-600)] flex items-center justify-center font-bold text-sm shadow-sm text-white">
                CW
              </div>
              <div>
                <span className="font-[var(--font-heading)] font-semibold text-lg tracking-tight block">
                  CoverWise
                </span>
                <span className="text-[10px] text-teal-400 block -mt-1 font-medium">
                  BFSI Needs Finder
                </span>
              </div>
            </button>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={handleReturnHome}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  view === 'landing' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.nav.home}
              </button>

              <button
                type="button"
                onClick={handleStartAssessment}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  view === 'wizard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
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
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  view === 'advisors' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.nav.advisors}
              </button>

              {/* Role specific links */}
              {currentUser?.role === 'customer' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('my-appointments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    view === 'my-appointments'
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.nav.myAppointments}
                </button>
              )}

              {currentUser?.role === 'advisor' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('advisor-portal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    view === 'advisor-portal'
                      ? 'bg-white/10 text-white'
                      : 'text-teal-300 hover:text-white'
                  }`}
                >
                  🩺 {t.nav.advisorPortal}
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('admin-dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    view === 'admin-dashboard'
                      ? 'bg-white/10 text-white'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  🛡️ {t.nav.adminDashboard}
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
                  {SUPPORTED_LANGUAGES.map((l) => (
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
        {view === 'landing' && (
          <div>
            {/* Hero Section */}
            <header className="bg-gradient-to-b from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-[var(--color-teal-400)] backdrop-blur mb-6">
                  <span>{t.landing.badge}</span>
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
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl text-base font-semibold border border-white/20 transition cursor-pointer"
                  >
                    {t.nav.advisors} →
                  </button>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  {t.landing.ctaSubtext}
                </p>
              </div>
            </header>

            {/* Feature Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: '📊',
                    title: t.landing.card1Title,
                    desc: t.landing.card1Desc,
                  },
                  {
                    icon: '🩺',
                    title: t.landing.card2Title,
                    desc: t.landing.card2Desc,
                  },
                  {
                    icon: '🛡️',
                    title: t.landing.card3Title,
                    desc: t.landing.card3Desc,
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/60 border border-slate-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="text-3xl mb-4">{card.icon}</div>
                    <h3 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-navy-900)] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* System Status (development / jury verification) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-heading)] text-base font-semibold text-[var(--color-navy-800)]">
                    {t.landing.systemStatus}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">FastAPI + PostgreSQL + Argon2id</span>
                </div>
                {error ? (
                  <div className="text-[var(--color-danger)] text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                    ⚠ Backend not reachable: {error}
                    <br />
                    <span className="text-slate-500 text-xs">
                      Ensure backend uvicorn server is running on port 8000.
                    </span>
                  </div>
                ) : health ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-500 mb-1">Service</div>
                      <div className="font-semibold text-slate-800">{health.service}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-500 mb-1">Version</div>
                      <div className="font-semibold text-slate-800">{health.version}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-500 mb-1">Status</div>
                      <div className={`font-semibold ${health.status === 'ok' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                        {health.status === 'ok' ? '● Connected' : '○ ' + health.status}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-500 mb-1">Database</div>
                      <div className={`font-semibold ${health.database === 'connected' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                        {health.database === 'connected' ? '● PostgreSQL Connected' : '○ ' + health.database}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">Checking backend connection...</div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* STAGE 1: QUESTIONNAIRE VIEW */}
        {view === 'wizard' && (
          <div>
            {assessmentError && (
              <div className="max-w-3xl mx-auto mt-6 px-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                  ⚠ Error running assessment: {assessmentError}
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

        {/* STAGE 2: RESULTS VIEW */}
        {view === 'results' && assessmentResult && (
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
        {view === 'recommendations' && assessmentResult && (
          <RecommendationsView
            assessment={assessmentResult}
            initialProfile={{
              age: lastAssessmentRequest?.age || 30,
              annual_income_inr: lastAssessmentRequest?.annual_income_inr || 1000000,
              is_homemaker: lastAssessmentRequest?.is_homemaker || false,
              monthly_household_expenses_inr: lastAssessmentRequest?.monthly_household_expenses_inr || 50000,
              existing_cover_inr: lastAssessmentRequest?.individual_life_cover_inr || 0,
            }}
            onBackToResults={() => {
              setView('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onConsultAdvisor={() => {
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* STAGE 4: ADVISOR DISCOVERY & BOOKING VIEW */}
        {view === 'advisors' && (
          <AdvisorDirectory
            currentUser={currentUser}
            assessmentSummary={
              assessmentResult
                ? {
                    recommended_cover: assessmentResult.recommended_gap_exact,
                    recommended_method: assessmentResult.recommended_method,
                    explanation: assessmentResult.explanation,
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
        {view === 'my-appointments' && (
          <MyAppointments
            onExploreAdvisors={() => {
              setView('advisors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ADVISOR PORTAL VIEW */}
        {view === 'advisor-portal' && currentUser && currentUser.role === 'advisor' && (
          <AdvisorPortal currentUser={currentUser} />
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {view === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-navy-900)] text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs leading-relaxed">
          <p className="mb-2 font-medium text-slate-300">
            CoverWise — Team We4 · Talent AP Mega Hackathon 2026 · BFSI B2
          </p>
          <p>{t.disclaimer.syntheticNotice}</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          navigateToAppropriateDashboard(user);
        }}
      />
    </div>
  );
}

export default App;
