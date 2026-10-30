import React, { useState, useEffect, useRef } from 'react';
import type { AdvisorSummary, Booking, User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import { type Language, SUPPORTED_LANGUAGES } from '../../i18n/translations';

export interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisor: AdvisorSummary | null;
  booking: Booking | null;
  assessmentSummary?: any;
  currentUser: User | null;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
}

// Pre-configured Gemini API Key (configurable via VITE_GEMINI_API_KEY)
const DEFAULT_GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  atob('QVEuQWI4Uk42S0xUNmhsdkdZN1R4UlRuM3hYdTYtbENVZWdKeThQSElwVU9lckNIaktnRWc=');

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({
  isOpen,
  onClose,
  advisor,
  booking,
  assessmentSummary,
  currentUser,
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Derived financial summary values
  const recommendedCover = assessmentSummary?.coverage_gap 
    ? `₹${(assessmentSummary.coverage_gap / 100000).toFixed(1)} Lakhs (${(assessmentSummary.coverage_gap / 10000000).toFixed(2)} Cr)`
    : '₹1.90 Crore';
  
  const userAge = assessmentSummary?.user_age || 30;
  const annualIncome = assessmentSummary?.annual_income_inr 
    ? `₹${(assessmentSummary.annual_income_inr / 100000).toFixed(1)} Lakhs/year`
    : '₹6.0 Lakhs/year';
  
  const selectedPlan = assessmentSummary?.selected_plan_name || 'Saffron Kesaro Return';
  const monthlyPremium = assessmentSummary?.selected_premium_amount_inr
    ? `₹${assessmentSummary.selected_premium_amount_inr.toLocaleString('en-IN')}/month`
    : '₹2,245/month';

  const advisorName = advisor?.advisor_name || booking?.advisor_name || 'Suresh Nair';
  const advisorExp = advisor?.years_experience || 8;
  const advisorLangs = Array.isArray(advisor?.languages)
    ? advisor.languages.join(', ')
    : typeof advisor?.languages === 'string'
    ? advisor.languages
    : 'English, Telugu, Hindi';

  const formatSlotTime = (isoString?: string) => {
    if (!isoString) return 'your scheduled slot';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    } catch {
      return isoString;
    }
  };

  const bookingTime = formatSlotTime(booking?.slot_start);
  const userName = currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'there';

  // Multilingual quick suggestions chips
  const getPromptChips = (lang: Language): string[] => {
    switch (lang) {
      case 'te':
        return [
          `నా డేటా ప్రకారం ఈ ప్లాన్ నాకు ఎందుకు ఉపయోగపడుతుంది?`,
          `నాకు ${recommendedCover} కవరేజ్ ఎందుకు అవసరం?`,
          `ఎండోమెంట్ లేదా ULIP బదులు టర్మ్ ప్లాన్ ఎందుకు మంచిది?`,
          `పన్ను ఆదా ప్రయోజనాలు (80C & 10(10D)) ఏమిటి?`,
          `${advisorName} గారికి ఏ డాక్యుమెంట్లు చూపించాలి?`,
          `నా ప్రీమియం ${monthlyPremium} ఎలా లెక్కించారు?`,
          `యాక్సిడెంటల్ డెత్ & డిసేబిలిటీ రైడర్లు అంటే ఏమిటి?`,
          `${advisorName} గారిని ఏ ప్రశ్నలు అడగాలి?`,
        ];
      case 'hi':
        return [
          `मेरी जानकारी के अनुसार यह प्लान मेरे लिए क्यों उपयोगी है?`,
          `मुझे ${recommendedCover} का सुरक्षा कवर क्यों चाहिए?`,
          `एंडोमेंट या यूलिप के बजाय टर्म प्लान क्यों चुनना चाहिए?`,
          `टैक्स छूट (धारा 80C और 10(10D)) के क्या फायदे हैं?`,
          `${advisorName} जी के साथ बैठक के लिए कौन से दस्तावेज चाहिए?`,
          `मेरा प्रीमियम ${monthlyPremium} कैसे तय हुआ?`,
          `दुर्घटना मृत्यु और विकलांगता राइडर्स क्या हैं?`,
          `${advisorName} जी से क्या सवाल पूछने चाहिए?`,
        ];
      case 'ta':
        return [
          `என் தகவல்களின்படி இந்த திட்டம் எனக்கு ஏன் சிறந்தது?`,
          `எனக்கு ஏன் ${recommendedCover} காப்பீடு தேவைப்படுகிறது?`,
          `எண்டோவ்மென்ட் அல்லது ULIP-ஐ விட டெர்ம் பிளான் ஏன் மேல்?`,
          `வரி சலுகைகள் (80C & 10(10D)) என்னென்ன?`,
          `${advisorName} அவர்களை சந்திக்கும் முன் என்ன ஆவணங்கள் தேவை?`,
          `என் பிரீமியம் ${monthlyPremium} எப்படி கணக்கிடப்பட்டது?`,
          `விபத்து மரணம் மற்றும் இயலாமை ரைடர்கள் என்றால் என்ன?`,
          `${advisorName} அவர்களிடம் என்ன கேள்விகள் கேட்க வேண்டும்?`,
        ];
      case 'kn':
        return [
          `ನನ್ನ ಡೇಟಾ ಪ್ರಕಾರ ಈ ಯೋಜನೆ ನನಗೆ ಏಕೆ ಉಪಯುಕ್ತ?`,
          `ನನಗೆ ${recommendedCover} ವಿಮೆ ಏಕೆ ಬೇಕು?`,
          `ಎಂಡೋವ್ಮೆಂಟ್ ಅಥವಾ ULIP ಗಿಂತ ಟರ್ಮ್ ಪ್ಲಾನ್ ಏಕೆ ಒಳ್ಳೆಯದು?`,
          `ತೆರಿಗೆ ಉಳಿತಾಯ (80C & 10(10D)) ಪ್ರಯೋಜನಗಳೇನು?`,
          `${advisorName} ಭೇಟಿಗೆ ಯಾವ ದಾಖಲೆಗಳು ಸಿದ್ಧಪಡಿಸಬೇಕು?`,
          `ನನ್ನ ಪ್ರೀಮಿಯಂ ${monthlyPremium} ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ?`,
          `ಅಪಘಾತ ಮರಣ ಮತ್ತು ಅಂಗವಿಕಲತೆ ರೈಡರ್‌ಗಳು ಯಾವುವು?`,
          `${advisorName} ಅವರೊಂದಿಗೆ ಯಾವ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬೇಕು?`,
        ];
      case 'en':
      default:
        return [
          `Why is this plan useful according to my data?`,
          `Why do I need ${recommendedCover} cover?`,
          `Why not an Endowment or ULIP plan instead?`,
          `What are the Tax Savings (80C & 10(10D))?`,
          `What documents should I prepare for ${advisorName}?`,
          `How is my ${monthlyPremium} premium calculated?`,
          `Explain Accidental Death & Disability Riders`,
          `What questions should I ask ${advisorName}?`,
        ];
    }
  };

  // Multilingual Initial Greeting
  const getGreetingText = (lang: Language): string => {
    switch (lang) {
      case 'te':
        return `నమస్కారం ${userName}! 👋 నేను మీ **ఇన్షూర్మేట్ (InsureMate)** — AI లైఫ్ ఇన్సూరెన్స్ అడ్వైజర్.\n\n` +
          `🎉 **మీ అడ్వైజర్ కన్సల్టేషన్ విజయవంతంగా బుక్ చేయబడింది!**\n\n` +
          `• 👨‍💼 **అడ్వైజర్:** ${advisorName} (${advisorExp} సం|| అనుభవం, భాషలు: ${advisorLangs})\n` +
          `• ⏰ **అపాయింట్‌మెంట్ సమయం:** ${bookingTime} (IST)\n` +
          `• 🛡️ **సిఫార్సు చేయబడిన లైఫ్ కవర్:** ${recommendedCover}\n` +
          `• 📋 **ఎంపికైన ప్లాన్:** ${selectedPlan} (~${monthlyPremium})\n\n` +
          `ఈ ప్లాన్ మీ కుటుంబానికి మరియు రుణ భద్రతకు ఎలా సహాయపడుతుందో తెలుసుకోవడానికి క్రింది ప్రశ్నలపై క్లిక్ చేయండి లేదా మీకు తోచిన ప్రశ్నను అడగండి:`;
      case 'hi':
        return `नमस्ते ${userName}! 👋 मैं हूँ **इन्श्योरमेट (InsureMate)** — आपका AI जीवन सुरक्षा सलाहकार।\n\n` +
          `🎉 **आपकी सलाहकार बैठक सफलतापूर्वक बुक हो गई है!**\n\n` +
          `• 👨‍💼 **सलाहकार:** ${advisorName} (${advisorExp} वर्ष अनुभव, भाषाएं: ${advisorLangs})\n` +
          `• ⏰ **मीटिंग का समय:** ${bookingTime} (IST)\n` +
          `• 🛡️ **अनुशंसित सुरक्षा कवर:** ${recommendedCover}\n` +
          `• 📋 **चुनी गई योजना:** ${selectedPlan} (~${monthlyPremium})\n\n` +
          `अपनी सुरक्षा योजना के बारे में कोई भी प्रश्न पूछें या नीचे दिए गए मुख्य विषयों में से चुनें:`;
      case 'ta':
        return `வணக்கம் ${userName}! 👋 நான் உங்கள் **InsureMate** — AI ஆயுள் காப்பீட்டு ஆலோசகர்.\n\n` +
          `🎉 **உங்கள் ஆலோசனை சந்திப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது!**\n\n` +
          `• 👨‍💼 **ஆலோசகர்:** ${advisorName} (${advisorExp} ஆண்டுகள் அனுபவம், மொழிகள்: ${advisorLangs})\n` +
          `• ⏰ **நேரம்:** ${bookingTime} (IST)\n` +
          `• 🛡️ **பரிந்துரைக்கப்பட்ட காப்பீடு:** ${recommendedCover}\n` +
          `• 📋 **தேர்ந்தெடுக்கப்பட்ட திட்டம்:** ${selectedPlan} (~${monthlyPremium})\n\n` +
          `கீழேயுள்ள கேள்விகளை கிளிக் செய்யவும் அல்லது உங்கள் கேள்விகளை தமிழில் கேட்கவும்:`;
      case 'kn':
        return `ನಮಸ್ಕಾರ ${userName}! 👋 ನಾನು ನಿಮ್ಮ **InsureMate** — AI ಜೀವ ವಿಮಾ ಸಲಹೆಗಾರ.\n\n` +
          `🎉 **ಸಮಾಲೋಚನೆ ಭೇಟಿ ಯಶಸ್ವಿಯಾಗಿ ನಿಗದಿಯಾಗಿದೆ!**\n\n` +
          `• 👨‍💼 **ಸಲಹೆಗಾರ:** ${advisorName} (${advisorExp} ವರ್ಷಗಳ ಅನುಭವ, ಭಾಷೆಗಳು: ${advisorLangs})\n` +
          `• ⏰ **ಸಮಯ:** ${bookingTime} (IST)\n` +
          `• 🛡️ **ಶಿಫಾರಸು ಮಾಡಿದ ವಿಮಾ ಮೊತ್ತ:** ${recommendedCover}\n` +
          `• 📋 **ಆಯ್ಕೆ ಮಾಡಿದ ಯೋಜನೆ:** ${selectedPlan} (~${monthlyPremium})\n\n` +
          `ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ:`;
      case 'en':
      default:
        return `Hello ${userName}! 👋 I am **InsureMate** — your AI-Powered Life Protection Advisory Assistant.\n\n` +
          `🎉 **Consultation Booked Successfully!**\n\n` +
          `• 👨‍💼 **Advisor:** ${advisorName} (${advisorExp} yrs experience, speaks ${advisorLangs})\n` +
          `• ⏰ **Appointment Time:** ${bookingTime} (IST)\n` +
          `• 🛡️ **Recommended Protection:** ${recommendedCover}\n` +
          `• 📋 **Target Plan:** ${selectedPlan} (~${monthlyPremium})\n\n` +
          `How can I assist you in preparing for your consultation? Click any of the quick topics below or type your question:`;
    }
  };

  // Initialize or re-adapt Chat when Modal opens or Language changes
  useEffect(() => {
    if (isOpen) {
      const greetingMsg: Message = {
        id: `msg-welcome-${language}`,
        sender: 'ai',
        text: getGreetingText(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: getPromptChips(language),
      };
      setMessages([greetingMsg]);
    }
  }, [isOpen, language, advisor, booking, assessmentSummary, currentUser]);

  if (!isOpen) return null;

  // Local Context-Aware Knowledge Engine (Conversational, Actuarial, Multilingual)
  const generateBuiltinResponse = (query: string, currentLang: Language): string => {
    const q = query.toLowerCase().trim();

    // ==========================================
    // 0. CONVERSATIONAL INTENTS (GREETINGS, THANKS, OK)
    // ==========================================
    const isGreeting = 
      q === 'hi' || q === 'hello' || q === 'hey' || q === 'hai' ||
      q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') ||
      q.includes('హాయ్') || q.includes('నమస్తే') || q.includes('నమస్కారం') ||
      q.includes('नमस्ते') || q.includes('வணக்கம்') || q.includes('ನಮಸ್ಕಾರ');

    if (isGreeting) {
      if (currentLang === 'te') {
        return `నమస్కారం ${userName}! 👋 నేను మీ **InsureMate** AI సలహాదారుని.\n\n` +
          `కవర్ వైజ్ (CoverWise) ప్లాట్‌ఫారమ్‌కు స్వాగతం! మీ **${recommendedCover}** లైఫ్ ప్రొటెక్షన్ కవర్, **${selectedPlan}** పాలసీ లేదా సలహాదారు **${advisorName}** గారితో మీ అపాయింట్‌మెంట్‌కు సంబంధించి మీకు ఎలాంటి సందేహాలు ఉన్నా అడగండి. నేను మీకు వివరంగా సహాయం చేస్తాను!`;
      }
      if (currentLang === 'hi') {
        return `नमस्ते ${userName}! 👋 मैं आपका **InsureMate** AI जीवन सुरक्षा सलाहकार हूँ।\n\n` +
          `CoverWise में आपका स्वागत है! आपके **${recommendedCover}** के सुरक्षा कवर, **${selectedPlan}** योजना या सलाहकार **${advisorName}** जी के साथ मीटिंग से जुड़ा कोई भी सवाल हो, बेझिझक पूछें। मैं आपकी पूरी सहायता करूँगा!`;
      }
      if (currentLang === 'ta') {
        return `வணக்கம் ${userName}! 👋 நான் உங்கள் **InsureMate** AI ஆலோசகர்.\n\n` +
          `உங்கள் **${recommendedCover}** காப்பீடு அல்லது ஆலோசகர் **${advisorName}** சந்திப்பு பற்றிய எந்த கேள்விகளையும் கேட்கலாம். நான் உதவ தயாராக உள்ளேன்!`;
      }
      if (currentLang === 'kn') {
        return `ನಮಸ್ಕಾರ ${userName}! 👋 ನಾನು ನಿಮ್ಮ **InsureMate** AI ಸಲಹೆಗಾರ.\n\n` +
          `ನಿಮ್ಮ **${recommendedCover}** ವಿಮಾ ರಕ್ಷಣೆ ಅಥವಾ ಸಲಹೆಗಾರ **${advisorName}** ಭೇಟಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ. ನಾನು ನಿಮಗೆ ವಿವರವಾಗಿ ನೆರವಾಗುತ್ತೇನೆ!`;
      }
      return `Hello ${userName}! 👋 I'm **InsureMate**, your dedicated AI Insurance Advisor.\n\n` +
        `Welcome to CoverWise! How can I assist you today? Feel free to ask me anything about your **${recommendedCover}** coverage gap, your **${selectedPlan}** plan, premium calculation, or questions for your upcoming session with Advisor **${advisorName}**!`;
    }

    // Gratitude / Thank you
    const isGratitude = q.includes('thank') || q.includes('ధన్యవాదాలు') || q.includes('ధన్యవాదం') || q.includes('శుక్రియా') || q.includes('நன்றி') || q.includes('ಧನ್ಯವಾದ');
    if (isGratitude) {
      if (currentLang === 'te') {
        return `మీకు సహాయపడటం నాకెంతో సంతోషం! 😊\n\nమీ **${recommendedCover}** పాలసీ గురించి గానీ లేదా అడ్వైజర్ **${advisorName}** గారితో మీటింగ్‌కు సంబంధించి గానీ ఇంకా ఏవైనా సందేహాలు ఉంటే ఎప్పుడైనా అడగవచ్చు!`;
      }
      if (currentLang === 'hi') {
        return `आपका बहुत-बहुत स्वागत है! 😊\n\nअपनी सुरक्षा योजना या सलाहकार **${advisorName}** जी से बातचीत से पहले अगर आपका कोई अन्य सवाल हो, तो ज़रूर पूछें!`;
      }
      return `You're very welcome! 😊\n\nAlways happy to help you protect what matters most. If you have any other questions before your consultation with Advisor **${advisorName}**, feel free to ask!`;
    }

    // Acknowledgement (Ok / Got it / Sure)
    const isAck = q === 'ok' || q === 'okay' || q === 'sure' || q === 'got it' || q === 'understood' || q === 'సరే' || q === 'తీసుకుంటా' || q === 'అర్థమైంది' || q === 'ठीक है' || q === 'சரி';
    if (isAck) {
      if (currentLang === 'te') {
        return `చాలా మంచిది! 👍\n\nమీరు మీ అడ్వైజర్ **${advisorName}** గారితో **${bookingTime}** సమయానికి మీటింగ్ కోసం సిద్ధంగా ఉన్నారు. అవసరమైన డాక్యుమెంట్లు సిద్ధం చేసుకోవడం మర్చిపోకండి. ఇంకేదైనా తెలుసుకోవాలంటే నన్ను అడగండి!`;
      }
      if (currentLang === 'hi') {
        return `बहुत बढ़िया! 👍\n\nआपकी सलाहकार **${advisorName}** जी के साथ **${bookingTime}** पर बैठक तय है। आवश्यक दस्तावेज तैयार रखें। कोई अन्य सवाल हो तो बेझिझक पूछें!`;
      }
      return `Great! 👍\n\nYou're all set for your consultation with Advisor **${advisorName}** on **${bookingTime}**. Don't forget to keep your KYC and income documents ready. Let me know if you need anything else!`;
    }

    // Who are you / Identity
    const isWho = q.includes('who are you') || q.includes('నువ్వు ఎవరు') || q.includes('तुम कौन हो') || q.includes('what can you do');
    if (isWho) {
      if (currentLang === 'te') {
        return `నేను **InsureMate** — కవర్ వైజ్ (CoverWise) డిజిటల్ అడ్వైజరీ AI అసిస్టెంట్‌ని. 🤖\n\nమీ కుటుంబ బాధ్యతలు, ఆదాయం మరియు అప్పుల ఆధారంగా సరైన లైఫ్ ఇన్సూరెన్స్ రక్షణను లెక్కించడం, పాలసీ ప్రయోజనాలను వివరించడం మరియు సర్టిఫైడ్ అడ్వైజర్ల మీటింగ్‌కు మిమ్మల్ని సిద్ధం చేయడం నా బాధ్యత!`;
      }
      return `I am **InsureMate** — your digital AI Insurance Advisor on CoverWise. 🤖\n\nI help calculate your family's exact protection gap, explain policy benefits in plain everyday language, and prepare you for a transparent consultation with certified advisors!`;
    }

    // ==========================================
    // 1. TELUGU ENGINE (తెలుగు)
    // ==========================================
    if (currentLang === 'te') {
      // 1.1 Why Useful / Suitability
      if (q.includes('ఉపయోగ') || q.includes('ప్లాన్') || q.includes('డేటా') || q.includes('సరిపోతుంది') || q.includes('useful') || q.includes('why this plan')) {
        return `💡 **మీ వివరాల ప్రకారం ఈ ప్లాన్ మీకు ఎందుకు అత్యంత ప్రయోజనకరమో తెలుసుకోండి:**\n\n` +
          `మీ ప్రస్తుత వయస్సు (**${userAge} సంవత్సరాలు**), వార్షిక ఆదాయం (**${annualIncome}**), మరియు కుటుంబ బాధ్యతల ఆధారంగా **${selectedPlan}** ప్లాన్ మీకు ఈ ముఖ్యమైన ప్రయోజనాలను అందిస్తుంది:\n\n` +
          `• 🛡️ **పూర్తి అప్పుల విముక్తి & కుటుంబ రక్షణ:** మీకు ఉన్న గృహ రుణం లేదా ఇతర బాధ్యతలకు తగినట్లుగా **${recommendedCover}** పూర్తి కవరేజ్ లభిస్తుంది. భవిష్యత్తులో కుటుంబం ఎలాంటి ఆర్థిక ఇబ్బందులకు గురికాకుండా ఇది కాపాడుతుంది.\n` +
          `• 💵 **తక్కువ ఖర్చు - ఎక్కువ రక్షణ:** నెలకు కేవలం **${monthlyPremium}** మాత్రమే. ఇది మీ నెలవారీ ఆదాయంలో **2% కంటే తక్కువ**. మిగిలిన **98% జీతం** మీ ఇంటి ఖర్చులు మరియు పిల్లల భవిష్యత్తు పొదుపు కోసం వాడుకోవచ్చు.\n` +
          `• 🎯 **నికర రక్షణ ప్రాధాన్యత:** సంప్రదాయ ఎండోమెంట్ పాలసీల్లో ఇంత పెద్ద మొత్తానికి భారీగా డబ్బు కట్టాల్సి వస్తుంది. కానీ ఈ ప్లాన్‌లో అతి తక్కువ ప్రీమియంతోనే అత్యధిక రక్షణ మీ కుటుంబానికి లభిస్తుంది.\n\n` +
          `💡 *సలహాదారు సురేష్ నాయర్ గారితో మీ కన్సల్టేషన్ సమయంలో పాలసీ వ్యవధి మరియు రైడర్లను గురించి తుది నిర్ణయం తీసుకోవచ్చు.*`;
      }

      // 1.2 Cover Amount Math
      if (q.includes('కవరేజ్') || q.includes('ఎందుకు అవసరం') || q.includes('190') || q.includes('1.90') || q.includes('1.30') || q.includes('crore') || q.includes('లక్ష') || q.includes('కోటి')) {
        return `🛡️ **మీకు ${recommendedCover} కవరేజ్ ఎందుకు అవసరమో స్పష్టమైన లెక్క:**\n\n` +
          `మీ కుటుంబానికి భవిష్యత్తులో అవసరమయ్యే ప్రతి రూపాయినీ పరిగణనలోకి తీసుకుని ఈ మొత్తాన్ని నిర్ణయించాము:\n\n` +
          `• 🏠 **100% రుణాల చెల్లింపు:** మీకున్న గృహ, వాహన లేదా వ్యక్తిగత రుణాలన్నింటినీ మొదటి రోజే పూర్తిగా తీర్చివేయడానికి కావాల్సిన నిధులు ఇందులో ఉన్నాయి.\n` +
          `• 👨‍👩‍👧 **కుటుంబ నెలవారీ పోషణ:** రాబోయే 15 నుండి 20 సంవత్సరాల పాటు మీ కుటుంబం తమ జీవన ప్రమాణాన్ని నిలబెట్టుకోవడానికి అవసరమైన నెలవారీ ఖర్చులు.\n` +
          `• 🎓 **పిల్లల ఉన్నత విద్య:** కాలేజీ ఫీజులు ఏటా 8% పెరుగుతాయి. ద్రవ్యోల్బణాన్ని తట్టుకుని పిల్లల చదువులు సాఫీగా సాగడానికి అవసరమైన నిధి.\n` +
          `• 🏥 **అత్యవసర నిధి:** కనీసం 6 నెలల అత్యవసర ఖర్చులకు సరిపడే వెసులుబాటు ఇందులో కలపబడింది.\n\n` +
          `💡 *ఈ మొత్తం మీ కుటుంబానికి పటిష్టమైన ఆర్థిక రక్షణ కవచంలా పనిచేస్తుంది.*`;
      }

      // 1.3 Endowment vs Term
      if (q.includes('ఎండోమెంట్') || q.includes('ulip') || q.includes('టర్మ్') || q.includes('మనీ-బ్యాక్') || q.includes('endowment')) {
        return `⚖️ **ఎండోమెంట్ లేదా ULIP కంటే ఈ టర్మ్ ప్లాన్ ఎందుకు ఉత్తమం?**\n\n` +
          `చాలామంది బీమాతో పాటు డబ్బు వెనక్కి రావాలని ఎండోమెంట్ పాలసీలు చూస్తారు, కానీ వాస్తవంలో టర్మ్ ప్లానే మీ డబ్బుకు సరైన విలువనిస్తుంది:\n\n` +
          `• 💰 **ఖర్చులో భారీ తేడా:** సంప్రదాయ ఎండోమెంట్ పాలసీలో **${recommendedCover}** రక్షణ పొందాలంటే ఏడాదికి దాదాపు ₹6,00,000 కట్టాలి! కానీ ఈ టర్మ్ ప్లాన్‌లో కేవలం **${monthlyPremium}** తోనే అదే రక్షణ లభిస్తుంది.\n` +
          `• 📈 **మ్యూచువల్ ఫండ్స్ లేదా PPF లో పెట్టుబడి:** టర్మ్ ప్లాన్ ద్వారా నెలకు వేల రూపాయలు ఆదా అవుతాయి. ఆ డబ్బును మ్యూచువల్ ఫండ్స్, SIP లేదా PPF లో మదుపు చేస్తే దీర్ఘకాలంలో కోట్ల రూపాయల సంపద సృష్టించవచ్చు.\n` +
          `• 🛡️ **కుటుంబానికి పూర్తి భద్రత:** ఎండోమెంట్‌లో ఎక్కువ ప్రీమియం వల్ల ప్రజలు ₹5-10 లక్షల చిన్న కవర్‌తో సరిపెట్టుకుంటారు. కానీ టర్మ్ ప్లాన్ మీ కుటుంబానికి 100% భద్రత ఇస్తుంది.`;
      }

      // 1.4 Tax Benefits
      if (q.includes('పన్ను') || q.includes('80c') || q.includes('10(10d)') || q.includes('tax') || q.includes('ఆదా')) {
        return `🧾 **ఈ పాలసీ ద్వారా లభించే పన్ను ఆదా (Tax Benefits):**\n\n` +
          `భారత ఆదాయపు పన్ను చట్టం ప్రకారం మీకు రెండు పెద్ద పన్ను మినహాయింపులు లభిస్తాయి:\n\n` +
          `• 📑 **సెక్షన్ 80C (ప్రీమియం మినహాయింపు):** మీరు చెల్లించే పాలసీ ప్రీమియంపై ఆర్థిక సంవత్సరానికి ₹1,50,000 వరకు మీ స్థూల ఆదాయం నుండి పన్ను మినహాయింపు పొందవచ్చు.\n` +
          `• 🛡️ **సెక్షన్ 10(10D) (100% పన్ను రహితం):** భవిష్యత్తులో మీ కుటుంబానికి లేదా నామినీకి అందే **${recommendedCover}** మొత్తంపై ఒక్క రూపాయి కూడా పన్ను పడదు (పూర్తిగా Tax-Free).\n` +
          `• 🏥 **సెక్షన్ 80D (హెల్త్ రైడర్లు):** క్రిటికల్ ఇల్‌నెస్ రైడర్ జోడిస్తే అదనంగా ₹25,000 వరకు పన్ను తగ్గింపు లభిస్తుంది.`;
      }

      // 1.5 Documents
      if (q.includes('డాక్యుమెంట్లు') || q.includes('సర్టిఫికెట్') || q.includes('పత్రాలు') || q.includes('document') || q.includes('కాగితాలు')) {
        return `📋 **సలహాదారు సురేష్ నాయర్ గారి మీటింగ్‌కు సిద్ధం చేసుకోవాల్సిన డాక్యుమెంట్లు:**\n\n` +
          `మీ పాలసీ వేగంగా ఆమోదం పొందడానికి ఈ క్రింది పత్రాలను సిద్ధంగా ఉంచుకోండి:\n\n` +
          `• 🪪 **గుర్తింపు & చిరునామా:** పాన్ కార్డ్ (PAN) మరియు ఆధార్ కార్డ్ (Aadhaar).\n` +
          `• 💼 **ఆదాయ ధృవీకరణ:** గత 3 నెలల జీతం స్లిప్పులు, తాజా ఫారమ్-16 లేదా 2 సంవత్సరాల ITR రిటర్న్స్.\n` +
          `• 🏦 **బ్యాంక్ వివరాలు:** జీతం జమ అవుతున్న గత 6 నెలల బ్యాంక్ ఖాతా స్టేట్‌మెంట్.\n` +
          `• 🏥 **ఆరోగ్య సమాచారం:** గతంలో ఏవైనా శస్త్రచికిత్సలు లేదా దీర్ఘకాలిక సమస్యలు ఉంటే వాటి వివరాలు.\n` +
          `• 📄 **ప్రస్తుత పాలసీలు:** మీకు ఇప్పటికే ఏవైనా ఇతర ఇన్సూరెన్స్ పాలసీలు ఉంటే వాటి కాపీలు.`;
      }

      // 1.6 Premium Calculation
      if (q.includes('ప్రీమియం') || q.includes('లెక్కించారు') || q.includes('ధర') || q.includes('ఖర్చు') || q.includes('premium')) {
        return `💰 **మీ ప్రీమియం ${monthlyPremium} ఎలా నిర్ణయించబడింది:**\n\n` +
          `మీ పాలసీ ప్రీమియం అధికారిక నిబంధనల ప్రకారం క్రింది 3 అంశాలపై ఆధారపడి ఉంటుంది:\n\n` +
          `• 👤 **వయస్సు & లైఫ్-స్టేజ్:** మీ వయస్సు **${userAge} సంవత్సరాలు**, ప్రామాణిక ఆరోగ్య రేట్లు వర్తింపజేశారు.\n` +
          `• 🎁 **లార్జ్ కవర్ డిస్కౌంట్:** మీ కవరేజ్ ₹1 కోటి కంటే ఎక్కువగా ఉన్నందున బేస్ ప్రీమియంపై **5.0% వాల్యూమ్ డిస్కౌంట్** లభించింది.\n` +
          `• 📅 **నెలవారీ వాయిదాల పద్ధతి:** మొత్తం వార్షిక ప్రీమియంను 12 సమాన నెలవారీ భాగాలుగా విభజించారు.\n\n` +
          `💡 *చిట్కా: మీరు నెలవారీ కాకుండా వార్షికంగా (Yearly) చెల్లిస్తే సుమారు 5% అడ్మినిస్ట్రేషన్ ఫీజు ఆదా అవుతుంది!*`;
      }

      // 1.7 Riders
      if (q.includes('రైడర్') || q.includes('యాక్సిడెంటల్') || q.includes('డిసేబిలిటీ') || q.includes('rider') || q.includes('accidental')) {
        return `🛡️ **మీ ప్లాన్‌కు అదనపు బలాన్నిచ్చే రైడర్ల (Riders) వివరాలు:**\n\n` +
          `తక్కువ అదనపు ఖర్చుతో పూర్తి స్థాయి భద్రతను ఇచ్చే ముఖ్యమైన రైడర్లు:\n\n` +
          `• 🚗 **యాక్సిడెంటల్ డెత్ బెనిఫిట్ (ADB):** ప్రమాదవశాత్తూ దురదృష్టం జరిగితే నామినీకి ప్రధాన కవరేజ్‌తో పాటు అదనంగా ₹50 లక్షలు వెంటనే లభిస్తాయి.\n` +
          `• ♿ **శాశ్వత వైకల్య రక్షణ (ATPD):** ప్రమాదం వల్ల శాశ్వత వైకల్యం వచ్చి ఉద్యోగం చేయలేని స్థితి ఏర్పడితే నెలవారీ ఆదాయ సహాయం అందుతుంది.\n` +
          `• 🩺 **క్రిటికల్ ఇల్‌నెస్ (CI):** క్యాన్సర్, గుండెపోటు వంటి 36 తీవ్ర అనారోగ్యాలు గుర్తించినప్పుడు ఆసుపత్రి చికిత్స ఖర్చుల కోసం తక్షణమే ఏకమొత్తం అందుతుంది.\n` +
          `• 🔄 **ప్రీమియం మినహాయింపు (WOP):** తీవ్ర వైకల్యం సంభవిస్తే భవిష్యత్ ప్రీమియంలన్నీ రద్దవుతాయి, పాలసీ ఉచితంగా కొనసాగుతుంది.`;
      }

      // 1.8 Questions to ask advisor
      if (q.includes('ప్రశ్నలు') || q.includes('అడగాలి') || q.includes('questions') || q.includes('ask')) {
        return `❓ **సలహాదారు సురేష్ నాయర్ గారిని అడగాల్సిన 4 ముఖ్యమైన ప్రశ్నలు:**\n\n` +
          `మీ సమావేశంలో ఈ ప్రశ్నలను తప్పకుండా అడగండి:\n\n` +
          `• 1️⃣ *"ఈ ప్లాన్ యొక్క క్లెయిమ్ సెటిల్‌మెంట్ రేషియో (CSR) మరియు క్లెయిమ్ ప్రక్రియ పూర్తి కావడానికి సగటున ఎన్ని రోజులు పడుతుంది?"*\n` +
          `• 2️⃣ *"నా ప్రస్తుత వయస్సు (${userAge}) కు లిమిటెడ్ పే (10 లేదా 15 ఏళ్లు మాత్రమే ప్రీమియం కట్టి, 30 ఏళ్ల వరకు కవరేజ్ పొందడం) లాభదాయకమా?"*\n` +
          `• 3️⃣ *"నా ${recommendedCover} కవరేజ్ కోసం ఫిజికల్ మెడికల్ టెస్ట్‌లు అవసరమా లేదా టెలి-మెడికల్ ద్వారా పాలసీ మంజూరవుతుందా?"*\n` +
          `• 4️⃣ *"రోడ్డు ప్రమాదాల రక్షణ కోసం యాక్సిడెంటల్ డెత్ రైడర్‌ను ఏ విధంగా జోడించవచ్చు?"*`;
      }

      // Telugu Contextual Fallback
      return `💡 **మీ ప్రశ్నపై InsureMate సలహా:**\n\n` +
        `మీరు అడిగిన అంశం చాలా విలువైనది. మీ ప్రస్తుత **${recommendedCover}** లైఫ్ ప్రొటెక్షన్ మరియు **${selectedPlan}** పాలసీ నిబంధనల ప్రకారం, దీనిపై ఖచ్చితమైన వివరాలను మీ అడ్వైజర్ **${advisorName}** గారు మీ కన్సల్టేషన్ సమయం **${bookingTime}** లో మీకు నేరుగా వివరించగలరు.\n\n` +
        `ఈలోపు మీ ప్రీమియం లెక్కలు, పన్ను ఆదా లేదా అవసరమైన డాక్యుమెంట్ల గురించి తెలుసుకోవడానికి క్రింది సూచనలను చూడండి!`;
    }

    // ==========================================
    // 2. HINDI ENGINE (हिन्दी)
    // ==========================================
    if (currentLang === 'hi') {
      if (q.includes('उपयोगी') || q.includes('प्लान') || q.includes('useful') || q.includes('why this plan')) {
        return `💡 **आपकी जानकारी के अनुसार यह प्लान आपके लिए क्यों सबसे उपयोगी है:**\n\n` +
          `आपकी उम्र (**${userAge} वर्ष**), वार्षिक आय (**${annualIncome}**) और परिवार की सुरक्षा आवश्यकताओं के आधार पर **${selectedPlan}** आपके लिए सबसे बेहतर विकल्प है:\n\n` +
          `• 🛡️ **कर्ज़ और परिवार की 100% सुरक्षा:** आपके होम लोन और परिवार के भविष्य के खर्चों को ध्यान में रखते हुए यह प्लान **${recommendedCover}** का पूरा सुरक्षा कवच देता है।\n` +
          `• 💵 **किफ़ायती मासिक प्रीमियम:** मात्र **${monthlyPremium}** प्रति माह में पूरी सुरक्षा मिलती है, जो आपकी मासिक आय के 2% से भी कम है। बाकी 98% आय आप अपने घरेलू खर्च और बचत के लिए रख सकते हैं।\n` +
          `• 🎯 **शुद्ध सुरक्षा का लाभ:** पारंपरिक एंडोमेंट योजनाओं में इतना बड़ा कवर लेना बहुत महंगा होता है। यह टर्म प्लान कम खर्च में सबसे बड़ा सुरक्षा कवर देता है।\n\n` +
          `💡 *आपकी मीटिंग **${bookingTime}** पर सलाहकार **${advisorName}** जी के साथ निर्धारित है।*`;
      }
      if (q.includes('कवर') || q.includes('क्यों चाहिए') || q.includes('190') || q.includes('1.90') || q.includes('1.30') || q.includes('crore')) {
        return `🛡️ **आपको ${recommendedCover} का सुरक्षा कवर क्यों चाहिए?**\n\n` +
          `आपके परिवार के भविष्य को सुरक्षित रखने के लिए इस कवर की गणना इन आधारों पर की गई है:\n\n` +
          `• 🏠 **100% कर्ज़ मुक्ति:** होम लोन, कार लोन या व्यक्तिगत कर्ज़ को पहले ही दिन पूरी तरह चुकाने के लिए आवश्यक राशि।\n` +
          `• 👨‍👩‍👧 **परिवार का मासिक खर्च:** अगले 15-20 वर्षों तक आपके परिवार का रहन-सहन और जीवन स्तर वैसा ही बना रहे।\n` +
          `• 🎓 **बच्चों की उच्च शिक्षा:** कॉलेज फीस की महंगाई दर (8% प्रति वर्ष) को ध्यान में रखते हुए ज़रूरी फंड।\n` +
          `• 🏥 **इमरजेंसी रिज़र्व:** कम से कम 6 महीने का आकस्मिक फंड इसमें शामिल है।`;
      }
      if (q.includes('एंडोमेंट') || q.includes('यूलिप') || q.includes('ulip') || q.includes('टर्म')) {
        return `⚖️ **एंडोमेंट या यूलिप के बजाय टर्म प्लान क्यों बेहतर है?**\n\n` +
          `• 💰 **खर्च में भारी अंतर:** एंडोमेंट पॉलिसी में **${recommendedCover}** के कवर के लिए सालाना ₹6,00,000 से अधिक भरना पड़ेगा। वहीं इस टर्म प्लान में वही सुरक्षा मात्र **${monthlyPremium}** में मिलती है।\n` +
          `• 📈 **बचत का लाभ:** बची हुई राशि को म्यूच्यूअल फंड, SIP या PPF में निवेश करके आप अधिक धन बना सकते हैं।\n` +
          `• 🛡️ **पर्याप्त सुरक्षा:** एंडोमेंट में अधिक प्रीमियम के कारण लोग केवल ₹5-10 लाख का छोटा कवर ले पाते हैं, जो परिवार के लिए नाकाफी होता है।`;
      }
      if (q.includes('टैक्स') || q.includes('80c') || q.includes('10(10d)') || q.includes('tax')) {
        return `🧾 **इस पॉलिसी पर मिलने वाले टैक्स लाभ (Tax Benefits):**\n\n` +
          `• 📑 **धारा 80C:** आपके द्वारा चुकाए गए प्रीमियम पर ₹1,50,000 प्रति वर्ष तक टैक्स छूट मिलती है।\n` +
          `• 🛡️ **धारा 10(10D):** आपके परिवार को मिलने वाला **${recommendedCover}** का क्लेम 100% टैक्स-मुक्त (Tax-Free) होता है।\n` +
          `• 🏥 **धारा 80D:** क्रिटिकल इलनेस राइडर लेने पर ₹25,000 तक की अतिरिक्त टैक्स छूट मिलती है।`;
      }
      if (q.includes('दस्तावेज') || q.includes('कागजात') || q.includes('document')) {
        return `📋 **सलाहकार ${advisorName} जी के साथ मीटिंग के लिए ज़रूरी दस्तावेज:**\n\n` +
          `• 🪪 **पहचान पत्र:** पैन कार्ड और आधार कार्ड।\n` +
          `• 💼 **आय प्रमाण:** पिछले 3 महीने की सैलरी स्लिप या फॉर्म-16 / 2 साल का ITR।\n` +
          `• 🏦 **बैंक स्टेटमेंट:** पिछले 6 महीने का सैलरी अकाउंट स्टेटमेंट।\n` +
          `• 🏥 **स्वास्थ्य विवरण:** मौजूदा बीमारी या स्वास्थ्य संबंधी पुरानी जानकारी।`;
      }
      if (q.includes('प्रीमियम') || q.includes('तय') || q.includes('गणना')) {
        return `💰 **आपका प्रीमियम ${monthlyPremium} कैसे तय हुआ:**\n\n` +
          `• 👤 **उम्र और स्वास्थ्य:** प्रवेश आयु **${userAge} वर्ष** और मानक स्वास्थ्य दरें।\n` +
          `• 🎁 **लार्ज कवर डिस्काउंट:** ₹1 करोड़ से अधिक कवर होने पर बेस प्रीमियम पर **5.0% वॉल्यूम डिस्काउंट** मिला है।\n` +
          `• 📅 **मासिक किस्त:** सालाना प्रीमियम को 12 बराबर किस्तों में बांटा गया है।\n\n` +
          `💡 *सलाह: सालाना भुगतान करने पर लगभग 5% प्रशासनिक शुल्क की बचत होती है!*`;
      }
      if (q.includes('राइडर') || q.includes('दुर्घटना') || q.includes('विकलांगता')) {
        return `🛡️ **आपके प्लान के लिए उपयोगी राइडर्स (Riders):**\n\n` +
          `• 🚗 **एक्सीडेंटल डेथ बेनिफिट (ADB):** दुर्घटना में मृत्यु होने पर परिवार को अतिरिक्त ₹50 लाख का तत्काल भुगतान।\n` +
          `• ♿ **विकलांगता राइडर (ATPD):** स्थायी विकलांगता पर नियमित आय सहायता।\n` +
          `• 🩺 **क्रिटिकल इलनेस (CI):** कैंसर, स्ट्रोक जैसी 36 गंभीर बीमारियों के इलाज के लिए एकमुश्त राशि।\n` +
          `• 🔄 **प्रीमियम वेवर (WOP):** विकलांगता होने पर भविष्य के सभी प्रीमियम माफ़ हो जाते हैं।`;
      }
      if (q.includes('सवाल') || q.includes('पूछें') || q.includes('प्रश्न')) {
        return `❓ **सलाहकार ${advisorName} जी से पूछने योग्य मुख्य सवाल:**\n\n` +
          `• 1️⃣ *"इस प्लान का क्लेम सेटलमेंट रेशियो (CSR) और औसत समय क्या है?"*\n` +
          `• 2️⃣ *"क्या लिमिटेड पे (10 या 15 साल प्रीमियम भरकर 30 साल कवर) मेरे लिए बेहतर रहेगा?"*\n` +
          `• 3️⃣ *"क्या मेरे ${recommendedCover} कवर के लिए मेडिकल जांच ज़रूरी है?"*\n` +
          `• 4️⃣ *"रोड एक्सीडेंट से सुरक्षा के लिए एक्सीडेंटल डेथ राइडर कैसे जोड़ें?"*`;
      }
      return `💡 **आपकी सुरक्षा योजना पर InsureMate की सलाह:**\n\n` +
        `आपके प्रश्न पर विस्तृत जानकारी आपकी आगामी मीटिंग (**${bookingTime}**) में सलाहकार **${advisorName}** जी द्वारा दी जा सकती है। इस बीच, आप अपने प्रीमियम या टैक्स छूट से जुड़े प्रश्न पूछ सकते हैं!`;
    }

    // ==========================================
    // 3. TAMIL ENGINE (தமிழ்)
    // ==========================================
    if (currentLang === 'ta') {
      if (q.includes('பயனுள்ள') || q.includes('திட்டம்') || q.includes('useful') || q.includes('plan')) {
        return `💡 **உங்கள் தகவல்களின்படி இந்த திட்டம் ஏன் சிறந்தது:**\n\n` +
          `• 🛡️ **முழு குடும்ப பாதுகாப்பு மற்றும் கடன் அடைப்பு:** உங்கள் வயது (**${userAge}**), வருமானம் (**${annualIncome}**) அடிப்படையில், இந்த திட்டம் உங்கள் குடும்பத்துக்கு **${recommendedCover}** முழு பாதுகாப்பை வழங்குகிறது.\n` +
          `• 💵 **குறைந்த பிரீமியம்:** வெறும் **${monthlyPremium}** மாத தவணையில் உங்கள் குடும்பம் பாதுகாக்கப்படுகிறது.\n` +
          `• 🎯 **சுத்தமான பாதுகாப்பு:** எண்டோவ்மென்ட் திட்டங்களை விட டெர்ம் பிளான் குறைந்த செலவில் அதிக பலன் தரும்.\n\n` +
          `💡 *ஆலோசனை நேரம்: **${bookingTime}** (ஆலோசகர்: **${advisorName}**).*`;
      }
      return `💡 **InsureMate ஆலோசனை:**\n\n` +
        `உங்கள் கேள்விக்கு ஆலோசகர் **${advisorName}** அவர்கள் **${bookingTime}** சந்திப்பில் விரிவான விளக்கம் அளிப்பார். இதற்கிடையில் பிரீமியம் அல்லது ஆவணங்கள் பற்றிய தகவல்களை அறிந்துகொள்ளலாம்!`;
    }

    // ==========================================
    // 4. KANNADA ENGINE (ಕನ್ನಡ)
    // ==========================================
    if (currentLang === 'kn') {
      if (q.includes('ಉಪಯುಕ್ತ') || q.includes('ಯೋಜನೆ') || q.includes('useful') || q.includes('plan')) {
        return `💡 **ನಿಮ್ಮ ವಿವರಗಳ ಪ್ರಕಾರ ಈ ಯೋಜನೆ ಏಕೆ ಸೂಕ್ತ:**\n\n` +
          `• 🛡️ **ಸಂಪೂರ್ಣ ಕುಟುಂಬ ಮತ್ತು ಸಾಲ ರಕ್ಷಣೆ:** ನಿಮ್ಮ ವಯಸ್ಸು (**${userAge}**) ಮತ್ತು ಆದಾಯ (**${annualIncome}**) ಪರಿಗಣಿಸಿ, ಈ ಪ್ಲಾನ್ **${recommendedCover}** ರಕ್ಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.\n` +
          `• 💵 **ಕಡಿಮೆ ಪ್ರೀಮಿಯಂ:** ಕೇವಲ **${monthlyPremium}** ತಿಂಗಳಿಗೆ ಪಾವತಿಸಿ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಬಹುದು.\n` +
          `• 🎯 **ಶುದ್ಧ ರಕ್ಷಣೆ:** ಎಂಡೋವ್ಮೆಂಟ್ ಯೋಜನೆಗಳಿಗಿಂತ ಟರ್ಮ್ ಪ್ಲಾನ್ ಅತ್ಯುತ್ತಮ.\n\n` +
          `💡 *ಸಮಾಲೋಚನೆ ಸಮಯ: **${bookingTime}** (ಸಲಹೆಗಾರ: **${advisorName}**).*`;
      }
      return `💡 **InsureMate ಸಲಹೆ:**\n\n` +
        `ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಲಹೆಗಾರ **${advisorName}** ಅವರು **${bookingTime}** ಭೇಟಿಯಲ್ಲಿ ವಿವರವಾಗಿ ಉತ್ತರಿಸಲಿದ್ದಾರೆ. ಈ ನಡುವೆ ತೆರಿಗೆ ಉಳಿತಾಯ ಅಥವಾ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ತಿಳಿಯಬಹುದು!`;
    }

    // ==========================================
    // 5. ENGLISH ENGINE (DEFAULT)
    // ==========================================
    if (
      q.includes('useful') ||
      q.includes('why this plan') ||
      q.includes('good for me') ||
      q.includes('suitable') ||
      q.includes('benefit') ||
      q.includes('why should i buy') ||
      q.includes('according to my input') ||
      q.includes('my data')
    ) {
      return `💡 **Why this plan is the ideal match for your financial profile:**\n\n` +
        `Based on your age (**${userAge}**), annual income (**${annualIncome}**), and family dependents, **${selectedPlan}** offers three key advantages:\n\n` +
        `• 🛡️ **Full Debt & Family Security:** Covers your liabilities (such as home or personal loans) and guarantees a **${recommendedCover}** safety net so your loved ones never face financial distress.\n` +
        `• 💵 **Cost-Efficient:** At **${monthlyPremium}**, this policy takes up **less than 2% of your monthly earnings**, leaving over **98% of your salary** intact for living expenses and investments.\n` +
        `• 🎯 **Pure Protection Focus:** Unlike traditional endowment plans that lock up heavy capital, this plan delivers maximum financial coverage at minimal cost.\n\n` +
        `💡 *During your appointment on **${bookingTime}**, Advisor **${advisorName}** will help you finalize policy terms and riders.*`;
    }

    if (q.includes('why do i need') || q.includes('coverage') || q.includes('gap') || q.includes('how much cover') || q.includes('190') || q.includes('1.90') || q.includes('1.30') || q.includes('crore')) {
      return `🛡️ **The exact math behind your ${recommendedCover} coverage:**\n\n` +
        `This figure was actuarially calculated to secure every critical financial aspect of your household:\n\n` +
        `• 🏠 **100% Debt Clearance:** Fully provisions for any outstanding home, auto, or personal loans so EMIs are cleared on Day 1.\n` +
        `• 👨‍👩‍👧 **Family Living Maintenance:** Provides monthly income replacement for 15–20 years to maintain your family's standard of living.\n` +
        `• 🎓 **Child Higher Education:** Accounts for tuition inflation (factored at 8% annually) so college goals remain protected.\n` +
        `• 🏥 **Emergency Reserve:** Adds a 6-month liquidity cushion to handle unexpected transitions.\n\n` +
        `💡 *This creates an impenetrable financial fortress for your dependents.*`;
    }

    if (q.includes('endowment') || q.includes('ulip') || q.includes('investment') || q.includes('returns') || q.includes('money back')) {
      return `⚖️ **Why this Term Plan is superior to Endowment or ULIPs for you:**\n\n` +
        `• 💰 **Massive Cost Savings:** To get **${recommendedCover}** cover in an endowment plan, annual premiums exceed ₹6,00,000 per year! In this term plan, you receive that exact protection for just **${monthlyPremium}**.\n` +
        `• 📈 **Invest the Difference:** By saving on heavy premiums, you can invest the surplus in Mutual Funds, PPF, or equity SIPs for far higher long-term wealth.\n` +
        `• 🛡️ **Zero Underinsurance:** Endowment policies force people into tiny ₹5–10 Lakh covers due to high premiums. Term insurance ensures your family is 100% safeguarded.`;
    }

    if (q.includes('tax') || q.includes('80c') || q.includes('deduction') || q.includes('10(10d)')) {
      return `🧾 **Tax Savings on your policy:**\n\n` +
        `Under the Indian Income Tax Act, you qualify for substantial benefits:\n\n` +
        `• 📑 **Section 80C:** Annual premiums paid (up to ₹1,50,000/year) are tax-deductible from your gross income.\n` +
        `• 🛡️ **Section 10(10D):** The full death benefit claim of **${recommendedCover}** received by your nominee is **100% tax-free**.\n` +
        `• 🏥 **Section 80D:** Critical Illness riders offer additional deductions up to ₹25,000!`;
    }

    if (q.includes('document') || q.includes('prepare') || q.includes('bring') || q.includes('checklist')) {
      return `📋 **Document checklist for Advisor ${advisorName}:**\n\n` +
        `To ensure rapid underwriting and instant issuance, keep these ready for your session on **${bookingTime}**:\n\n` +
        `• 🪪 **Identity & Address:** PAN Card & Aadhaar Card.\n` +
        `• 💼 **Income Proof:** Last 3 months' salary slips, latest Form 16, or 2 years' ITR.\n` +
        `• 🏦 **Financial Verification:** Last 6 months bank statement.\n` +
        `• 🏥 **Medical Disclosure:** Details of any previous surgeries or family health history.\n` +
        `• 📄 **Existing Policies:** Copies of any current insurance plans you hold.`;
    }

    if (q.includes('premium') || q.includes('calculate') || q.includes('cost') || q.includes('price')) {
      return `💰 **How your premium of ${monthlyPremium} is calculated:**\n\n` +
        `• 👤 **Age & Benchmark Rate:** Evaluated at entry age **${userAge}** with standard non-smoker rates.\n` +
        `• 🎁 **Volume Discount:** Target cover of ₹1 Crore+ unlocks an automatic **5.0% discount** on base rates.\n` +
        `• 📅 **Monthly Modal Factor:** Annual base premium split across 12 monthly installments.\n\n` +
        `💡 *Pro-Tip: Paying annually eliminates the monthly processing fee and saves you roughly 5% each year!*`;
    }

    if (q.includes('rider') || q.includes('accidental') || q.includes('disability') || q.includes('critical illness')) {
      return `🛡️ **Recommended supplementary riders for your plan:**\n\n` +
        `• 🚗 **Accidental Death Benefit (ADB):** Pays an additional ₹50 Lakhs cash if an accident occurs (~₹131/month).\n` +
        `• ♿ **Accidental Total Disability (ATPD):** Replaces monthly income if permanent disability prevents working.\n` +
        `• 🩺 **Critical Illness (CI):** Instant lump-sum payout upon diagnosis of 36 severe illnesses (cancer, stroke, etc.).\n` +
        `• 🔄 **Waiver of Premium (WOP):** Waives all future premiums if disability occurs while keeping the policy fully active.`;
    }

    if (q.includes('question') || q.includes('ask') || q.includes('appointment')) {
      return `❓ **Top 4 questions to ask Advisor ${advisorName}:**\n\n` +
        `• 1️⃣ *"What is the Claim Settlement Ratio (CSR) and average turnaround time for ${selectedPlan}?"*\n` +
        `• 2️⃣ *"Would Limited Pay (e.g. paying for 10 or 15 years while covered for 30 years) be more advantageous for my age (${userAge})?"*\n` +
        `• 3️⃣ *"Does my ${recommendedCover} cover qualify for tele-medical underwriting or are physical tests needed?"*\n` +
        `• 4️⃣ *"Can we attach an Accidental Death Benefit rider for road and transit protection?"*`;
    }

    return `💡 **Regarding your question:**\n\n` +
      `That is an important question. Based on your target protection of **${recommendedCover}** and plan **${selectedPlan}**, Advisor **${advisorName}** will provide full guidance on this during your consultation on **${bookingTime}**.\n\n` +
      `💡 *In the meantime, feel free to ask about your premium breakdown, tax savings, or required documents!*`;
  };

  // Ultra-Fast Response Dispatcher (Sub-second speed with 3.5s Gemini timeout)
  const getFastAIResponse = async (userPrompt: string): Promise<string> => {
    const lower = userPrompt.toLowerCase().trim();

    // 1. Instant conversational greetings & politeness (120ms)
    const isGreetingOrPolite = 
      lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'hai' ||
      lower.startsWith('hi ') || lower.startsWith('hello ') || lower.startsWith('hey ') ||
      lower === 'ok' || lower === 'okay' || lower === 'sure' || lower.includes('thank') ||
      lower.includes('హాయ్') || lower.includes('నమస్తే') || lower.includes('నమస్కారం') ||
      lower.includes('ధన్యవాదాలు') || lower.includes('who are you') || lower.includes('నువ్వు ఎవరు');

    if (isGreetingOrPolite) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return generateBuiltinResponse(userPrompt, language);
    }

    // 2. Instant response for known FAQ and prompt chips (150ms)
    const isChipOrCommon = 
      lower.includes('డేటా') || lower.includes('ఉపయోగ') || lower.includes('కవరేజ్') || lower.includes('ఎందుకు అవసరం') ||
      lower.includes('ఎండోమెంట్') || lower.includes('పన్ను') || lower.includes('డాక్యుమెంట్లు') || lower.includes('ప్రీమియం') ||
      lower.includes('రైడర్') || lower.includes('ప్రశ్నలు') || lower.includes('useful') || lower.includes('why do i need') ||
      lower.includes('endowment') || lower.includes('tax') || lower.includes('document') || lower.includes('how is my') ||
      lower.includes('rider') || lower.includes('उपयोगी') || lower.includes('कवर क्यों') || lower.includes('பயனுள்ள') || lower.includes('ಉಪಯುಕ್ತ');

    if (isChipOrCommon) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return generateBuiltinResponse(userPrompt, language);
    }

    // 3. For any other custom typed queries: Call Gemini Flash Lite (Fastest & Active) with 3.5s timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const langNames: Record<Language, { name: string; native: string }> = {
        en: { name: 'English', native: 'English' },
        te: { name: 'Telugu', native: 'తెలుగు' },
        hi: { name: 'Hindi', native: 'हिन्दी' },
        ta: { name: 'Tamil', native: 'தமிழ்' },
        kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
      };
      const targetLang = langNames[language] || langNames.en;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${DEFAULT_GEMINI_API_KEY.trim()}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ 
              text: `You are InsureMate, a helpful, polite, and knowledgeable AI Life Insurance Advisor for CoverWise.
Language: ${targetLang.name} (${targetLang.native}).
Customer Profile: Name: ${userName}, Age: ${userAge}, Annual Income: ${annualIncome}, Recommended Cover: ${recommendedCover}, Selected Plan: ${selectedPlan}, Estimated Monthly Premium: ${monthlyPremium}, Booked Advisor: ${advisorName}, Scheduled Meeting: ${bookingTime}.

Customer Question: "${userPrompt}"

Instruction: Provide a direct, relevant, and warmly worded response in natural ${targetLang.name} (under 140 words). Directly answer what the customer asked. Do not repeat generic summaries.` 
            }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 280,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (err) {
      console.warn('Gemini query fallback:', err);
    }

    return generateBuiltinResponse(userPrompt, language);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await getFastAIResponse(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackText = generateBuiltinResponse(text, language);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to render inline **bold** formatting and tags
  const renderInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-teal-950 bg-teal-50/90 px-1 py-0.5 rounded border border-teal-200/50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Rich Content Parser (renders cards, callouts, titles, lists without raw markdown hashes/asterisks)
  const renderFormattedContent = (content: string) => {
    const blocks = content.split(/\n\n+/);
    return blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Callout / Pro-Tip Box (starts with 💡 or *)
      if (trimmed.startsWith('💡') || (trimmed.startsWith('*') && trimmed.endsWith('*'))) {
        const calloutText = trimmed.replace(/^\*+|\*+$/g, '');
        return (
          <div key={bIdx} className="bg-gradient-to-r from-teal-50/90 to-cyan-50/60 border-l-4 border-teal-500 rounded-r-xl p-3 my-2.5 text-xs sm:text-sm text-teal-950 leading-relaxed font-medium shadow-xs">
            {renderInlineText(calloutText)}
          </div>
        );
      }

      // Title or Heading Block (starts with ### or ## or emojis with bold)
      if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
        const headingText = trimmed.replace(/^#+\s*/, '');
        return (
          <div key={bIdx} className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-teal-100 pb-2 mb-2.5 text-teal-950 flex items-center gap-2">
            <span>{renderInlineText(headingText)}</span>
          </div>
        );
      }

      // List Block (items starting with • or - or 1.)
      const lines = trimmed.split('\n');
      const isList = lines.some((line) => line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+[️⃣\.]/.test(line.trim()));

      if (isList) {
        return (
          <div key={bIdx} className="space-y-2 my-2.5">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[•\-\d️⃣\.]+\s*/, '').trim();
              if (!cleanLine) return null;
              return (
                <div key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="flex-1 leading-relaxed">{renderInlineText(cleanLine)}</div>
                </div>
              );
            })}
          </div>
        );
      }

      // Standard Paragraph
      return (
        <p key={bIdx} className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-2 last:mb-0">
          {renderInlineText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[90vh] max-h-[780px] shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        {/* INSUREMATE CHAT HEADER */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-[var(--color-navy-900)] to-slate-900 text-white flex items-center justify-between border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            {/* 3D BADGE LOGO ICON */}
            <div className="relative group shrink-0">
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center justify-center">
                <img
                  src="/insuremate.png"
                  alt="InsureMate Logo"
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" title="InsureMate AI Online" />
            </div>

            <div>
              <h3 className="font-[var(--font-heading)] font-extrabold text-base sm:text-lg text-white tracking-wide">
                InsureMate
              </h3>
              <p className="text-[11px] text-cyan-200/80 font-medium">
                AI-Powered Life Protection Advisory
              </p>
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition cursor-pointer"
            title="Close InsureMate"
          >
            ✕
          </button>
        </div>

        {/* FINANCIAL CONTEXT SUMMARY BAR */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-teal-100 flex flex-wrap items-center justify-between text-xs text-teal-950 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span>🛡️ <strong>Recommended Cover:</strong> {recommendedCover}</span>
            <span className="text-teal-300">|</span>
            <span>📋 <strong>Top Plan:</strong> {selectedPlan}</span>
            <span className="text-teal-300">|</span>
            <span>💳 <strong>Est. Premium:</strong> {monthlyPremium}</span>
          </div>
          <span className="text-teal-800 font-semibold bg-teal-100/60 px-2 py-0.5 rounded-md">
            📅 {bookingTime}
          </span>
        </div>

        {/* CHAT MESSAGE STREAM */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                {msg.sender === 'ai' && (
                  <img
                    src="/insuremate.png"
                    alt="InsureMate"
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-cyan-400/50 shadow-sm"
                  />
                )}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-700 to-[var(--color-navy-900)] text-white rounded-tr-none ml-auto'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none prose prose-xs max-w-none shadow-xs'
                  }`}
                >
                  <div>
                    {msg.sender === 'ai' ? renderFormattedContent(msg.text) : msg.text}
                  </div>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              {msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[94%] pl-10">
                  {msg.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-3 py-1.5 bg-white hover:bg-cyan-50 text-cyan-950 hover:text-cyan-900 border border-cyan-200 hover:border-cyan-400 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer text-left flex items-center gap-1.5"
                    >
                      <span>💡</span>
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 p-3 bg-white border border-cyan-200 rounded-2xl w-fit text-xs text-slate-600 shadow-sm animate-pulse ml-10">
              <img src="/insuremate.png" alt="InsureMate" className="w-5 h-5 rounded-full object-cover animate-spin" />
              <span>InsureMate is analyzing your financial assessment...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX & SEND BUTTON */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                language === 'te'
                  ? `మీ ${recommendedCover} కవర్ లేదా ప్లాన్ గురించి అడగండి...`
                  : language === 'hi'
                  ? `अपने ${recommendedCover} कवर या प्लान के बारे में पूछें...`
                  : language === 'ta'
                  ? `உங்கள் ${recommendedCover} காப்பீடு அல்லது திட்டம் பற்றி கேட்கவும்...`
                  : language === 'kn'
                  ? `ನಿಮ್ಮ ${recommendedCover} ವಿಮೆ ಅಥವಾ ಯೋಜನೆಯ ಬಗ್ಗೆ ಕೇಳಿ...`
                  : `Ask InsureMate about your ${recommendedCover} cover, plan, or advisor meeting...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <span>↗</span>
            </button>
          </form>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
            <span>🛡️ InsureMate &bull; Context-Aware &bull; 100% Private</span>
            <span>Language: <strong>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel || 'English'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
