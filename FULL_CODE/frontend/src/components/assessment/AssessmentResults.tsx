import { useState, useMemo } from 'react';
import {
  type AssessmentResponse,
  formatINR,
  formatINRLakhCr,
} from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeGoalType } from '../../i18n/localizeCatalog';
import { FinancialHelp } from '../education/FinancialHelp';

interface AssessmentResultsProps {
  result: AssessmentResponse;
  onRecalculate: () => void;
  onTalkToAdvisor?: () => void;
  onExplorePlans?: () => void;
}

export function AssessmentResults({
  result,
  onRecalculate,
  onTalkToAdvisor,
  onExplorePlans,
}: AssessmentResultsProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'net_needs' | 'hlv' | 'assumptions'>('overview');
  const [showYearBreakdown, setShowYearBreakdown] = useState<boolean>(false);

  const { hlv, net_needs, recommended_gap_rounded, recommended_method, assumptions_used, warnings } = result;

  const isNetNeedsDriver = recommended_method === 'net_needs';

  // Standardize HLV to nearest 5L
  const hlvRaw = parseFloat(hlv.hlv_coverage_gap) || 0;
  const hlvRounded = Math.max(0, Math.ceil(hlvRaw / 500000) * 500000);

  const netNeedsRaw = parseFloat(net_needs.net_needs_gap) || 0;
  const netNeedsRounded = Math.max(0, Math.ceil(netNeedsRaw / 500000) * 500000);

  // User selectable protection method: Option A (Complete Family & Loans) vs Option B (Salary Replacement)
  const [selectedMethod, setSelectedMethod] = useState<'net_needs' | 'hlv'>(
    isNetNeedsDriver ? 'net_needs' : 'hlv'
  );

  const effectiveGapRounded = selectedMethod === 'net_needs' ? (netNeedsRounded || parseFloat(recommended_gap_rounded)).toString() : (hlvRounded || hlvRaw).toString();
  const effectiveGapExact = selectedMethod === 'net_needs' ? net_needs.net_needs_gap : hlv.hlv_coverage_gap;
  const hasZeroGap = parseFloat(effectiveGapRounded) <= 0;

  // Deduplicate and transform warnings to friendly, plain-language text
  const cleanWarnings = useMemo(() => {
    if (!warnings || warnings.length === 0) return [];

    const seen = new Set<string>();
    const cleaned: { id: string; text: string; linkToAssumptions?: boolean }[] = [];

    warnings.forEach((w) => {
      const lower = w.toLowerCase();

      if (lower.includes('retirement savings') && (lower.includes('excluded') || lower.includes('count_retirement_savings'))) {
        if (!seen.has('retirement_excluded')) {
          seen.add('retirement_excluded');
          cleaned.push({
            id: 'retirement_excluded',
            text: (t.results as any).cleanWarningRetirement || "Your retirement savings were not deducted from your family's insurance needs because these funds may be intended for your retirement. You can review this assumption in Expert Mode.",
            linkToAssumptions: true,
          });
        }
      } else if (lower.includes('employer group cover') || lower.includes('employer-provided')) {
        if (!seen.has('employer_cover')) {
          seen.add('employer_cover');
          cleaned.push({
            id: 'employer_cover',
            text: (t.results as any).cleanWarningEmployer || 'Your employer-provided life insurance has been included in this estimate. Keep in mind that this cover may end when you leave your job.',
            linkToAssumptions: true,
          });
        }
      } else {
        const sanitized = w.replace(/count_[a-z_]+/g, 'assumptions').trim();
        const normKey = sanitized.toLowerCase();
        if (!seen.has(normKey)) {
          seen.add(normKey);
          cleaned.push({
            id: normKey,
            text: sanitized,
          });
        }
      }
    });

    return cleaned;
  }, [warnings, t]);

  const handleProceedToPlans = () => {
    // Carry user's selected method & amount forward into recommendations
    result.recommended_method = selectedMethod;
    result.recommended_gap_rounded = effectiveGapRounded;
    result.recommended_gap_exact = effectiveGapExact;
    if (onExplorePlans) {
      onExplorePlans();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Top Header — Stage 2 Heading Centered, Big, Bold, and Black */}
      <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-200 gap-3">
        <div className="inline-flex items-center gap-2.5 sm:gap-3 px-4 py-2 bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-teal-500/40 rounded-2xl shadow-xs">
          <span className="bg-teal-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-2xs">
            Stage 2
          </span>
          <span className="text-black font-black text-sm sm:text-base tracking-tight">
            {(t.results as any).stagePill?.replace(/Stage 2\s*[·•-]?\s*/i, '') || 'Coverage Needs Analysis'}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black font-[var(--font-heading)] tracking-tight">
          {t.results.title}
        </h2>

        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={onRecalculate}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t.results.recalculateBtn}
          </button>
          {onTalkToAdvisor && (
            <button
              type="button"
              onClick={onTalkToAdvisor}
              className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              {t.results.talkToAdvisorBtn}
            </button>
          )}
        </div>
      </div>

      {/* Cleaned Warnings & Explanatory Notes */}
      {cleanWarnings.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-900 space-y-2.5 shadow-sm">
          <div className="font-bold flex items-center gap-2 text-amber-950 text-sm">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">ℹ</span>
            {(t.results as any).cleanWarningsTitle || 'Important things to know about your estimate'}
          </div>
          <div className="space-y-2 pl-7">
            {cleanWarnings.map((item) => (
              <div key={item.id} className="leading-relaxed flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <div>
                  <span>{item.text}</span>
                  {item.linkToAssumptions && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('assumptions')}
                      className="ml-2 text-teal-700 hover:text-teal-900 underline font-medium inline-block cursor-pointer"
                    >
                      View calculation rules →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Recommendation Card (Dark Blue Box) */}
      <div className="bg-gradient-to-br from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--color-teal-500)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-[var(--color-teal-400)] backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-[var(--color-teal-400)] animate-pulse" />
              <span>Recommended Life Cover Amount</span>
              <FinancialHelp termId="recommended_cover" />
            </div>

            {hasZeroGap ? (
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[var(--color-teal-400)] font-[var(--font-heading)]">
                  Fully Protected!
                </div>
                <p className="text-sm text-slate-300 mt-2 max-w-lg">
                  Your existing life cover and available liquid assets are sufficient to cover your calculated obligations. No additional term cover is required at this time.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--color-teal-400)] font-[var(--font-heading)]">
                    {formatINRLakhCr(effectiveGapRounded)}
                  </span>
                  <span className="text-xs text-slate-300">
                    ({formatINR(effectiveGapRounded)})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Exact gap: {formatINR(effectiveGapExact)} · Standardized up to nearest ₹5 Lakh multiple for market policies.
                </p>
              </div>
            )}
          </div>

          {/* User-Friendly Plain English Explanation Box */}
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur border border-white/15 text-xs space-y-1.5 max-w-sm">
            <div className="font-bold text-white text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>💡</span>
                <span>Why this amount?</span>
              </span>
              <span className="font-bold text-teal-300 text-[11px] bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-400/30">
                {selectedMethod === 'net_needs' ? 'Family & Loans' : 'Salary Replacement'}
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">
              {selectedMethod === 'net_needs'
                ? `Clears 100% of your bank loans and covers family grocery & education costs.`
                : `Guarantees your monthly paycheck reaches your family until retirement.`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs — Simplified in Everyday Language */}
      <div className="flex border-b border-slate-200 text-sm font-semibold gap-3 sm:gap-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Choose Your Protection
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('net_needs')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'net_needs'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          2. Family Expenses & Loans
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hlv')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'hlv'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          3. Salary Replacement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assumptions')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'assumptions'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          4. How We Calculated This
        </button>
      </div>

      {/* TAB 1: Compare Both Options (Selectable Cards & Key Differences) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Choose Which Protection Method Fits Your Family Best:
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click either option below to select your desired coverage amount for Stage 3 plans.
              </p>
            </div>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-semibold hidden sm:inline">
              ✓ Click a card to switch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option A: Complete Family & Debt Protection */}
            <div
              onClick={() => setSelectedMethod('net_needs')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'net_needs'
                  ? 'bg-gradient-to-br from-teal-50/90 to-cyan-50/50 border-teal-500 shadow-md ring-2 ring-teal-500/15'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                      <span>Option A: Complete Family & Loan Payoff</span>
                      <FinancialHelp termId="net_needs" />
                    </h4>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Clears loans + covers daily living & college funds
                    </span>
                  </div>

                  {isNetNeedsDriver && (
                    <span className="text-[10px] bg-teal-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 shadow-2xs">
                      ★ RECOMMENDED
                    </span>
                  )}
                </div>

                {/* Short Tagline */}
                <div className="py-2 px-3 bg-teal-100/60 rounded-xl border border-teal-200/80 text-xs text-teal-950 font-medium leading-relaxed">
                  🛡️ <strong>Why this is better:</strong> Clears 100% of bank loans on Day 1 and fully protects daily living costs.
                </div>

                {/* Reduced Clean Numbers */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                    <span>Total Family Expenses & Loans:</span>
                    <span className="font-semibold text-slate-900">{formatINR(net_needs.total_needs)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>Minus Current Savings & Insurance:</span>
                    <span className="font-semibold">- {formatINR(net_needs.total_resources)}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
                    <span>Recommended Cover:</span>
                    <span className="text-teal-700 text-lg font-black">{formatINRLakhCr(netNeedsRounded || net_needs.net_needs_gap)}</span>
                  </div>
                </div>
              </div>

              {/* Selection Button */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Standardized policy:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMethod('net_needs');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'net_needs'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {selectedMethod === 'net_needs' ? '✓ Selected' : 'Choose This'}
                </button>
              </div>
            </div>

            {/* Option B: Future Salary Replacement */}
            <div
              onClick={() => setSelectedMethod('hlv')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'hlv'
                  ? 'bg-gradient-to-br from-teal-50/90 to-cyan-50/50 border-teal-500 shadow-md ring-2 ring-teal-500/15'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                      <span>Option B: Future Salary Replacement</span>
                      <FinancialHelp termId="hlv" />
                    </h4>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Replaces your monthly paycheck until retirement age 60
                    </span>
                  </div>

                  {!isNetNeedsDriver && (
                    <span className="text-[10px] bg-teal-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 shadow-2xs">
                      ★ RECOMMENDED
                    </span>
                  )}
                </div>

                {/* Short Tagline */}
                <div className="py-2 px-3 bg-teal-100/60 rounded-xl border border-teal-200/80 text-xs text-teal-950 font-medium leading-relaxed">
                  💼 <strong>Why this is better:</strong> Guarantees your exact monthly paycheck continues to reach your family until retirement.
                </div>

                {/* Reduced Clean Numbers */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                    <span>Future Earnings for Family ({hlv.remaining_earning_years} yrs):</span>
                    <span className="font-semibold text-slate-900">{formatINR(hlv.hlv_gross)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>Minus Current Insurance:</span>
                    <span className="font-semibold">- {formatINR(hlv.existing_cover)}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
                    <span>Recommended Cover:</span>
                    <span className="text-teal-700 text-lg font-black">{formatINRLakhCr(hlvRounded || hlv.hlv_coverage_gap)}</span>
                  </div>
                </div>
              </div>

              {/* Selection Button */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Standardized policy:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMethod('hlv');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'hlv'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {selectedMethod === 'hlv' ? '✓ Selected' : 'Choose This'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Family Expense & Loan Breakdown */}
      {activeTab === 'net_needs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-xs">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                Family Expenses & Loan Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                How every rupee of your family's future living costs, loans, and education is calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-xs font-semibold text-slate-600">Household Living & Daily Grocery Fund</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatINR(net_needs.pv_household_support)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Guarantees monthly grocery and living costs for {net_needs.dependency_horizon_years} years until your youngest dependent is financially independent.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-xs font-semibold text-slate-600">100% Bank Loan Clearance Fund</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatINR(net_needs.outstanding_loans)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ensures all home, car, or personal loans are paid off immediately so your family keeps their home 100% debt-free.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-xs font-semibold text-slate-600">Children's Higher Education Fund</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatINR(net_needs.pv_goals)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Includes extra money for rising college fees so your children's education is 100% secured.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-xs font-semibold text-slate-600">Emergency Cash Cushion</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatINR(parseFloat(net_needs.final_expenses) + parseFloat(net_needs.emergency_buffer))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Provides 6 months of instant cash for medical emergencies and immediate family expenses.
                </p>
              </div>
            </div>

            {/* Goal details table */}
            {net_needs.goal_details && net_needs.goal_details.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Children's Future College & Family Milestone Needs
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Goal</th>
                        <th className="p-2.5">Today Cost</th>
                        <th className="p-2.5">When Needed</th>
                        <th className="p-2.5">Expected Price Rise</th>
                        <th className="p-2.5">Estimated Future Cost</th>
                        <th className="p-2.5 rounded-r-lg">Money Set Aside Today</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {net_needs.goal_details.map((gd, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{localizeGoalType(gd.goal_type, language)}</td>
                          <td className="p-2.5">{formatINR(gd.target_amount_today_inr)}</td>
                          <td className="p-2.5">{gd.target_year} ({gd.years_to_goal} yrs)</td>
                          <td className="p-2.5 font-mono">{(parseFloat(gd.inflation_rate_used) * 100).toFixed(1)}%</td>
                          <td className="p-2.5 font-medium text-amber-700">{formatINR(gd.future_cost)}</td>
                          <td className="p-2.5 font-bold text-[var(--color-teal-600)]">{formatINR(gd.present_value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Salary Replacement Calculation */}
      {activeTab === 'hlv' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  Future Salary Replacement Calculation
                </h3>
                <p className="text-xs text-slate-500">
                  Calculates how much salary you will bring home to your family until retirement age (60).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowYearBreakdown(!showYearBreakdown)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
              >
                {showYearBreakdown ? 'Hide Yearly Schedule' : 'Show Full Yearly Schedule'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 font-medium">Total Lifetime Income Brought Home:</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatINR(hlv.hlv_gross)}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 font-medium">Working Years Left Until Retirement:</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {hlv.remaining_earning_years} years
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 font-medium">Yearly Family Support from Salary:</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatINR(hlv.annual_income_contribution)}/yr
                </div>
              </div>
            </div>

            {/* Yearly schedule table */}
            {showYearBreakdown && hlv.year_breakdown && (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5">Projected Salary</th>
                      <th className="p-2.5">Family Take-Home Share</th>
                      <th className="p-2.5">Bank Return Multiplier</th>
                      <th className="p-2.5">Equivalent Value Today</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hlv.year_breakdown.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">Year {row.year}</td>
                        <td className="p-2.5">{formatINR(row.projected_income)}</td>
                        <td className="p-2.5 font-medium">{formatINR(row.contribution_after_consumption)}</td>
                        <td className="p-2.5 text-slate-400 font-mono">{parseFloat(row.pv_factor).toFixed(4)}</td>
                        <td className="p-2.5 font-bold text-[var(--color-teal-600)]">{formatINR(row.present_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: How We Calculated This — 100% Plain Everyday English for Everyone */}
      {activeTab === 'assumptions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xs">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <span>🧮</span>
              <span>How We Calculated Your Family's Protection</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              To make sure your family never faces any shortage of money in the future, we used these 6 simple, realistic points:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* 1. Working Age */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎂</span>
                <span className="font-bold text-slate-900 text-sm">Until What Age You Work</span>
              </div>
              <div className="text-base font-black text-teal-700">
                Age {assumptions_used.retirement_age} (60 Years)
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                We calculate your family's financial security for all the earning years left until you reach 60.
              </p>
            </div>

            {/* 2. Salary Growth */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <span className="font-bold text-slate-900 text-sm">Yearly Salary Growth</span>
              </div>
              <div className="text-base font-black text-teal-700">
                +{(parseFloat(assumptions_used.income_growth_rate) * 100).toFixed(0)}% every year
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                We assume your income will gradually increase each year as you gain more job experience.
              </p>
            </div>

            {/* 3. Bank Interest on Payout */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <span className="font-bold text-slate-900 text-sm">Bank Deposit Interest</span>
              </div>
              <div className="text-base font-black text-teal-700">
                {(parseFloat(assumptions_used.discount_rate) * 100).toFixed(0)}% safe bank return
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                If your family puts the claim money in a safe bank fixed deposit, it earns monthly interest for house costs.
              </p>
            </div>

            {/* 4. Grocery Price Rise */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛒</span>
                <span className="font-bold text-slate-900 text-sm">Grocery & Living Cost Rise</span>
              </div>
              <div className="text-base font-black text-teal-700">
                {(parseFloat(assumptions_used.general_inflation_pct_pa) * 100).toFixed(1)}% price rise per year
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Daily food, milk, and grocery prices rise over time, so we added extra funds so your family never cuts costs.
              </p>
            </div>

            {/* 5. College Fees Rise */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="font-bold text-slate-900 text-sm">School & College Fee Rise</span>
              </div>
              <div className="text-base font-black text-teal-700">
                {(parseFloat(assumptions_used.education_inflation_pct_pa) * 100).toFixed(0)}% fee rise per year
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                College tuition and coaching fees rise fast, so we made sure college funds are 100% secured.
              </p>
            </div>

            {/* 6. Round Figure for Policy */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 hover:bg-teal-50/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span className="font-bold text-slate-900 text-sm">Neat Round Policy Figure</span>
              </div>
              <div className="text-base font-black text-teal-700">
                Rounded up by {formatINR(assumptions_used.cover_rounding_inr)}
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Insurance policies are sold in clean round multiples (like ₹1.90 Cr instead of odd numbers) for easy buying.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps / CTA Section */}
      <div className="p-6 bg-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[var(--color-navy-900)]">
            Ready to protect your family?
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Explore verified IRDAI term insurance products fitting your <strong>{formatINRLakhCr(effectiveGapRounded)}</strong> chosen coverage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRecalculate}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            ← Recalculate
          </button>
          <button
            type="button"
            onClick={handleProceedToPlans}
            className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:from-teal-500 hover:to-teal-400 transition cursor-pointer"
          >
            Explore & Customize Plans ({formatINRLakhCr(effectiveGapRounded)}) →
          </button>
        </div>
      </div>
    </div>
  );
}
