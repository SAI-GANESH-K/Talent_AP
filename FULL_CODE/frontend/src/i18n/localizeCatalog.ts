import type { Language } from './translations';

/**
 * Localizes product categories and types for all 5 supported languages.
 */
export function localizeCategory(category: string, lang: Language): string {
  const map: Record<Language, Record<string, string>> = {
    en: {
      'Family Protection': 'Family Protection',
      'Term Life': 'Term Life',
      'Debt Protection': 'Debt Protection',
      'Long-Term Protection': 'Long-Term Protection',
      'Child Future Shield': 'Child Future Shield',
      'Protection With Savings': 'Protection With Savings',
      'Investment-Linked Protection': 'Investment-Linked Protection',
      'Life Protection': 'Life Protection',
      'Savings & Protection': 'Savings & Protection',
      'Investment & Wealth': 'Investment & Wealth',
      'Endowment': 'Endowment',
      'ULIP': 'ULIP',
      'Whole Life': 'Whole Life',
    },
    te: {
      'Family Protection': 'కుటుంబ రక్షణ',
      'Term Life': 'టర్మ్ లైఫ్',
      'Debt Protection': 'రుణ రక్షణ',
      'Long-Term Protection': 'దీర్ఘకాలిక రక్షణ',
      'Child Future Shield': 'పిల్లల భవిష్యత్ రక్షణ',
      'Protection With Savings': 'పొదుపుతో కూడిన రక్షణ',
      'Investment-Linked Protection': 'పెట్టుబడి అనుసంధాన రక్షణ',
      'Life Protection': 'జీవిత రక్షణ',
      'Savings & Protection': 'పొదుపు & రక్షణ',
      'Investment & Wealth': 'పెట్టుబడి & సంపద',
      'Endowment': 'ఎండోమెంట్',
      'ULIP': 'యులిప్ (ULIP)',
      'Whole Life': 'హోల్ లైఫ్',
    },
    hi: {
      'Family Protection': 'परिवार सुरक्षा',
      'Term Life': 'टर्म लाइफ',
      'Debt Protection': 'ऋण सुरक्षा',
      'Long-Term Protection': 'दीर्घकालिक सुरक्षा',
      'Child Future Shield': 'बाल भविष्य सुरक्षा',
      'Protection With Savings': 'बचत के साथ सुरक्षा',
      'Investment-Linked Protection': 'निवेश आधारित सुरक्षा',
      'Life Protection': 'जीवन सुरक्षा',
      'Savings & Protection': 'बचत और सुरक्षा',
      'Investment & Wealth': 'निवेश और धन',
      'Endowment': 'बंदोबस्ती',
      'ULIP': 'यूलिप (ULIP)',
      'Whole Life': 'संपूर्ण जीवन',
    },
    ta: {
      'Family Protection': 'குடும்ப பாதுகாப்பு',
      'Term Life': 'டேர்ம் லைஃப்',
      'Debt Protection': 'கடன் பாதுகாப்பு',
      'Long-Term Protection': 'நீண்ட கால பாதுகாப்பு',
      'Child Future Shield': 'குழந்தை எதிர்கால கவசம்',
      'Protection With Savings': 'சேமிப்புடன் கூடிய பாதுகாப்பு',
      'Investment-Linked Protection': 'முதலீடு சார்ந்த பாதுகாப்பு',
      'Life Protection': 'ஆயுள் பாதுகாப்பு',
      'Savings & Protection': 'சேமிப்பு மற்றும் பாதுகாப்பு',
      'Investment & Wealth': 'முதலீடு மற்றும் செல்வம்',
      'Endowment': 'எண்டோவ்மென்ட்',
      'ULIP': 'யூலிப் (ULIP)',
      'Whole Life': 'முழு ஆயுள்',
    },
    kn: {
      'Family Protection': 'ಕುಟುಂಬ ರಕ್ಷಣೆ',
      'Term Life': 'ಟರ್ಮ್ ಲೈಫ್',
      'Debt Protection': 'ಸಾಲ ರಕ್ಷಣೆ',
      'Long-Term Protection': 'ದೀರ್ಘಾವಧಿ ರಕ್ಷಣೆ',
      'Child Future Shield': 'ಮಕ್ಕಳ ಭವಿಷ್ಯ ರಕ್ಷಣೆ',
      'Protection With Savings': 'ಉಳಿತಾಯದೊಂದಿಗೆ ರಕ್ಷಣೆ',
      'Investment-Linked Protection': 'ಹೂಡಿಕೆ ಆಧಾರಿತ ರಕ್ಷಣೆ',
      'Life Protection': 'ಜೀವ ರಕ್ಷಣೆ',
      'Savings & Protection': 'ಉಳಿತಾಯ ಮತ್ತು ರಕ್ಷಣೆ',
      'Investment & Wealth': 'ಹೂಡಿಕೆ ಮತ್ತು ಸಂಪತ್ತು',
      'Endowment': 'ಎಂಡೋವ್ಮೆಂಟ್',
      'ULIP': 'ಯುಲಿಪ್ (ULIP)',
      'Whole Life': 'ಸಂಪೂರ್ಣ ಜೀವ',
    },
  };

  return map[lang]?.[category] || category;
}

/**
 * Localizes financial goal types in Stage 2 Net Needs breakdown.
 */
export function localizeGoalType(goal: string, lang: Language): string {
  const normalized = goal.toLowerCase().trim();
  const map: Record<Language, Record<string, string>> = {
    en: {
      child_education: "Child's Higher Education",
      child_marriage: "Child's Marriage",
      home_purchase: 'Home Purchase',
      house_purchase: 'Home Purchase',
      parents_health: "Parents' Healthcare Fund",
      parent_care: "Parents' Care",
      retirement_corpus: 'Retirement Corpus',
      emergency_fund: 'Emergency Reserve',
    },
    te: {
      child_education: 'పిల్లల ఉన్నత విద్య',
      child_marriage: 'పిల్లల వివాహం',
      home_purchase: 'సొంత ఇల్లు కొనుగోలు',
      house_purchase: 'సొంత ఇల్లు కొనుగోలు',
      parents_health: 'తల్లిదండ్రుల వైద్య సంరక్షణ',
      parent_care: 'తల్లిదండ్రుల సంరక్షణ',
      retirement_corpus: 'పదవీ విరమణ నిధి',
      emergency_fund: 'అత్యవసర నిధి',
    },
    hi: {
      child_education: 'बच्चों की उच्च शिक्षा',
      child_marriage: 'बच्चों का विवाह',
      home_purchase: 'घर की खरीद',
      house_purchase: 'घर की खरीद',
      parents_health: 'माता-पिता की स्वास्थ्य देखभाल',
      parent_care: 'माता-पिता की देखभाल',
      retirement_corpus: 'सेवानिवृत्ति कोष',
      emergency_fund: 'आपातकालीन कोष',
    },
    ta: {
      child_education: 'குழந்தைகள் உயர்கல்வி',
      child_marriage: 'குழந்தைகள் திருமணம்',
      home_purchase: 'வீடு வாங்குதல்',
      house_purchase: 'வீடு வாங்குதல்',
      parents_health: 'பெற்றோர் மருத்துவ பராமரிப்பு',
      parent_care: 'பெற்றோர் பராமரிப்பு',
      retirement_corpus: 'ஓய்வூதிய நிதி',
      emergency_fund: 'அவசரகால நிதி',
    },
    kn: {
      child_education: 'ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ',
      child_marriage: 'ಮಕ್ಕಳ ವಿವಾಹ',
      home_purchase: 'ಮನೆ ಖರೀದಿ',
      house_purchase: 'ಮನೆ ಖರೀದಿ',
      parents_health: 'ಪೋಷಕರ ಆರೋಗ್ಯ ರಕ್ಷಣೆ',
      parent_care: 'ಪೋಷಕರ ರಕ್ಷಣೆ',
      retirement_corpus: 'ನಿವೃತ್ತಿ ನಿಧಿ',
      emergency_fund: 'ತುರ್ತು ನಿಧಿ',
    },
  };

  return map[lang]?.[normalized] || goal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Localizes recommendation reason sentences into natural regional phrasing.
 */
export function localizeWhyRecommended(why: string, sumAssuredFormatted: string, lang: Language): string {
  if (lang === 'en') return why;

  if (why.includes('pure protection') || why.includes('Delivers')) {
    switch (lang) {
      case 'te':
        return `మీ కుటుంబ రక్షణ లోటును అత్యంత సమర్థవంతంగా భర్తీ చేయడానికి ${sumAssuredFormatted} స్వచ్ఛమైన జీవిత రక్షణను అందిస్తుంది.`;
      case 'hi':
        return `आपके परिवार के सुरक्षा अंतर को न्यूनतम लागत में सुरक्षित करने के लिए ${sumAssuredFormatted} का शुद्ध जीवन कवर प्रदान करता है।`;
      case 'ta':
        return `உங்கள் குடும்பத்தின் கவரேஜ் இடைவெளியை குறைந்தபட்ச செலவில் பூர்த்தி செய்ய ${sumAssuredFormatted} நேரடி ஆயுள் பாதுகாப்பை வழங்குகிறது.`;
      case 'kn':
        return `ನಿಮ್ಮ ಕುಟುಂಬದ ರಕ್ಷಣಾ ಕೊರತೆಯನ್ನು ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಪರಿಹರಿಸಲು ${sumAssuredFormatted} ಶುದ್ಧ ಜೀವ ರಕ್ಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.`;
    }
  }

  if (why.includes('Combines life cover') || why.includes('savings')) {
    switch (lang) {
      case 'te':
        return 'కుటుంబ భవిష్యత్ మైలురాళ్ల కోసం క్రమశిక్షణతో కూడిన దీర్ఘకాలిక పొదుపుతో పాటు నమ్మకమైన జీవిత రక్షణను అందిస్తుంది.';
      case 'hi':
        return 'पारिवारिक लक्ष्यों के लिए अनुशासित दीर्घकालिक बचत के साथ जीवन सुरक्षा को जोड़ता है।';
      case 'ta':
        return 'குடும்ப மைல்கற்களுக்கு நீண்ட கால சேமிப்புடன் கூடிய ஆயுள் பாதுகாப்பை இணைக்கிறது.';
      case 'kn':
        return 'ಕುಟುಂಬದ ಗುರಿಗಳಿಗಾಗಿ ದೀರ್ಘಾವಧಿಯ ಉಳಿತಾಯದೊಂದಿಗೆ ಜೀವ ರಕ್ಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.';
    }
  }

  if (why.includes('Market-linked') || why.includes('wealth')) {
    switch (lang) {
      case 'te':
        return 'వార్షిక ప్రీమియం పెట్టుబడితో సంపద సృష్టి అవకాశాలు మరియు మార్కెట్-అనుసంధాన జీవిత రక్షణను అందిస్తుంది.';
      case 'hi':
        return 'लचीले प्रीमियम निवेश के साथ धन सृजन और बाजार से जुड़ा जीवन कवर प्रदान करता है।';
      case 'ta':
        return 'வருடாந்திர பிரீமியம் முதலீட்டுடன் செல்வத்தை உருவாக்கும் சந்தை சார்ந்த ஆயுள் பாதுகாப்பு.';
      case 'kn':
        return 'ವಾರ್ಷಿಕ ಪ್ರೀಮಿಯಂ ಹೂಡಿಕೆಯೊಂದಿಗೆ ಸಂಪತ್ತು ಸೃಷ್ಟಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಆಧಾರಿತ ಜೀವ ರಕ್ಷಣೆ.';
    }
  }

  if (why.includes('entire lifespan') || why.includes('Whole Life')) {
    switch (lang) {
      case 'te':
        return 'మరణానంతరం గ్యారెంటీ చెల్లింపుతో మీ జీవితాంతం కుటుంబానికి పూర్తి రక్షణను అందిస్తుంది.';
      case 'hi':
        return 'मृत्यु पर गारंटीकृत भुगतान के साथ आपके पूरे जीवनकाल में परिवार को सुरक्षा प्रदान करता है।';
      case 'ta':
        return 'மரணம் ஏற்படும் போது உத்தரவாதமான பலனுடன் உங்கள் வாழ்நாள் முழுவதும் குடும்பத்திற்கு பாதுகாப்பு அளிக்கிறது.';
      case 'kn':
        return 'ಮರಣದ ನಂತರ ಖಾತರಿಯ ಪಾವತಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಜೀವಿತಾವಧಿಯಲ್ಲಿ ಕುಟುಂಬಕ್ಕೆ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.';
    }
  }

  return why;
}

/**
 * Localizes standard IRDAI product benefits and features.
 */
export function localizeFeature(feature: string, lang: Language): string {
  if (lang === 'en') return feature;

  const f = feature.trim().toLowerCase();

  if (f.includes('survival') || f.includes('premiums back')) {
    switch (lang) {
      case 'te': return 'కాలపరిమితి ముగిసిన తర్వాత చెల్లించిన బేస్ ప్రీమియంలు తిరిగి పొందండి';
      case 'hi': return 'जीवित रहने पर अपने मूल प्रीमियम वापस पाएं';
      case 'ta': return 'முதிர்வின் போது செலுத்திய அடிப்படை பிரீமியத்தைத் திரும்பப் பெறுங்கள்';
      case 'kn': return 'ಬದುಕುಳಿಯುವಿಕೆಯ ಮೇಲೆ ನಿಮ್ಮ ಮೂಲ ಪ್ರೀಮಿಯಂಗಳನ್ನು ಮರಳಿ ಪಡೆಯಿರಿ';
    }
  }

  if (f.includes('terms 20 to 40') || f.includes('policy terms')) {
    switch (lang) {
      case 'te': return '20 నుండి 40 సంవత్సరాల అనుకూల పాలసీ వ్యవధి';
      case 'hi': return '20 से 40 वर्ष की लचीली पॉलिसी अवधि';
      case 'ta': return '20 முதல் 40 ஆண்டுகள் வரை பாலிசி கால அளவு';
      case 'kn': return '20 ರಿಂದ 40 ವರ್ಷಗಳ ಹೊಂದಿಕೊಳ್ಳುವ ಪಾಲಿಸಿ ಅವಧಿ';
    }
  }

  if (f.includes('25 lakh') && f.includes('25 crore')) {
    switch (lang) {
      case 'te': return 'రూ. 25 లక్షల నుండి రూ. 25 కోట్ల వరకు జీవిత రక్షణ';
      case 'hi': return 'रु. 25 लाख से रु. 25 करोड़ तक का जीवन कवर';
      case 'ta': return 'ரூ. 25 லட்சம் முதல் ரூ. 25 கோடி வரை ஆயுள் காப்பீடு';
      case 'kn': return 'ರೂ. 25 ಲಕ್ಷದಿಂದ ರೂ. 25 ಕೋಟಿಯವರೆಗೆ ಜೀವ ರಕ್ಷಣೆ';
    }
  }

  if (f.includes('5 lakh to') || f.includes('50 lakh')) {
    switch (lang) {
      case 'te': return 'రూ. 5 లక్షల నుండి రూ. 50 లక్షల వరకు సరసమైన కవర్';
      case 'hi': return 'रु. 5 लाख से रु. 50 लाख तक का किफायती कवर';
      case 'ta': return 'ரூ. 5 லட்சம் முதல் ரூ. 50 லட்சம் வரை சிக்கனமான பாதுகாப்பு';
      case 'kn': return 'ರೂ. 5 ಲಕ್ಷದಿಂದ ರೂ. 50 ಲಕ್ಷದವರೆಗೆ ಆರ್ಥಿಕ ಕವರ್';
    }
  }

  if (f.includes('cover ends by age 85') || f.includes('10 to 40 years')) {
    switch (lang) {
      case 'te': return '10 నుండి 40 సంవత్సరాల వరకు నచ్చిన వ్యవధి (85 ఏళ్ల వరకు రక్షణ)';
      case 'hi': return '10 से 40 वर्ष तक की पॉलिसी अवधि चुनें (85 वर्ष की आयु तक)';
      case 'ta': return '10 முதல் 40 ஆண்டுகள் வரை விருப்பமான கால அளவு (85 வயது வரை)';
      case 'kn': return '10 ರಿಂದ 40 ವರ್ಷಗಳವರೆಗೆ ಪಾಲಿಸಿ ಅವಧಿ (85 ವರ್ಷದವರೆಗೆ ರಕ್ಷಣೆ)';
    }
  }

  if (f.includes('cover rises') || f.includes('5% of the starting')) {
    switch (lang) {
      case 'te': return 'ప్రతి సంవత్సరం ప్రారంభ కవర్‌లో 5% ఆటోమేటిక్‌గా పెరుగుతుంది (గరిష్టంగా 2 రెట్లు)';
      case 'hi': return 'प्रारंभिक कवर का 5% हर साल स्वचालित रूप से बढ़ता है (अधिकतम 2 गुना)';
      case 'ta': return 'ஆரம்ப கவரேஜில் 5% ஒவ்வொரு ஆண்டும் தானாக உயரும் (அதிகபட்சம் 2 மடங்கு)';
      case 'kn': return 'ಪ್ರಾರಂಭಿಕ ಕವರ್‌ನ 5% ಪ್ರತಿ ವರ್ಷ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೆಚ್ಚಾಗುತ್ತದೆ (ಗರಿಷ್ಠ 2 ಪಟ್ಟು)';
    }
  }

  if (f.includes('cover for life') || f.includes('age 100')) {
    switch (lang) {
      case 'te': return '100 సంవత్సరాల వయస్సు వరకు జీవితాంత రక్షణ';
      case 'hi': return '100 वर्ष की आयु तक आजीवन सुरक्षा';
      case 'ta': return '100 வயது வரை வாழ்நாள் முழுவதும் பாதுகாப்பு';
      case 'kn': return '100 ವರ್ಷದವರೆಗೆ ಜೀವಮಾನದ ರಕ್ಷಣೆ';
    }
  }

  if (f.includes('terminal-illness') || f.includes('terminal illness')) {
    switch (lang) {
      case 'te': return 'తీవ్ర అనారోగ్య ప్రయోజనం అంతర్నిర్మితంగా లభ్యం';
      case 'hi': return 'गंभीर बीमारी लाभ इन-बिल्ट शामिल';
      case 'ta': return 'முனைய நோய் பலன் உள்ளிணைக்கப்பட்டுள்ளது';
      case 'kn': return 'ಮಾರಣಾಂತಿಕ ಕಾಯಿಲೆ ಪ್ರಯೋಜನ ಅಂತರ್ಗತವಾಗಿದೆ';
    }
  }

  if (f.includes('level premium')) {
    switch (lang) {
      case 'te': return 'పాలసీ మొత్తం కాలానికి స్థిరమైన ప్రీమియం';
      case 'hi': return 'पूरी पॉलिसी अवधि में समान स्थिर प्रीमियम';
      case 'ta': return 'முழு பாலிசி காலத்திற்கும் நிலையான பிரீமியம்';
      case 'kn': return 'ಸಂಪೂರ್ಣ ಪಾಲಿಸಿ ಅವಧಿಗೆ ಸ್ಥಿರ ಪ್ರೀಮಿಯಂ';
    }
  }

  if (f.includes('disciplined saving') || f.includes('disciplined')) {
    switch (lang) {
      case 'te': return 'జీవిత రక్షణతో కూడిన క్రమశిక్షణతో కూడిన పొదుపు';
      case 'hi': return 'जीवन कवर के साथ अनुशासित बचत';
      case 'ta': return 'ஆயுள் பாதுகாப்புடன் கூடிய ஒழுங்குபடுத்தப்பட்ட சேமிப்பு';
      case 'kn': return 'ಜೀವ ರಕ್ಷಣೆಯೊಂದಿಗೆ ಶಿಸ್ತುಬದ್ಧ ಉಳಿತಾಯ';
    }
  }

  if (f.includes('fully guaranteed') || f.includes('guaranteed maturity')) {
    switch (lang) {
      case 'te': return 'పూర్తిగా గ్యారెంటీ చేయబడిన మెచ్యూరిటీ మొత్తం';
      case 'hi': return 'पूर्णतः गारंटीकृत परिपक्वता राशि';
      case 'ta': return 'முழுமையாக உத்தரவாதம் அளிக்கப்பட்ட முதிர்வுத் தொகை';
      case 'kn': return 'ಸಂಪೂರ್ಣ ಖಾತರಿಯ ಮೆಚ್ಯೂರಿಟಿ ಮೊತ್ತ';
    }
  }

  if (f.includes('4 funds') || f.includes('switch')) {
    switch (lang) {
      case 'te': return '4 ఫండ్ల నుండి ఎంపిక మరియు ఉచిత మార్పిడి సౌలభ్యం';
      case 'hi': return '4 फंडों में से चयन और फंड स्विचिंग की सुविधा';
      case 'ta': return '4 நிதிகளிலிருந்து தேர்வு மற்றும் இலவச நிதி மாற்றங்கள்';
      case 'kn': return '4 ನಿಧಿಗಳಿಂದ ಆಯ್ಕೆ ಮತ್ತು ಉಚಿತ ವರ್ಗಾವಣೆ ಸೌಲಭ್ಯ';
    }
  }

  if (f.includes('partial withdrawals') || f.includes('lock-in')) {
    switch (lang) {
      case 'te': return '5 ఏళ్ల లాక్-ఇన్ తర్వాత పాక్షిక ఉపసంహరణల సౌలభ్యం';
      case 'hi': return '5 साल के लॉक-इन के बाद आंशिक निकासी की अनुमति';
      case 'ta': return '5 ஆண்டுகள் லாக்-இன் பிறகு பகுதி திரும்பப் பெறுதல்';
      case 'kn': return '5 ವರ್ಷಗಳ ಲಾಕ್-ಇನ್ ನಂತರ ಭಾಗಶಃ ಹಿಂಪಡೆಯುವಿಕೆ';
    }
  }

  if (f.includes('premium waiver') || f.includes('waiver')) {
    switch (lang) {
      case 'te': return 'తల్లిదండ్రుల మరణానంతరం ప్రీమియం మినహాయింపు ప్రయోజనం';
      case 'hi': return 'माता-पिता के निधन पर भविष्य के प्रीमियम की छूट';
      case 'ta': return 'பெற்றோர் இறப்பில் எதிர்கால பிரீமியம் தள்ளுபடி';
      case 'kn': return 'ಪೋಷಕರ ನಿಧನದ ಮೇಲೆ ಪ್ರೀಮಿಯಂ ಮನ್ನಾ ಪ್ರಯೋಜನ';
    }
  }

  if (f.includes('loan balance') || f.includes('outstanding loan')) {
    switch (lang) {
      case 'te': return 'గృహ రుణ బ్యాలెన్స్‌కు అనుగుణంగా తగ్గుతూ ఉండే రక్షణ';
      case 'hi': return 'गृह ऋण शेष के अनुरूप घटने वाला कवर';
      case 'ta': return 'வீட்டுக் கடன் இருப்புக்கு ஏற்ப குறையும் பாதுகாப்பு';
      case 'kn': return 'ಗೃಹ ಸಾಲದ ಬಾಕಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ರಕ್ಷಣೆ';
    }
  }

  if (f.includes('no medical tests') || f.includes('simplified')) {
    switch (lang) {
      case 'te': return 'రూ. 25 లక్షల వరకు వైద్య పరీక్షలు అవసరం లేదు';
      case 'hi': return 'रु. 25 लाख तक मेडिकल टेस्ट की आवश्यकता नहीं';
      case 'ta': return 'ரூ. 25 லட்சம் வரை மருத்துவ பரிசோதனை தேவையில்லை';
      case 'kn': return 'ರೂ. 25 ಲಕ್ಷದವರೆಗೆ ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಯಿಲ್ಲ';
    }
  }

  if (f.includes('one-time premium') || f.includes('pay once')) {
    switch (lang) {
      case 'te': return 'ఒకేసారి సింగిల్ ప్రీమియం చెల్లింపు సౌలభ్యం';
      case 'hi': return 'एकल प्रीमियम भुगतान की सुविधा';
      case 'ta': return 'ஒரே முறை பிரீமியம் செலுத்தும் வசதி';
      case 'kn': return 'ಏಕ ಪ್ರೀಮಿಯಂ ಪಾವತಿಯ ಸೌಲಭ್ಯ';
    }
  }

  if (f.includes('limited premium') || f.includes('10 years only') || f.includes('short premium')) {
    switch (lang) {
      case 'te': return 'పరిమిత కాల ప్రీమియం చెల్లింపు ఎంపికలు';
      case 'hi': return 'सीमित प्रीमियम भुगतान के विकल्प';
      case 'ta': return 'வரையறுக்கப்பட்ட பிரீமியம் செலுத்தும் விருப்பங்கள்';
      case 'kn': return 'ಸೀಮಿತ ಪ್ರೀಮಿಯಂ ಪಾವತಿಯ ಆಯ್ಕೆಗಳು';
    }
  }

  return feature;
}

/**
 * Localizes standard points to note / limitations.
 */
export function localizeLimitation(limitation: string, lang: Language): string {
  if (lang === 'en') return limitation;

  const l = limitation.trim().toLowerCase();

  if (l.includes('as for saffron kesaro term')) {
    switch (lang) {
      case 'te': return 'శాఫ్రాన్ కేసరో టర్మ్ నిబంధనల ప్రకారం వర్తిస్తుంది.';
      case 'hi': return 'सैफरन केसरो टर्म के नियमों के अनुसार लागू।';
      case 'ta': return 'குங்குமப்பூ கேசரோ டேர்ம் நிபந்தனைகளின்படி பொருந்தும்.';
      case 'kn': return 'ಕೇಸರಿ ಟರ್ಮ್ ನಿಯಮಗಳ ಪ್ರಕಾರ ಅನ್ವಯಿಸುತ್ತದೆ.';
    }
  }

  if (l.includes('suicide within 12 months')) {
    switch (lang) {
      case 'te': return 'పాలసీ ప్రారంభించిన 12 నెలల్లోపు ఆత్మహత్య సంభవిస్తే: చెల్లించిన ప్రీమియంలలో కనీసం 80% (లేదా సరెండర్ విలువ) చెల్లించబడుతుంది.';
      case 'hi': return 'पॉलिसी शुरू होने के 12 महीनों के भीतर आत्महत्या: भुगतान किए गए प्रीमियम का कम से कम 80% वापस दिया जाएगा।';
      case 'ta': return 'பாலிசி தொடங்கிய 12 மாதங்களுக்குள் தற்கொலை: செலுத்தப்பட்ட பிரீமியத்தில் குறைந்தபட்சம் 80% திரும்ப வழங்கப்படும்.';
      case 'kn': return 'ಪಾಲಿಸಿ ಆರಂಭವಾದ 12 ತಿಂಗಳೊಳಗೆ ಆತ್ಮಹತ್ಯೆ: ಪಾವತಿಸಿದ ಪ್ರೀಮಿಯಂಗಳಲ್ಲಿ ಕನಿಷ್ಠ 80% ಹಿಂತಿರುಗಿಸಲಾಗುತ್ತದೆ.';
    }
  }

  if (l.includes('bonuses are not guaranteed') || l.includes('not guaranteed')) {
    switch (lang) {
      case 'te': return 'బోనస్‌లు ఫండ్ పనితీరుపై ఆధారపడి ఉంటాయి, గ్యారెంటీ ఉండవు.';
      case 'hi': return 'बोनस फंड के प्रदर्शन पर निर्भर करते हैं और गारंटीकृत नहीं हैं।';
      case 'ta': return 'போனஸ்கள் நிதியின் செயல்பாட்டைப் பொறுத்தது, உத்தரவாதம் இல்லை.';
      case 'kn': return 'ಬೋನಸ್‌ಗಳು ನಿಧಿಯ ಕಾರ್ಯಕ್ಷಮತೆಯ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತವೆ ಮತ್ತು ಖಾತರಿಯಿಲ್ಲ.';
    }
  }

  if (l.includes('investment risk') || l.includes('policyholder')) {
    switch (lang) {
      case 'te': return 'పెట్టుబడి ప్రమాదం పూర్తిగా పాలసీదారుడే భరించాల్సి ఉంటుంది.';
      case 'hi': return 'निवेश का जोखिम पॉलिसीधारक द्वारा वहन किया जाता है।';
      case 'ta': return 'முதலீட்டு அபாயம் பாலிசிதாரரால் ஏற்கப்படுகிறது.';
      case 'kn': return 'ಹೂಡಿಕೆಯ ಅಪಾಯವನ್ನು ಪಾಲಿಸಿದಾರರೇ ಭರಿಸುತ್ತಾರೆ.';
    }
  }

  return limitation;
}

