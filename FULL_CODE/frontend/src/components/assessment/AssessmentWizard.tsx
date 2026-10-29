import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  type AssessmentRequest,
  type AssumptionsInput,
  type DependentInput,
  type GoalInput,
  type LoanInput,
} from '../../api/client';

interface AssessmentWizardProps {
  onSubmit: (data: AssessmentRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Preset personas for quick demo / testing
const PRESETS: Record<string, Partial<AssessmentRequest>> = {
  salaried_family: {
    age: 35,
    annual_income_inr: 1200000,
    monthly_household_expenses_inr: 45000,
    is_homemaker: false,
    homemaker_services_value_annual_inr: 0,
    dependents: [
      { relationship: 'spouse', age: 32, has_own_income: false },
      { relationship: 'child', age: 5, has_own_income: false },
    ],
    goals: [
      {
        goal_type: 'child_education',
        beneficiary: 'child',
        target_amount_today_inr: 2500000,
        target_year: 2039,
        priority: 'high',
      },
    ],
    loans: [
      {
        loan_type: 'Home Loan',
        outstanding_principal_inr: 3500000,
      },
    ],
    individual_life_cover_inr: 1000000,
    employer_group_life_cover_inr: 500000,
    liquid_savings_inr: 500000,
    market_investments_inr: 300000,
    retirement_savings_inr: 800000,
  },
  young_professional: {
    age: 26,
    annual_income_inr: 900000,
    monthly_household_expenses_inr: 28000,
    is_homemaker: false,
    homemaker_services_value_annual_inr: 0,
    dependents: [],
    goals: [],
    loans: [
      {
        loan_type: 'Education Loan',
        outstanding_principal_inr: 450000,
      },
    ],
    individual_life_cover_inr: 0,
    employer_group_life_cover_inr: 300000,
    liquid_savings_inr: 200000,
    market_investments_inr: 150000,
    retirement_savings_inr: 100000,
  },
  homemaker_persona: {
    age: 34,
    annual_income_inr: 0,
    monthly_household_expenses_inr: 40000,
    is_homemaker: true,
    homemaker_services_value_annual_inr: 360000,
    dependents: [
      { relationship: 'child', age: 7, has_own_income: false },
      { relationship: 'child', age: 4, has_own_income: false },
    ],
    goals: [],
    loans: [],
    individual_life_cover_inr: 0,
    employer_group_life_cover_inr: 0,
    liquid_savings_inr: 100000,
    market_investments_inr: 0,
    retirement_savings_inr: 0,
  },
  shopkeeper_loans: {
    age: 42,
    annual_income_inr: 1800000,
    monthly_household_expenses_inr: 60000,
    is_homemaker: false,
    homemaker_services_value_annual_inr: 0,
    dependents: [
      { relationship: 'spouse', age: 39, has_own_income: false },
      { relationship: 'child', age: 14, has_own_income: false },
      { relationship: 'parent', age: 68, has_own_income: false },
    ],
    goals: [
      {
        goal_type: 'child_higher_education',
        beneficiary: 'child',
        target_amount_today_inr: 3000000,
        target_year: 2030,
        priority: 'high',
      },
      {
        goal_type: 'child_marriage',
        beneficiary: 'child',
        target_amount_today_inr: 2000000,
        target_year: 2036,
        priority: 'medium',
      },
    ],
    loans: [
      {
        loan_type: 'Business Working Capital Loan',
        outstanding_principal_inr: 2000000,
      },
      {
        loan_type: 'Commercial Property Loan',
        outstanding_principal_inr: 4000000,
      },
    ],
    individual_life_cover_inr: 2500000,
    employer_group_life_cover_inr: 0,
    liquid_savings_inr: 1200000,
    market_investments_inr: 800000,
    retirement_savings_inr: 1500000,
  },
};

export function AssessmentWizard({ onSubmit, onCancel, isLoading }: AssessmentWizardProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [expertMode, setExpertMode] = useState<boolean>(false);

  // Form State
  const [age, setAge] = useState<number>(35);
  const [annualIncome, setAnnualIncome] = useState<number>(1200000);
  const [isHomemaker, setIsHomemaker] = useState<boolean>(false);
  const [homemakerValue, setHomemakerValue] = useState<number>(360000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(45000);

  const [dependents, setDependents] = useState<DependentInput[]>([
    { relationship: 'spouse', age: 32, has_own_income: false },
    { relationship: 'child', age: 5, has_own_income: false },
  ]);

  const [loans, setLoans] = useState<LoanInput[]>([
    { loan_type: 'Home Loan', outstanding_principal_inr: 3500000 },
  ]);

  const [goals, setGoals] = useState<GoalInput[]>([
    {
      goal_type: 'child_education',
      beneficiary: 'child',
      target_amount_today_inr: 2500000,
      target_year: 2039,
      priority: 'high',
    },
  ]);

  const [individualCover, setIndividualCover] = useState<number>(1000000);
  const [employerCover, setEmployerCover] = useState<number>(500000);
  const [liquidSavings, setLiquidSavings] = useState<number>(500000);
  const [marketInvestments, setMarketInvestments] = useState<number>(300000);
  const [retirementSavings, setRetirementSavings] = useState<number>(800000);

  // Expert assumptions
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [incomeGrowthRate, setIncomeGrowthRate] = useState<number>(6.0);
  const [discountRate, setDiscountRate] = useState<number>(7.0);
  const [generalInflation, setGeneralInflation] = useState<number>(5.5);
  const [educationInflation, setEducationInflation] = useState<number>(8.0);
  const [countEmployerCover, setCountEmployerCover] = useState<boolean>(true);
  const [countRetirementSavings, setCountRetirementSavings] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    if (p.age !== undefined) setAge(p.age);
    if (p.annual_income_inr !== undefined) setAnnualIncome(p.annual_income_inr);
    if (p.is_homemaker !== undefined) setIsHomemaker(p.is_homemaker);
    if (p.homemaker_services_value_annual_inr !== undefined)
      setHomemakerValue(p.homemaker_services_value_annual_inr);
    if (p.monthly_household_expenses_inr !== undefined)
      setMonthlyExpenses(p.monthly_household_expenses_inr);
    if (p.dependents) setDependents(p.dependents);
    if (p.loans) setLoans(p.loans);
    if (p.goals) setGoals(p.goals);
    if (p.individual_life_cover_inr !== undefined)
      setIndividualCover(p.individual_life_cover_inr);
    if (p.employer_group_life_cover_inr !== undefined)
      setEmployerCover(p.employer_group_life_cover_inr);
    if (p.liquid_savings_inr !== undefined) setLiquidSavings(p.liquid_savings_inr);
    if (p.market_investments_inr !== undefined)
      setMarketInvestments(p.market_investments_inr);
    if (p.retirement_savings_inr !== undefined)
      setRetirementSavings(p.retirement_savings_inr);
    setErrors({});
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};
    if (currentStep === 1) {
      if (!age || age < 18 || age > 100) errs.age = 'Age must be between 18 and 100';
      if (!isHomemaker && annualIncome < 0) errs.annualIncome = 'Annual income cannot be negative';
      if (isHomemaker && homemakerValue < 0) errs.homemakerValue = 'Value cannot be negative';
      if (monthlyExpenses < 0) errs.monthlyExpenses = 'Monthly expenses cannot be negative';
    }
    if (currentStep === 2) {
      dependents.forEach((dep, idx) => {
        if (dep.age < 0 || dep.age > 120) {
          errs[`dep_${idx}`] = 'Dependent age must be between 0 and 120';
        }
      });
    }
    if (currentStep === 3) {
      loans.forEach((loan, idx) => {
        if (loan.outstanding_principal_inr < 0) {
          errs[`loan_${idx}`] = 'Loan principal cannot be negative';
        }
      });
    }
    if (currentStep === 4) {
      goals.forEach((goal, idx) => {
        if (goal.target_amount_today_inr < 0) {
          errs[`goal_${idx}`] = 'Goal target cannot be negative';
        }
        if (goal.target_year < 2026 || goal.target_year > 2080) {
          errs[`goal_year_${idx}`] = 'Year must be between 2026 and 2080';
        }
      });
    }
    if (currentStep === 5) {
      if (individualCover < 0) errs.individualCover = 'Cannot be negative';
      if (employerCover < 0) errs.employerCover = 'Cannot be negative';
      if (liquidSavings < 0) errs.liquidSavings = 'Cannot be negative';
      if (marketInvestments < 0) errs.marketInvestments = 'Cannot be negative';
      if (retirementSavings < 0) errs.retirementSavings = 'Cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;

    // Preserve selected assumptions regardless of presentation mode
    const assumptions: AssumptionsInput = {
      retirement_age: retirementAge,
      income_growth_rate: incomeGrowthRate / 100,
      discount_rate: discountRate / 100,
      general_inflation_pct_pa: generalInflation / 100,
      education_inflation_pct_pa: educationInflation / 100,
      count_employer_group_cover: countEmployerCover,
      count_retirement_savings: countRetirementSavings,
    };

    const payload: AssessmentRequest = {
      age,
      annual_income_inr: isHomemaker ? 0 : annualIncome,
      is_homemaker: isHomemaker,
      homemaker_services_value_annual_inr: isHomemaker ? homemakerValue : 0,
      monthly_household_expenses_inr: monthlyExpenses,
      dependents,
      loans,
      goals,
      individual_life_cover_inr: individualCover,
      employer_group_life_cover_inr: employerCover,
      liquid_savings_inr: liquidSavings,
      market_investments_inr: marketInvestments,
      retirement_savings_inr: retirementSavings,
      current_year: 2026,
      assumptions,
    };

    onSubmit(payload);
  };

  const addDependent = () => {
    setDependents([...dependents, { relationship: 'child', age: 5, has_own_income: false }]);
  };

  const removeDependent = (index: number) => {
    setDependents(dependents.filter((_, idx) => idx !== index));
  };

  const updateDependent = (index: number, field: keyof DependentInput, value: any) => {
    const updated = [...dependents];
    updated[index] = { ...updated[index], [field]: value };
    setDependents(updated);
  };

  const addLoan = () => {
    setLoans([...loans, { loan_type: 'Personal Loan', outstanding_principal_inr: 300000 }]);
  };

  const removeLoan = (index: number) => {
    setLoans(loans.filter((_, idx) => idx !== index));
  };

  const updateLoan = (index: number, field: keyof LoanInput, value: any) => {
    const updated = [...loans];
    updated[index] = { ...updated[index], [field]: value };
    setLoans(updated);
  };

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        goal_type: 'Child Education',
        beneficiary: 'child',
        target_amount_today_inr: 2000000,
        target_year: 2038,
        priority: 'high',
      },
    ]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, idx) => idx !== index));
  };

  const updateGoal = (index: number, field: keyof GoalInput, value: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const stepTitles = [
    t.wizard.step1Title,
    t.wizard.step2Title,
    t.wizard.step3Title,
    t.wizard.step4Title,
    t.wizard.step5Title,
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          {/* Big, Bold, Beautiful Stage 1 Badge */}
          <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-teal-500/40 rounded-2xl mb-3 shadow-xs">
            <span className="bg-teal-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-2xs">
              Stage 1
            </span>
            <span className="text-teal-950 font-extrabold text-sm sm:text-base tracking-tight">
              {(t.wizard as any).stagePill?.replace(/Stage 1\s*[·•-]?\s*/i, '') || 'Financial Needs Assessment'}
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[var(--color-teal-600)] mb-1">
            {t.wizard.stepOf} {step} {t.wizard.stepOfTotal} 5 · {stepTitles[step - 1]}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] font-[var(--font-heading)]">
            {t.wizard.assessmentTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setExpertMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !expertMode
                ? 'bg-white shadow text-[var(--color-navy-900)] font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.wizard.simpleMode}
          </button>
          <button
            type="button"
            onClick={() => setExpertMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              expertMode
                ? 'bg-[var(--color-navy-900)] text-white shadow font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t.wizard.expertMode}</span>
          </button>
        </div>
      </div>

      {/* Demo Persona Quick Selectors */}
      <div className="py-3 px-4 bg-teal-50/70 border border-teal-100 rounded-xl my-4 text-xs">
        <span className="text-teal-900 font-semibold mr-2">{t.wizard.quickTestPersonas}</span>
        <div className="inline-flex flex-wrap gap-2 mt-1 sm:mt-0">
          <button
            type="button"
            onClick={() => applyPreset('salaried_family')}
            className="bg-white hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shadow-2xs"
          >
            {t.wizard.personaSalaried}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('young_professional')}
            className="bg-white hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shadow-2xs"
          >
            {t.wizard.personaYoung}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('homemaker_persona')}
            className="bg-white hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shadow-2xs"
          >
            {t.wizard.personaHomemaker}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('shopkeeper_loans')}
            className="bg-white hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shadow-2xs"
          >
            {t.wizard.personaShopkeeper}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-gradient-to-r from-[var(--color-teal-600)] to-[var(--color-teal-400)] h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        {/* STEP 1: Personal Profile & Income */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-navy-900)] mb-1">
                {t.wizard.step1Title}
              </h3>
              <p className="text-sm text-slate-500">
                {t.wizard.step1Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.ageLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">{t.wizard.ageHelp}</span>
                </div>
                {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                <p className="text-xs text-slate-400 mt-1">Remaining earning years to 60: {Math.max(0, 60 - age)} years</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.expensesLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    step={1000}
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                  />
                </div>
                {errors.monthlyExpenses && <p className="text-xs text-red-600 mt-1">{errors.monthlyExpenses}</p>}
                <p className="text-xs text-slate-400 mt-1">
                  * Note: Excludes loan EMIs and insurance premiums (entered separately).
                </p>
              </div>
            </div>

            {/* Homemaker Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHomemaker}
                  onChange={(e) => setIsHomemaker(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-teal-600)] rounded border-slate-300 focus:ring-[var(--color-teal-500)]"
                />
                <div>
                  <span className="text-sm font-semibold text-[var(--color-navy-900)]">
                    {t.wizard.homemakerToggle}
                  </span>
                  <p className="text-xs text-slate-500">
                    {t.wizard.homemakerHelp}
                  </p>
                </div>
              </label>

              {isHomemaker ? (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.wizard.homemakerServices}
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      step={10000}
                      value={homemakerValue}
                      onChange={(e) => setHomemakerValue(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                    />
                  </div>
                  {errors.homemakerValue && <p className="text-xs text-red-600 mt-1">{errors.homemakerValue}</p>}
                  <p className="text-xs text-slate-400 mt-1">
                    Standard guideline benchmark: ₹3,60,000/yr (₹30,000/month replacement cost).
                  </p>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.wizard.incomeLabel}
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      step={25000}
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                    />
                  </div>
                  {errors.annualIncome && <p className="text-xs text-red-600 mt-1">{errors.annualIncome}</p>}
                  <p className="text-xs text-slate-400 mt-1">
                    Include salary, regular business earnings, or annual farm income.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Dependents */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-navy-900)] mb-1">
                  {t.wizard.step2Title}
                </h3>
                <p className="text-sm text-slate-500">
                  {t.wizard.step2Desc}
                </p>
              </div>
              <button
                type="button"
                onClick={addDependent}
                className="text-xs font-medium text-[var(--color-teal-600)] hover:text-[var(--color-teal-500)] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
              >
                {t.wizard.addDependent}
              </button>
            </div>

            {dependents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-600">{t.wizard.dependentsLabel}: 0</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t.wizard.step2Desc}
                </p>
                <button
                  type="button"
                  onClick={addDependent}
                  className="mt-3 text-xs bg-[var(--color-teal-600)] text-white px-3 py-1.5 rounded-lg"
                >
                  {t.wizard.addDependent}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dependents.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 sm:gap-4"
                  >
                    <div className="w-32">
                      <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.dependentsLabel}</label>
                      <select
                        value={dep.relationship}
                        onChange={(e) => updateDependent(idx, 'relationship', e.target.value)}
                        className="w-full text-sm py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none"
                      >
                        <option value="spouse">{t.wizard.relationshipSpouse}</option>
                        <option value="child">{t.wizard.relationshipChild}</option>
                        <option value="parent">{t.wizard.relationshipParent}</option>
                        <option value="sibling">{t.wizard.relationshipSibling}</option>
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.dependentAgeLabel || "Dependent's Age"}</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={dep.age}
                        onChange={(e) => updateDependent(idx, 'age', parseInt(e.target.value) || 0)}
                        className="w-full text-sm py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="flex-1 min-w-[140px] pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={dep.has_own_income || false}
                          onChange={(e) => updateDependent(idx, 'has_own_income', e.target.checked)}
                          className="w-3.5 h-3.5 text-[var(--color-teal-600)] rounded border-slate-300"
                        />
                        {t.wizard.hasIncome}
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => removeDependent(idx)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
                      >
                        {t.wizard.remove}
                      </button>
                    </div>

                    {errors[`dep_${idx}`] && (
                      <p className="w-full text-xs text-red-600">{errors[`dep_${idx}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Loans & Liabilities */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-navy-900)] mb-1">
                  {t.wizard.step3Title}
                </h3>
                <p className="text-sm text-slate-500">
                  {t.wizard.step3Desc}
                </p>
              </div>
              <button
                type="button"
                onClick={addLoan}
                className="text-xs font-medium text-[var(--color-teal-600)] hover:text-[var(--color-teal-500)] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
              >
                {t.wizard.addLoan}
              </button>
            </div>

            {loans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-600">{t.wizard.loansLabel}: 0</p>
                <p className="text-xs text-slate-400 mt-1">{t.wizard.step3Desc}</p>
                <button
                  type="button"
                  onClick={addLoan}
                  className="mt-3 text-xs bg-[var(--color-teal-600)] text-white px-3 py-1.5 rounded-lg"
                >
                  {t.wizard.addLoan}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {loans.map((loan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.loanTypeLabel || 'Loan Type / Purpose'}</label>
                      <input
                        type="text"
                        value={loan.loan_type}
                        onChange={(e) => updateLoan(idx, 'loan_type', e.target.value)}
                        placeholder="Home Loan, Car Loan"
                        className="w-full text-sm py-1.5 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="w-44">
                      <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.outstandingAmount}</label>
                      <input
                        type="number"
                        step={50000}
                        value={loan.outstanding_principal_inr}
                        onChange={(e) => updateLoan(idx, 'outstanding_principal_inr', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm py-1.5 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => removeLoan(idx)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
                      >
                        {t.wizard.remove}
                      </button>
                    </div>

                    {errors[`loan_${idx}`] && (
                      <p className="w-full text-xs text-red-600">{errors[`loan_${idx}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Goals & Future Milestones */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-navy-900)] mb-1">
                  {t.wizard.step4Title}
                </h3>
                <p className="text-sm text-slate-500">
                  {t.wizard.step4Desc}
                </p>
              </div>
              <button
                type="button"
                onClick={addGoal}
                className="text-xs font-medium text-[var(--color-teal-600)] hover:text-[var(--color-teal-500)] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
              >
                {t.wizard.addGoal}
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-600">{t.wizard.goalsLabel}: 0</p>
                <p className="text-xs text-slate-400 mt-1">{t.wizard.step4Desc}</p>
                <button
                  type="button"
                  onClick={addGoal}
                  className="mt-3 text-xs bg-[var(--color-teal-600)] text-white px-3 py-1.5 rounded-lg"
                >
                  {t.wizard.addGoal}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.goalsLabel}</label>
                        <select
                          value={goal.goal_type}
                          onChange={(e) => updateGoal(idx, 'goal_type', e.target.value)}
                          className="w-full text-sm py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none"
                        >
                          <option value="child_education">{t.wizard.goalEducation}</option>
                          <option value="child_marriage">{t.wizard.goalMarriage}</option>
                          <option value="family_emergency">{t.wizard.goalWealth}</option>
                          <option value="retirement">{t.wizard.goalRetirement}</option>
                        </select>
                      </div>

                      <div className="w-28">
                        <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.targetYear}</label>
                        <input
                          type="number"
                          min={2026}
                          max={2080}
                          value={goal.target_year}
                          onChange={(e) => updateGoal(idx, 'target_year', parseInt(e.target.value) || 2026)}
                          className="w-full text-sm py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none"
                        />
                      </div>

                      <div className="w-36">
                        <label className="block text-xs font-medium text-slate-600 mb-1">{t.wizard.targetAmount}</label>
                        <input
                          type="number"
                          step={50000}
                          value={goal.target_amount_today_inr}
                          onChange={(e) => updateGoal(idx, 'target_amount_today_inr', parseFloat(e.target.value) || 0)}
                          className="w-full text-sm py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => removeGoal(idx)}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
                        >
                          {t.wizard.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Existing Assets & Insurance */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-navy-900)] mb-1">
                {t.wizard.step5Title}
              </h3>
              <p className="text-sm text-slate-500">
                {t.wizard.step5Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.existingCoverLabel} (₹)
                </label>
                <input
                  type="number"
                  step={100000}
                  value={individualCover}
                  onChange={(e) => setIndividualCover(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                />
                {errors.individualCover && <p className="text-xs text-red-600 mt-1">{errors.individualCover}</p>}
                <p className="text-xs text-slate-400 mt-1">{t.wizard.existingCoverLabel}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.employerCoverHelp} (₹)
                </label>
                <input
                  type="number"
                  step={100000}
                  value={employerCover}
                  onChange={(e) => setEmployerCover(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                />
                {errors.employerCover && <p className="text-xs text-red-600 mt-1">{errors.employerCover}</p>}
                <p className="text-xs text-slate-400 mt-1">{t.wizard.employerCoverHelp}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.savingsLabel} (₹)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={liquidSavings}
                  onChange={(e) => setLiquidSavings(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                />
                {errors.liquidSavings && <p className="text-xs text-red-600 mt-1">{errors.liquidSavings}</p>}
                <p className="text-xs text-slate-400 mt-1">{t.wizard.savingsLabel}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.wizard.marketInvestmentsLabel} (₹)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={marketInvestments}
                  onChange={(e) => setMarketInvestments(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-teal-500)] focus:border-transparent outline-none transition"
                />
                {errors.marketInvestments && <p className="text-xs text-red-600 mt-1">{errors.marketInvestments}</p>}
                <p className="text-xs text-slate-400 mt-1">{t.wizard.marketInvestmentsLabel}</p>
              </div>
            </div>

            {/* Expert Mode Assumptions Sub-Panel */}
            {expertMode && (
              <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal-400)]">
                    {t.wizard.expertAssumptionsTitle}
                  </span>
                  <span className="text-xs text-slate-400">{t.wizard.expertMode}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">{t.wizard.retirementAgeLabel}</label>
                    <input
                      type="number"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(parseInt(e.target.value) || 60)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t.wizard.growthRateLabel}</label>
                    <input
                      type="number"
                      step={0.5}
                      value={incomeGrowthRate}
                      onChange={(e) => setIncomeGrowthRate(parseFloat(e.target.value) || 6.0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t.wizard.discountRateLabel}</label>
                    <input
                      type="number"
                      step={0.5}
                      value={discountRate}
                      onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 7.0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t.wizard.inflationLabel}</label>
                    <input
                      type="number"
                      step={0.5}
                      value={generalInflation}
                      onChange={(e) => setGeneralInflation(parseFloat(e.target.value) || 5.5)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t.wizard.educationInflationLabel}</label>
                    <input
                      type="number"
                      step={0.5}
                      value={educationInflation}
                      onChange={(e) => setEducationInflation(parseFloat(e.target.value) || 8.0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={countEmployerCover}
                      onChange={(e) => setCountEmployerCover(e.target.checked)}
                      className="rounded"
                    />
                    {t.wizard.includeEmployerCover}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={countRetirementSavings}
                      onChange={(e) => setCountRetirementSavings(e.target.checked)}
                      className="rounded"
                    />
                    {t.wizard.includeRetirementSavings}
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                ← {t.common.back}
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
              >
                {t.common.cancel}
              </button>
            )}
          </div>

          <div>
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-800)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition"
              >
                {t.common.next} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-[var(--color-teal-600)] to-[var(--color-teal-500)] hover:from-[var(--color-teal-500)] hover:to-[var(--color-teal-400)] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-teal-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? t.common.loading : t.wizard.calculateBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
