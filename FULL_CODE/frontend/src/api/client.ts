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

// ── Phase 3: Product Recommendations & Pricing Models ──

export interface CustomerProfile {
  age: number;
  gender: 'male' | 'female';
  smoker_status: 'smoker' | 'non_smoker';
  annual_income_inr: number;
  is_homemaker?: boolean;
  spouse_annual_income_inr?: number;
  is_nri?: boolean;
  existing_individual_life_cover_inr?: number;
  existing_non_term_sa_inr?: number;
  children_ages?: number[];
  has_outstanding_loan?: boolean;
  preferred_policy_term_years?: number;
  monthly_premium_budget_inr?: number;
  risk_appetite?: 'low' | 'moderate' | 'high';
}

export interface RecommendationRequest {
  customer: CustomerProfile;
  recommended_gap_inr: number;
}

export interface SelectedRiderInput {
  rider_id: string;
  sum_assured?: number;
}

export interface PricingInput {
  product_id: string;
  sum_assured: number;
  entry_age: number;
  policy_term_years: number;
  gender?: 'male' | 'female';
  smoker_status?: 'smoker' | 'non_smoker';
  premium_payment_option?: string;
  premium_mode?: 'annual' | 'half_yearly' | 'quarterly' | 'monthly' | 'single';
  selected_riders?: SelectedRiderInput[];
  ulip_annual_premium?: number;
  ulip_sa_multiple?: number;
  ulip_fund_id?: string;
}

export interface RiderQuote {
  rider_id: string;
  rider_name: string;
  rider_category: string;
  rider_sa: string;
  annual_premium: string;
  instalment_premium: string;
  rate_used: string;
  smoker_multiplier_applied: string;
}

export interface PricingQuote {
  product_id: string;
  product_name: string;
  product_type: string;
  variant: string;
  sum_assured: string;
  policy_term_years: number;
  premium_payment_option: string;
  premium_paying_term_years: number;
  premium_mode: string;
  base_annual_premium: string;
  base_instalment_premium: string;
  rider_quotes: RiderQuote[];
  total_annual_premium: string;
  total_instalment_premium: string;
  modal_factor_used: string;
  sa_band_factor_used: string;
  rate_per_1000_used: string;
  is_ulip: boolean;
  warnings: string[];
}

export interface RecommendedProduct {
  rank: number;
  product_id: string;
  product_name: string;
  product_type: string;
  variant: string;
  category_label: string;
  composite_score: number;
  coverage_fit_score: number;
  affordability_score: number;
  type_fit_score: number;
  feature_fit_score: number;
  recommended_sum_assured: string;
  recommended_policy_term: number;
  coverage_shortfall: string;
  quote: PricingQuote;
  why_recommended: string;
  key_benefits: string[];
  key_limitations: string[];
  allowed_terms: number[];
  min_allowed_sa: string;
  max_allowed_sa: string;
  sum_assured_step: string;
  allowed_payment_options: string[];
  allowed_modes: string[];
  eligible_rider_ids: string[];
}

export interface RejectedProduct {
  product_id: string;
  product_name: string;
  product_type: string;
  variant: string;
  rejection_reasons: string[];
}

export interface RecommendationResult {
  recommended_coverage_gap: string;
  total_products_evaluated: number;
  eligible_count: number;
  ineligible_count: number;
  recommendations: RecommendedProduct[];
  rejected_products: RejectedProduct[];
  headline_explanation: string;
  disclaimer: string;
}

export interface RiderDetail {
  rider_id: string;
  rider_name: string;
  rider_category: string;
  benefit: string;
  available_on_product_ids: string;
  min_entry_age: number;
  max_entry_age: number;
  max_cover_age: number;
  min_rider_sa_inr: number | null;
  max_rider_sa_inr: number | null;
  max_rider_sa_pct_of_base_sa: number | null;
  rate_basis: string;
  smoker_multiplier: number;
  max_premium_pct_of_base_premium: number | null;
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
  // Phase 3 endpoints
  recommendations: (req: RecommendationRequest) =>
    fetchJson<RecommendationResult>('/products/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }),
  quote: (pricingIn: PricingInput) =>
    fetchJson<PricingQuote>('/products/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricingIn),
    }),
  riders: () => fetchJson<RiderDetail[]>('/products/riders/all'),
  productDetails: (productId: string) => fetchJson<any>(`/products/${productId}/details`),
};
