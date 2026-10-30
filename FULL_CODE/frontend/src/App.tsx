import { useState, useEffect, useMemo } from 'react';
import {
  api,
  type AdvisorSummary,
  type AssessmentRequest,
  type AssessmentResponse,
  type SelectedPlan,
  type User,
} from './api/client';
import { useLanguage } from './i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, type LanguageOption } from './i18n/translations';
import { SlideTabs, type TabItem } from './components/ui/slide-tabs';
import { AssessmentWizard } from './components/assessment/AssessmentWizard';
import { AssessmentResults } from './components/assessment/AssessmentResults';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { AdvisorDirectory } from './components/advisory/AdvisorDirectory';
import { MyAppointments } from './components/advisory/MyAppointments';
import { AdvisorPortal } from './components/advisor/AdvisorPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/layout/Footer';
import { AppPreloader } from './components/layout/AppPreloader';
import { HeroSection } from './components/landing/HeroSection';
import { LifeStorySection } from './components/landing/LifeStorySection';
import { ValueProposition } from './components/landing/ValueProposition';
import { HowItWorks } from './components/landing/HowItWorks';
import { FinalCTA } from './components/landing/FinalCTA';

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
  const [pendingBookingAdvisor, setPendingBookingAdvisor] = useState<AdvisorSummary | null>(null);
  const [hasCompletedPreloader, setHasCompletedPreloader] = useState<boolean>(false);

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

  // Active navigation tab identifier
  const activeNavId =
    effectiveView === 'results' || effectiveView === 'recommendations'
      ? 'wizard'
      : effectiveView;

  // Derive responsive navbar tabs based on current role
  const navItems: TabItem[] = useMemo(() => {
    if (!currentUser || currentUser.role === 'customer') {
      const items: TabItem[] = [
        {
          id: 'landing',
          label: t.nav.home,
          onClick: handleReturnHome,
        },
        {
          id: 'wizard',
          label: t.nav.findCover,
          onClick: handleStartAssessment,
        },
        {
          id: 'advisors',
          label: t.nav.advisors,
          onClick: () => {
            setView('advisors');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        },
      ];
      if (currentUser?.role === 'customer') {
        items.push({
          id: 'my-appointments',
          label: t.nav.myAppointments,
          onClick: () => {
            setView('my-appointments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        });
      }
      return items;
    }

    if (currentUser?.role === 'advisor') {
      return [
        {
          id: 'advisor-portal',
          label: t.nav.advisorPortal,
          onClick: () => {
            setView('advisor-portal');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        },
      ];
    }

    if (currentUser?.role === 'admin') {
      return [
        {
          id: 'admin-dashboard',
          label: (t.nav as any).adminDashboard || 'Admin Dashboard',
          onClick: () => {
            setView('admin-dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        },
      ];
    }

    return [];
  }, [currentUser, t]);

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex flex-col justify-between">
      {/* Premium Branded Preloader (Runs on initial page load and every browser refresh) */}
      {!hasCompletedPreloader && (
        <AppPreloader
          onComplete={() => {
            setHasCompletedPreloader(true);
          }}
        />
      )}

      {/* Navigation Bar — Logo on left-most, Enlarge Tabs in Middle, Login & Language on right-most */}
      <nav className="bg-[var(--color-navy-900)] text-white sticky top-0 z-40 shadow-xl border-b border-slate-800 w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between h-20">
          {/* Brand Wordmark — Left-Most Position */}
          <button
            type="button"
            onClick={handleReturnHome}
            className="flex items-center text-left focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-2xl py-1 px-1 cursor-pointer group shrink-0"
            aria-label="CoverWise Home"
          >
            <span className="font-[var(--font-heading)] font-black text-2xl sm:text-3xl tracking-tight text-white group-hover:text-teal-300 transition-colors whitespace-nowrap">
              Cover<span className="text-teal-400">Wise</span>
            </span>
          </button>

          {/* Role-Specific Navigation Links with Animated SlideTabs — Large Center Prominence */}
          <div className="hidden md:flex items-center justify-center flex-1 px-4 lg:px-8">
            <SlideTabs
              items={navItems}
              activeId={activeNavId}
              size="lg"
              activePillClassName="bg-teal-500/25 border-2 border-teal-400/60 text-teal-200 shadow-md shadow-teal-500/20"
              hoverPillClassName="bg-white/10 border border-white/15"
            />
          </div>

          {/* Language Switcher & Auth Section — Right-Most Position */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Central 5-Language Switcher */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                aria-label="Select Interface Language"
                className="bg-slate-800 text-white border border-slate-700 hover:border-teal-500/60 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition-colors shadow-xs"
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
                  className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer hover:border-teal-500/50 transition shadow-xs"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm hidden sm:inline">
                    {currentUser.full_name}
                  </span>
                  <span className="text-xs text-teal-400 uppercase font-bold">
                    ({currentUser.role})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                {t.nav.login} / {t.nav.register}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* LANDING PAGE VIEW */}
        {effectiveView === 'landing' && (
          <div className="space-y-0">
            {/* Section 1: Cinematic Split Hero */}
            <HeroSection
              onStartAssessment={handleStartAssessment}
              onConsultAdvisor={() => {
                setView('advisors');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Section 2: CoverWise Life Story — Interactive Literacy & Awareness */}
            <LifeStorySection onStartAssessment={handleStartAssessment} />

            {/* Section 3: Why CoverWise? */}
            <ValueProposition
              onStartAssessment={handleStartAssessment}
              onExplorePlans={() => {
                if (assessmentResult) {
                  setView('recommendations');
                } else {
                  handleStartAssessment();
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onConsultAdvisor={() => {
                setView('advisors');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Section 4: How CoverWise Works */}
            <HowItWorks />

            {/* Section 5: Final Call to Action */}
            <FinalCTA
              onStartAssessment={handleStartAssessment}
              onConsultAdvisor={() => {
                setView('advisors');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
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
            onRequestAuth={(adv) => {
              setPendingPostLoginAction('advisors');
              if (adv) setPendingBookingAdvisor(adv);
              setIsAuthModalOpen(true);
            }}
            initialAdvisor={pendingBookingAdvisor}
            onClearInitialAdvisor={() => setPendingBookingAdvisor(null)}
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

      {/* Footer (Cinematic Motion on Landing, Sleek Compact Bar on Other Pages) */}
      <Footer
        currentView={effectiveView}
        currentUser={currentUser}
        onNavigate={(v) => {
          setView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartAssessment={handleStartAssessment}
        hasAssessmentResult={!!assessmentResult}
      />

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
