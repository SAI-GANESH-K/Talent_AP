import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';

interface LifeStorySectionProps {
  onStartAssessment: () => void;
}

interface ExampleScenario {
  badge: string;
  heading: string;
  subheading: string;
  hypotheticalTag: string;
  earnerTitle: string;
  earnerDetail: string;
  monthlyExpensesLabel: string;
  monthlyExpensesVal: string;
  loanLabel: string;
  loanVal: string;
  educationLabel: string;
  educationVal: string;
  tabWithoutTitle: string;
  tabWithTitle: string;
  withoutRisk1Title: string;
  withoutRisk1Desc: string;
  withoutRisk2Title: string;
  withoutRisk2Desc: string;
  withoutRisk3Title: string;
  withoutRisk3Desc: string;
  withBenefit1Title: string;
  withBenefit1Desc: string;
  withBenefit2Title: string;
  withBenefit2Desc: string;
  withBenefit3Title: string;
  withBenefit3Desc: string;
  disclaimer: string;
  ctaButton: string;
}

const LITERACY_SCENARIOS: Record<string, ExampleScenario> = {
  en: {
    badge: 'Financial Literacy & Clarity',
    heading: 'Why Pure Term Insurance Matters for Your Family',
    subheading: 'A clear, simple real-life illustration of family financial responsibilities if an unexpected tragedy strikes.',
    hypotheticalTag: 'Hypothetical Illustrative Family Example',
    earnerTitle: 'Primary Earner (Age 32)',
    earnerDetail: 'Brings home ₹50,000/month supporting spouse, two school-going children, and elderly parents.',
    monthlyExpensesLabel: 'Monthly Living Support',
    monthlyExpensesVal: '₹30,000 / mo',
    loanLabel: 'Outstanding Home / Agri Loan',
    loanVal: '₹15 Lakhs',
    educationLabel: 'Children Higher Education Goal',
    educationVal: '₹20 Lakhs',
    tabWithoutTitle: 'Without Term Insurance',
    tabWithTitle: 'With ₹1 Crore Term Cover (~₹800/mo)',
    withoutRisk1Title: 'Monthly Income Ends Abruptly',
    withoutRisk1Desc: 'Daily groceries, school fees, and parents’ medical bills continue uninterrupted, but monthly earnings drop to zero.',
    withoutRisk2Title: '₹15 Lakhs Debt Burden Falls on Family',
    withoutRisk2Desc: 'Lenders demand immediate repayments, risking repossession of family farmland, gold, or the residential home.',
    withoutRisk3Title: 'Children’s Education at Risk',
    withoutRisk3Desc: 'Without liquid capital, children may be forced to discontinue higher education to seek immediate low-wage work.',
    withBenefit1Title: 'Immediate ₹1 Crore Nominee Settlement',
    withBenefit1Desc: 'The life insurer deposits the guaranteed tax-free sum assured directly into the spouse’s bank account without delays.',
    withBenefit2Title: '₹15 Lakhs Loan Paid to Zero Debt',
    withBenefit2Desc: 'All outstanding liabilities are cleared immediately, fully protecting the family’s ancestral home and land.',
    withBenefit3Title: 'Guaranteed Long-term Living & College Fund',
    withBenefit3Desc: 'The remaining ₹85 Lakhs safely invested provides ~₹45,000/month living income and funds higher education milestones.',
    disclaimer: 'Hypothetical educational illustration only. Your personalized protection need is calculated accurately in Stage 1 & 2 using actuarial models.',
    ctaButton: 'Calculate My Family’s Protection Need →',
  },
  te: {
    badge: 'ఆర్థిక అవగాహన & ప్రాథమిక జ్ఞానం',
    heading: 'జీవిత బీమా మీ కుటుంబానికి ఎందుకు అవసరం?',
    subheading: 'కుటుంబాన్ని పోషించే వ్యక్తి హఠాత్తుగా లేకపోతే ఆ కుటుంబ ఆర్థిక బాధ్యతలు ఎలా రక్షించబడతాయో తెలిపే ఒక చిన్న ఉదాహరణ.',
    hypotheticalTag: 'ఉదాహరణ కుటుంబం (ఊహాజనిత గణాంకాలు)',
    earnerTitle: 'కుటుంబ పెద్ద (వయస్సు 32 సం॥)',
    earnerDetail: 'నెలకు ₹50,000 సంపాదిస్తూ భార్య, ఇద్దరు పిల్లలు, వృద్ధ తల్లిదండ్రులను పోషిస్తున్నారు.',
    monthlyExpensesLabel: 'నెలవారీ జీవన ఖర్చులు',
    monthlyExpensesVal: 'నెలకు ₹30,000',
    loanLabel: 'ఇంటి లేదా వ్యవసాయ రుణం',
    loanVal: '₹15 లక్షలు',
    educationLabel: 'పిల్లల ఉన్నత చదువుల లక్ష్యం',
    educationVal: '₹20 లక్షలు',
    tabWithoutTitle: 'బీమా రక్షణ లేకపోతే',
    tabWithTitle: '₹1 కోటి టర్మ్ ఇన్సూరెన్స్ ఉంటే (~₹800/నెల)',
    withoutRisk1Title: 'ఆదాయం ఒక్కసారిగా ఆగిపోతుంది',
    withoutRisk1Desc: 'ఇంటి ఖర్చులు, స్కూల్ ఫీజులు, మందుల ఖర్చులు ఆగవు, కానీ కుటుంబానికి వచ్చే నెలవారీ సంపాదన సున్నా అవుతుంది.',
    withoutRisk2Title: '₹15 లక్షల రుణ భారం కుటుంబంపై పడుతుంది',
    withoutRisk2Desc: 'బ్యాంకు రుణాలు తీర్చడానికి ఇల్లు లేదా వ్యవసాయ భూమిని అమ్ముకోవాల్సిన విషాద పరిస్థితి ఏర్పడుతుంది.',
    withoutRisk3Title: 'పిల్లల భవిష్యత్తు ప్రమాదంలో పడుతుంది',
    withoutRisk3Desc: 'ఫీజులు చెల్లించలేక పిల్లలు చదువు మధ్యలోనే ఆపివేసి చిన్న వయస్సులోనే పనులకు వెళ్లాల్సి రావచ్చు.',
    withBenefit1Title: '₹1 కోటి క్లెయిమ్ నేరుగా నామినీ ఖాతాలో',
    withBenefit1Desc: 'బీమా సంస్థ ఆ హామీ మొత్తాన్ని నేరుగా నామినీ బ్యాంక్ ఖాతాలో జమ చేసి కుటుంబానికి తక్షణ ఆర్థిక బలాన్నిస్తుంది.',
    withBenefit2Title: '₹15 లక్షల అప్పులు తీరి సున్నా భారం',
    withBenefit2Desc: 'రుణాలన్నీ వెంటనే తీరిపోయి, కుటుంబ నివాస ఇల్లు మరియు భూమి శాశ్వతంగా సురక్షితంగా ఉంటాయి.',
    withBenefit3Title: 'నెలకు క్రమం తప్పకుండా జీవన భృతి & చదువు',
    withBenefit3Desc: 'మిగిలిన ₹85 లక్షలను భద్రంగా దాచుకుంటే వచ్చే వడ్డీతో నెలకు ₹40,000+ జీవన ఖర్చులు మరియు పిల్లల చదువు పూర్తవుతాయి.',
    disclaimer: 'గమనిక: ఇది ప్రజల అవగాహన కోసం ఇచ్చిన ఉదాహరణ మాత్రమే. మీ కుటుంబానికి సరిపోయే ఖచ్చితమైన బీమా మొత్తం స్టేజ్ 1 & 2 లో లెక్కించబడుతుంది.',
    ctaButton: 'నా కుటుంబ రక్షణ అవసరాన్ని లెక్కించండి →',
  },
  hi: {
    badge: 'वित्तीय साक्षरता और स्पष्टता',
    heading: 'प्योर टर्म इंश्योरेंस आपके परिवार के लिए क्यों जरूरी है?',
    subheading: 'यदि मुख्य कमाने वाले को कुछ हो जाए, तो परिवार की वित्तीय जिम्मेदारियां कैसे सुरक्षित रहती हैं, इसका एक सरल उदाहरण।',
    hypotheticalTag: 'काल्पनिक उदाहरण (सरल समझ हेतु)',
    earnerTitle: 'मुख्य कमाने वाला (आयु 32 वर्ष)',
    earnerDetail: 'मासिक आय ₹50,000, जिससे पत्नी, दो बच्चे और बुजुर्ग माता-पिता का भरण-पोषण होता है।',
    monthlyExpensesLabel: 'मासिक घरेलू खर्च',
    monthlyExpensesVal: '₹30,000 / माह',
    loanLabel: 'बकाया गृह / कृषि ऋण',
    loanVal: '₹15 लाख',
    educationLabel: 'बच्चों की उच्च शिक्षा का लक्ष्य',
    educationVal: '₹20 लाख',
    tabWithoutTitle: 'बीमा न होने पर',
    tabWithTitle: '₹1 करोड़ टर्म बीमा होने पर (~₹800/माह)',
    withoutRisk1Title: 'मासिक आमदनी अचानक बंद',
    withoutRisk1Desc: 'घर का राशन, स्कूल फीस और दवाइयों के खर्च जारी रहते हैं, लेकिन आमदनी अचानक शून्य हो जाती है।',
    withoutRisk2Title: '₹15 लाख के कर्ज का बोझ परिवार पर',
    withoutRisk2Desc: 'कर्ज चुकाने के लिए जमीन, मकान या गहने बेचने की नौबत आ सकती है।',
    withoutRisk3Title: 'बच्चों की पढ़ाई अधूरी रहने का डर',
    withoutRisk3Desc: 'पैसों के अभाव में बच्चों को पढ़ाई छोड़कर छोटी उम्र में काम शुरू करना पड़ सकता है।',
    withBenefit1Title: 'नॉमिनी को तुरंत ₹1 करोड़ का भुगतान',
    withBenefit1Desc: 'बीमा कंपनी टैक्स-फ्री बीमा राशि सीधे नॉमिनी के खाते में भेजती है, जिससे तत्काल सहारा मिलता है।',
    withBenefit2Title: '₹15 लाख का सारा कर्ज तुरंत खत्म',
    withBenefit2Desc: 'कर्ज पूरी तरह समाप्त हो जाता है और परिवार का घर-जमीन सुरक्षित रहता है।',
    withBenefit3Title: 'नियमित मासिक आय और सुरक्षित शिक्षा',
    withBenefit3Desc: 'बचे हुए ₹85 लाख सुरक्षित निवेश करने पर हर महीने ₹45,000 का खर्च और बच्चों की डिग्री सुरक्षित हो जाती है।',
    disclaimer: 'यह केवल वित्तीय साक्षरता हेतु काल्पनिक उदाहरण है। आपकी व्यक्तिगत आवश्यकता स्टेज 1 और 2 में वैज्ञानिक रूप से निकाली जाती है।',
    ctaButton: 'अपने परिवार की बीमा आवश्यकता जांचें →',
  },
  ta: {
    badge: 'நிதி விழிப்புணர்வு & தெளிவு',
    heading: 'டேர்ம் லைஃப் இன்சூரன்ஸ் உங்கள் குடும்பத்திற்கு ஏன் அவசியம்?',
    subheading: 'குடும்பத் தலைவர் எதிர்பாராதவிதமாக மறைந்தால் குடும்பப் பொறுப்புகள் எவ்வாறு பாதுகாக்கப்படும் என்பதற்கான எளிய எடுத்துக்காட்டு.',
    hypotheticalTag: 'மாதிரி குடும்ப எடுத்துக்காட்டு',
    earnerTitle: 'குடும்பத் தலைவர் (வயது 32)',
    earnerDetail: 'மாத வருமானம் ₹50,000 மூலம் மனைவி, இரு குழந்தைகள் மற்றும் பெற்றோரைப் பராமரிக்கிறார்.',
    monthlyExpensesLabel: 'மாதாந்திர குடும்ப செலவு',
    monthlyExpensesVal: 'மாதம் ₹30,000',
    loanLabel: 'வீடு / விவசாய கடன் பாக்கி',
    loanVal: '₹15 லட்சம்',
    educationLabel: 'பிள்ளைகளின் உயர்கல்வி இலக்கு',
    educationVal: '₹20 லட்சம்',
    tabWithoutTitle: 'காப்பீடு இல்லாதபோது',
    tabWithTitle: '₹1 கோடி டேர்ம் காப்பீடு உள்ளபோது (~₹800/மாதம்)',
    withoutRisk1Title: 'வருமானம் உடனடியாக நின்றுவிடும்',
    withoutRisk1Desc: 'வீட்டுச் செலவுகளும் பள்ளி கட்டணங்களும் தொடரும், ஆனால் குடும்பத்தின் மாத வருமானம் பூஜ்யமாகும்.',
    withoutRisk2Title: '₹15 லட்சம் கடன் சுமை குடும்பத்தின் மேல் விழும்',
    withoutRisk2Desc: 'கடனை அடைக்க நிலம் அல்லது வீட்டை விற்க வேண்டிய இக்கட்டான சூழல் உருவாகலாம்.',
    withoutRisk3Title: 'பிள்ளைகளின் படிப்பு பாதிக்கப்படலாம்',
    withoutRisk3Desc: 'பணப்பற்றாக்குறையால் பிள்ளைகள் படிப்பை நிறுத்திவிட்டு வேலைக்கு செல்ல நேரிடலாம்.',
    withBenefit1Title: '₹1 கோடி காப்பீட்டுத் தொகை உடனடியாக கிடைக்கும்',
    withBenefit1Desc: 'காப்பீட்டு நிறுவனம் முழுத் தொகையையும் நாமினியின் வங்கிக் கணக்கில் நேரடியாகச் செலுத்தும்.',
    withBenefit2Title: '₹15 லட்சம் கடன் அடைக்கப்பட்டு பூஜ்ஜிய சுமை',
    withBenefit2Desc: 'அனைத்து கடன்களும் உடனடியாக அடைக்கப்பட்டு, குடும்பத்தின் வீடு மற்றும் நிலம் பாதுகாக்கப்படும்.',
    withBenefit3Title: 'மாதாந்திர வாழ்வாதாரம் & கல்வி பாதுகாப்பு',
    withBenefit3Desc: 'மீதமுள்ள ₹85 லட்சத்தை முதலீடு செய்வதன் மூலம் மாதம் ₹45,000 வருமானமும் உயர்கல்வியும் உறுதியாகும்.',
    disclaimer: 'இது கல்வி நோக்கிலான மாதிரி எடுத்துக்காட்டு மட்டுமே. உங்கள் தனிப்பட்ட தேவை நிலை 1 & 2 இல் கணக்கிடப்படுகிறது.',
    ctaButton: 'குடும்பத்திற்கான காப்பீட்டுத் தேவையை அறியவும் →',
  },
  kn: {
    badge: 'ಆರ್ಥಿಕ ಸಾಕ್ಷರತೆ ಮತ್ತು ಸ್ಪಷ್ಟತೆ',
    heading: 'ಪ್ಯೂರ್ ಟರ್ಮ್ ವಿಮೆ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಏಕೆ ಅಗತ್ಯ?',
    subheading: 'ಮುಖ್ಯ ಸಂಪಾದಕರು ಅಕಸ್ಮಾತ್ ನಿಧನರಾದರೆ ಕುಟುಂಬದ ಆರ್ಥಿಕ ಜವಾಬ್ದಾರಿಗಳು ಹೇಗೆ ರಕ್ಷಿಸಲ್ಪಡುತ್ತವೆ ಎಂಬುದರ ಸರಳ ನಿದರ್ಶನ.',
    hypotheticalTag: 'ಮಾದರಿ ಕುಟುಂಬ ಉದಾಹರಣೆ',
    earnerTitle: 'ಮುಖ್ಯ ಸಂಪಾದಕ (ವಯಸ್ಸು 32)',
    earnerDetail: 'ತಿಂಗಳಿಗೆ ₹50,000 ದುಡಿಯುತ್ತಾ ಪತ್ನಿ, ಇಬ್ಬರು ಮಕ್ಕಳು ಮತ್ತು ವೃದ್ಧ ಪೋಷಕರನ್ನು ಪೋಷಿಸುತ್ತಿದ್ದಾರೆ.',
    monthlyExpensesLabel: 'ಮಾಸಿಕ ಜೀವನ ವೆಚ್ಚ',
    monthlyExpensesVal: 'ತಿಂಗಳಿಗೆ ₹30,000',
    loanLabel: 'ಬಾಕಿ ಇರುವ ಗೃಹ / ಕೃಷಿ ಸಾಲ',
    loanVal: '₹15 ಲಕ್ಷ',
    educationLabel: 'ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣದ ಗುರಿ',
    educationVal: '₹20 ಲಕ್ಷ',
    tabWithoutTitle: 'ವಿಮೆ ಇಲ್ಲದಿದ್ದಾಗ',
    tabWithTitle: '₹1 ಕೋಟಿ ಟರ್ಮ್ ವಿಮೆ ಇದ್ದಾಗ (~₹800/ತಿಂಗಳು)',
    withoutRisk1Title: 'ಮಾಸಿಕ ಆದಾಯ ತಕ್ಷಣ ನಿಲ್ಲುತ್ತದೆ',
    withoutRisk1Desc: 'ಮನೆಯ ದಿನಸಿ, ಶಾಲಾ ಶುಲ್ಕ ಮತ್ತು ಔಷಧಿ ವೆಚ್ಚಗಳು ಮುಂದುವರಿಯುತ್ತವೆ, ಆದರೆ ಆದಾಯ ಶೂನ್ಯವಾಗುತ್ತದೆ.',
    withoutRisk2Title: '₹15 ಲಕ್ಷ ಸಾಲದ ಹೊರೆ ಕುಟುಂಬದ ಮೇಲೆ',
    withoutRisk2Desc: 'ಸಾಲ ತೀರಿಸಲು ಜಮೀನು ಅಥವಾ ಮನೆಯನ್ನು ಕಳೆದುಕೊಳ್ಳುವ ಕಠಿಣ ಪರಿಸ್ಥಿತಿ ಉಂಟಾಗಬಹುದು.',
    withoutRisk3Title: 'ಮಕ್ಕಳ ಶಿಕ್ಷಣ ಅನಿಶ್ಚಿತವಾಗಬಹುದು',
    withoutRisk3Desc: 'ಹಣದ ಕೊರತೆಯಿಂದ ಮಕ್ಕಳು ಉನ್ನತ ಶಿಕ್ಷಣವನ್ನು ಅರ್ಧದಲ್ಲೇ ನಿಲ್ಲಿಸಬೇಕಾಗಬಹುದು.',
    withBenefit1Title: 'ನಾಮಿನಿಗೆ ನೇರವಾಗಿ ₹1 ಕೋಟಿ ಜಮೆ',
    withBenefit1Desc: 'ವಿಮಾ ಕಂಪನಿಯು ತೆರಿಗೆ ರಹಿತ ಕ್ಲೈಮ್ ಮೊತ್ತವನ್ನು ನೇರವಾಗಿ ನಾಮಿನಿಯ ಖಾತೆಗೆ ಪಾವತಿಸುತ್ತದೆ.',
    withBenefit2Title: '₹15 ಲಕ್ಷ ಸಾಲ ಸಂಪೂರ್ಣ ಮನ್ನಾ',
    withBenefit2Desc: 'ಎಲ್ಲಾ ಬಾಕಿ ಸಾಲಗಳು ತಕ್ಷಣ ತೀರಿಸಲ್ಪಟ್ಟು, ಕುಟುಂಬದ ಆಸ್ತಿ ಶಾಶ್ವತವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.',
    withBenefit3Title: 'ನಿರಂತರ ಮಾಸಿಕ ಆದಾಯ & ಶಿಕ್ಷಣ ಭದ್ರತೆ',
    withBenefit3Desc: 'ಉಳಿದ ₹85 ಲಕ್ಷವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹೂಡಿಕೆ ಮಾಡುವುದರಿಂದ ತಿಂಗಳಿಗೆ ₹45,000 ಖರ್ಚು ಹಾಗೂ ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ ಭದ್ರವಾಗುತ್ತದೆ.',
    disclaimer: 'ಇದು ತಿಳುವಳಿಕೆಗಾಗಿ ನೀಡಲಾದ ಮಾದರಿ ಉದಾಹರಣೆಯಾಗಿದೆ. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿಮಾ ಅಗತ್ಯವನ್ನು ಹಂತ 1 ಮತ್ತು 2 ರಲ್ಲಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
    ctaButton: 'ನನ್ನ ಕುಟುಂಬದ ವಿಮಾ ಅಗತ್ಯವನ್ನು ಲೆಕ್ಕಹಾಕಿ →',
  },
};

export const LifeStorySection: React.FC<LifeStorySectionProps> = ({ onStartAssessment }) => {
  const { language } = useLanguage();
  const scenario = LITERACY_SCENARIOS[language] || LITERACY_SCENARIOS.en;
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('with');

  return (
    <section className="bg-gradient-to-b from-[#0B1320] via-[#0E1A2D] to-[var(--color-offwhite)] py-14 sm:py-20 border-b border-slate-200/60 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <ScrollReveal direction="up" delay={0.05}>
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-500/15 border border-teal-400/30 rounded-full text-xs font-bold text-teal-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{scenario.badge}</span>
            </div>
            
            <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {scenario.heading}
            </h2>
            
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              {scenario.subheading}
            </p>
          </div>

          {/* Interactive Educational Card */}
          <div className="bg-[#111E31] border border-teal-500/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-teal-950/40 text-white relative">
            
            {/* Hypothetical Family Overview Bar */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                    {scenario.hypotheticalTag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-[var(--font-heading)] mt-0.5">
                    {scenario.earnerTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {scenario.earnerDetail}
                  </p>
                </div>
              </div>

              {/* Identified Figures Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {scenario.monthlyExpensesLabel}
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-300">
                    {scenario.monthlyExpensesVal}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {scenario.loanLabel}
                  </span>
                  <span className="text-base sm:text-lg font-black text-rose-300">
                    {scenario.loanVal}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {scenario.educationLabel}
                  </span>
                  <span className="text-base sm:text-lg font-black text-cyan-300">
                    {scenario.educationVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Scenario Switcher Tabs */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex p-1 bg-slate-900/90 rounded-2xl border border-slate-700 max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('with')}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'with'
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✓ {scenario.tabWithTitle}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('without')}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'without'
                      ? 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✕ {scenario.tabWithoutTitle}
                </button>
              </div>
            </div>

            {/* Comparison Cards Content */}
            {activeTab === 'with' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-teal-950/20 border border-teal-500/30 rounded-2xl p-5 sm:p-6 transition-all">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                    01 · {scenario.withBenefit1Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withBenefit1Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                    02 · {scenario.withBenefit2Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withBenefit2Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                    03 · {scenario.withBenefit3Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withBenefit3Desc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 sm:p-6 transition-all">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                    01 · {scenario.withoutRisk1Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withoutRisk1Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                    02 · {scenario.withoutRisk2Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withoutRisk2Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                    03 · {scenario.withoutRisk3Title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenario.withoutRisk3Desc}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions and Transparency Note */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl text-center sm:text-left leading-relaxed">
                {scenario.disclaimer}
              </p>

              <button
                type="button"
                onClick={onStartAssessment}
                className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap text-center"
              >
                {scenario.ctaButton}
              </button>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
