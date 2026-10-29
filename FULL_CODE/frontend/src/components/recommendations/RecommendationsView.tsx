import React, { useState, useEffect } from 'react';
import {
  api,
  formatINR,
  formatINRLakhCr,
  type AssessmentResponse,
  type CustomerProfile,
  type RecommendationResult,
  type RecommendedProduct,
  type RiderDetail,
  type SelectedPlan,
} from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeGender, localizeYesNo } from '../../i18n/localizeCatalog';
import { ProductCard } from './ProductCard';
import { PolicyCustomizerModal } from './PolicyCustomizerModal';
import { PlanComparisonModal } from './PlanComparisonModal';

interface RecommendationsViewProps {
  assessment: AssessmentResponse;
  initialProfile: {
    age: number;
    annual_income_inr: number;
    is_homemaker?: boolean;
    monthly_household_expenses_inr: number;
    existing_cover_inr: number;
  };
  selectedPlan: SelectedPlan | null;
  onSelectPlan: (plan: SelectedPlan | null) => void;
  onBackToResults: () => void;
  onConsultAdvisor?: () => void;
  onContinueToAdvisor?: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  assessment,
  initialProfile,
  selectedPlan,
  onSelectPlan,
  onBackToResults,
  onConsultAdvisor,
  onContinueToAdvisor,
}) => {
  const { t, language } = useLanguage();
  // Customer Profile state (allows quick tweaking for quotes)
  const [profile, setProfile] = useState<CustomerProfile>({
    age: initialProfile.age,
    gender: 'male',
    smoker_status: 'non_smoker',
    annual_income_inr: initialProfile.annual_income_inr,
    is_homemaker: initialProfile.is_homemaker || false,
    spouse_annual_income_inr: 0,
    is_nri: false,
    existing_individual_life_cover_inr: initialProfile.existing_cover_inr || 0,
    monthly_premium_budget_inr: Math.round(initialProfile.monthly_household_expenses_inr * 0.1) || 5000,
    risk_appetite: 'moderate',
  });

  const recommendedGap = parseFloat(assessment.recommended_gap_rounded) || 10000000;

  // Data fetching state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recData, setRecData] = useState<RecommendationResult | null>(null);
  const [allRiders, setAllRiders] = useState<RiderDetail[]>([]);

  // Interactive UI modals state
  const [customizingProduct, setCustomizingProduct] = useState<RecommendedProduct | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<RecommendedProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [showIneligible, setShowIneligible] = useState<boolean>(false);

  // Fetch recommendations and rider master data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [recs, riders] = await Promise.all([
          api.recommendations({
            customer: profile,
            recommended_gap_inr: recommendedGap,
          }),
          api.riders().catch(() => []),
        ]);

        if (isMounted) {
          setRecData(recs);
          setAllRiders(riders);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load personalized recommendations.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [profile, recommendedGap]);

  // Comparison toggle handlers
  const handleToggleCompare = (product: RecommendedProduct) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((p) => p.product_id === product.product_id);
      if (exists) {
        return prev.filter((p) => p.product_id !== product.product_id);
      }
      if (prev.length < 3) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setSelectedForCompare((prev) => prev.filter((p) => p.product_id !== productId));
  };

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={onBackToResults}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t.recommendations.backToAssessment}</span>
              </button>
              {/* Big, Bold, Beautiful Stage 3 Badge */}
              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-teal-500/40 rounded-2xl shadow-xs">
                <span className="bg-teal-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-2xs">
                  Stage 3
                </span>
                <span className="text-teal-950 font-extrabold text-sm sm:text-base tracking-tight">
                  {(t.recommendations as any).stagePill?.replace(/Stage 3\s*[·•-]?\s*/i, '') || 'Product Recommendations'}
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-[var(--font-heading)]">
              {t.recommendations.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {t.recommendations.subtitle}
            </p>
          </div>

          {/* Quick Profile Controls Badge Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center gap-3 self-start shadow-xs">
            {/* Gender Toggle */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">{(t.wizard as any).genderLabel || 'Gender'}:</span>
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, gender: p.gender === 'male' ? 'female' : 'male' }))}
                className="font-bold text-teal-700 capitalize hover:text-teal-900 cursor-pointer"
              >
                {localizeGender(profile.gender, language)} ↻
              </button>
            </div>

            {/* Smoker Toggle */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">{(t.wizard as any).smokerLabel || 'Smoker'}:</span>
              <button
                type="button"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    smoker_status: p.smoker_status === 'smoker' ? 'non_smoker' : 'smoker',
                  }))
                }
                className={`font-bold capitalize cursor-pointer ${
                  profile.smoker_status === 'smoker' ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {localizeYesNo(profile.smoker_status === 'smoker', language)} ↻
              </button>
            </div>

            {/* NRI Toggle */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">{(t.wizard as any).nriLabel || 'NRI'}:</span>
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, is_nri: !p.is_nri }))}
                className={`font-bold capitalize cursor-pointer ${profile.is_nri ? 'text-teal-700' : 'text-slate-500'}`}
              >
                {localizeYesNo(!!profile.is_nri, language)} ↻
              </button>
            </div>
          </div>
        </div>

        {/* Selected Plan Summary Banner (if active) */}
        {selectedPlan && (
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-[var(--color-navy-900)] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/30 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-teal-700/50">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-teal-300">
                  <span>✓</span> {(t.recommendations as any).selectedPlanTitle || 'Your Selected Protection Plan'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-[var(--font-heading)]">
                  {selectedPlan.product_name}
                </h2>
                <p className="text-xs text-teal-200">
                  {selectedPlan.product_type} {selectedPlan.variant ? `(${selectedPlan.variant})` : ''} · Validated Actuarial Quotation
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const prod = recData?.recommendations.find((p) => p.product_id === selectedPlan.product_id);
                    if (prod) setCustomizingProduct(prod);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {(t.recommendations as any).editCustomizationBtn || 'Edit Customization'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPlan(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {(t.recommendations as any).changePlanBtn || 'Change Plan'}
                </button>
                {(onContinueToAdvisor || onConsultAdvisor) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onContinueToAdvisor) onContinueToAdvisor();
                      else if (onConsultAdvisor) onConsultAdvisor();
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {(t.recommendations as any).continueToAdvisorBtn || 'Continue to Advisor Consultation →'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] text-teal-200 uppercase font-medium block">Life Cover (SA)</span>
                <span className="text-xl font-extrabold text-white mt-0.5 block">{formatINRLakhCr(selectedPlan.sum_assured)}</span>
                <span className="text-[11px] text-teal-300">{selectedPlan.policy_term_years} Years Tenure</span>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] text-teal-200 uppercase font-medium block">Premium Payable</span>
                <span className="text-xl font-extrabold text-teal-300 mt-0.5 block">
                  {formatINR(selectedPlan.total_instalment_premium)}
                  <span className="text-xs font-normal text-teal-200 ml-1">/{selectedPlan.premium_mode}</span>
                </span>
                <span className="text-[11px] text-teal-300">Annual: {formatINR(selectedPlan.total_annual_premium)}</span>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] text-teal-200 uppercase font-medium block">Chosen Riders</span>
                <span className="text-base font-bold text-white mt-0.5 block">
                  {selectedPlan.riders.length > 0 ? `${selectedPlan.riders.length} Active Rider(s)` : 'Base Cover Only'}
                </span>
                {selectedPlan.riders.length > 0 && (
                  <span className="text-[11px] text-teal-200 truncate block">
                    {selectedPlan.riders.map((r) => r.rider_name).join(', ')}
                  </span>
                )}
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] text-teal-200 uppercase font-medium block">Protection Fit</span>
                <span className="text-base font-bold text-white mt-0.5 block">
                  {selectedPlan.remaining_shortfall_inr === 0 ? (
                    <span className="text-emerald-300 font-bold">✓ 100% Covered</span>
                  ) : (
                    <span className="text-amber-300">Shortfall: {formatINRLakhCr(selectedPlan.remaining_shortfall_inr)}</span>
                  )}
                </span>
                <span className="text-[11px] text-teal-300">Target: {formatINRLakhCr(selectedPlan.recommended_gap_inr)}</span>
              </div>
            </div>

            <p className="text-[11px] text-teal-300/80 pt-4 mt-4 border-t border-teal-700/40 text-center sm:text-left">
              * Illustrative quote based on synthetic rates and entered health/age criteria. Non-binding demonstration.
            </p>
          </div>
        )}

        {/* Coverage Need Banner */}
        <div className="bg-gradient-to-r from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              Target Financial Protection Need
            </span>
            <div className="text-3xl font-black text-white">
              {formatINRLakhCr(recommendedGap)}
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Calculated using the approved {assessment.recommended_method} algorithm from your financial profile and dependency horizon.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-white/10 rounded-2xl p-3.5 text-center min-w-[90px] backdrop-blur-xs">
              <div className="text-slate-300 text-[11px] uppercase font-semibold">{t.recommendations.evaluated}</div>
              <div className="text-xl font-bold text-white mt-0.5">
                {recData?.total_products_evaluated || 14}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 text-center min-w-[90px] backdrop-blur-xs">
              <div className="text-slate-300 text-[11px] uppercase font-semibold">{t.recommendations.eligible}</div>
              <div className="text-xl font-bold text-teal-300 mt-0.5">
                {recData?.eligible_count || 0}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 text-center min-w-[90px] backdrop-blur-xs">
              <div className="text-slate-300 text-[11px] uppercase font-semibold">{t.recommendations.ineligible}</div>
              <div className="text-xl font-bold text-slate-300 mt-0.5">
                {recData?.ineligible_count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
            <div className="text-base font-bold text-slate-800">
              {t.recommendations.evaluatingMsg}
            </div>
            <p className="text-xs text-slate-500">
              {t.recommendations.evaluatingDesc}
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
            <div className="text-red-700 font-bold text-lg">Unable to Load Recommendations</div>
            <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Recommended Products Grid */}
        {!loading && !error && recData && (
          <>
            {recData.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recData.recommendations.map((p, idx) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    isTopMatch={idx === 0}
                    onCustomize={(prod) => setCustomizingProduct(prod)}
                    isSelectedForCompare={selectedForCompare.some((cp) => cp.product_id === p.product_id)}
                    onToggleCompare={handleToggleCompare}
                    canSelectMoreForCompare={selectedForCompare.length < 3}
                  />
                ))}
              </div>
            ) : (
              /* No eligible product state */
              <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t.recommendations.noEligibleTitle}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.recommendations.noEligibleDesc}
                </p>
                {onConsultAdvisor && (
                  <button
                    type="button"
                    onClick={onConsultAdvisor}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-xs rounded-xl shadow-md hover:brightness-105 cursor-pointer"
                  >
                    {t.recommendations.consultAdvisorBtn}
                  </button>
                )}
              </div>
            )}

            {/* Ineligible Products Section (Accordion) */}
            {recData.rejected_products && recData.rejected_products.length > 0 && (
              <div className="border border-slate-200 rounded-3xl bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowIneligible(!showIneligible)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-600">
                      {t.recommendations.excludedPlans}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                      {recData.rejected_products.length} {t.recommendations.products}
                    </span>
                  </div>
                  <span className="text-xs text-teal-700 font-semibold">
                    {showIneligible ? t.recommendations.hideReasons : t.recommendations.viewReasons}
                  </span>
                </button>

                {showIneligible && (
                  <div className="p-6 pt-2 border-t border-slate-100 divide-y divide-slate-100">
                    {recData.rejected_products.map((rp) => (
                      <div key={rp.product_id} className="py-3 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{rp.product_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{rp.product_type} ({rp.variant})</div>
                        </div>
                        <div className="md:text-right space-y-1">
                          {rp.rejection_reasons.map((r, i) => (
                            <span
                              key={i}
                              className="inline-block bg-red-50 text-red-700 border border-red-200 rounded-lg px-2.5 py-1 text-[11px] font-medium mr-1.5 mb-1"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regulatory Disclaimer */}
            <div className="text-center text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed pt-4">
              {recData.disclaimer}
            </div>
          </>
        )}

        {/* Sticky Floating Compare Drawer */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-navy-900)] border border-teal-500/50 shadow-2xl rounded-2xl px-6 py-3.5 backdrop-blur-md flex items-center gap-5 text-xs animate-slideUp text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{t.recommendations.comparePlans}:</span>
              <div className="flex items-center gap-1.5">
                {selectedForCompare.map((p) => (
                  <span
                    key={p.product_id}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-semibold flex items-center gap-1.5"
                  >
                    <span className="truncate max-w-[120px]">{p.product_name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCompare(p.product_id)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={selectedForCompare.length < 2}
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold rounded-xl disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                {t.recommendations.compareSelected} ({selectedForCompare.length}/3)
              </button>
              <button
                type="button"
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-white underline text-[11px] cursor-pointer"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Policy Customizer Modal */}
        {customizingProduct && (
          <PolicyCustomizerModal
            product={customizingProduct}
            customer={profile}
            recommendedGap={recommendedGap}
            onClose={() => setCustomizingProduct(null)}
            onSelectPlan={(plan) => {
              onSelectPlan(plan);
              setCustomizingProduct(null);
            }}
            allRiders={allRiders}
          />
        )}

        {/* Plan Comparison Modal */}
        {isCompareModalOpen && (
          <PlanComparisonModal
            products={selectedForCompare}
            onClose={() => setIsCompareModalOpen(false)}
            onCustomize={(p) => setCustomizingProduct(p)}
            onRemoveFromCompare={handleRemoveFromCompare}
          />
        )}
      </div>
    </div>
  );
};
