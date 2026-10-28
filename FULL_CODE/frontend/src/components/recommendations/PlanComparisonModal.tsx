import React from 'react';
import { formatINR, formatINRLakhCr, type RecommendedProduct } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface PlanComparisonModalProps {
  products: RecommendedProduct[];
  onClose: () => void;
  onCustomize: (product: RecommendedProduct) => void;
  onRemoveFromCompare: (productId: string) => void;
}

export const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({
  products,
  onClose,
  onCustomize,
  onRemoveFromCompare,
}) => {
  const { t } = useLanguage();
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-5 bg-[var(--color-navy-900)] border-b border-slate-800 flex items-center justify-between text-white">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              {t.recommendations.compareModalTitle}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Comparing {products.length} Insurance Plans
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            aria-label={t.recommendations.closeComparison}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="p-6 overflow-x-auto flex-1 bg-white">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-4 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">
                  Feature
                </th>
                {products.map((p) => (
                  <th key={p.product_id} className="py-4 px-4 align-top w-1/3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                          {p.category_label}
                        </span>
                        <h4 className="text-base font-bold text-slate-950 mt-1">
                          {p.product_name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCompare(p.product_id)}
                        className="text-slate-400 hover:text-red-600 text-xs p-1 cursor-pointer"
                        title="Remove plan"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Match Score */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600">Match Score</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4">
                    <span className="text-sm font-extrabold text-teal-700">
                      {Math.round(p.composite_score)}%
                    </span>
                    <span className="text-slate-500 text-[11px] block">
                      Coverage fit: {Math.round(p.coverage_fit_score)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Recommended Sum Assured */}
              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.sumAssured}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {formatINRLakhCr(p.recommended_sum_assured)}
                  </td>
                ))}
              </tr>

              {/* Monthly Premium */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.monthlyInstalment}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4">
                    <span className="font-extrabold text-teal-700 text-sm">
                      {formatINR(p.quote.total_instalment_premium)}/mo
                    </span>
                  </td>
                ))}
              </tr>

              {/* Annual Premium */}
              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.annualPremium}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 text-slate-800 font-medium">
                    {formatINR(p.quote.total_annual_premium)}/yr
                  </td>
                ))}
              </tr>

              {/* Policy Tenure */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.policyTerm}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 text-slate-800">
                    {p.recommended_policy_term} Years
                  </td>
                ))}
              </tr>

              {/* Product Category & Type */}
              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-600">Product Category</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 text-slate-700">
                    {p.product_type} ({p.variant})
                  </td>
                ))}
              </tr>

              {/* Coverage Shortfall */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600">Uncovered Gap</td>
                {products.map((p) => {
                  const shortfall = parseFloat(p.coverage_shortfall);
                  return (
                    <td key={p.product_id} className="py-3.5 px-4">
                      {shortfall > 0 ? (
                        <span className="text-amber-800 font-semibold">
                          {formatINRLakhCr(shortfall)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">✓ Fully Covered</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Key Features */}
              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.keyFeatures}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 space-y-1">
                    {p.key_benefits.slice(0, 3).map((b, i) => (
                      <div key={i} className="text-slate-700 flex items-start gap-1">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Key Limitations */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600">{t.recommendations.pointsToNote}</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-3.5 px-4 text-slate-500 text-[11px] leading-relaxed">
                    {p.key_limitations && p.key_limitations.length > 0
                      ? p.key_limitations[0]
                      : 'Standard regulatory restrictions apply.'}
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr className="bg-slate-50">
                <td className="py-4 px-4 font-semibold text-slate-600">Action</td>
                {products.map((p) => (
                  <td key={p.product_id} className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCustomize(p);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm cursor-pointer"
                    >
                      {t.recommendations.customizePlan}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
