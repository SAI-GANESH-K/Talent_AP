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
} from '../../api/client';
import { CoverageShortfallVisualizer } from './CoverageShortfallVisualizer';

interface PolicyCustomizerModalProps {
  product: RecommendedProduct;
  customer: CustomerProfile;
  recommendedGap: number;
  onClose: () => void;
  allRiders: RiderDetail[];
}

export const PolicyCustomizerModal: React.FC<PolicyCustomizerModalProps> = ({
  product,
  customer,
  recommendedGap,
  onClose,
  allRiders,
}) => {
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
        const quote = await api.quote(pricingIn);
        setLiveQuote(quote);
      } catch (err: any) {
        setCalcError(err?.message || 'Failed to calculate quote for selected combination.');
      } finally {
        setIsCalculating(false);
      }
    }, 280);

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
        // default rider SA: 50% of base SA or 50L
        const defaultSa = Math.min(sumAssured * 0.5, defaultMaxSa || 5000000);
        setRiderSumAssureds((saPrev) => ({ ...saPrev, [riderId]: defaultSa }));
      }
      return { ...prev, [riderId]: nextActive };
    });
  };

  const currentCover = isUlip ? ulipAnnualPremium * ulipSaMultiple : sumAssured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            aria-label="Close customizer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - 2 Column Layout */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    Life Cover (Sum Assured)
                  </label>
                  <span className="text-base font-extrabold text-teal-300">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />

                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Min: {formatINRLakhCr(minSa)}</span>
                  <span>Step: {formatINRLakhCr(saStep)}</span>
                  <span>Max: {formatINRLakhCr(maxSa)}</span>
                </div>
              </div>
            )}

            {/* ULIP Parameters */}
            {isUlip && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
                      Annual Investment Premium
                    </label>
                    <span className="text-base font-extrabold text-teal-300">
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
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                      SA Multiple
                    </label>
                    <select
                      value={ulipSaMultiple}
                      onChange={(e) => setUlipSaMultiple(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-teal-500"
                    >
                      <option value={7}>7x (₹{formatINR(ulipAnnualPremium * 7)})</option>
                      <option value={10}>10x (₹{formatINR(ulipAnnualPremium * 10)})</option>
                      <option value={15}>15x (₹{formatINR(ulipAnnualPremium * 15)})</option>
                      <option value={20}>20x (₹{formatINR(ulipAnnualPremium * 20)})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                      Target Fund
                    </label>
                    <select
                      value={ulipFundId}
                      onChange={(e) => setUlipFundId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-teal-500"
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
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  Policy Tenure
                </label>
                <span className="text-sm font-bold text-white">
                  {policyTerm} Years (Matures at age {customer.age + policyTerm})
                </span>
              </div>

              {product.allowed_terms && product.allowed_terms.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.allowed_terms.map((term) => (
                    <button
                      key={term}
                      onClick={() => setPolicyTerm(term)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        policyTerm === term
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
                />
              )}
            </div>

            {/* Premium Payment Option */}
            {product.allowed_payment_options && product.allowed_payment_options.length > 1 && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
                  Payment Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.allowed_payment_options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPaymentOption(opt)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                        paymentOption === opt
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                      }`}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Frequency */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
                Payment Frequency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['monthly', 'quarterly', 'half_yearly', 'annual'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                      paymentMode === mode
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Riders Selection */}
            {productRiders.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    Add Policy Riders
                  </label>
                  <span className="text-[11px] text-teal-400 font-semibold">
                    {Object.values(selectedRiders).filter(Boolean).length} Selected
                  </span>
                </div>

                <div className="space-y-2.5">
                  {productRiders.map((rider) => {
                    const isChecked = !!selectedRiders[rider.rider_id];
                    const activeSa = riderSumAssureds[rider.rider_id] || Math.min(sumAssured * 0.5, 5000000);

                    return (
                      <div
                        key={rider.rider_id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-slate-900 border-teal-500/60'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRider(rider.rider_id, rider.max_rider_sa_inr)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/40 mt-0.5"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">
                                {rider.rider_name}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {rider.benefit}
                              </div>
                            </div>
                          </label>

                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                            {rider.rider_category}
                          </span>
                        </div>

                        {/* If checked & customizable SA */}
                        {isChecked && rider.rate_basis === 'per_1000_rider_sa' && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                            <span className="text-[11px] text-slate-400">Rider Cover:</span>
                            <span className="text-xs font-bold text-teal-300">
                              {formatINRLakhCr(activeSa)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Recalculated Premium Quote */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-teal-500/40 rounded-2xl p-6 shadow-xl relative">
              {/* Spinner overlay during debounced quote calculation */}
              {isCalculating && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Recalculating official quote...</span>
                  </div>
                </div>
              )}

              <div className="text-xs uppercase font-bold tracking-wider text-teal-400 mb-1">
                Live Validated Quote
              </div>
              <h3 className="text-lg font-bold text-white mb-4">
                Premium Summary
              </h3>

              {calcError ? (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 mb-4">
                  {calcError}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Big Total Price */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 capitalize">
                      Total {paymentMode.replace('_', ' ')} Instalment
                    </div>
                    <div className="text-3xl font-black text-teal-300 mt-1">
                      {formatINR(liveQuote.total_instalment_premium)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Annual: <strong className="text-slate-200">{formatINR(liveQuote.total_annual_premium)}</strong>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Policy Instalment:</span>
                      <span className="font-semibold text-white">
                        {formatINR(liveQuote.base_instalment_premium)}
                      </span>
                    </div>

                    {liveQuote.rider_quotes && liveQuote.rider_quotes.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                        <div className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                          Selected Riders Breakdown
                        </div>
                        {liveQuote.rider_quotes.map((rq) => (
                          <div key={rq.rider_id} className="flex justify-between text-slate-300 text-[11px]">
                            <span className="truncate max-w-[200px]">{rq.rider_name}</span>
                            <span className="font-mono text-teal-400">
                              +{formatINR(rq.instalment_premium)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calculation Transparency Badges */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Rate Per 1,000 SA:</span>
                      <span className="text-slate-200">{liveQuote.rate_per_1000_used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Band Factor Applied:</span>
                      <span className="text-slate-200">{liveQuote.sa_band_factor_used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modal Factor Used:</span>
                      <span className="text-slate-200">{liveQuote.modal_factor_used}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Customizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
