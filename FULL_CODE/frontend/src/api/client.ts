/**
 * CoverWise API client — typed fetch wrapper.
 * Communicates with FastAPI backend via Vite /api proxy.
 * Supports HttpOnly session cookies, CSRF tokens, and Phase 4 advisory & RBAC.
 */

const API_BASE = '/api/v1';

let currentCsrfToken: string = '';

export function setCsrfToken(token: string) {
  currentCsrfToken = token;
}

export function getCsrfToken(): string {
  if (!currentCsrfToken) {
    // Check if coverwise_csrf cookie is readable
    const match = document.cookie.match(/coverwise_csrf=([^;]+)/);
    if (match) {
      currentCsrfToken = match[1];
    }
  }
  return currentCsrfToken;
}

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

// ── Auth Models ──

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'advisor' | 'admin';
  advisor_id?: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  csrf_token: string;
  message: string;
}

export interface SessionInfoResponse {
  user: User;
  csrf_token: string;
}

// ── Advisory & Booking Models ──

export interface AdvisorSummary {
  advisor_id: string;
  advisor_name: string;
  email: string;
  languages: string[];
  specialisations: string[];
  consultation_modes: string[];
  years_experience: number;
  rating: number;
  review_count: number;
  working_days: string;
  shift_start: string;
  shift_end: string;
  available_slot_count: number;
}

export interface AdvisorSlot {
  slot_id: string;
  advisor_id: string;
  slot_start: string;
  slot_end: string;
  status: string;
}

export interface Booking {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  slot_id: string;
  advisor_id: string;
  advisor_name?: string;
  consultation_mode: string;
  slot_start?: string;
  slot_end?: string;
  assessment_summary?: any;
  status: 'confirmed' | 'completed' | 'cancelled';
  advisor_notes?: string | null;
  created_at: string;
}

export interface AdminStats {
  total_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_advisors: number;
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  slot_utilization_pct: number;
  bookings_by_mode: Record<string, number>;
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
  const headers = new Headers(init?.headers || {});

  // Add CSRF token for mutating requests
  const method = (init?.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers.set('X-CSRF-Token', csrf);
    }
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers,
    credentials: 'include', // Transmits HttpOnly coverwise_session cookie
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const body = await response.json();
      if (body.error?.message) {
        errorDetail = body.error.message;
      } else if (body.detail) {
        errorDetail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      }
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

  // Auth endpoints
  auth: {
    register: (req: { email: string; password: string; full_name: string; phone?: string }) =>
      fetchJson<AuthResponse>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }).then((res) => {
        setCsrfToken(res.csrf_token);
        return res;
      }),
    login: (req: { email: string; password: string }) =>
      fetchJson<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }).then((res) => {
        setCsrfToken(res.csrf_token);
        return res;
      }),
    me: () =>
      fetchJson<SessionInfoResponse>('/auth/me').then((res) => {
        setCsrfToken(res.csrf_token);
        return res;
      }),
    logout: () =>
      fetchJson<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      }).then((res) => {
        setCsrfToken('');
        return res;
      }),
  },

  // Advisory endpoints
  advisors: {
    list: (params?: { language?: string; specialisation?: string; mode?: string; date?: string }) => {
      const sp = new URLSearchParams();
      if (params?.language) sp.set('language', params.language);
      if (params?.specialisation) sp.set('specialisation', params.specialisation);
      if (params?.mode) sp.set('mode', params.mode);
      if (params?.date) sp.set('date', params.date);
      const q = sp.toString();
      return fetchJson<AdvisorSummary[]>(`/advisors${q ? `?${q}` : ''}`);
    },
    get: (advisorId: string) => fetchJson<AdvisorSummary>(`/advisors/${advisorId}`),
    slots: (advisorId: string, params?: { date?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.date) sp.set('date', params.date);
      if (params?.status) sp.set('status', params.status);
      const q = sp.toString();
      return fetchJson<AdvisorSlot[]>(`/advisors/${advisorId}/slots${q ? `?${q}` : ''}`);
    },
  },

  // Customer Booking endpoints
  bookings: {
    create: (req: { slot_id: string; consultation_mode: string; assessment_summary?: any }) =>
      fetchJson<Booking>('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }),
    my: () => fetchJson<Booking[]>('/bookings/my'),
    cancel: (bookingId: string) =>
      fetchJson<Booking>(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
      }),
  },

  // Advisor Portal endpoints
  advisor: {
    consultations: () => fetchJson<Booking[]>('/advisor/consultations'),
    updateConsultation: (bookingId: string, req: { status?: string; advisor_notes?: string }) =>
      fetchJson<Booking>(`/advisor/consultations/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }),
  },

  // Admin Dashboard endpoints
  admin: {
    stats: () => fetchJson<AdminStats>('/admin/stats'),
    bookings: () => fetchJson<Booking[]>('/admin/bookings'),
  },

  // Needs Estimation
  estimate: (req: AssessmentRequest) =>
    fetchJson<AssessmentResponse>('/assessments/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }),

  // Phase 3 Product Recommendations & Pricing
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
