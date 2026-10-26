import React, { useState } from 'react';
import { formatINR, formatINRLakhCr, type RecommendedProduct } from '../../api/client';

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
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const quote = product.quote;
  const isMonthly = quote.premium_mode === 'monthly';
  const premiumDisplay = isMonthly ? quote.total_instalment_premium : quote.total_annual_premium;

  const scoreColor =
    product.composite_score >= 80
      ? 'from-teal-500 to-emerald-500 text-teal-300'
      : product.composite_score >= 60
      ? 'from-amber-500 to-yellow-500 text-amber-300'
      : 'from-slate-500 to-slate-600 text-slate-300';

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 flex flex-col justify-between ${
        isTopMatch
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/80 shadow-2xl shadow-teal-950/40'
          : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl'
      }`}
    >
      {/* Top Match Banner */}
      {isTopMatch && (
        <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Top Recommendation
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {product.category_label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {product.product_type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {product.product_name}
            </h3>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end">
            <button
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="group relative flex items-center gap-1 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 transition-all"
              title="Click to view match score breakdown"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Match</div>
                <div className={`text-sm font-black bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>
                  {Math.round(product.composite_score)}%
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Score Breakdown Dropdown */}
        {showScoreDetails && (
          <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-2 animate-fadeIn">
            <div className="flex justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
              <span>Scoring Pillar Breakdown</span>
              <span>Weight</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Coverage Fit ({Math.round(product.coverage_fit_score)}/100)</span>
              <span className="text-teal-400 font-medium">40%</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Affordability ({Math.round(product.affordability_score)}/100)</span>
              <span className="text-teal-400 font-medium">30%</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Product Type Fit ({Math.round(product.type_fit_score)}/100)</span>
              <span className="text-teal-400 font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Feature & Tenure Fit ({Math.round(product.feature_fit_score)}/100)</span>
              <span className="text-teal-400 font-medium">10%</span>
            </div>
          </div>
        )}

        {/* Why Recommended Explanation */}
        <p className="text-xs text-slate-300 bg-slate-800/40 border border-slate-800 rounded-xl p-3 mb-4 leading-relaxed">
          {product.why_recommended}
        </p>

        {/* Key Metrics: Cover & Premium */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Recommended Cover
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {formatINRLakhCr(product.recommended_sum_assured)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tenure: <strong className="text-slate-200">{product.recommended_policy_term} Years</strong>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Estimated Premium
            </div>
            <div className="text-lg font-black text-teal-400 mt-0.5">
              {formatINR(premiumDisplay)}
              <span className="text-xs font-normal text-slate-400">
                {isMonthly ? '/mo' : '/yr'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Annual: <strong className="text-slate-200">{formatINR(quote.total_annual_premium)}</strong>
            </div>
          </div>
        </div>

        {/* Shortfall Notice if any */}
        {parseFloat(product.coverage_shortfall) > 0 && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span>Remaining Need Shortfall:</span>
            <span className="font-bold text-amber-200">
              {formatINRLakhCr(product.coverage_shortfall)}
            </span>
          </div>
        )}

        {/* Key Benefits */}
        <div className="space-y-1.5 mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Key Features
          </div>
          {(showAllBenefits ? product.key_benefits : product.key_benefits.slice(0, 2)).map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
              <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{b}</span>
            </div>
          ))}
          {product.key_benefits.length > 2 && (
            <button
              onClick={() => setShowAllBenefits(!showAllBenefits)}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium pt-1"
            >
              {showAllBenefits ? '− Show fewer features' : `+ ${product.key_benefits.length - 2} more features`}
            </button>
          )}
        </div>

        {/* Key Limitations */}
        {product.key_limitations && product.key_limitations.length > 0 && (
          <div className="text-[11px] text-slate-400 bg-slate-900/60 rounded-lg p-2 border border-slate-800/80">
            <span className="text-slate-400 font-semibold">Important Limitation: </span>
            {product.key_limitations[0]}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-6 pt-3 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl flex items-center justify-between gap-3">
        {/* Compare Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={isSelectedForCompare}
            disabled={!isSelectedForCompare && !canSelectMoreForCompare}
            onChange={() => onToggleCompare(product)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/40 focus:ring-offset-slate-900 disabled:opacity-50"
          />
          <span>Compare</span>
        </label>

        {/* Customize CTA */}
        <button
          onClick={() => onCustomize(product)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-md ${
            isTopMatch
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20'
          }`}
        >
          <span>Customize Plan</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
