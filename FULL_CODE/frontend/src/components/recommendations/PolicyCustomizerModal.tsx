import React, { useState, useEffect, useRef } from 'react';
import {
  api,
  formatINR,
  formatINRLakhCr,
  type CustomerProfile,
  type PricingInput,
  type PricingQuote,
  type RecommendedProduct,
  type RiderDetail,
  type SelectedPlan,
  type SelectedPlanRider,
} from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import { CoverageShortfallVisualizer } from './CoverageShortfallVisualizer';
import { FinancialHelp } from '../education/FinancialHelp';

interface RiderInfo {
  icon: string;
  friendlyName: string;
  badge: string;
  shortDescription: string;
  whyNeeded: string;
}

const getRiderInfo = (
  riderId: string,
  rawName: string,
  benefitText: string,
  rateBasis: string
): RiderInfo => {
  const normId = (riderId || '').toUpperCase();
  const lowerName = (rawName || '').toLowerCase();

  if (normId === 'RDR-LUR23D' || lowerName.includes('accidental death')) {
    return {
      icon: '🚗',
      friendlyName: 'Accidental Death Protection',
      badge: '2x Extra Payout',
      shortDescription:
        'Pays an additional 100% lump-sum cash directly to your family if death occurs due to an accident.',
      whyNeeded: 'Doubles family payout on road or workplace accidents',
    };
  }

  if (normId === 'RDR-GRH8AS' || lowerName.includes('critical illness')) {
    return {
      icon: '🩺',
      friendlyName: 'Critical Illness Protection',
      badge: '20 Major Illnesses',
      shortDescription:
        'Pays immediate cash upon diagnosis of 20 severe medical illnesses (cancer, heart attack, stroke).',
      whyNeeded: 'Provides instant cash for emergency hospital treatment',
    };
  }

  if (normId === 'RDR-I0Q2E6' || lowerName.includes('disability')) {
    return {
      icon: '♿',
      friendlyName: 'Accidental Disability Protection',
      badge: 'Income Shield',
      shortDescription:
        'Provides guaranteed cash support and monthly income replacement if an accident causes permanent disability.',
      whyNeeded: 'Protects your family if you are unable to earn an income',
    };
  }

  if (
    normId === 'RDR-XBHTE9' ||
    lowerName.includes('waiver of premium') ||
    lowerName.includes('wop')
  ) {
    return {
      icon: '🛡️',
      friendlyName: 'Waiver of Premium (WOP)',
      badge: 'Zero Premium Burden',
      shortDescription:
        'If you suffer disability or serious illness, all future premiums are waived for free while your full life cover stays 100% active.',
      whyNeeded: 'Keeps family life cover active even if you cannot pay premiums',
    };
  }

  if (normId === 'RDR-ZG7SVA' || lowerName.includes('terminal illness')) {
    return {
      icon: '🏥',
      friendlyName: 'Terminal Illness Benefit (Built-in)',
      badge: 'Included Free',
      shortDescription:
        'Pays the life cover amount early in advance if diagnosed with a certified terminal illness.',
      whyNeeded: 'Pre-included at no extra charge in this plan',
    };
  }

  const cleanTitle = rawName
    .replace(/^saffron life\s*/i, '')
    .replace(/rider/i, '')
    .trim();
  return {
    icon: '✨',
    friendlyName: cleanTitle || 'Additional Protection Rider',
    badge: rateBasis === 'included_free' ? 'Included Free' : 'Optional Add-on',
    shortDescription:
      benefitText.length > 95 ? benefitText.slice(0, 95) + '...' : benefitText,
    whyNeeded: 'Extra financial cushion for unexpected events',
  };
};

interface PolicyCustomizerModalProps {
  product: RecommendedProduct;
  customer: CustomerProfile;
  recommendedGap: number;
  onClose: () => void;
  onSelectPlan?: (selectedPlan: SelectedPlan) => void;
  allRiders: RiderDetail[];
}

export const PolicyCustomizerModal: React.FC<PolicyCustomizerModalProps> = ({
  product,
  customer,
  recommendedGap,
  onClose,
  onSelectPlan,
  allRiders,
}) => {
  const { t } = useLanguage();
  // Parsing bounds
  const minSa = Math.max(parseFloat(product.min_allowed_sa) || 500000, 100000);
  const maxSa = Math.max(parseFloat(product.max_allowed_sa) || 100000000, minSa);
  const saStep = Math.max(parseFloat(product.sum_assured_step) || 500000, 50000);

  // Initial state from recommended values
  const [sumAssured, setSumAssured] = useState<number>(
    parseFloat(product.recommended_sum_assured) || minSa
  );
  const [policyTerm, setPolicyTerm] = useState<number>(
    product.recommended_policy_term || (product.allowed_terms[0] ?? 20)
  );
  const [paymentMode, setPaymentMode] = useState<
    'annual' | 'half_yearly' | 'quarterly' | 'monthly'
  >((product.quote.premium_mode as any) || 'monthly');
  const [paymentOption, setPaymentOption] = useState<string>(
    product.quote.premium_payment_option || 'regular'
  );

  // Selected riders state: map of rider_id -> boolean & rider_id -> sum_assured
  const [selectedRiders, setSelectedRiders] = useState<{ [riderId: string]: boolean }>({});
  const [riderSumAssureds, setRiderSumAssureds] = useState<{ [riderId: string]: number }>({});

  // ULIP specific state
  const isUlip = product.product_type === 'ULIP';
  const [ulipAnnualPremium, setUlipAnnualPremium] = useState<number>(50000);
  const [ulipSaMultiple, setUlipSaMultiple] = useState<number>(10);
  const [ulipFundId, setUlipFundId] = useState<string>('FND-RDC0W3');

  // Live calculated quote state
  const [liveQuote, setLiveQuote] = useState<PricingQuote>(product.quote);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Filter riders eligible for this product
  const productRiders = allRiders.filter((r) =>
    product.eligible_rider_ids.includes(r.rider_id)
  );

  // Debounced API quote recalculation
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsCalculating(true);
      setCalcError(null);

      // Build active rider selections
      const riderPayload = Object.entries(selectedRiders)
        .filter(([, active]) => active)
        .map(([riderId]) => {
          const customSa = riderSumAssureds[riderId];
          return {
            rider_id: riderId,
            ...(customSa ? { sum_assured: customSa } : {}),
          };
        });

      const pricingIn: PricingInput = {
        product_id: product.product_id,
        sum_assured: isUlip ? ulipAnnualPremium * ulipSaMultiple : sumAssured,
        entry_age: customer.age,
        policy_term_years: policyTerm,
        gender: customer.gender,
        smoker_status: customer.smoker_status,
        premium_payment_option: paymentOption,
        premium_mode: paymentMode,
        selected_riders: riderPayload,
        ...(isUlip
          ? {
              ulip_annual_premium: ulipAnnualPremium,
              ulip_sa_multiple: ulipSaMultiple,
              ulip_fund_id: ulipFundId,
            }
          : {}),
      };

      try {
        const resultQuote = await api.quote(pricingIn);
        setLiveQuote(resultQuote);
      } catch (err: any) {
        setCalcError(err?.message || 'Failed to calculate quote for selected combination.');
      } finally {
        setIsCalculating(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [
    sumAssured,
    policyTerm,
    paymentMode,
    paymentOption,
    selectedRiders,
    riderSumAssureds,
    ulipAnnualPremium,
    ulipSaMultiple,
    ulipFundId,
    customer,
    product.product_id,
    isUlip,
  ]);

  const toggleRider = (riderId: string, defaultMaxSa?: number | null) => {
    setSelectedRiders((prev) => {
      const nextActive = !prev[riderId];
      if (nextActive && !riderSumAssureds[riderId]) {
        const defaultSa = Math.min(sumAssured * 0.5, defaultMaxSa || 5000000);
        setRiderSumAssureds((saPrev) => ({ ...saPrev, [riderId]: defaultSa }));
      }
      return { ...prev, [riderId]: nextActive };
    });
  };

  const currentCover = isUlip ? ulipAnnualPremium * ulipSaMultiple : sumAssured;
  const remainingShortfall = Math.max(0, recommendedGap - currentCover);

  const handleSelectPlan = () => {
    if (!liveQuote || isCalculating || calcError) return;

    const chosenRiders: SelectedPlanRider[] = (liveQuote.rider_quotes || []).map((rq) => ({
      rider_id: rq.rider_id,
      rider_name: rq.rider_name,
      rider_sa: parseFloat(rq.rider_sa) || 0,
      annual_premium: rq.annual_premium,
      instalment_premium: rq.instalment_premium,
    }));

    const plan: SelectedPlan = {
      product_id: product.product_id,
      product_name: product.product_name,
      product_type: product.product_type,
      variant: product.variant,
      sum_assured: currentCover,
      policy_term_years: policyTerm,
      premium_mode: paymentMode,
      riders: chosenRiders,
      ulip_config: isUlip ? { fund_id: ulipFundId, annual_premium: ulipAnnualPremium } : undefined,
      quote: liveQuote,
      total_annual_premium: liveQuote.total_annual_premium,
      total_instalment_premium: liveQuote.total_instalment_premium,
      recommended_gap_inr: recommendedGap,
      remaining_shortfall_inr: remainingShortfall,
    };

    if (onSelectPlan) {
      onSelectPlan(plan);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 max-h-[94vh] flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[var(--color-navy-900)] border-b border-slate-800 flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase tracking-wider">
                {product.category_label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {product.product_id}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Customize: {product.product_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            aria-label="Close customizer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - 2 Column Layout */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Coverage Shortfall Alignment Component */}
            <CoverageShortfallVisualizer
              recommendedGap={recommendedGap}
              selectedCoverage={currentCover}
              productName={product.product_name}
            />

            {/* Sum Assured Slider (Non-ULIP) */}
            {!isUlip && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase font-bold tracking-wider text-slate-700 flex items-center">
                    <span>{t.recommendations.sumAssured}</span>
                    <FinancialHelp termId="sum_assured" />
                  </label>
                  <span className="text-base font-extrabold text-teal-700">
                    {formatINRLakhCr(sumAssured)}
                  </span>
                </div>

                <input
                  type="range"
                  min={minSa}
                  max={maxSa}
                  step={saStep}
                  value={sumAssured}
                  onChange={(e) => setSumAssured(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />

                <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Min: {formatINRLakhCr(minSa)}</span>
                  <span>Step: {formatINRLakhCr(saStep)}</span>
                  <span>Max: {formatINRLakhCr(maxSa)}</span>
                </div>
              </div>
            )}

            {/* ULIP Parameters */}
            {isUlip && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-700">
                      Annual Investment Premium
                    </label>
                    <span className="text-base font-extrabold text-teal-700">
                      {formatINR(ulipAnnualPremium)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24000}
                    max={500000}
                    step={10000}
                    value={ulipAnnualPremium}
                    onChange={(e) => setUlipAnnualPremium(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                      SA Multiple
                    </label>
                    <select
                      value={ulipSaMultiple}
                      onChange={(e) => setUlipSaMultiple(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 outline-none"
                    >
                      <option value={7}>7x (₹{formatINR(ulipAnnualPremium * 7)})</option>
                      <option value={10}>10x (₹{formatINR(ulipAnnualPremium * 10)})</option>
                      <option value={15}>15x (₹{formatINR(ulipAnnualPremium * 15)})</option>
                      <option value={20}>20x (₹{formatINR(ulipAnnualPremium * 20)})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                      Target Fund
                    </label>
                    <select
                      value={ulipFundId}
                      onChange={(e) => setUlipFundId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 outline-none"
                    >
                      <option value="FND-VNJ5TV">Equity Fund (High Risk)</option>
                      <option value="FND-RDC0W3">Balanced Fund (Moderate)</option>
                      <option value="FND-3HXCTH">Bond Fund (Conservative)</option>
                      <option value="FND-4PH7ER">Money Market (Low Risk)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Policy Tenure */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-wider text-slate-700 flex items-center">
                  <span>{t.recommendations.policyTerm}</span>
                  <FinancialHelp termId="policy_tenure" />
                </label>
                <span className="text-sm font-bold text-slate-900">
                  {policyTerm} Years (Matures at age {customer.age + policyTerm})
                </span>
              </div>

              {product.allowed_terms && product.allowed_terms.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.allowed_terms.map((term) => (
                    <button
                      type="button"
                      key={term}
                      onClick={() => setPolicyTerm(term)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        policyTerm === term
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {term} Yrs
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={policyTerm}
                  onChange={(e) => setPolicyTerm(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
              )}
            </div>

            {/* Premium Payment Option */}
            {product.allowed_payment_options && product.allowed_payment_options.length > 1 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
                  Payment Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.allowed_payment_options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setPaymentOption(opt)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                        paymentOption === opt
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Frequency */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
                {t.recommendations.premiumFrequency}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['monthly', 'quarterly', 'half_yearly', 'annual'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      paymentMode === mode
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Riders Selection — Fully Responsive across Mobile, Tablet, Laptop */}
            {productRiders.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <label className="text-xs sm:text-sm uppercase font-black tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>🛡️ Extra Protection Riders (Add-ons)</span>
                      <FinancialHelp termId="riders" />
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Strengthen your base cover against unexpected accidents, major illnesses, or disability.
                    </p>
                  </div>
                  <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200 shrink-0 self-start sm:self-auto shadow-2xs">
                    {Object.values(selectedRiders).filter(Boolean).length} Active Add-on{Object.values(selectedRiders).filter(Boolean).length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Grid: 1 col on mobile, 2 cols on tablet and laptop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {productRiders.map((rider) => {
                    const isBuiltIn = rider.rate_basis === 'included_free';
                    const isChecked = isBuiltIn || !!selectedRiders[rider.rider_id];
                    const info = getRiderInfo(rider.rider_id, rider.rider_name, rider.benefit, rider.rate_basis);
                    const activeSa = riderSumAssureds[rider.rider_id] || Math.min(sumAssured * 0.5, rider.max_rider_sa_inr || 5000000);
                    const riderQuote = liveQuote?.rider_quotes?.find((rq) => rq.rider_id === rider.rider_id);

                    return (
                      <div
                        key={rider.rider_id}
                        onClick={() => {
                          if (!isBuiltIn) {
                            toggleRider(rider.rider_id, rider.max_rider_sa_inr);
                          }
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                          isBuiltIn
                            ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs cursor-default'
                            : isChecked
                            ? 'bg-gradient-to-br from-teal-50/90 to-cyan-50/60 border-teal-500 shadow-md ring-2 ring-teal-500/15 cursor-pointer'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs cursor-pointer'
                        }`}
                      >
                        {/* Top: Large Touch-friendly Checkbox + Clear Bold Heading + Category Badge */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            {/* Custom Touch-Friendly Checkbox */}
                            <div className="pt-0.5 shrink-0">
                              {isBuiltIn ? (
                                <div
                                  title="Pre-included free in base policy"
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs"
                                >
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div
                                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                                      : 'bg-white border-slate-300 hover:border-teal-500'
                                  }`}
                                >
                                  {isChecked && (
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Heading & Badge */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                  <span>{info.icon}</span>
                                  <span>{info.friendlyName}</span>
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                    isBuiltIn
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : isChecked
                                      ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {info.badge}
                                </span>
                              </div>

                              {/* Plain Language Short Description */}
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                {info.shortDescription}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Bar: Status, Cover Amount, and Live Added Cost */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
                          <div>
                            {isBuiltIn ? (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                ✓ Pre-included for Free
                              </span>
                            ) : isChecked ? (
                              <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                                ✓ Added to Plan
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Click to add
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* If checked and has customizable SA */}
                            {isChecked && rider.rate_basis === 'per_1000_rider_sa' && (
                              <span className="text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                Cover: <strong className="text-teal-700">{formatINRLakhCr(activeSa)}</strong>
                              </span>
                            )}

                            {/* Added premium if quoted */}
                            {isChecked && riderQuote && parseFloat(riderQuote.instalment_premium) > 0 && (
                              <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-200">
                                +{formatINR(riderQuote.instalment_premium)}/{paymentMode === 'annual' ? 'yr' : 'mo'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Recalculated Premium Quote */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative">
              {/* Spinner overlay during debounced quote calculation */}
              {isCalculating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-teal-700 text-xs font-bold">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Recalculating official quote...</span>
                  </div>
                </div>
              )}

              <div className="text-xs uppercase font-bold tracking-wider text-teal-700 mb-1">
                Live Validated Quote
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Premium Summary
              </h3>

              {calcError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4">
                  {calcError}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Big Total Price */}
                  <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-600 capitalize">
                      Total {paymentMode.replace('_', ' ')} Instalment
                    </div>
                    <div className="text-3xl font-black text-teal-700 mt-1">
                      {formatINR(liveQuote.total_instalment_premium)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Annual: <strong className="text-slate-800">{formatINR(liveQuote.total_annual_premium)}</strong>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Policy Instalment:</span>
                      <span className="font-semibold text-slate-900">
                        {formatINR(liveQuote.base_instalment_premium)}
                      </span>
                    </div>

                    {liveQuote.rider_quotes && liveQuote.rider_quotes.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200">
                        <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                          Selected Riders Breakdown
                        </div>
                        {liveQuote.rider_quotes.map((rq) => (
                          <div key={rq.rider_id} className="flex justify-between text-slate-700 text-[11px]">
                            <span className="truncate max-w-[200px]">{rq.rider_name}</span>
                            <span className="font-mono text-teal-700 font-semibold">
                              +{formatINR(rq.instalment_premium)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calculation Transparency Badges — Simplified Plain Language */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Official Base Pricing Rate:</span>
                      <span className="text-slate-800 font-bold">{liveQuote.rate_per_1000_used} per ₹1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High-Coverage Volume Discount:</span>
                      <span className="text-slate-800 font-bold">{liveQuote.sa_band_factor_used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Frequency Factor:</span>
                      <span className="text-slate-800 font-bold">{liveQuote.modal_factor_used}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Bar — Directly Visible & Selectable from Anywhere Without Scrolling */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shadow-lg shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Total {paymentMode.replace('_', ' ')} Instalment
              </div>
              <div className="text-2xl font-black text-teal-700">
                {formatINR(liveQuote.total_instalment_premium)}
                <span className="text-xs font-normal text-slate-500 ml-1">/{paymentMode}</span>
              </div>
            </div>
            <div className="hidden md:block pl-4 border-l border-slate-200 text-xs text-slate-600">
              <div>Life Cover: <strong className="text-slate-900">{formatINRLakhCr(isUlip ? ulipAnnualPremium * ulipSaMultiple : sumAssured)}</strong> · Tenure: <strong className="text-slate-900">{policyTerm} Yrs</strong></div>
              <div>Riders: <strong className="text-teal-700">{Object.values(selectedRiders).filter(Boolean).length} Active</strong> · Annual: <strong className="text-slate-800">{formatINR(liveQuote.total_annual_premium)}</strong></div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              {t.common.back || 'Back to Plans'}
            </button>
            {onSelectPlan && (
              <button
                type="button"
                disabled={isCalculating || !liveQuote || !!calcError}
                onClick={handleSelectPlan}
                className="py-2.5 px-6 rounded-xl text-xs font-extrabold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>{(t.recommendations as any).selectPlanBtn || 'Select This Plan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
