import React from 'react';
import { formatINRLakhCr } from '../../api/client';

interface CoverageShortfallVisualizerProps {
  recommendedGap: number;
  selectedCoverage: number;
  productName?: string;
}

export const CoverageShortfallVisualizer: React.FC<CoverageShortfallVisualizerProps> = ({
  recommendedGap,
  selectedCoverage,
  productName,
}) => {
  if (recommendedGap <= 0) return null;

  const coveragePct = Math.min(100, Math.round((selectedCoverage / recommendedGap) * 100));
  const shortfall = Math.max(0, recommendedGap - selectedCoverage);
  const isFullyCovered = shortfall === 0;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
            Coverage Gap Alignment
          </span>
          <h4 className="text-base font-bold text-slate-900">
            {productName ? `${productName} Protection Fit` : 'Assessment Need vs. Policy Cover'}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs">
            Need: <strong className="text-slate-900">{formatINRLakhCr(recommendedGap)}</strong>
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${isFullyCovered
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
          >
            {isFullyCovered ? '100% Covered' : `${coveragePct}% Covered`}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300 relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isFullyCovered
              ? 'bg-gradient-to-r from-teal-600 to-emerald-500'
              : 'bg-gradient-to-r from-teal-600 via-amber-500 to-amber-600'
            }`}
          style={{ width: `${coveragePct}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-600 mt-2">
        <span>Selected Cover: <strong className="text-teal-700">{formatINRLakhCr(selectedCoverage)}</strong></span>
        {shortfall > 0 ? (
          <span className="text-amber-800 font-medium">
            Remaining Shortfall: <strong>{formatINRLakhCr(shortfall)}</strong>
          </span>
        ) : (
          <span className="text-emerald-700 font-bold">✓ Zero Coverage Gap</span>
        )}
      </div>

      {shortfall > 0 && (
        <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-200 leading-relaxed">
          <span className="text-amber-700 font-semibold">Note:</span> This configuration leaves{' '}
          <strong className="text-slate-900">{formatINRLakhCr(shortfall)}</strong> of your calculated financial
          protection gap uncovered. Consider increasing sum assured or combining with a secondary pure term plan.
        </p>
      )}
    </div>
  );
};
