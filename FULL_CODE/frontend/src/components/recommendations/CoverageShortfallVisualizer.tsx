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
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
            Coverage Gap Alignment
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            {productName ? `${productName} Protection Fit` : 'Assessment Need vs. Policy Cover'}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Need: <strong className="text-white">{formatINRLakhCr(recommendedGap)}</strong>
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              isFullyCovered
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isFullyCovered ? '100% Covered' : `${coveragePct}% Covered`}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/60 relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isFullyCovered
              ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
              : 'bg-gradient-to-r from-teal-500 via-amber-400 to-amber-500'
          }`}
          style={{ width: `${coveragePct}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
        <span>Selected Cover: <strong className="text-teal-300">{formatINRLakhCr(selectedCoverage)}</strong></span>
        {shortfall > 0 ? (
          <span className="text-amber-400 font-medium">
            Remaining Shortfall: <strong>{formatINRLakhCr(shortfall)}</strong>
          </span>
        ) : (
          <span className="text-emerald-400 font-medium">✓ Zero Coverage Gap</span>
        )}
      </div>

      {shortfall > 0 && (
        <p className="text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-800/80 leading-relaxed">
          <span className="text-amber-300 font-semibold">Note:</span> This configuration leaves{' '}
          <strong className="text-white">{formatINRLakhCr(shortfall)}</strong> of your calculated financial
          protection gap uncovered. Consider increasing sum assured or combining with a secondary pure term plan.
        </p>
      )}
    </div>
  );
};
