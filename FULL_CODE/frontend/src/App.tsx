import { useEffect, useState } from 'react';
import {
  api,
  type AssessmentRequest,
  type AssessmentResponse,
  type HealthResponse,
} from './api/client';
import { AssessmentResults } from './components/assessment/AssessmentResults';
import { AssessmentWizard } from './components/assessment/AssessmentWizard';
import { RecommendationsView } from './components/recommendations/RecommendationsView';

type ViewMode = 'landing' | 'wizard' | 'results' | 'recommendations';

function App() {
  const [view, setView] = useState<ViewMode>('landing');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResponse | null>(null);
  const [lastAssessmentRequest, setLastAssessmentRequest] = useState<AssessmentRequest | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch((err) => setError(err.message));
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

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex flex-col justify-between">
      {/* Navigation */}
      <nav className="bg-[var(--color-navy-900)] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              onClick={handleReturnHome}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-teal-500)] to-[var(--color-teal-600)] flex items-center justify-center font-bold text-sm shadow-sm">
                CW
              </div>
              <div>
                <span className="font-[var(--font-heading)] font-semibold text-lg tracking-tight block">
                  CoverWise
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">
                  BFSI Needs Finder
                </span>
              </div>
            </button>

            {/* Nav actions */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300 hidden sm:inline text-xs">🌐 English</span>
              {view === 'landing' ? (
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Find My Cover →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReturnHome}
                  className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
                >
                  Home
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
                  <span>✨</span> Phase 2 Financial Needs Calculation Engine Active
                </div>
                <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Life insurance,{' '}
                  <span className="text-[var(--color-teal-400)]">understood</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Tell us about your family and goals. We'll compute your protection requirement using 
                  both <strong>Human Life Value</strong> and <strong>Net Needs</strong> — with clear explanations.
                </p>
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  Find My Cover →
                </button>
                <p className="mt-4 text-xs text-slate-400">
                  Takes ~3 minutes · No personal data stored · Instant mathematical breakdown
                </p>
              </div>
            </header>

            {/* Feature Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: '📊',
                    title: 'Dual-Method Calculation',
                    desc: 'We calculate both Human Life Value (income replacement) and Net Needs (family obligations) to ensure zero underinsurance.',
                  },
                  {
                    icon: '🛡️',
                    title: 'Inflation & Debt Shield',
                    desc: 'Children education costs inflated at 8% p.a. while outstanding home loans and medical emergency funds are protected.',
                  },
                  {
                    icon: '💬',
                    title: 'Audited & Explainable',
                    desc: 'Every single rupee in your coverage gap has an exact mathematical reason. No black-box algorithms.',
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
                    System Architecture & API Status
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">FastAPI + PostgreSQL</span>
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
            onTalkToAdvisor={() => alert('Phase 4 Advisor Matching will connect you to certified language advisors!')}
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
            onConsultAdvisor={() => alert('Phase 4 Advisor Matching will connect you to certified language advisors!')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-navy-900)] text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs leading-relaxed">
          <p className="mb-2 font-medium text-slate-300">
            CoverWise — Team We4 · Talent AP Mega Hackathon 2026 · BFSI B2
          </p>
          <p>
            Saffron Bank and Saffron Life Insurance Co. are fictional. All products, rates, advisors and customers
            are synthetic. Products are not IRDAI-approved. Nothing here is financial, insurance, tax or legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
