import { useState } from 'react';
import {
  type AssessmentResponse,
  formatINR,
  formatINRLakhCr,
} from '../../api/client';

interface AssessmentResultsProps {
  result: AssessmentResponse;
  onRecalculate: () => void;
  onTalkToAdvisor?: () => void;
}

export function AssessmentResults({
  result,
  onRecalculate,
  onTalkToAdvisor,
}: AssessmentResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'net_needs' | 'hlv' | 'assumptions'>('overview');
  const [showYearBreakdown, setShowYearBreakdown] = useState<boolean>(false);

  const { hlv, net_needs, recommended_gap_rounded, recommended_gap_exact, recommended_method, explanation, assumptions_used, warnings } = result;

  const isNetNeedsDriver = recommended_method === 'net_needs';
  const hasZeroGap = parseFloat(recommended_gap_rounded) <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-teal-600)]">
            Stage 2 · Assessment Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] font-[var(--font-heading)]">
            Your Family's Protection Need
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRecalculate}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            ✏ Adjust Inputs
          </button>
          {onTalkToAdvisor && (
            <button
              type="button"
              onClick={onTalkToAdvisor}
              className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
            >
              💬 Talk to Advisor
            </button>
          )}
        </div>
      </div>

      {/* Warnings & Advisories */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <span>⚠</span> Note regarding your profile:
          </div>
          {warnings.map((w, idx) => (
            <p key={idx} className="pl-4">• {w}</p>
          ))}
        </div>
      )}

      {/* Hero Recommendation Card */}
      <div className="bg-gradient-to-br from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--color-teal-500)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-[var(--color-teal-400)] backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-[var(--color-teal-400)] animate-pulse" />
              Recommended Life Insurance Coverage
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
                    {formatINRLakhCr(recommended_gap_rounded)}
                  </span>
                  <span className="text-xs text-slate-300">
                    ({formatINR(recommended_gap_rounded)})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Exact gap: {formatINR(recommended_gap_exact)} · Standardized up to nearest ₹5 Lakh multiple for market policies.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur max-w-xs border border-white/10 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Primary Engine Method:</span>
              <span className="text-[var(--color-gold-400)] font-bold uppercase">
                {isNetNeedsDriver ? 'Net Needs' : 'HLV'}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold gap-4 sm:gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Comparative Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('net_needs')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'net_needs'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Net Needs Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hlv')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'hlv'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Human Life Value (HLV)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assumptions')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'assumptions'
              ? 'border-[var(--color-teal-600)] text-[var(--color-teal-600)]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Assumptions & Policy
        </button>
      </div>

      {/* TAB 1: Comparative Analysis */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1: Net Needs Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                isNetNeedsDriver
                  ? 'bg-teal-50/40 border-[var(--color-teal-500)] shadow-md ring-1 ring-[var(--color-teal-500)]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
                  <span>🎯 Net Needs Approach</span>
                  {isNetNeedsDriver && (
                    <span className="text-[10px] bg-[var(--color-teal-600)] text-white px-2 py-0.5 rounded-full font-bold">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">Obligations-based</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Obligations Needed:</span>
                  <span className="font-semibold">{formatINR(net_needs.total_needs)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Living Expenses PV ({net_needs.dependency_horizon_years} yrs)</span>
                  <span>{formatINR(net_needs.pv_household_support)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Outstanding Debts</span>
                  <span>{formatINR(net_needs.outstanding_loans)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Inflated Goals PV</span>
                  <span>{formatINR(net_needs.pv_goals)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Emergency Buffer & Final</span>
                  <span>{formatINR(parseFloat(net_needs.final_expenses) + parseFloat(net_needs.emergency_buffer))}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>Less Total Resources:</span>
                  <span className="font-semibold">- {formatINR(net_needs.total_resources)}</span>
                </div>

                <div className="flex justify-between pt-2 font-bold text-base text-[var(--color-navy-900)]">
                  <span>Net Needs Protection Gap:</span>
                  <span className="text-[var(--color-teal-600)]">{formatINRLakhCr(net_needs.net_needs_gap)}</span>
                </div>
              </div>
            </div>

            {/* Method 2: HLV Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                !isNetNeedsDriver
                  ? 'bg-teal-50/40 border-[var(--color-teal-500)] shadow-md ring-1 ring-[var(--color-teal-500)]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
                  <span>📈 Human Life Value (HLV)</span>
                  {!isNetNeedsDriver && (
                    <span className="text-[10px] bg-[var(--color-teal-600)] text-white px-2 py-0.5 rounded-full font-bold">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">Income-replacement</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Gross Human Life Value:</span>
                  <span className="font-semibold">{formatINR(hlv.hlv_gross)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Remaining Earning Years</span>
                  <span>{hlv.remaining_earning_years} years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Annual Net Family Contribution</span>
                  <span>{formatINR(hlv.annual_income_contribution)}/yr</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-xs pl-3">
                  <span>• Discount vs Growth (PV Rate)</span>
                  <span>7.0% disc. / 6.0% growth</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>Less Existing Cover:</span>
                  <span className="font-semibold">- {formatINR(hlv.existing_cover)}</span>
                </div>

                <div className="flex justify-between pt-2 font-bold text-base text-[var(--color-navy-900)]">
                  <span>HLV Coverage Gap:</span>
                  <span className="text-[var(--color-teal-600)]">{formatINRLakhCr(hlv.hlv_coverage_gap)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-sm font-bold text-[var(--color-navy-900)] flex items-center gap-2">
              💡 Why CoverWise recommends the {isNetNeedsDriver ? 'Net Needs' : 'HLV'} Approach:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {explanation}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-2">
              <strong>Prudent Protection Rule:</strong> CoverWise calculates both international gold-standard methodologies and recommends the higher of the two so your family is never underinsured against either future income loss or specific liabilities and educational goals.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Net Needs Breakdown */}
      {activeTab === 'net_needs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-[var(--color-navy-900)] mb-1">
                Net Needs Detailed Itemization
              </h3>
              <p className="text-xs text-slate-500">
                How every rupee of your family's financial future is accounted for.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-500">Living Support Present Value</span>
                <div className="text-xl font-bold text-[var(--color-navy-900)] mt-1">
                  {formatINR(net_needs.pv_household_support)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Covers {net_needs.dependency_horizon_years} years until youngest dependent is independent, discounting for deceased member's personal share.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-500">Debt & Liability Payoff</span>
                <div className="text-xl font-bold text-[var(--color-navy-900)] mt-1">
                  {formatINR(net_needs.outstanding_loans)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ensures family home and vehicles are not liquidated by lenders.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-500">Milestone Goals (Discounted PV)</span>
                <div className="text-xl font-bold text-[var(--color-navy-900)] mt-1">
                  {formatINR(net_needs.pv_goals)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Children's higher education, marriages, and buffers inflated at custom rates.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-500">Emergency Buffer + Final Expenses</span>
                <div className="text-xl font-bold text-[var(--color-navy-900)] mt-1">
                  {formatINR(parseFloat(net_needs.final_expenses) + parseFloat(net_needs.emergency_buffer))}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  6 months living expenses reserve + immediate medical/funeral buffer.
                </p>
              </div>
            </div>

            {/* Goal details table */}
            {net_needs.goal_details && net_needs.goal_details.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Individual Goal Compounding & Discounting
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Goal</th>
                        <th className="p-2.5">Today Cost</th>
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Inflation</th>
                        <th className="p-2.5">Future Cost</th>
                        <th className="p-2.5 rounded-r-lg">Present Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {net_needs.goal_details.map((gd, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{gd.goal_type}</td>
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

      {/* TAB 3: HLV */}
      {activeTab === 'hlv' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-navy-900)] mb-1">
                  Human Life Value Projection
                </h3>
                <p className="text-xs text-slate-500">
                  Actuarial finite year-by-year income replacement value to age 60.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowYearBreakdown(!showYearBreakdown)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition"
              >
                {showYearBreakdown ? 'Hide Yearly Schedule' : 'Show Full Yearly Schedule'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Gross Human Life Value:</span>
                <div className="text-lg font-bold text-[var(--color-navy-900)] mt-0.5">
                  {formatINR(hlv.hlv_gross)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Remaining Earning Span:</span>
                <div className="text-lg font-bold text-[var(--color-navy-900)] mt-0.5">
                  {hlv.remaining_earning_years} years
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Annual Contribution:</span>
                <div className="text-lg font-bold text-[var(--color-navy-900)] mt-0.5">
                  {formatINR(hlv.annual_income_contribution)}
                </div>
              </div>
            </div>

            {showYearBreakdown && hlv.year_breakdown && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Year-by-Year Actuarial Schedule
                </h4>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2">Year</th>
                        <th className="p-2">Projected Income</th>
                        <th className="p-2">Net Family Share</th>
                        <th className="p-2">PV Discount Factor</th>
                        <th className="p-2">Present Value (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {hlv.year_breakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50">
                          <td className="p-2 font-sans font-medium">Year {row.year}</td>
                          <td className="p-2">{formatINR(row.projected_income)}</td>
                          <td className="p-2">{formatINR(row.contribution_after_consumption)}</td>
                          <td className="p-2 text-slate-500">{row.pv_factor}</td>
                          <td className="p-2 font-bold text-[var(--color-teal-600)]">{formatINR(row.present_value)}</td>
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

      {/* TAB 4: Assumptions & Policy */}
      {activeTab === 'assumptions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
          <h3 className="font-semibold text-lg text-[var(--color-navy-900)] mb-1">
            Actuarial Assumptions & Calculation Policy
          </h3>
          <p className="text-slate-500">
            CoverWise enforces strict, mathematically audited calculation rules documented in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">docs/CALCULATION_POLICY.md</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Retirement Age</span>
              <span className="text-slate-500">{assumptions_used.retirement_age} years old</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Self-Consumption Share</span>
              <span className="text-slate-500">{(parseFloat(assumptions_used.self_consumption_share) * 100).toFixed(0)}% (standard ICMR/actuarial benchmark)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Annual Income Growth Rate</span>
              <span className="text-slate-500">{(parseFloat(assumptions_used.income_growth_rate) * 100).toFixed(1)}% p.a.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Actuarial Discount Rate</span>
              <span className="text-slate-500">{(parseFloat(assumptions_used.discount_rate) * 100).toFixed(1)}% p.a.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">General Household Inflation</span>
              <span className="text-slate-500">{(parseFloat(assumptions_used.general_inflation_pct_pa) * 100).toFixed(1)}% p.a.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Higher Education Inflation</span>
              <span className="text-slate-500">{(parseFloat(assumptions_used.education_inflation_pct_pa) * 100).toFixed(1)}% p.a. (higher than general CPI)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Cover Standardization Multiplier</span>
              <span className="text-slate-500">Rounded up to nearest {formatINR(assumptions_used.cover_rounding_inr)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 block">Currency</span>
              <span className="text-slate-500">{result.currency} (Indian Rupee)</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps / CTA Section */}
      <div className="p-6 bg-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-sm text-[var(--color-navy-900)]">
            Ready to protect your family?
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 3 will match verified IRDAI term insurance products fitting your {formatINRLakhCr(recommended_gap_rounded)} coverage gap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRecalculate}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            ← Modify Inputs
          </button>
          <button
            type="button"
            onClick={() => alert(`Phase 3 Product Recommendation Engine will filter products matching ₹${parseFloat(recommended_gap_rounded).toLocaleString('en-IN')} sum assured!`)}
            className="bg-gradient-to-r from-[var(--color-teal-600)] to-[var(--color-teal-500)] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:from-[var(--color-teal-500)] hover:to-[var(--color-teal-400)] transition"
          >
            Explore Matching Plans →
          </button>
        </div>
      </div>
    </div>
  );
}
