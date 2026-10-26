/**
 * CoverWise API client — typed fetch wrapper.
 * Communicates with FastAPI backend via Vite /api proxy.
 */

const API_BASE = '/api/v1';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: string;
}

export interface ProductSummary {
  product_id: string;
  product_name: string;
  product_type: string;
  variant: string;
  plain_language_summary: string;
  min_entry_age: number;
  max_entry_age: number;
  min_sum_assured_inr: number | null;
  max_sum_assured_inr: number | null;
  premium_payment_options: string;
  nri_eligible: boolean;
}

export interface AdvisorSummary {
  advisor_id: string;
  advisor_name: string;
  languages: string;
  specialisations: string;
  consultation_modes: string;
  years_experience: number;
  rating: number;
  review_count: number;
}

// ── Assessment Models ──

export interface DependentInput {
  relationship: 'spouse' | 'child' | 'parent';
  age: number;
  has_own_income?: boolean;
}

export interface GoalInput {
  goal_type: string;
  beneficiary: string;
  target_amount_today_inr: number;
  target_year: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface LoanInput {
  loan_type: string;
  outstanding_principal_inr: number;
}

export interface AssumptionsInput {
  retirement_age?: number;
  self_consumption_share?: number;
  income_growth_rate?: number;
  discount_rate?: number;
  general_inflation_pct_pa?: number;
  education_inflation_pct_pa?: number;
  household_expense_share_of_deceased_pct?: number;
  child_dependency_end_age?: number;
  life_expectancy_age?: number;
  emergency_fund_months?: number;
  final_expenses_inr?: number;
  cover_rounding_inr?: number;
  count_employer_group_cover?: boolean;
  count_retirement_savings?: boolean;
}

export interface AssessmentRequest {
  age: number;
  annual_income_inr: number;
  is_homemaker?: boolean;
  homemaker_services_value_annual_inr?: number;
  monthly_household_expenses_inr: number;
  dependents: DependentInput[];
  goals: GoalInput[];
  loans: LoanInput[];
  individual_life_cover_inr: number;
  employer_group_life_cover_inr?: number;
  liquid_savings_inr: number;
  market_investments_inr?: number;
  retirement_savings_inr?: number;
  current_year?: number;
  assumptions?: AssumptionsInput;
}

export interface HLVYearBreakdown {
  year: number;
  projected_income: string;
  contribution_after_consumption: string;
  pv_factor: string;
  present_value: string;
}

export interface HLVResponse {
  hlv_gross: string;
  existing_cover: string;
  hlv_coverage_gap: string;
  remaining_earning_years: number;
  annual_income_contribution: string;
  warnings: string[];
  year_breakdown: HLVYearBreakdown[];
}

export interface GoalDetailResponse {
  goal_type: string;
  beneficiary: string;
  target_amount_today_inr: string;
  target_year: number;
  years_to_goal: number;
  inflation_rate_used: string;
  future_cost: string;
  present_value: string;
  included: boolean;
  exclusion_reason: string | null;
}

export interface NetNeedsResponse {
  pv_household_support: string;
  dependency_horizon_years: number;
  outstanding_loans: string;
  pv_goals: string;
  final_expenses: string;
  emergency_buffer: string;
  total_needs: string;
  available_assets: string;
  existing_cover: string;
  total_resources: string;
  net_needs_gap: string;
  goal_details: GoalDetailResponse[];
  warnings: string[];
}

export interface AssessmentResponse {
  hlv: HLVResponse;
  net_needs: NetNeedsResponse;
  recommended_gap_exact: string;
  recommended_gap_rounded: string;
  recommended_method: string;
  explanation: string;
  assumptions_used: Record<string, any>;
  currency: string;
  warnings: string[];
}

// ── Helpers ──

export function formatINR(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

export function formatINRLakhCr(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return '₹0';
  const abs = Math.abs(num);
  if (abs >= 10_000_000) {
    const cr = num / 10_000_000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (abs >= 100_000) {
    const lakh = num / 100_000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, init);
  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const body = await response.json();
      if (body.detail) errorDetail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      // ignore
    }
    throw new Error(`API error (${response.status}): ${errorDetail}`);
  }
  return response.json();
}

export const api = {
  health: () => fetchJson<HealthResponse>('/health'),
  products: () => fetchJson<ProductSummary[]>('/products'),
  advisors: (params?: { language?: string; specialty?: string; mode?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.language) searchParams.set('language', params.language);
    if (params?.specialty) searchParams.set('specialty', params.specialty);
    if (params?.mode) searchParams.set('mode', params.mode);
    const query = searchParams.toString();
    return fetchJson<AdvisorSummary[]>(`/advisors${query ? `?${query}` : ''}`);
  },
  estimate: (req: AssessmentRequest) =>
    fetchJson<AssessmentResponse>('/assessments/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }),
};
