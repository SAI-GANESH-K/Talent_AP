import React, { useState, useEffect } from 'react';
import {
  api,
  formatINRLakhCr,
  type AssessmentResponse,
  type CustomerProfile,
  type RecommendationResult,
  type RecommendedProduct,
  type RiderDetail,
} from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
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
  onBackToResults: () => void;
  onConsultAdvisor?: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  assessment,
  initialProfile,
  onBackToResults,
  onConsultAdvisor,
}) => {
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <button
              onClick={onBackToResults}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.recommendations.backToAssessment}</span>
            </button>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {t.recommendations.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {t.recommendations.subtitle}
            </p>
          </div>

          {/* Quick Profile Controls Badge Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-3 self-start">
            {/* Gender Toggle */}
            <div className="flex items-center gap-1 text-xs bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Gender:</span>
              <button
                onClick={() => setProfile((p) => ({ ...p, gender: p.gender === 'male' ? 'female' : 'male' }))}
                className="font-bold text-teal-400 capitalize hover:text-teal-300"
              >
                {profile.gender} ↻
              </button>
            </div>

            {/* Smoker Toggle */}
            <div className="flex items-center gap-1 text-xs bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Smoker:</span>
              <button
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    smoker_status: p.smoker_status === 'smoker' ? 'non_smoker' : 'smoker',
                  }))
                }
                className={`font-bold capitalize ${
                  profile.smoker_status === 'smoker' ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {profile.smoker_status === 'smoker' ? 'Yes' : 'No'} ↻
              </button>
            </div>

            {/* NRI Toggle */}
            <div className="flex items-center gap-1 text-xs bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">NRI:</span>
              <button
                onClick={() => setProfile((p) => ({ ...p, is_nri: !p.is_nri }))}
                className={`font-bold capitalize ${profile.is_nri ? 'text-teal-400' : 'text-slate-400'}`}
              >
                {profile.is_nri ? 'Yes' : 'No'} ↻
              </button>
            </div>
          </div>
        </div>

        {/* Coverage Need Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              Target Financial Protection Need
            </span>
            <div className="text-3xl font-black text-white">
              {formatINRLakhCr(recommendedGap)}
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Calculated using the approved {assessment.recommended_method} algorithm from your financial profile and dependency horizon.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-[11px] uppercase">{t.recommendations.evaluated}</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {recData?.total_products_evaluated || 14}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-[11px] uppercase">{t.recommendations.eligible}</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {recData?.eligible_count || 0}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-[11px] uppercase">{t.recommendations.ineligible}</div>
              <div className="text-lg font-bold text-slate-400 mt-0.5">
                {recData?.ineligible_count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
            <div className="text-base font-bold text-slate-200">
              {t.recommendations.evaluatingMsg}
            </div>
            <p className="text-xs text-slate-400">
              {t.recommendations.evaluatingDesc}
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 bg-red-950/40 border border-red-800/80 rounded-2xl text-center space-y-3">
            <div className="text-red-400 font-bold text-lg">Unable to Load Recommendations</div>
            <p className="text-xs text-red-200 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
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
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h3 className="text-xl font-bold text-white">{t.recommendations.noEligibleTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.recommendations.noEligibleDesc}
                </p>
                {onConsultAdvisor && (
                  <button
                    onClick={onConsultAdvisor}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                  >
                    {t.recommendations.consultAdvisorBtn}
                  </button>
                )}
              </div>
            )}

            {/* Ineligible Products Section (Accordion) */}
            {recData.rejected_products && recData.rejected_products.length > 0 && (
              <div className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden">
                <button
                  onClick={() => setShowIneligible(!showIneligible)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      {t.recommendations.excludedPlans}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {recData.rejected_products.length} {t.recommendations.products}
                    </span>
                  </div>
                  <span className="text-xs text-teal-400 font-semibold">
                    {showIneligible ? t.recommendations.hideReasons : t.recommendations.viewReasons}
                  </span>
                </button>

                {showIneligible && (
                  <div className="p-6 pt-2 border-t border-slate-800 divide-y divide-slate-800/60">
                    {recData.rejected_products.map((rp) => (
                      <div key={rp.product_id} className="py-3 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{rp.product_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{rp.product_type} ({rp.variant})</div>
                        </div>
                        <div className="md:text-right space-y-1">
                          {rp.rejection_reasons.map((r, i) => (
                            <span
                              key={i}
                              className="inline-block bg-red-950/40 text-red-300 border border-red-800/40 rounded-lg px-2.5 py-1 text-[11px] font-medium mr-1.5 mb-1"
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-teal-500/50 shadow-2xl rounded-2xl px-6 py-3.5 backdrop-blur-md flex items-center gap-5 text-xs animate-slideUp">
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
                      onClick={() => handleRemoveFromCompare(p.product_id)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={selectedForCompare.length < 2}
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl disabled:opacity-50 transition-all shadow-md"
              >
                {t.recommendations.compareSelected} ({selectedForCompare.length}/3)
              </button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-white underline text-[11px]"
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
