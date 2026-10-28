import React, { useState } from 'react';
import { formatINR, formatINRLakhCr, type RecommendedProduct } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProductCardProps {
  product: RecommendedProduct;
  isTopMatch?: boolean;
  onCustomize: (product: RecommendedProduct) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (product: RecommendedProduct) => void;
  canSelectMoreForCompare: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isTopMatch = false,
  onCustomize,
  isSelectedForCompare,
  onToggleCompare,
  canSelectMoreForCompare,
}) => {
  const { t } = useLanguage();
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const quote = product.quote;
  const isMonthly = quote.premium_mode === 'monthly';
  const premiumDisplay = isMonthly ? quote.total_instalment_premium : quote.total_annual_premium;

  const scoreBadgeBg =
    product.composite_score >= 80
      ? 'bg-teal-50 text-teal-800 border-teal-300'
      : product.composite_score >= 60
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div
      className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isTopMatch
          ? 'bg-white border-2 border-teal-600 ring-4 ring-teal-500/10 shadow-xl'
          : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Match Banner */}
      {isTopMatch && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-600 to-teal-500 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs flex items-center gap-1.5 z-10">
          <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {t.recommendations.topMatch}
        </div>
      )}

      {/* Card Header & Body */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {product.category_label}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {product.product_type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-[var(--font-heading)]">
              {product.product_name}
            </h3>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className={`group flex items-center gap-1 border rounded-xl px-2.5 py-1 transition-all cursor-pointer ${scoreBadgeBg}`}
              title="Click to view match score breakdown"
            >
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider font-semibold opacity-75">Match</div>
                <div className="text-sm font-black">
                  {Math.round(product.composite_score)}%
                </div>
              </div>
              <svg className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Score Breakdown Dropdown */}
        {showScoreDetails && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
            <div className="flex justify-between text-slate-700 font-semibold border-b border-slate-200 pb-1">
              <span>Scoring Pillar Breakdown</span>
              <span>Weight</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Coverage Fit ({Math.round(product.coverage_fit_score)}/100)</span>
              <span className="text-teal-700 font-bold">40%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Affordability ({Math.round(product.affordability_score)}/100)</span>
              <span className="text-teal-700 font-bold">30%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Product Type Fit ({Math.round(product.type_fit_score)}/100)</span>
              <span className="text-teal-700 font-bold">20%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Feature & Tenure Fit ({Math.round(product.feature_fit_score)}/100)</span>
              <span className="text-teal-700 font-bold">10%</span>
            </div>
          </div>
        )}

        {/* Why Recommended Explanation */}
        <p className="text-xs text-slate-700 bg-teal-50/50 border border-teal-100 rounded-xl p-3 mb-4 leading-relaxed">
          <strong className="text-teal-900 font-semibold">{t.recommendations.whyRecommended} </strong>
          {product.why_recommended}
        </p>

        {/* Key Metrics: Cover & Premium */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Recommended Cover
            </div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {formatINRLakhCr(product.recommended_sum_assured)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tenure: <strong className="text-slate-800">{product.recommended_policy_term} Years</strong>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Estimated Premium
            </div>
            <div className="text-lg font-black text-teal-700 mt-0.5">
              {formatINR(premiumDisplay)}
              <span className="text-xs font-normal text-slate-500">
                {isMonthly ? '/mo' : '/yr'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Annual: <strong className="text-slate-800">{formatINR(quote.total_annual_premium)}</strong>
            </div>
          </div>
        </div>

        {/* Shortfall Notice if any */}
        {parseFloat(product.coverage_shortfall) > 0 && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-medium">Remaining Need Shortfall:</span>
            <span className="font-bold text-amber-950">
              {formatINRLakhCr(product.coverage_shortfall)}
            </span>
          </div>
        )}

        {/* Key Benefits */}
        <div className="space-y-1.5 mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.recommendations.keyFeatures}
          </div>
          {(showAllBenefits ? product.key_benefits : product.key_benefits.slice(0, 2)).map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
              <svg className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{b}</span>
            </div>
          ))}
          {product.key_benefits.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAllBenefits(!showAllBenefits)}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium pt-1 cursor-pointer"
            >
              {showAllBenefits ? '− Show fewer features' : `+ ${product.key_benefits.length - 2} more features`}
            </button>
          )}
        </div>

        {/* Key Limitations */}
        {product.key_limitations && product.key_limitations.length > 0 && (
          <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
            <span className="text-slate-800 font-semibold">{t.recommendations.pointsToNote} </span>
            {product.key_limitations[0]}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 rounded-b-3xl flex items-center justify-between gap-3">
        {/* Compare Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900">
          <input
            type="checkbox"
            checked={isSelectedForCompare}
            disabled={!isSelectedForCompare && !canSelectMoreForCompare}
            onChange={() => onToggleCompare(product)}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50 cursor-pointer"
          />
          <span>{t.recommendations.compareCheckbox}</span>
        </label>

        {/* Customize CTA */}
        <button
          type="button"
          onClick={() => onCustomize(product)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm cursor-pointer ${
            isTopMatch
              ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-teal-600/20'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          <span>{t.recommendations.customizePlan}</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
