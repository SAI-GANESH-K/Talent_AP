/**
 * COVERWISE — Financial Literacy & Educational Content
 * Phase 8: Multi-language Educational Terminology & Life Story
 * Supports: en (English), te (Telugu), hi (Hindi), ta (Tamil), kn (Kannada)
 */

import type { Language } from './translations';

export type EducationTermId =
  | 'annual_income'
  | 'monthly_expenses'
  | 'homemaker_contribution'
  | 'dependents'
  | 'dependent_own_income'
  | 'loan_principal'
  | 'liabilities'
  | 'future_goals'
  | 'target_year'
  | 'cost_today'
  | 'existing_cover'
  | 'employer_cover'
  | 'liquid_savings'
  | 'investments'
  | 'retirement_age'
  | 'income_growth_rate'
  | 'discount_rate'
  | 'general_inflation'
  | 'education_inflation'
  | 'self_consumption'
  | 'hlv'
  | 'net_needs'
  | 'coverage_gap'
  | 'recommended_cover'
  | 'sum_assured'
  | 'policy_tenure'
  | 'premium'
  | 'riders'
  | 'product_match_score';

export interface TermExplanation {
  title: string;
  definition: string;
  example?: string;
}

export interface StorySceneContent {
  step: number;
  badge: string;
  title: string;
  narrative: string;
  keyTakeaway: string;
}

export interface LifeStoryContent {
  sectionTag: string;
  sectionHeading: string;
  sectionSubheading: string;
  openStoryBtn: string;
  storyModalTitle: string;
  scenes: StorySceneContent[];
  controls: {
    next: string;
    back: string;
    close: string;
    skip: string;
    replay: string;
    finalCta: string;
    stepOf: string;
  };
}

export const EDUCATION_TERMS: Record<Language, Record<EducationTermId, TermExplanation>> = {
  en: {
    annual_income: {
      title: 'Annual Take-Home Income',
      definition: 'The money you earn in one year after relevant deductions. It may come from a job, farming, a shop, business, or daily wages. If your earnings vary, use a reasonable annual average.',
      example: 'Example: A shopkeeper earning ₹30,000–₹40,000 per month can enter an estimate of ₹4,20,000 for the full year.',
    },
    monthly_expenses: {
      title: 'Monthly Household Expenses',
      definition: 'Money your family spends every month on basic necessities like food, electricity, rent, travel, and children schooling. Do not include loan EMIs or insurance premiums here if entered separately.',
      example: 'Example: Monthly grocery bills, cooking gas, school bus, and medicines are household expenses.',
    },
    homemaker_contribution: {
      title: 'Homemaker Economic Contribution',
      definition: 'Even without a monthly salary, a homemaker provides vital work including cooking, household management, and childcare. The model values the replacement cost of these essential services.',
      example: 'Example: Hiring help for full-time childcare, cooking, and home management would cost ₹15,000–₹25,000 monthly.',
    },
    dependents: {
      title: 'Family Dependents',
      definition: 'Family members who depend on your income for their daily living, healthcare, and education. Typically includes children, non-earning spouse, and aging parents.',
      example: 'Example: If your elderly parents and young school-going children rely on your farm earnings, they are dependents.',
    },
    dependent_own_income: {
      title: 'Dependent Has Own Income',
      definition: 'Check this only if the family member earns their own regular, independent income (e.g., your spouse runs a boutique or has a salary).',
      example: 'Example: A spouse with a monthly salary of ₹25,000 has independent income and does not solely rely on you.',
    },
    loan_principal: {
      title: 'Outstanding Loan Principal',
      definition: 'The remaining balance of money you borrowed that still needs to be repaid to the bank or lender. This is NOT your monthly EMI.',
      example: 'Example: If you took a ₹10,00,000 home loan and repaid ₹3,00,000 of the principal, ₹7,00,000 remains outstanding.',
    },
    liabilities: {
      title: 'Outstanding Liabilities',
      definition: 'All unpaid financial obligations including home loans, agricultural loans, vehicle loans, or credit balances. Life insurance ensures your family is not forced to sell land or assets to repay them.',
    },
    future_goals: {
      title: 'Future Financial Goals',
      definition: 'High-value family milestones you plan to fund in the future, such as a child higher education, professional training, or marriage.',
      example: 'Example: Sponsoring a 4-year engineering or medical degree for your child in 10 years.',
    },
    target_year: {
      title: 'Target Year',
      definition: 'The calendar year when the future milestone expense will be needed.',
      example: 'Example: If your child is currently 8 years old and will start college at age 18, the target year is 2036.',
    },
    cost_today: {
      title: 'Cost in Today Money',
      definition: 'How much the milestone would cost if you paid for it today. CoverWise automatically applies education inflation formulas to project the future requirement.',
      example: 'Example: A degree costing ₹8,00,000 today might require ₹18,00,000 in 10 years due to education inflation.',
    },
    existing_cover: {
      title: 'Existing Life Insurance Cover',
      definition: 'The total death benefit coverage you already hold across active term or endowment policies. This is subtracted from your gross needs so you do not buy unnecessary extra insurance.',
    },
    employer_cover: {
      title: 'Employer Group Cover',
      definition: 'Life insurance provided as a corporate benefit by your current employer. Note: this cover typically ends immediately if you leave or change your job.',
    },
    liquid_savings: {
      title: 'Liquid Savings',
      definition: 'Money in savings bank accounts, fixed deposits, or emergency cash that your family can withdraw immediately in an emergency.',
      example: 'Example: Fixed deposits of ₹2,00,000 in your local bank that can be withdrawn anytime.',
    },
    investments: {
      title: 'Mutual Funds & Stock Investments',
      definition: 'Market-linked assets that your family could sell if needed to cover living expenses or settle liabilities.',
    },
    retirement_age: {
      title: 'Retirement Age',
      definition: 'The planned age when you expect to stop working (standard default is 60). Defines the active income-earning span your life insurance needs to protect.',
    },
    income_growth_rate: {
      title: 'Income Growth Rate',
      definition: 'The expected annual percentage increase in your salary, farm yield, or business earnings over time.',
    },
    discount_rate: {
      title: 'Discount Rate',
      definition: 'An actuarial interest rate used to express future money in terms of today purchasing power. Used in Human Life Value calculations.',
    },
    general_inflation: {
      title: 'General Inflation Rate',
      definition: 'The annual rate at which the price of everyday groceries, transport, utilities, and clothing increases over time.',
    },
    education_inflation: {
      title: 'Education Inflation Rate',
      definition: 'The annual price increase specifically for school and university fees, which typically rises faster than regular groceries.',
    },
    self_consumption: {
      title: 'Self-Consumption Percentage',
      definition: 'The portion of your earnings that you spend on your own personal expenses (clothes, travel, food). In insurance math, this portion is deducted because it ceases in your absence.',
    },
    hlv: {
      title: 'Human Life Value (HLV)',
      definition: 'An actuarial method estimating the total economic value of your future earnings that your family would lose if you were no longer there.',
      example: 'Example: If you earn ₹5,00,000 yearly and plan to work 25 more years, HLV calculates what lump sum today replaces that loss.',
    },
    net_needs: {
      title: 'Net Needs Approach',
      definition: 'A comprehensive method calculating your family living expenses, debt payoffs, and children milestones, then subtracting existing savings and insurance.',
      example: 'Example: (Family Living + Debts + Education) minus (Bank Savings + Existing Cover) = Net Life Cover Needed.',
    },
    coverage_gap: {
      title: 'Estimated Coverage Gap',
      definition: 'The exact financial shortfall between what your family needs to survive securely and what they currently have in savings and insurance.',
    },
    recommended_cover: {
      title: 'Recommended Life Cover',
      definition: 'The suggested sum assured calculated by CoverWise using dual actuarial engines (HLV + Net Needs) to prevent both underinsurance and wasted premium.',
    },
    sum_assured: {
      title: 'Sum Assured (Life Cover)',
      definition: 'The guaranteed, tax-free lump sum amount that the insurance company pays to your family nominee if a covered event occurs during the policy period.',
      example: 'Example: A ₹1 Crore sum assured guarantees that your nominee receives ₹1,00,00,000 upon approved claim.',
    },
    policy_tenure: {
      title: 'Policy Tenure',
      definition: 'The duration for which your life insurance policy stays active. For pure term insurance, it is usually chosen until your planned retirement age (e.g., age 60 or 65).',
    },
    premium: {
      title: 'Annual Premium',
      definition: 'The fee you pay once a year to keep your life insurance coverage active. In pure term plans, premiums remain locked at the same price for the entire policy tenure.',
    },
    riders: {
      title: 'Insurance Policy Riders',
      definition: 'Optional add-on benefits you can attach to your base term policy for additional protection (such as Critical Illness payout, Accidental Disability cover, or Waiver of Premium).',
      example: 'Example: An Accidental Disability rider provides a lump sum payout if a major accident causes permanent disability.',
    },
    product_match_score: {
      title: 'Product Match Score',
      definition: 'A platform suitability rating calculated by CoverWise based on plan coverage fit, insurer claim settlement ratio (CSR), solvency margin, and premium affordability.',
    },
  },

  te: {
    annual_income: {
      title: 'వార్షిక నికర ఆదాయం (Annual Take-Home Income)',
      definition: 'పన్నులు మరియు ఇతర తగ్గింపుల తర్వాత మీరు ఒక సంవత్సరంలో సంపాదించే మొత్తం ఆదాయం. ఇది వ్యవసాయం, చిన్న వ్యాపారం, దుకాణం లేదా ఉద్యోగం ద్వారా రావచ్చు. ఆదాయం మారుతూ ఉంటే సగటు వార్షిక అంచనాను నమోదు చేయండి.',
      example: 'ఉదాహరణ: నెలకు సుమారు ₹30,000 నుండి ₹40,000 సంపాదించే వారు సంవత్సరానికి ₹4,20,000 నమోదు చేయవచ్చు.',
    },
    monthly_expenses: {
      title: 'నెలవారీ కుటుంబ ఖర్చులు (Monthly Expenses)',
      definition: 'ఆహారం, కరెంట్ బిల్లు, ఇంటి అద్దె, ప్రయాణం, పిల్లల బడి ఫీజుల వంటి ప్రాథమిక అవసరాలకు ప్రతి నెలా కుటుంబం చేసే ఖర్చు. రుణాలు లేదా బీమా ప్రీమియంలు వేరుగా నమోదు చేస్తే ఇక్కడ కలపవద్దు.',
      example: 'ఉదాహరణ: నెలకు కిరాణా, విద్యుత్ బిల్లు మరియు స్కూల్ బస్సు ఖర్చులు కుటుంబ ఖర్చుల క్రిందకు వస్తాయి.',
    },
    homemaker_contribution: {
      title: 'గృహిణి ఆర్థిక సహకారం (Homemaker Contribution)',
      definition: 'జీతం తీసుకోకపోయినా, గృహిణి చేసే వంట, ఇంటి నిర్వహణ, పిల్లల సంరక్షణ వంటి పనులు ఎంతో విలువైనవి. ఈ సేవలను బయటి వ్యక్తుల ద్వారా పొందాలంటే అయ్యే వ్యయాన్ని ఈ మోడల్ గుర్తిస్తుంది.',
      example: 'ఉదాహరణ: పిల్లల సంరక్షణ, వంట మరియు ఇంటి పనుల కోసం బయటి వారిని నియమిస్తే నెలకు ₹15,000-₹20,000 ఖర్చవుతుంది.',
    },
    dependents: {
      title: 'కుటుంబ ఆధారపరులు (Family Dependents)',
      definition: 'రోజూవారీ జీవనం, ఆరోగ్యం, చదువు కోసం మీ ఆదాయంపై ఆధారపడే కుటుంబ సభ్యులు. ఇందులో పిల్లలు, ఆదాయం లేని భార్య/భర్త, వృద్ధ తల్లిదండ్రులు ఉంటారు.',
      example: 'ఉదాహరణ: మీ వ్యవసాయ ఆదాయంపై మీ వృద్ధ తల్లిదండ్రులు, చదువుకునే పిల్లలు ఆధారపడితే వారు ఆధారపరులు.',
    },
    dependent_own_income: {
      title: 'ఆధారపరులకు స్వంత ఆదాయం ఉందా?',
      definition: 'ఆ కుటుంబ సభ్యుడికి స్వంతంగా క్రమం తప్పకుండా ఆదాయం వస్తున్నప్పుడు మాత్రమే దీన్ని ఎంచుకోండి (ఉదాహరణకు మీ జీవిత భాగస్వామి ఉద్యోగం లేదా వ్యాపారం చేస్తున్నప్పుడు).',
    },
    loan_principal: {
      title: 'మిగిలి ఉన్న రుణ అసలు (Outstanding Loan Principal)',
      definition: 'బ్యాంకు లేదా రుణదాతకు మీరు ఇంకా తిరిగి చెల్లించాల్సిన అసలు రుణం మొత్తం. ఇది నెలవారీ EMI కాదు.',
      example: 'ఉదాహరణ: మీరు ₹10 లక్షల గృహ రుణం తీసుకుని, ₹3 లక్షల అసలు చెల్లించి ఉంటే, ఇంకా ₹7 లక్షల అసలు మిగిలి ఉంటుంది.',
    },
    liabilities: {
      title: 'మొత్తం అప్పులు మరియు బాధ్యతలు (Liabilities)',
      definition: 'గృహ రుణాలు, పంట రుణాలు, వాహన రుణాలు లేదా వ్యక్తిగత అప్పులతో సహా చెల్లించాల్సిన మొత్తం. బీమా ఉంటే మీరు లేనప్పుడు కుటుంబం ఆస్తులను అమ్ముకోవాల్సిన పరిస్థితి రాదు.',
    },
    future_goals: {
      title: 'భవిష్యత్ ఆర్థిక లక్ష్యాలు (Future Goals)',
      definition: 'పిల్లల ఉన్నత చదువులు లేదా వివాహం వంటి భవిష్యత్తులో వచ్చే ముఖ్యమైన పెద్ద ఖర్చులు.',
      example: 'ఉదాహరణ: 10 సంవత్సరాల తర్వాత మీ బిడ్డ ఇంజనీరింగ్ లేదా వైద్య విద్య ఖర్చు.',
    },
    target_year: {
      title: 'లక్ష్య సంవత్సరం (Target Year)',
      definition: 'భవిష్యత్తులో ఆ ఖర్చు ఏ సంవత్సరంలో అవసరమవుతుందో ఆ క్యాలెండర్ సంవత్సరం.',
      example: 'ఉదాహరణ: మీ బిడ్డకు ప్రస్తుతం 8 సంవత్సరాలు ఉండి, 18 ఏళ్ల వయసులో కాలేజీకి వెళితే, ఆ సంవత్సరం 2036.',
    },
    cost_today: {
      title: 'నేటి ధరల ప్రకారం ఖర్చు (Cost Today)',
      definition: 'నేటి ధరల్లో ఆ చదువుకు లేదా లక్ష్యానికి అయ్యే ఖర్చు. భవిష్యత్ ద్రవ్యోల్బణాన్ని కవర్ వైజ్ ఆటోమేటిక్‌గా లెక్కిస్తుంది.',
    },
    existing_cover: {
      title: 'ప్రస్తుతమున్న జీవిత బీమా (Existing Cover)',
      definition: 'మీరు ఇప్పటికే కలిగి ఉన్న పాలసీల మొత్తం కవరేజ్. ఇది లెక్కించి తీసివేయడం వల్ల అవసరానికి మించి అదనపు బీమా కొనాల్సిన పని ఉండదు.',
    },
    employer_cover: {
      title: 'ఉద్యోగ సంస్థ అందించే గ్రూప్ బీమా',
      definition: 'మీరు పనిచేస్తున్న కంపెనీ అందించే లైఫ్ కవర్. మీరు ఉద్యోగం మారినప్పుడు లేదా మానేసినప్పుడు సాధారణంగా ఈ కవర్ రద్దవుతుంది.',
    },
    liquid_savings: {
      title: 'వెంటనే నగదుగా మార్చుకోగల పొదుపు (Liquid Savings)',
      definition: 'బ్యాంకు పొదుపు ఖాతా, ఫిక్స్‌డ్ డిపాజిట్లలో ఉన్న డబ్బు, అవసరమైనప్పుడు వెంటనే కుటుంబానికి ఉపయోగపడుతుంది.',
    },
    investments: {
      title: 'మ్యూచువల్ ఫండ్స్ & స్టాక్ పెట్టుబడులు',
      definition: 'మార్కెట్ ఆధారిత పెట్టుబడులు, అవసరమైతే అప్పులు తీర్చడానికి లేదా కుటుంబ అవసరాలకు ఉపయోగించవచ్చు.',
    },
    retirement_age: {
      title: 'పదవీ విరమణ వయస్సు (Retirement Age)',
      definition: 'మీరు పని ఆపాలని అనుకుంటున్న వయస్సు (సాధారణంగా 60 సంవత్సరాలు). ఇది మీ సంపాదన కాలాన్ని సూచిస్తుంది.',
    },
    income_growth_rate: {
      title: 'ఆదాయ వృద్ధి రేటు (Income Growth Rate)',
      definition: 'ప్రతి సంవత్సరం మీ జీతం లేదా వ్యాపార లాభాలలో మీరు ఆశించే సగటు వృద్ధి శాతం.',
    },
    discount_rate: {
      title: 'డిస్కౌంట్ రేటు (Discount Rate)',
      definition: 'భవిష్యత్తులో వచ్చే డబ్బు విలువను నేటి కొనుగోలు శక్తితో సమానంగా మార్చడానికి ఉపయోగించే యాక్చుయేరియల్ రేటు.',
    },
    general_inflation: {
      title: 'సాధారణ ద్రవ్యోల్బణం (Inflation)',
      definition: 'నిత్యావసరాలు, కిరాణా మరియు జీవన వ్యయాలు ఏటా పెరిగే శాతం.',
    },
    education_inflation: {
      title: 'విద్యా ద్రవ్యోల్బణం (Education Inflation)',
      definition: 'పాఠశాల మరియు కళాశాలల ఫీజులు సాధారణ కిరాణా సామాగ్రి కంటే వేగంగా పెరిగే ప్రత్యేక రేటు.',
    },
    self_consumption: {
      title: 'స్వీయ వినియోగ శాతం (Self Consumption)',
      definition: 'మీ సంపాదనలో మీ స్వంత వ్యక్తిగత ఖర్చుల కోసం వాడే శాతం. ఇది కుటుంబ రక్షణ లెక్కింపులో తీసివేయబడుతుంది.',
    },
    hlv: {
      title: 'హ్యూమన్ లైఫ్ వ్యాల్యూ (Human Life Value - HLV)',
      definition: 'మీ పని జీవితంలో మీ కుటుంబానికి మీరు అందించగల మొత్తం ఆర్థిక విలువను లెక్కించే శాస్త్రీయ పద్ధతి.',
    },
    net_needs: {
      title: 'నెట్ నీడ్స్ విధానం (Net Needs Approach)',
      definition: 'కుటుంబ జీవన ఖర్చులు, అప్పులు, పిల్లల భవిష్యత్ లక్ష్యాల నుండి ఇప్పటికే ఉన్న పొదుపును తీసివేసి సరైన కవరేజీని లెక్కించే విధానం.',
    },
    coverage_gap: {
      title: 'అవసరమైన అదనపు రక్షణ (Coverage Gap)',
      definition: 'మీ కుటుంబానికి అసలైన ఆర్థిక భద్రత కల్పించడానికి ప్రస్తుత పొదుపు కాకుండా ఇంకా కావాల్సిన నికర బీమా మొత్తం.',
    },
    recommended_cover: {
      title: 'సిఫార్సు చేయబడిన జీవిత బీమా (Recommended Cover)',
      definition: 'కవర్ వైజ్ యాక్చుయేరియల్ మోడల్స్ ద్వారా లెక్కించిన సరైన జీవిత బీమా రక్షణ మొత్తం.',
    },
    sum_assured: {
      title: 'సమ్ అష్యూర్డ్ (మొత్తం బీమా హామీ)',
      definition: 'పాలసీ సమయంలో ఏదైనా అనుకోని సంఘటన జరిగితే మీ నామినీకి బీమా కంపెనీ చెల్లించే హామీ మొత్తం.',
      example: 'ఉదాహరణ: ₹1 కోటి సమ్ అష్యూర్డ్ ఉన్న పాలసీలో మీ కుటుంబానికి క్లెయిమ్ సమయంలో ₹1,00,00,000 లభిస్తుంది.',
    },
    policy_tenure: {
      title: 'పాలసీ కాలపరిమితి (Policy Tenure)',
      definition: 'మీ బీమా పాలసీ ఎన్ని సంవత్సరాలు రక్షణ అందిస్తుందో ఆ కాలం (ఉదాహరణకు 60 లేదా 65 ఏళ్ల వయస్సు వరకు).',
    },
    premium: {
      title: 'వార్షిక ప్రీమియం (Annual Premium)',
      definition: 'బీమా రక్షణను కొనసాగించడానికి మీరు సంవత్సరానికి ఒకసారి చెల్లించే రుసుము. ప్యూర్ టర్మ్ ప్లాన్లలో ప్రీమియం ఎప్పటికీ మారదు.',
    },
    riders: {
      title: 'పాలసీ రైడర్లు (Policy Riders)',
      definition: 'ప్రమాద వైకల్యం లేదా తీవ్ర అనారోగ్యాల సమయాల్లో అదనపు ఆర్థిక సహాయం అందించే ప్రత్యేక రక్షణ ప్రయోజనాలు.',
    },
    product_match_score: {
      title: 'ప్రోడక్ట్ మ్యాచ్ స్కోర్ (Match Score)',
      definition: 'కవరేజ్ అనుకూలత, బీమా కంపెనీ క్లెయిమ్ సెటిల్‌మెంట్ నిష్పత్తి ఆధారంగా కవర్ వైజ్ లెక్కించిన సూచిక.',
    },
  },

  hi: {
    annual_income: {
      title: 'वार्षिक टेक-होम आय (Annual Income)',
      definition: 'कटौती के बाद आप एक वर्ष में जो कुल राशि कमाते हैं। यह खेती, दुकान, व्यवसाय या नौकरी से आ सकती है। यदि आपकी आय बदलती रहती है, तो उचित वार्षिक औसत दर्ज करें।',
      example: 'उदाहरण: यदि आप महीने में ₹30,000–₹40,000 कमाते हैं, तो पूरे वर्ष के लिए लगभग ₹4,20,000 दर्ज करें।',
    },
    monthly_expenses: {
      title: 'मासिक घरेलू खर्च (Monthly Expenses)',
      definition: 'किराना, बिजली, किराया, यात्रा और बच्चों की स्कूल फीस जैसी बुनियादी जरूरतों पर हर महीने होने वाला खर्च। यदि ऋण ईएमआई अलग से दर्ज की है तो इसे यहाँ न जोड़ें।',
    },
    homemaker_contribution: {
      title: 'गृहिणी का आर्थिक योगदान (Homemaker Contribution)',
      definition: 'वेतन न मिलने के बावजूद गृहिणी द्वारा खाना पकाना, बच्चों की देखभाल और घर संभालना अमूल्य कार्य हैं। यह मॉडल इन आवश्यक सेवाओं के मूल्य को स्वीकार करता है।',
    },
    dependents: {
      title: 'परिवार के आश्रित (Family Dependents)',
      definition: 'वे सदस्य जो भोजन, स्वास्थ्य और शिक्षा के लिए आपकी आय पर निर्भर हैं, जैसे बच्चे, गैर-कमाने वाले जीवनसाथी और बुजुर्ग माता-पिता।',
    },
    dependent_own_income: {
      title: 'आश्रित की अपनी आय है?',
      definition: 'इसे केवल तभी चुनें जब परिवार के सदस्य की अपनी स्वतंत्र नियमित आय हो (जैसे जीवनसाथी की नौकरी या दुकान)।',
    },
    loan_principal: {
      title: 'बकाया ऋण मूलधन (Outstanding Loan Principal)',
      definition: 'बैंक या ऋणदाता को अभी भी चुकाई जाने वाली मूल राशि। यह आपकी मासिक ईएमआई नहीं है।',
      example: 'उदाहरण: ₹10 लाख के होम लोन में यदि ₹3 लाख मूलधन चुका दिया है, तो ₹7 लाख बकाया है।',
    },
    liabilities: {
      title: 'कुल देनदारियां और कर्ज (Liabilities)',
      definition: 'घर, वाहन, व्यक्तिगत या कृषि ऋणों की कुल बकाया राशि ताकि संकट के समय परिवार को संपत्ति न बेचनी पड़े।',
    },
    future_goals: {
      title: 'भविष्य के वित्तीय लक्ष्य (Future Goals)',
      definition: 'बच्चों की उच्च शिक्षा या शादी जैसे महत्वपूर्ण बड़े भविष्य के खर्चे।',
    },
    target_year: {
      title: 'लक्ष्य वर्ष (Target Year)',
      definition: 'कैलेंडर वर्ष जब उस खर्च की आवश्यकता होगी (जैसे 2036 में जब बच्चा 18 वर्ष का होगा)।',
    },
    cost_today: {
      title: 'आज के मूल्यों में लागत (Cost Today)',
      definition: 'आज के बाजार भाव में उस लक्ष्य की अनुमानित लागत। भविष्य की महंगाई कवरवाइज़ अपने आप जोड़ लेता है।',
    },
    existing_cover: {
      title: 'मौजूदा जीवन बीमा कवर (Existing Cover)',
      definition: 'आपके पास पहले से मौजूद सक्रिय बीमा पॉलिसियों की कुल राशि। इसे घटाया जाता है ताकि आपको अनावश्यक अधिक बीमा न खरीदना पड़े।',
    },
    employer_cover: {
      title: 'कंपनी द्वारा प्रदान किया गया समूह बीमा',
      definition: 'आपकी कंपनी द्वारा दिया जाने वाला जीवन कवर, जो नौकरी बदलने पर आमतौर पर समाप्त हो जाता है।',
    },
    liquid_savings: {
      title: 'तुरंत उपलब्ध बचत (Liquid Savings)',
      definition: 'बैंक बचत खाते या फिक्स्ड डिपॉजिट में जमा राशि जो आपातकाल में तुरंत काम आ सकती है।',
    },
    investments: {
      title: 'म्यूचुअल फंड और शेयर निवेश',
      definition: 'बाजार से जुड़े निवेश जिनका उपयोग जरूरत पड़ने पर कर्ज चुकाने या परिवार के भरण-पोषण के लिए किया जा सकता है।',
    },
    retirement_age: {
      title: 'सेवानिवृत्ति की आयु (Retirement Age)',
      definition: 'वह आयु जब आप काम बंद करने की योजना बनाते हैं (मानक डिफ़ॉल्ट 60 वर्ष)।',
    },
    income_growth_rate: {
      title: 'आय वृद्धि दर (Income Growth Rate)',
      definition: 'कामकाजी जीवन के दौरान वेतन या व्यावसायिक मुनाफे में अपेक्षित वार्षिक वृद्धि प्रतिशत।',
    },
    discount_rate: {
      title: 'छूट दर (Discount Rate)',
      definition: 'भविष्य के पैसे को आज के मूल्य में व्यक्त करने के लिए बीमा गणित में उपयोग की जाने वाली दर।',
    },
    general_inflation: {
      title: 'सामान्य मुद्रास्फीति (Inflation Rate)',
      definition: 'दैनिक किराने, परिवहन और जीवन यापन की लागत में वार्षिक प्रतिशत वृद्धि।',
    },
    education_inflation: {
      title: 'शिक्षा मुद्रास्फीति (Education Inflation)',
      definition: 'स्कूल और कॉलेज की फीस में वृद्धि दर, जो आम तौर पर सामान्य किराना मुद्रास्फीति से तेज होती है।',
    },
    self_consumption: {
      title: 'व्यक्तिगत उपभोग प्रतिशत (Self Consumption)',
      definition: 'आपकी आय का वह हिस्सा जो आप अपने निजी खर्चों पर व्यतीत करते हैं। बीमा गणना में इसे घटाया जाता है।',
    },
    hlv: {
      title: 'ह्यूमन लाइफ वैल्यू (Human Life Value - HLV)',
      definition: 'आपके शेष कामकाजी वर्षों में आपके परिवार के लिए आपकी भविष्य की कमाई के आर्थिक मूल्य का अनुमान।',
    },
    net_needs: {
      title: 'नेट नीड्स दृष्टिकोण (Net Needs Approach)',
      definition: 'परिवार के भविष्य के खर्चों और ऋणों से मौजूदा बचत को घटाकर आवश्यक सुरक्षा राशि निकालने का तरीका।',
    },
    coverage_gap: {
      title: 'अनुमानित सुरक्षा अंतर (Coverage Gap)',
      definition: 'परिवार की कुल जरूरतों और वर्तमान में उपलब्ध बचत के बीच का शुद्ध अंतर।',
    },
    recommended_cover: {
      title: 'अनुशंसित जीवन बीमा कवर (Recommended Cover)',
      definition: 'कवरवाइज़ के डुअल-इंजन मॉडल द्वारा सुझाई गई सटीक जीवन बीमा राशि।',
    },
    sum_assured: {
      title: 'बीमा राशि (Sum Assured)',
      definition: 'पॉलिसी अवधि में किसी अनहोनी पर आपके नॉमिनी को बीमा कंपनी द्वारा दी जाने वाली गारंटीकृत कर-मुक्त राशि।',
      example: 'उदाहरण: ₹1 करोड़ सम एश्योर्ड का अर्थ है कि क्लेम स्वीकृत होने पर नॉमिनी को ₹1,00,00,000 मिलेंगे।',
    },
    policy_tenure: {
      title: 'पॉलिसी अवधि (Policy Tenure)',
      definition: 'वह समय जब तक आपकी बीमा पॉलिसी सक्रिय रहती है (जैसे 60 या 65 वर्ष की आयु तक)।',
    },
    premium: {
      title: 'वार्षिक प्रीमियम (Annual Premium)',
      definition: 'बीमा कवर चालू रखने के लिए हर साल दी जाने वाली निश्चित किस्त। टर्म प्लान में यह पूरी अवधि समान रहती है।',
    },
    riders: {
      title: 'पॉलिसी राइडर्स (Policy Riders)',
      definition: 'दुर्घटना विकलांगता या गंभीर बीमारी की स्थिति में अतिरिक्त सुरक्षा देने वाले वैकल्पिक लाभ।',
    },
    product_match_score: {
      title: 'प्रॉडक्ट मैच स्कोर (Match Score)',
      definition: 'पॉलिसी की उपयुक्तता, कंपनी के क्लेम सेटलमेंट अनुपात और सामर्थ्य के आधार पर निकाला गया स्कोर।',
    },
  },

  ta: {
    annual_income: {
      title: 'ஆண்டு நிகர வருமானம் (Annual Income)',
      definition: 'கழிவுகளுக்குப் பிறகு ஒரு ஆண்டில் நீங்கள் சம்பாதிக்கும் நிகர வருமானம். இது விவசாயம், கடை, தொழில் அல்லது வேலை மூலம் வரலாம். வருமானம் மாறுபட்டால் சராசரி தொகையை குறிப்பிடவும்.',
      example: 'உதாரணம்: மாதம் ₹30,000–₹40,000 சம்பாதிப்பவர் வருடத்திற்கு ₹4,20,000 என குறிப்பிடலாம்.',
    },
    monthly_expenses: {
      title: 'மாதாந்திர குடும்ப செலவுகள் (Monthly Expenses)',
      definition: 'உணவு, மின்சாரம், வாடகை, போக்குவரத்து, பள்ளி கட்டணம் போன்ற அடிப்படை தேவைகளுக்காக குடும்பம் செலவழிக்கும் தொகை.',
    },
    homemaker_contribution: {
      title: 'இல்லத்தரசியின் பொருளாதார பங்களிப்பு',
      definition: 'சம்பளம் இல்லாவிட்டாலும், சமையல், குழந்தைகளை வளர்த்தல், வீட்டு மேலாண்மை போன்ற பணிகளின் பொருளாதார மதிப்பை இந்த மாதிரி அங்கீகரிக்கிறது.',
    },
    dependents: {
      title: 'குடும்ப சார்ந்திருப்பவர்கள் (Dependents)',
      definition: 'தங்களின் தினசரி வாழ்வாதாரம் மற்றும் மருத்துவத்திற்கு உங்கள் வருமானத்தை நம்பியிருக்கும் குடும்ப உறுப்பினர்கள்.',
    },
    dependent_own_income: {
      title: 'சார்ந்திருப்பவருக்கு சொந்த வருமானம் உள்ளதா?',
      definition: 'குடும்ப உறுப்பினருக்கு சொந்தமாக வழக்கமான வருமானம் இருந்தால் மட்டுமே இதைத் தேர்ந்தெடுக்கவும்.',
    },
    loan_principal: {
      title: 'மீதமுள்ள அசல் கடன் (Loan Principal)',
      definition: 'வங்கிக்கு நீங்கள் இன்னும் திருப்பிச் செலுத்த வேண்டிய அசல் தொகை. இது மாதாந்திர இஎம்ஐ அல்ல.',
    },
    liabilities: {
      title: 'மொத்த கடன் பொறுப்புகள் (Liabilities)',
      definition: 'வீட்டுக்கடன், வாகனக்கடன் அல்லது இதர கடன்கள். எதிர்பாராத சூழலில் குடும்பம் நிலத்தையோ சொத்தையோ விற்காமல் காக்க உதவும்.',
    },
    future_goals: {
      title: 'எதிர்கால நிதி இலக்குகள் (Future Goals)',
      definition: 'குழந்தைகளின் உயர்கல்வி அல்லது திருமணம் போன்ற எதிர்காலத்தில் திட்டமிடப்பட்ட முக்கிய செலவுகள்.',
    },
    target_year: {
      title: 'இலக்கு ஆண்டு (Target Year)',
      definition: 'எதிர்காலத்தில் அந்த செலவு தேவைப்படும் குறிப்பிட்ட ஆண்டு (எ.கா. 2036).',
    },
    cost_today: {
      title: 'இன்றைய மதிப்பில் செலவு (Cost Today)',
      definition: 'இன்றைய விலை நிலவரப்படி அந்த கல்வி அல்லது இலக்கிற்கான செலவு. எதிர்கால பணவீக்கத்தை கவர்வைஸ் தானாக கணக்கிடும்.',
    },
    existing_cover: {
      title: 'தற்போதுள்ள ஆயுள் காப்பீடு (Existing Cover)',
      definition: 'நீங்கள் ஏற்கனவே வைத்துள்ள காப்பீடுகளின் மொத்த மதிப்பு. இது கணக்கீட்டில் கழிக்கப்படும்.',
    },
    employer_cover: {
      title: 'நிறுவனம் வழங்கும் குழு காப்பீடு',
      definition: 'உங்கள் வேலை நிறுவனம் வழங்கும் காப்பீடு, வேலையை விடும்போது பொதுவாக முடிவடையும்.',
    },
    liquid_savings: {
      title: 'உடனடி சேமிப்பு (Liquid Savings)',
      definition: 'வங்கி கணக்கு அல்லது எஃப்டி-யில் உள்ள பணம், அவசர காலங்களில் உடனடியாக பயன்படும்.',
    },
    investments: {
      title: 'மியூச்சுவல் ஃபண்ட் & பங்கு முதலீடுகள்',
      definition: 'சந்தை முதலீடுகள், தேவைப்பட்டால் கடன்களை அடைக்க அல்லது குடும்ப செலவுகளுக்கு பயன்படுத்தலாம்.',
    },
    retirement_age: {
      title: 'ஓய்வு பெறும் வயது (Retirement Age)',
      definition: 'நீங்கள் வேலையை நிறுத்த திட்டமிட்டுள்ள வயது (இயல்புநிலை 60 வயது).',
    },
    income_growth_rate: {
      title: 'வருமான வளர்ச்சி விகிதம் (Income Growth)',
      definition: 'ஒவ்வொரு ஆண்டும் உங்கள் வருமானத்தில் எதிர்பார்க்கப்படும் சராசரி வளர்ச்சி சதவீதம்.',
    },
    discount_rate: {
      title: 'தள்ளுபடி விகிதம் (Discount Rate)',
      definition: 'எதிர்கால பணத்தை இன்றைய வாங்கும் திறனுடன் ஒப்பிட பயன்படும் கணக்கீட்டு விகிதம்.',
    },
    general_inflation: {
      title: 'பொது பணவீக்கம் (Inflation)',
      definition: 'மளிகை, போக்குவரத்து மற்றும் வாழ்க்கைச் செலவுகள் ஆண்டுதோறும் உயரும் சதவீதம்.',
    },
    education_inflation: {
      title: 'கல்வி பணவீக்கம் (Education Inflation)',
      definition: 'கல்லூரி மற்றும் பள்ளி கட்டணங்கள் உயரும் தனித்துவமான பணவீக்க விகிதம்.',
    },
    self_consumption: {
      title: 'சுய நுகர்வு சதவீதம் (Self Consumption)',
      definition: 'உங்கள் வருமானத்தில் உங்கள் சொந்த தேவைகளுக்கு செலவிடும் பகுதி. இது கணக்கீட்டில் கழிக்கப்படும்.',
    },
    hlv: {
      title: 'மனித ஆயுள் மதிப்பு (Human Life Value - HLV)',
      definition: 'உங்கள் பணி காலத்தில் குடும்பத்திற்கு நீங்கள் வழங்கக்கூடிய மொத்த நிதி மதிப்பின் மதிப்பீடு.',
    },
    net_needs: {
      title: 'நிகர தேவைகள் அணுகுமுறை (Net Needs)',
      definition: 'குடும்பத்தின் எதிர்கால செலவுகளிலிருந்து இருக்கும் சேமிப்பை கழித்து சரியான காப்பீட்டை கணக்கிடும் முறை.',
    },
    coverage_gap: {
      title: 'தேவைப்படும் கூடுதல் பாதுகாப்பு (Coverage Gap)',
      definition: 'குடும்பத்தின் முழுமையான பாதுகாப்புக்கு இருக்கும் சேமிப்பைத் தவிர இன்னும் தேவைப்படும் கூடுதல் தொகை.',
    },
    recommended_cover: {
      title: 'பரிந்துரைக்கப்பட்ட ஆயுள் காப்பீடு (Recommended Cover)',
      definition: 'கவர்வைஸ் மாதிரிகள் மூலம் கணக்கிடப்பட்ட துல்லியமான காப்பீட்டுத் தொகை.',
    },
    sum_assured: {
      title: 'உறுதிசெய்யப்பட்ட தொகை (Sum Assured)',
      definition: 'பாலிசி காலத்தில் அசம்பாவிதம் ஏற்பட்டால் உங்கள் குடும்பத்திற்கு காப்பீட்டு நிறுவனம் வழங்கும் உத்தரவாதத் தொகை.',
    },
    policy_tenure: {
      title: 'பாலிசி காலம் (Policy Tenure)',
      definition: 'உங்கள் காப்பீடு நடைமுறையில் இருக்கும் வருடங்களின் எண்ணிக்கை (எ.கா. 60 வயது வரை).',
    },
    premium: {
      title: 'ஆண்டு பிரீமியம் (Annual Premium)',
      definition: 'காப்பீட்டை தொடர ஒவ்வொரு ஆண்டும் நீங்கள் செலுத்தும் நிலையான கட்டணம்.',
    },
    riders: {
      title: 'பாலிசி ரைடர்கள் (Policy Riders)',
      definition: 'விபத்து ஊனம் அல்லது தீவிர நோய்களுக்கான கூடுதல் நிதி ஆதரவை வழங்கும் கூடுதல் நன்மைகள்.',
    },
    product_match_score: {
      title: 'பொருத்த மதிப்பெண் (Match Score)',
      definition: 'காப்பீட்டு தகுதி மற்றும் நிறுவனத்தின் க்ளெய்ம் செட்டில்மென்ட் அடிப்படையில் கணக்கிடப்பட்ட மதிப்பீடு.',
    },
  },

  kn: {
    annual_income: {
      title: 'ವಾರ್ಷಿಕ ನಿವ್ವಳ ಆದಾಯ (Annual Income)',
      definition: 'ಕಡಿತಗಳ ನಂತರ ನೀವು ಒಂದು ವರ್ಷದಲ್ಲಿ ಗಳಿಸುವ ಒಟ್ಟು ಆದಾಯ. ಇದು ಕೃಷಿ, ವ್ಯಾಪಾರ, ಅಂಗಡಿ ಅಥವಾ ಉದ್ಯೋಗದಿಂದ ಬರಬಹುದು. ಆದಾಯ ಬದಲಾಗುತ್ತಿದ್ದರೆ ಸರಾಸರಿ ಮೊತ್ತ ನಮೂದಿಸಿ.',
      example: 'ಉದಾಹರಣೆ: ತಿಂಗಳಿಗೆ ₹30,000–₹40,000 ಗಳಿಸುವವರು ವರ್ಷಕ್ಕೆ ₹4,20,000 ನಮೂದಿಸಬಹುದು.',
    },
    monthly_expenses: {
      title: 'ಮಾಸಿಕ ಕೌಟುಂಬಿಕ ಖರ್ಚುಗಳು (Monthly Expenses)',
      definition: 'ಆಹಾರ, ವಿದ್ಯುತ್, ಬಾಡಿಗೆ, ಪ್ರಯಾಣ ಮತ್ತು ಮಕ್ಕಳ ಶಾಲಾ ಶುಲ್ಕದಂತಹ ಮೂಲಭೂತ ಅಗತ್ಯಗಳಿಗಾಗಿ ಪ್ರತಿ ತಿಂಗಳು ಕುಟುಂಬ ಮಾಡುವ ಖರ್ಚು.',
    },
    homemaker_contribution: {
      title: 'ಗೃಹಿಣಿಯ ಆರ್ಥಿಕ ಕೊಡುಗೆ (Homemaker Contribution)',
      definition: 'ವೇತನ ಪಡೆಯದಿದ್ದರೂ ಅಡುಗೆ, ಮಕ್ಕಳ ಪಾಲನೆ, ಮನೆ ನಿರ್ವಹಣೆಯಂತಹ ಕೆಲಸಗಳು ಅಪಾರ ಮೌಲ್ಯ ಹೊಂದಿವೆ. ಈ ಮಾದರಿಯು ಈ ಸೇವೆಗಳ ಆರ್ಥಿಕ ಮೌಲ್ಯವನ್ನು ಗುರುತಿಸುತ್ತದೆ.',
    },
    dependents: {
      title: 'ಕುಟುಂಬದ ಅವಲಂಬಿತರು (Dependents)',
      definition: 'ತಮ್ಮ ದೈನಂದಿನ ಜೀವನ ಮತ್ತು ವೈದ್ಯಕೀಯ ವೆಚ್ಚಕ್ಕಾಗಿ ನಿಮ್ಮ ಆದಾಯವನ್ನು ಅವಲಂಬಿಸಿರುವ ಕುಟುಂಬದ ಸದಸ್ಯರು.',
    },
    dependent_own_income: {
      title: 'ಅವಲಂಬಿತರಿಗೆ ಸ್ವಂತ ಆದಾಯವಿದೆಯೇ?',
      definition: 'ಕುಟುಂಬದ ಸದಸ್ಯರಿಗೆ ಸ್ವಂತ ನಿಯಮಿತ ಆದಾಯವಿದ್ದಾಗ ಮಾತ್ರ ಇದನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    loan_principal: {
      title: 'ಬಾಕಿ ಇರುವ ಸಾಲದ ಅಸಲು (Loan Principal)',
      definition: 'ಬ್ಯಾಂಕಿಗೆ ನೀವು ಇನ್ನೂ ಮರುಪಾವತಿಸಬೇಕಾದ ಅಸಲು ಮೊತ್ತ. ಇದು ಮಾಸಿಕ ಇಎಂಐ ಅಲ್ಲ.',
    },
    liabilities: {
      title: 'ಒಟ್ಟು ಸಾಲ ಮತ್ತು ಹೊಣೆಗಾರಿಕೆಗಳು (Liabilities)',
      definition: 'ಗೃಹ ಸಾಲ, ವಾಹನ ಸಾಲ ಅಥವಾ ಇತರ ಸಾಲಗಳು. ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಕುಟುಂಬ ಆಸ್ತಿಯನ್ನು ಮಾರದಂತೆ ಇದು ರಕ್ಷಿಸುತ್ತದೆ.',
    },
    future_goals: {
      title: 'ಭವಿಷ್ಯದ ಆರ್ಥಿಕ ಗುರಿಗಳು (Future Goals)',
      definition: 'ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ ಅಥವಾ ಮದುವೆಯಂತಹ ಭವಿಷ್ಯದಲ್ಲಿ ಯೋಜಿಸಲಾದ ಪ್ರಮುಖ ವೆಚ್ಚಗಳು.',
    },
    target_year: {
      title: 'ಗುರಿ ವರ್ಷ (Target Year)',
      definition: 'ಭವಿಷ್ಯದಲ್ಲಿ ಆ ವೆಚ್ಚವು ಅಗತ್ಯವಿರುವ ಕ್ಯಾಲೆಂಡರ್ ವರ್ಷ (ಉದಾಹರಣೆಗೆ 2036).',
    },
    cost_today: {
      title: 'ಇಂದಿನ ಮೌಲ್ಯದಲ್ಲಿ ವೆಚ್ಚ (Cost Today)',
      definition: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯಲ್ಲಿ ಆ ಶಿಕ್ಷಣದ ಅಂದಾಜು ವೆಚ್ಚ. ಭವಿಷ್ಯದ ಹಣದುಬ್ಬರವನ್ನು ಕವರ್‌ವೈಸ್ ತಾನಾಗಿಯೇ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.',
    },
    existing_cover: {
      title: 'ಈಗಿರುವ ಜೀವ ವಿಮೆ (Existing Cover)',
      definition: 'ನೀವು ಈಗಾಗಲೇ ಹೊಂದಿರುವ ವಿಮಾ ಪಾಲಿಸಿಗಳ ಒಟ್ಟು ಮೊತ್ತ. ಇದನ್ನು ಒಟ್ಟು ಅಗತ್ಯದಿಂದ ಕಳೆಯಲಾಗುತ್ತದೆ.',
    },
    employer_cover: {
      title: 'ಸಂಸ್ಥೆ ಒದಗಿಸುವ ಗುಂಪು ವಿಮೆ',
      definition: 'ನಿಮ್ಮ ಉದ್ಯೋಗ ಸಂಸ್ಥೆ ನೀಡುವ ಲೈಫ್ ಕವರ್, ಕೆಲಸ ಬಿಟ್ಟಾಗ ಸಾಮಾನ್ಯವಾಗಿ ಇದು ರದ್ದಾಗುತ್ತದೆ.',
    },
    liquid_savings: {
      title: 'ತಕ್ಷಣ ಲಭ್ಯವಿರುವ ಉಳಿತಾಯ (Liquid Savings)',
      definition: 'ಬ್ಯಾಂಕ್ ಉಳಿತಾಯ ಖಾತೆ ಅಥವಾ ಎಫ್‌ಡಿಯಲ್ಲಿರುವ ಹಣ, ತುರ್ತು ಸಮಯದಲ್ಲಿ ತಕ್ಷಣವೇ ಕುಟುಂಬಕ್ಕೆ ಸಹಾಯವಾಗುತ್ತದೆ.',
    },
    investments: {
      title: 'ಮ್ಯೂಚುವಲ್ ಫಂಡ್ಸ್ & ಷೇರು ಹೂಡಿಕೆಗಳು',
      definition: 'ಮಾರುಕಟ್ಟೆ ಆಧಾರಿತ ಹೂಡಿಕೆಗಳು, ಅಗತ್ಯವಿದ್ದಾಗ ಸಾಲ ತೀರಿಸಲು ಅಥವಾ ಕುಟುಂಬದ ವೆಚ್ಚಗಳಿಗೆ ಬಳಸಬಹುದು.',
    },
    retirement_age: {
      title: 'ನಿವೃತ್ತಿ ವಯಸ್ಸು (Retirement Age)',
      definition: 'ನೀವು ಕೆಲಸ ನಿಲ್ಲಿಸಲು ಯೋಜಿಸಿರುವ ವಯಸ್ಸು (ಸಾಮಾನ್ಯವಾಗಿ 60 ವರ್ಷಗಳು).',
    },
    income_growth_rate: {
      title: 'ಆದಾಯ ಬೆಳವಣಿಗೆ ದರ (Income Growth Rate)',
      definition: 'ಪ್ರತಿ ವರ್ಷ ನಿಮ್ಮ ಆದಾಯದಲ್ಲಿ ನಿರೀಕ್ಷಿಸುವ ಸರಾಸರಿ ಶೇಕಡಾವಾರು ಬೆಳವಣಿಗೆ.',
    },
    discount_rate: {
      title: 'ಡಿಸ್ಕೌಂಟ್ ದರ (Discount Rate)',
      definition: 'ಭವಿಷ್ಯದ ಹಣದ ಮೌಲ್ಯವನ್ನು ಇಂದಿನ ಕೊಳ್ಳುವ ಶಕ್ತಿಯೊಂದಿಗೆ ಹೋಲಿಸಲು ಬಳಸುವ ಆಕ್ಚುಯೇರಿಯಲ್ ದರ.',
    },
    general_inflation: {
      title: 'ಸಾಮಾನ್ಯ ಹಣದುಬ್ಬರ (Inflation Rate)',
      definition: 'ದೈನಂದಿನ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಜೀವನ ವೆಚ್ಚವು ಪ್ರತಿ ವರ್ಷ ಹೆಚ್ಚಾಗುವ ಶೇಕಡಾವಾರು ದರ.',
    },
    education_inflation: {
      title: 'ಶಿಕ್ಷಣ ಹಣದುಬ್ಬರ (Education Inflation)',
      definition: 'ಶಾಲಾ ಮತ್ತು ಕಾಲೇಜು ಶುಲ್ಕಗಳು ಹೆಚ್ಚಾಗುವ ವಿಶಿಷ್ಟ ದರ.',
    },
    self_consumption: {
      title: 'ಸ್ವಯಂ ಬಳಕೆ ಶೇಕಡಾವಾರು (Self Consumption)',
      definition: 'ನಿಮ್ಮ ಸ್ವಂತ ಖರ್ಚುಗಳಿಗಾಗಿ ಬಳಸುವ ಆದಾಯದ ಭಾಗ. ವಿಮಾ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ಇದನ್ನು ಕಳೆಯಲಾಗುತ್ತದೆ.',
    },
    hlv: {
      title: 'ಹ್ಯೂಮನ್ ಲೈಫ್ ವ್ಯಾಲ್ಯೂ (Human Life Value - HLV)',
      definition: 'ನಿಮ್ಮ ದುಡಿಮೆಯ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ನೀವು ಒದಗಿಸಬಹುದಾದ ಒಟ್ಟು ಆರ್ಥಿಕ ಮೌಲ್ಯದ ಅಂದಾಜು.',
    },
    net_needs: {
      title: 'ನೆಟ್ ನೀಡ್ಸ್ ವಿಧಾನ (Net Needs Approach)',
      definition: 'ಕುಟುಂಬದ ಭವಿಷ್ಯದ ವೆಚ್ಚಗಳಿಂದ ಪ್ರಸ್ತುತ ಉಳಿತಾಯವನ್ನು ಕಳೆದು ಸೂಕ್ತ ವಿಮಾ ಮೊತ್ತವನ್ನು ಲೆಕ್ಕಹಾಕುವ ವಿಧಾನ.',
    },
    coverage_gap: {
      title: 'ಅಗತ್ಯವಿರುವ ಹೆಚ್ಚುವರಿ ರಕ್ಷಣೆ (Coverage Gap)',
      definition: 'ಕುಟುಂಬದ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆಗೆ ಇರುವ ಉಳಿತಾಯದ ಹೊರತಾಗಿ ಇನ್ನೂ ಬೇಕಾದ ಹೆಚ್ಚುವರಿ ಮೊತ್ತ.',
    },
    recommended_cover: {
      title: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಜೀವ ವಿಮೆ (Recommended Cover)',
      definition: 'ಕವರ್‌ವೈಸ್ ಮಾದರಿಗಳ ಮೂಲಕ ಲೆಕ್ಕಹಾಕಲಾದ ನಿಖರ ವಿಮಾ ರಕ್ಷಣೆ.',
    },
    sum_assured: {
      title: 'ಸಮ್ ಅಶ್ಯೂರ್ಡ್ (ವಿಮಾ ಮೊತ್ತ)',
      definition: 'ಪಾಲಿಸಿ ಅವಧಿಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ಸಂಭವಿಸಿದರೆ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ವಿಮಾ ಕಂಪನಿಯು ಪಾವತಿಸುವ ಖಾತರಿಯ ಮೊತ್ತ.',
    },
    policy_tenure: {
      title: 'ಪಾಲಿಸಿ ಅವಧಿ (Policy Tenure)',
      definition: 'ನಿಮ್ಮ ವಿಮೆ ಜಾರಿಯಲ್ಲಿರುವ ವರ್ಷಗಳ ಸಂಖ್ಯೆ (ಉದಾಹರಣೆಗೆ 60 ಅಥವಾ 65 ವರ್ಷಗಳವರೆಗೆ).',
    },
    premium: {
      title: 'ವಾರ್ಷಿಕ ಪ್ರೀಮಿಯಂ (Annual Premium)',
      definition: 'ವಿಮಾ ರಕ್ಷಣೆಯನ್ನು ಮುಂದುವರಿಸಲು ಪ್ರತಿ ವರ್ಷ ಪಾವತಿಸುವ ನಿಗದಿತ ಶುಲ್ಕ.',
    },
    riders: {
      title: 'ಪಾಲಿಸಿ ರೈಡರ್‌ಗಳು (Policy Riders)',
      definition: 'ಅಪಘಾತ ಅಂಗವೈಕಲ್ಯ ಅಥವಾ ಗಂಭೀರ ಕಾಯಿಲೆಗಳ ಸಂದರ್ಭದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಆರ್ಥಿಕ ರಕ್ಷಣೆ ನೀಡುವ ಸೌಲಭ್ಯಗಳು.',
    },
    product_match_score: {
      title: 'ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್ (Match Score)',
      definition: 'ವಿಮಾ ಯೋಜನೆ ಸೂಕ್ತತೆ ಮತ್ತು ಕಂಪನಿಯ ಕ್ಲೈಮ್ ಸೆಟಲ್ಮೆಂಟ್ ಆಧಾರದ ಮೇಲೆ ನೀಡಲಾದ ಸ್ಕೋರ್.',
    },
  },
};

export const LIFE_STORY_CONTENT: Record<Language, LifeStoryContent> = {
  en: {
    sectionTag: 'Financial Literacy & Awareness',
    sectionHeading: 'New to Life Insurance? Understand It Through a Simple Story.',
    sectionSubheading: "A short, visual example showing how term life insurance can protect your family's future.",
    openStoryBtn: 'See How Life Insurance Works (40s)',
    storyModalTitle: 'Why Life Insurance Matters — Ramu’s Story',
    scenes: [
      {
        step: 1,
        badge: 'Scene 1 · Everyday Life',
        title: 'Meet Ramu, a Dedicated Farmer',
        narrative: 'Ramu works hard in his fields every day to earn a livelihood. His spouse, children, and elderly parents depend on his monthly income for their groceries, school fees, and daily medicine.',
        keyTakeaway: 'Like most families, Ramu’s household relies on one primary income earner for their dignity and survival.',
      },
      {
        step: 2,
        badge: 'Scene 2 · The Unexpected',
        title: 'What Happens If His Income Suddenly Stops?',
        narrative: 'If an unexpected tragedy strikes and Ramu is no longer there, his income abruptly ends. But the family’s daily expenses, farm loans, and children’s school fees do not stop. Without savings, the family faces severe hardship.',
        keyTakeaway: 'Loss of income without a safety net can force families to leave school or sell their land.',
      },
      {
        step: 3,
        badge: 'Scene 3 · The Protective Shield',
        title: 'How Life Insurance Steps In',
        narrative: 'Because Ramu secured an active pure term insurance policy, the insurer pays the guaranteed sum assured directly to his nominee. His family can clear all debts and continue their children’s education with dignity.',
        keyTakeaway: 'Life insurance does not replace a loved one — it replaces their lost income so the family stays financially secure.',
      },
      {
        step: 4,
        badge: 'Scene 4 · Planning Your Cover',
        title: 'Protection Designed for Your Family',
        narrative: 'Every family is unique. A shopkeeper, farmer, or software engineer all need different protection amounts based on their debts and expenses. CoverWise uses actuarial math to calculate your exact need.',
        keyTakeaway: 'Pure term insurance is affordable, simple, and gives your family unbreakable peace of mind.',
      },
    ],
    controls: {
      next: 'Next Scene →',
      back: '← Back',
      close: 'Close Story',
      skip: 'Skip to Assessment',
      replay: 'Replay Story',
      finalCta: 'Find Out How Much Cover You Need →',
      stepOf: 'Scene',
    },
  },

  te: {
    sectionTag: 'ఆర్థిక అవగాహన & ప్రాథమిక జ్ఞానం',
    sectionHeading: 'జీవిత బీమా అంటే ఏమిటి? ఒక చిన్న కథ ద్వారా సులభంగా అర్థం చేసుకోండి.',
    sectionSubheading: 'టర్మ్ లైఫ్ ఇన్సూరెన్స్ మీ కుటుంబానికి ఎలా ఆర్థిక రక్షణ కల్పిస్తుందో తెలిపే 40 సెకన్ల చిన్న ఉదాహరణ.',
    openStoryBtn: 'జీవిత బీమా ఎలా పనిచేస్తుందో చూడండి (40 సె॥)',
    storyModalTitle: 'జీవిత బీమా ఎందుకు అవసరం? — రాము కథ',
    scenes: [
      {
        step: 1,
        badge: 'దృశ్యం 1 · దైనందిన జీవితం',
        title: 'రాము, ఒక కష్టపడే రైతు',
        narrative: 'రాము ప్రతిరోజూ తన పొలంలో కష్టపడి సంపాదిస్తాడు. అతని భార్య, చదువుకునే పిల్లలు, వృద్ధ తల్లిదండ్రులు వారి రోజువారీ ఆహారం, మందులు మరియు స్కూల్ ఫీజుల కోసం అతని సంపాదనపైనే ఆధారపడతారు.',
        keyTakeaway: 'చాలా కుటుంబాల లాగే, రాము కుటుంబం కూడా రోజువారీ అవసరాలకు ఒక్కరి ఆదాయంపైనే ఆధారపడి ఉంది.',
      },
      {
        step: 2,
        badge: 'దృశ్యం 2 · అనుకోని ఆపద',
        title: 'ఆదాయం హఠాత్తుగా ఆగిపోతే ఏమవుతుంది?',
        narrative: 'అనుకోకుండా రాముకు ఏదైనా జరిగి అతను లేకపోతే, కుటుంబానికి వచ్చే ఆదాయం ఒక్కసారిగా ఆగిపోతుంది. కానీ ఇంటి ఖర్చులు, వ్యవసాయ రుణాలు, పిల్లల చదువు ఖర్చులు ఆగవు. సరైన రక్షణ లేకపోతే కుటుంబం తీవ్ర ఇబ్బందుల్లో పడుతుంది.',
        keyTakeaway: 'ఆర్థిక రక్షణ లేకపోతే అప్పులు తీర్చడానికి భూమి లేదా ఇంటిని అమ్ముకోవాల్సి రావచ్చు.',
      },
      {
        step: 3,
        badge: 'దృశ్యం 3 · రక్షణ కవచం',
        title: 'జీవిత బీమా ఎలా ఆదుకుంటుంది?',
        narrative: 'రాము ముందుచూపుతో సరైన టర్మ్ లైఫ్ ఇన్సూరెన్స్ తీసుకున్నాడు. ఏదైనా అనుకోని సంఘటన జరిగినప్పుడు, బీమా సంస్థ ఆ హామీ మొత్తాన్ని అతని కుటుంబానికి అందిస్తుంది. ఆ డబ్బుతో కుటుంబం అప్పులు తీర్చుకుని, పిల్లల చదువును ఆత్మగౌరవంతో కొనసాగించవచ్చు.',
        keyTakeaway: 'జీవిత బీమా మనిషిని తిరిగి తీసుకురాలేదు, కానీ అతని ఆదాయాన్ని భర్తీ చేసి కుటుంబాన్ని నిలబెడుతుంది.',
      },
      {
        step: 4,
        badge: 'దృశ్యం 4 · ముందస్తు ప్రణాళిక',
        title: 'మీ కుటుంబానికి తగిన రక్షణను ఎంచుకోండి',
        narrative: 'ప్రతి కుటుంబం అవసరాలు వేరుగా ఉంటాయి. రైతు, చిరు వ్యాపారి, ఉద్యోగి ఎవరికైనా వారి అప్పులు, ఖర్చుల ఆధారంగా ఎంత బీమా కావాలో కవర్ వైజ్ ఉచితంగా లెక్కిస్తుంది.',
        keyTakeaway: 'ప్యూర్ టర్మ్ ఇన్సూరెన్స్ చాలా తక్కువ ఖర్చుతో కూడుకున్నది మరియు కుటుంబానికి కొండంత అండగా నిలుస్తుంది.',
      },
    ],
    controls: {
      next: 'తరువాతి దృశ్యం →',
      back: '← వెనుకకు',
      close: 'మూసివేయి',
      skip: 'అంచనాకు వెళ్లండి',
      replay: 'మళ్లీ చూడండి',
      finalCta: 'మీకు ఎంత బీమా కావాలో తెలుసుకోండి →',
      stepOf: 'దృశ్యం',
    },
  },

  hi: {
    sectionTag: 'वित्तीय साक्षरता और जागरूकता',
    sectionHeading: 'जीवन बीमा क्या है? एक सरल कहानी के माध्यम से समझें।',
    sectionSubheading: 'एक 40 सेकंड का दृश्य उदाहरण जो दिखाता है कि टर्म लाइफ इंश्योरेंस आपके परिवार के भविष्य की रक्षा कैसे करता है।',
    openStoryBtn: 'देखें जीवन बीमा कैसे काम करता है (40s)',
    storyModalTitle: 'जीवन बीमा क्यों जरूरी है? — रामू की कहानी',
    scenes: [
      {
        step: 1,
        badge: 'दृश्य 1 · दैनिक जीवन',
        title: 'मिलिए रामू से, एक परिश्रमी किसान',
        narrative: 'रामू अपने खेत में रोज कड़ी मेहनत करके परिवार का पालन-पोषण करता है। उसकी पत्नी, बच्चे और वृद्ध माता-पिता अपने दैनिक भोजन, दवा और स्कूल की फीस के लिए उसी की कमाई पर निर्भर हैं।',
        keyTakeaway: 'अधिकांश परिवारों की तरह, रामू का परिवार भी अपने दैनिक जीवन के लिए एक ही कमाने वाले पर निर्भर है।',
      },
      {
        step: 2,
        badge: 'दृश्य 2 · अचानक संकट',
        title: 'यदि अचानक आय बंद हो जाए तो क्या होगा?',
        narrative: 'यदि किसी दुर्घटना में रामू का निधन हो जाता है, तो परिवार की नियमित आय अचानक बंद हो जाती है। लेकिन घर के खर्च, खेत का कर्ज और बच्चों की फीस बंद नहीं होती। सुरक्षा के बिना परिवार पर गहरा संकट आ जाता है।',
        keyTakeaway: 'बिना सुरक्षा के परिवार को कर्ज चुकाने के लिए जमीन या संपत्ति बेचनी पड़ सकती है।',
      },
      {
        step: 3,
        badge: 'दृश्य 3 · सुरक्षा कवच',
        title: 'जीवन बीमा किस प्रकार सहायता करता है?',
        narrative: 'रामू ने समय रहते एक टर्म इंश्योरेंस पॉलिसी ले रखी थी। अनहोनी होने पर बीमा कंपनी गारंटीकृत बीमा राशि उसके परिवार को देती है। उस पैसे से परिवार कर्ज चुका सकता है और बच्चों की पढ़ाई बिना रुकावट जारी रख सकता है।',
        keyTakeaway: 'बीमा किसी व्यक्ति की कमी पूरी नहीं कर सकता, लेकिन उसकी कमाई की भरपाई कर परिवार को सम्मान से जीने का सहारा देता है।',
      },
      {
        step: 4,
        badge: 'दृश्य 4 · सही योजना बनाएं',
        title: 'अपने परिवार के लिए उचित सुरक्षा चुनें',
        narrative: 'हर परिवार की जरूरतें अलग होती हैं। किसान, दुकानदार या नौकरीपेशा - आपके खर्चों और देनदारियों के अनुसार कितना बीमा चाहिए, कवरवाइज़ यह वैज्ञानिक तरीके से निकालता है।',
        keyTakeaway: 'प्योर टर्म इंश्योरेंस किफायती और सरल है, जो आपके परिवार को अटूट मानसिक शांति देता है।',
      },
    ],
    controls: {
      next: 'अगला दृश्य →',
      back: '← पीछे',
      close: 'बंद करें',
      skip: 'आकलन पर जाएं',
      replay: 'पुनः देखें',
      finalCta: 'जानें आपको कितने बीमा की आवश्यकता है →',
      stepOf: 'दृश्य',
    },
  },

  ta: {
    sectionTag: 'நிதி விழிப்புணர்வு & அடிப்படைக் கல்வி',
    sectionHeading: 'ஆயுள் காப்பீடு என்றால் என்ன? எளிய கதையின் மூலம் புரிந்து கொள்ளுங்கள்.',
    sectionSubheading: 'டேர்ம் லைஃப் இன்சூரன்ஸ் உங்கள் குடும்பத்தின் எதிர்காலத்தை எவ்வாறு பாதுகாக்கிறது என்பதைக் காட்டும் 40 வினாடி கதை.',
    openStoryBtn: 'ஆயுள் காப்பீடு எவ்வாறு செயல்படுகிறது என்பதைப் பார்க்கவும்',
    storyModalTitle: 'ஆயுள் காப்பீடு ஏன் அவசியம்? — ராமுவின் கதை',
    scenes: [
      {
        step: 1,
        badge: 'காட்சி 1 · அன்றாட வாழ்க்கை',
        title: 'ராமு, ஒரு கடின உழைப்பாளி விவசாயி',
        narrative: 'ராமு தன் வயலில் உழைத்து குடும்பத்தை காப்பாற்றுகிறார். அவரது மனைவி, குழந்தைகள் மற்றும் வயதான பெற்றோர் தங்களின் உணவு, மருத்துவம் மற்றும் பள்ளி கட்டணத்திற்கு அவரது வருமானத்தையே நம்பியுள்ளனர்.',
        keyTakeaway: 'பெரும்பாலான குடும்பங்களைப் போல, ராமுவின் குடும்பமும் வாழ்வாதாரத்திற்கு ஒரே வருமானத்தையே நம்பியுள்ளது.',
      },
      {
        step: 2,
        badge: 'காட்சி 2 · எதிர்பாராத சவால்',
        title: 'வருமானம் திடீரென நின்றால் என்ன நடக்கும்?',
        narrative: 'எதிர்பாராத விபத்தில் ராமு இறக்க நேரிட்டால், குடும்பத்தின் வருமானம் நின்றுவிடும். ஆனால் குடும்பச் செலவுகள், விவசாயக் கடன், பள்ளி கட்டணங்கள் நிற்காது. பாதுகாப்பு இல்லாவிட்டால் குடும்பம் நிலைகுலைந்து போகும்.',
        keyTakeaway: 'பாதுகாப்பு வலை இல்லாவிட்டால் கடனை அடைக்க நிலத்தையோ சொத்தையோ விற்க வேண்டிய கட்டாயம் ஏற்படலாம்.',
      },
      {
        step: 3,
        badge: 'காட்சி 3 · பாதுகாப்புக் கவசம்',
        title: 'ஆயுள் காப்பீடு எவ்வாறு கைகொடுக்கிறது?',
        narrative: 'ராமு முன்கூட்டியே ஒரு தூய டேர்ம் இன்சூரன்ஸ் பாலிசியை எடுத்திருந்தார். எதிர்பாராத நிகழ்வின் போது காப்பீட்டு நிறுவனம் அந்த இழப்பீட்டுத் தொகையை குடும்பத்திற்கு வழங்குகிறது. அந்த பணத்தைக் கொண்டு குடும்பம் கடன்களை அடைத்து பிள்ளைகளின் கல்வியைத் தொடர முடியும்.',
        keyTakeaway: 'காப்பீடு ஒரு மனிதனை மாற்றீடு செய்ய முடியாது, ஆனால் அவரது வருமானத்தை ஈடுசெய்து குடும்பத்தைக் காப்பாற்றும்.',
      },
      {
        step: 4,
        badge: 'காட்சி 4 · சரியான திட்டமிடல்',
        title: 'உங்கள் குடும்பத்திற்கான பாதுகாப்பைத் திட்டமிடுங்கள்',
        narrative: 'ஒவ்வொரு குடும்பத்தின் தேவையும் வேறுபட்டது. விவசாயி, வியாபாரி, பணியாளர் என உங்கள் கடன்கள் மற்றும் செலவுகளுக்கு ஏற்ப எவ்வளவு காப்பீடு தேவை என்பதை கவர்வைஸ் துல்லியமாக கணக்கிடுகிறது.',
        keyTakeaway: 'தூய டேர்ம் இன்சூரன்ஸ் குறைந்த செலவில் குடும்பத்திற்கு முழுமையான பாதுகாப்பை வழங்குகிறது.',
      },
    ],
    controls: {
      next: 'அடுத்த காட்சி →',
      back: '← பின்னே',
      close: 'மூடு',
      skip: 'மதிப்பீட்டிற்குச் செல்லவும்',
      replay: 'மீண்டும் பார்க்க',
      finalCta: 'உங்களுக்கு எவ்வளவு காப்பீடு தேவை என அறியவும் →',
      stepOf: 'காட்சி',
    },
  },

  kn: {
    sectionTag: 'ಹಣಕಾಸು ಸಾಕ್ಷರತೆ ಮತ್ತು ಜಾಗೃತಿ',
    sectionHeading: 'ಜೀವ ವಿಮೆ ಎಂದರೇನು? ಸರಳ ಕಥೆಯ ಮೂಲಕ ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ.',
    sectionSubheading: 'ಟರ್ಮ್ ಲೈಫ್ ಇನ್ಶೂರೆನ್ಸ್ ನಿಮ್ಮ ಕುಟುಂಬದ ಭವಿಷ್ಯವನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತೋರಿಸುವ 40 ಸೆಕೆಂಡುಗಳ ಉದಾಹರಣೆ.',
    openStoryBtn: 'ಜೀವ ವಿಮೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ನೋಡಿ (40s)',
    storyModalTitle: 'ಜೀವ ವಿಮೆ ಏಕೆ ಮುಖ್ಯ? — ರಾಮು ಕಥೆ',
    scenes: [
      {
        step: 1,
        badge: 'ದೃಶ್ಯ 1 · ದೈನಂದಿನ ಜೀವನ',
        title: 'ರಾಮು, ಕಷ್ಟಪಟ್ಟು ದುಡಿಯುವ ರೈತ',
        narrative: 'ರಾಮು ಪ್ರತಿದಿನ ತನ್ನ ಹೊಲದಲ್ಲಿ ದುಡಿದು ಕುಟುಂಬವನ್ನು ಪೋಷಿಸುತ್ತಾನೆ. ಅವನ ಪತ್ನಿ, ಶಾಲಾ ಮಕ್ಕಳು ಮತ್ತು ವೃದ್ಧ ತಂದೆ-ತಾಯಿ ತಮ್ಮ ಊಟ, ಔಷಧಿ ಮತ್ತು ಶಾಲಾ ಶುಲ್ಕಕ್ಕಾಗಿ ಅವನ ಸಂಪಾದನೆಯನ್ನೇ ಅವಲಂಬಿಸಿದ್ದಾರೆ.',
        keyTakeaway: 'ಸಾಮಾನ್ಯ ಕುಟುಂಬಗಳಂತೆ, ರಾಮು ಕುಟುಂಬವೂ ಜೀವನ ನಿರ್ವಹಣೆಗೆ ಒಬ್ಬರ ಆದಾಯವನ್ನೇ ನಂಬಿಕೊಂಡಿದೆ.',
      },
      {
        step: 2,
        badge: 'ದೃಶ್ಯ 2 · ಅನಿರೀಕ್ಷಿತ ಸಂಕಷ್ಟ',
        title: 'ಆದಾಯ ಹಠಾತ್ತನೆ ನಿಂತುಹೋದರೆ ಏನಾಗುತ್ತದೆ?',
        narrative: 'ಅನಿರೀಕ್ಷಿತ ದುರಂತ ಸಂಭವಿಸಿ ರಾಮು ಇಲ್ಲದಿದ್ದರೆ, ಕುಟುಂಬದ ಆದಾಯ ತಕ್ಷಣವೇ ನಿಂತುಹೋಗುತ್ತದೆ. ಆದರೆ ದಿನಸಿ ಖರ್ಚು, ಕೃಷಿ ಸಾಲ, ಮಕ್ಕಳ ಶಾಲಾ ಶುಲ್ಕ ನಿಲ್ಲುವುದಿಲ್ಲ. ರಕ್ಷಣೆ ಇಲ್ಲದಿದ್ದರೆ ಕುಟುಂಬವು ತೀವ್ರ ಆರ್ಥಿಕ ಸಂಕಷ್ಟಕ್ಕೆ ಸಿಲುಕುತ್ತದೆ.',
        keyTakeaway: 'ಆರ್ಥಿಕ ರಕ್ಷಣೆ ಇಲ್ಲದಿದ್ದರೆ ಸಾಲ ತೀರಿಸಲು ಜಮೀನು ಅಥವಾ ಆಸ್ತಿಯನ್ನು ಮಾರಾಟ ಮಾಡಬೇಕಾಗಬಹುದು.',
      },
      {
        step: 3,
        badge: 'ದೃಶ್ಯ 3 · ರಕ್ಷಣಾ ಕವಚ',
        title: 'ಜೀವ ವಿಮೆ ಹೇಗೆ ನೆರವಾಗುತ್ತದೆ?',
        narrative: 'ರಾಮು ಸೂಕ್ತವಾದ ಟರ್ಮ್ ಲೈಫ್ ಇನ್ಶೂರೆನ್ಸ್ ಪಾಲಿಸಿ ಹೊಂದಿದ್ದನು. ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ನಡೆದಾಗ, ವಿಮಾ ಕಂಪನಿಯು ಭರವಸೆಯ ಮೊತ್ತವನ್ನು ಅವನ ಕುಟುಂಬಕ್ಕೆ ನೀಡುತ್ತದೆ. ಆ ಹಣದಿಂದ ಕುಟುಂಬವು ಸಾಲಗಳನ್ನು ತೀರಿಸಿ ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸವನ್ನು ಗೌರವದಿಂದ ಮುಂದುವರಿಸಬಹುದು.',
        keyTakeaway: 'ವಿಮೆಯು ವ್ಯಕ್ತಿಯನ್ನು ಮರಳಿ ತರಲಾರದು, ಆದರೆ ಆದಾಯದ ಕೊರತೆಯನ್ನು ನೀಗಿಸಿ ಕುಟುಂಬಕ್ಕೆ ಆಸರೆಯಾಗುತ್ತದೆ.',
      },
      {
        step: 4,
        badge: 'ದೃಶ್ಯ 4 · ಮುಂಜಾಗ್ರತಾ ಯೋಜನೆ',
        title: 'ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ತಕ್ಕಂತೆ ರಕ್ಷಣೆ ಪಡೆಯಿರಿ',
        narrative: 'ಪ್ರತಿಯೊಂದು ಕುಟುಂಬದ ಅಗತ್ಯತೆಯೂ ಭಿನ್ನವಾಗಿರುತ್ತದೆ. ರೈತ, ವ್ಯಾಪಾರಿ, ಉದ್ಯೋಗಿ ಹೀಗೆ ನಿಮ್ಮ ಸಾಲಗಳು ಮತ್ತು ವೆಚ್ಚಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಎಷ್ಟು ವಿಮೆ ಬೇಕು ಎಂಬುದನ್ನು ಕವರ್‌ವೈಸ್ ನಿಖರವಾಗಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.',
        keyTakeaway: 'ಪ್ಯೂರ್ ಟರ್ಮ್ ಇನ್ಶೂರೆನ್ಸ್ ಅತ್ಯಂತ ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಂಪೂರ್ಣ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ.',
      },
    ],
    controls: {
      next: 'ಮುಂದಿನ ದೃಶ್ಯ →',
      back: '← ಹಿಂದಕ್ಕೆ',
      close: 'ಮುಚ್ಚಿ',
      skip: 'ಅಂದಾಜಿಗೆ ಹೋಗಿ',
      replay: 'ಮತ್ತೆ ನೋಡಿ',
      finalCta: 'ನಿಮಗೆ ಎಷ್ಟು ವಿಮೆ ಬೇಕು ಎಂದು ತಿಳಿಯಿರಿ →',
      stepOf: 'ದೃಶ್ಯ',
    },
  },
};

