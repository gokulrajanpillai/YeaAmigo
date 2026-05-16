/* eslint-disable */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'hi' | 'ta' | 'ml' | 'kn' | 'mr' | 'bn';

export const LANGS: { code: Lang; label: string; native: string; region?: string }[] = [
  { code: 'en', label: 'English',  native: 'English' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी',   region: 'North India' },
  { code: 'ta', label: 'Tamil',    native: 'தமிழ்',   region: 'Tamil Nadu' },
  { code: 'ml', label: 'Malayalam',native: 'മലയാളം',  region: 'Kerala' },
  { code: 'kn', label: 'Kannada',  native: 'ಕನ್ನಡ',    region: 'Karnataka' },
  { code: 'mr', label: 'Marathi',  native: 'मराठी',    region: 'Maharashtra' },
  { code: 'bn', label: 'Bengali',  native: 'বাংলা',    region: 'West Bengal' },
];

type T = Record<string, Record<Lang, string>>;
const dict: T = {
  // brand
  brand_name:        { en: 'YeaAmigo', hi: 'YeaAmigo', ta: 'YeaAmigo', ml: 'YeaAmigo', kn: 'YeaAmigo', mr: 'YeaAmigo', bn: 'YeaAmigo' },
  tagline:           { en: 'Good food, great amigos.', hi: 'अच्छा खाना, बढ़िया दोस्त।', ta: 'நல்ல உணவு, சிறந்த நண்பர்கள்.', ml: 'നല്ല ഭക്ഷണം, മികച്ച സുഹൃത്തുക്കൾ.', kn: 'ರುಚಿಯಾದ ಊಟ, ಉತ್ತಮ ಸ್ನೇಹಿತರು.', mr: 'चविष्ट जेवण, छान मित्र.', bn: 'ভালো খাবার, দারুণ বন্ধুরা।' },
  // auth
  welcome_back:      { en: 'Welcome back', hi: 'फिर से स्वागत है', ta: 'மீண்டும் வரவேற்கிறோம்', ml: 'വീണ്ടും സ്വാഗതം', kn: 'ಮತ್ತೆ ಸ್ವಾಗತ', mr: 'पुन्हा स्वागत आहे', bn: 'আবার স্বাগতম' },
  sign_in:           { en: 'Sign in', hi: 'साइन इन करें', ta: 'உள்நுழைக', ml: 'സൈൻ ഇൻ ചെയ്യുക', kn: 'ಸೈನ್ ಇನ್', mr: 'साइन इन', bn: 'সাইন ইন' },
  sign_in_to_continue:{en: 'Sign in to continue', hi: 'जारी रखने के लिए साइन इन करें', ta: 'தொடர உள்நுழைக', ml: 'തുടരാൻ സൈൻ ഇൻ ചെയ്യുക', kn: 'ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್', mr: 'सुरू ठेवण्यासाठी साइन इन करा', bn: 'চালিয়ে যেতে সাইন ইন করুন' },
  email:             { en: 'Email', hi: 'ईमेल', ta: 'மின்னஞ்சல்', ml: 'ഇമെയിൽ', kn: 'ಇಮೇಲ್', mr: 'ईमेल', bn: 'ইমেইল' },
  password:          { en: 'Password', hi: 'पासवर्ड', ta: 'கடவுச்சொல்', ml: 'പാസ്‌വേഡ്', kn: 'ಪಾಸ್‌ವರ್ಡ್', mr: 'पासवर्ड', bn: 'পাসওয়ার্ড' },
  new_to:            { en: 'New here?', hi: 'नए हैं?', ta: 'புதிதா?', ml: 'പുതിയതാണോ?', kn: 'ಹೊಸಬರೇ?', mr: 'नवीन आहात?', bn: 'নতুন?' },
  create_account:    { en: 'Create account', hi: 'खाता बनाएं', ta: 'கணக்கை உருவாக்கவும்', ml: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', kn: 'ಖಾತೆ ರಚಿಸಿ', mr: 'खाते तयार करा', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  demo_accounts:     { en: 'Demo accounts (password: YeaAmigo2026!)', hi: 'डेमो खाते (पासवर्ड: YeaAmigo2026!)', ta: 'டெமோ கணக்குகள் (கடவுச்சொல்: YeaAmigo2026!)', ml: 'ഡെമോ അക്കൗണ്ടുകൾ (പാസ്‌വേഡ്: YeaAmigo2026!)', kn: 'ಡೆಮೋ ಖಾತೆಗಳು (ಪಾಸ್‌ವರ್ಡ್: YeaAmigo2026!)', mr: 'डेमो खाती (पासवर्ड: YeaAmigo2026!)', bn: 'ডেমো অ্যাকাউন্ট (পাসওয়ার্ড: YeaAmigo2026!)' },

  // customer
  delivering_to:     { en: 'Delivering to', hi: 'डिलीवरी पता', ta: 'டெலிவரி இடம்', ml: 'ഡെലിവറി ലൊക്കേഷൻ', kn: 'ಡೆಲಿವರಿ ಸ್ಥಳ', mr: 'डिलीव्हरी पत्ता', bn: 'ডেলিভারি ঠিকানা' },
  search_placeholder:{ en: 'Search restaurants or dishes...', hi: 'रेस्तरां या व्यंजन खोजें...', ta: 'உணவகங்கள் அல்லது உணவுகளை தேடுங்கள்...', ml: 'റെസ്റ്റോറന്റുകൾ അല്ലെങ്കിൽ വിഭവങ്ങൾ തിരയുക...', kn: 'ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ಅಥವಾ ಭಕ್ಷ್ಯಗಳನ್ನು ಹುಡುಕಿ...', mr: 'रेस्तराँ किंवा पदार्थ शोधा...', bn: 'রেস্তোরাঁ বা খাবার খুঁজুন...' },
  restaurants_near:  { en: 'restaurants near you', hi: 'आपके पास रेस्तरां', ta: 'அருகிலுள்ள உணவகங்கள்', ml: 'അടുത്തുള്ള റെസ്റ്റോറന്റുകൾ', kn: 'ಹತ್ತಿರದ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು', mr: 'जवळची रेस्तराँ', bn: 'কাছাকাছি রেস্তোরাঁ' },
  closed_label:      { en: 'Currently closed', hi: 'अभी बंद है', ta: 'தற்போது மூடப்பட்டுள்ளது', ml: 'ഇപ്പോൾ അടച്ചിരിക്കുന്നു', kn: 'ಪ್ರಸ್ತುತ ಮುಚ್ಚಲಾಗಿದೆ', mr: 'सध्या बंद', bn: 'এখন বন্ধ' },

  // tabs
  tab_home:          { en: 'Home', hi: 'होम', ta: 'முகப்பு', ml: 'ഹോം', kn: 'ಮುಖಪುಟ', mr: 'मुख्यपृष्ठ', bn: 'হোম' },
  tab_orders:        { en: 'Orders', hi: 'ऑर्डर', ta: 'ஆர்டர்கள்', ml: 'ഓർഡറുകൾ', kn: 'ಆರ್ಡರ್‌ಗಳು', mr: 'ऑर्डर', bn: 'অর্ডার' },
  tab_support:       { en: 'Support', hi: 'सहायता', ta: 'ஆதரவு', ml: 'പിന്തുണ', kn: 'ಸಹಾಯ', mr: 'मदत', bn: 'সাহায্য' },
  tab_profile:       { en: 'Profile', hi: 'प्रोफ़ाइल', ta: 'சுயவிவரம்', ml: 'പ്രൊഫൈൽ', kn: 'ಪ್ರೊಫೈಲ್', mr: 'प्रोफाइल', bn: 'প্রোফাইল' },
  tab_dashboard:     { en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'டாஷ்போர்டு', ml: 'ഡാഷ്ബോർഡ്', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', mr: 'डॅशबोर्ड', bn: 'ড্যাশবোর্ড' },
  tab_menu:          { en: 'Menu', hi: 'मेनू', ta: 'மெனு', ml: 'മെനു', kn: 'ಮೆನು', mr: 'मेनू', bn: 'মেনু' },
  tab_settings:      { en: 'Settings', hi: 'सेटिंग्स', ta: 'அமைப்புகள்', ml: 'ക്രമീകരണങ്ങൾ', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', mr: 'सेटिंग्ज', bn: 'সেটিংস' },
  tab_history:       { en: 'History', hi: 'इतिहास', ta: 'வரலாறு', ml: 'ചരിത്രം', kn: 'ಇತಿಹಾಸ', mr: 'इतिहास', bn: 'ইতিহাস' },
  tab_overview:      { en: 'Overview', hi: 'सिंहावलोकन', ta: 'மேலோட்டம்', ml: 'അവലോകനം', kn: 'ಅವಲೋಕನ', mr: 'अवलोकन', bn: 'সংক্ষিপ্তসার' },
  tab_restaurants:   { en: 'Restaurants', hi: 'रेस्तरां', ta: 'உணவகங்கள்', ml: 'റെസ്റ്റോറന്റുകൾ', kn: 'ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು', mr: 'रेस्तराँ', bn: 'রেস্তোরাঁ' },
  tab_users:         { en: 'Users', hi: 'उपयोगकर्ता', ta: 'பயனர்கள்', ml: 'ഉപയോക്താക്കൾ', kn: 'ಬಳಕೆದಾರರು', mr: 'वापरकर्ते', bn: 'ব্যবহারকারী' },

  // cart
  your_cart:         { en: 'Your Cart', hi: 'आपका कार्ट', ta: 'உங்கள் கூடை', ml: 'നിങ്ങളുടെ കാർട്ട്', kn: 'ನಿಮ್ಮ ಕಾರ್ಟ್', mr: 'तुमची कार्ट', bn: 'আপনার কার্ট' },
  cart_empty:        { en: 'Cart is empty', hi: 'कार्ट खाली है', ta: 'கூடை காலியாக உள்ளது', ml: 'കാർട്ട് ശൂന്യമാണ്', kn: 'ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ', mr: 'कार्ट रिकामी आहे', bn: 'কার্ট খালি' },
  browse_restaurants:{ en: 'Browse restaurants', hi: 'रेस्तरां ब्राउज़ करें', ta: 'உணவகங்களை பார்க்கவும்', ml: 'റെസ്റ്റോറന്റുകൾ കാണുക', kn: 'ರೆಸ್ಟೋರೆಂಟ್ ನೋಡಿ', mr: 'रेस्तराँ पहा', bn: 'রেস্তোরাঁ দেখুন' },
  delivery_address:  { en: 'Delivery address', hi: 'डिलीवरी पता', ta: 'டெலிவரி முகவரி', ml: 'ഡെലിവറി വിലാസം', kn: 'ಡೆಲಿವರಿ ವಿಳಾಸ', mr: 'डिलीव्हरी पत्ता', bn: 'ডেলিভারি ঠিকানা' },
  delivery_notes:    { en: 'Delivery notes (optional)', hi: 'डिलीवरी नोट्स (वैकल्पिक)', ta: 'டெலிவரி குறிப்புகள் (விரும்பினால்)', ml: 'ഡെലിവറി കുറിപ്പുകൾ (ഐച്ഛികം)', kn: 'ಡೆಲಿವರಿ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)', mr: 'डिलीव्हरी टीप (ऐच्छिक)', bn: 'ডেলিভারি নোট (ঐচ্ছিক)' },
  subtotal:          { en: 'Subtotal', hi: 'उप-योग', ta: 'மொத்த துணை', ml: 'ഉപ-മൊത്തം', kn: 'ಉಪ-ಒಟ್ಟು', mr: 'उप-एकूण', bn: 'উপ-মোট' },
  delivery_fee:      { en: 'Delivery fee', hi: 'डिलीवरी शुल्क', ta: 'டெலிவரி கட்டணம்', ml: 'ഡെലിവറി ഫീസ്', kn: 'ಡೆಲಿವರಿ ಶುಲ್ಕ', mr: 'डिलीव्हरी शुल्क', bn: 'ডেলিভারি ফি' },
  total:             { en: 'Total', hi: 'कुल', ta: 'மொத்தம்', ml: 'ആകെ', kn: 'ಒಟ್ಟು', mr: 'एकूण', bn: 'মোট' },
  place_order:       { en: 'Place Order', hi: 'ऑर्डर करें', ta: 'ஆர்டர் செய்க', ml: 'ഓർഡർ ചെയ്യുക', kn: 'ಆರ್ಡರ್ ಮಾಡಿ', mr: 'ऑर्डर करा', bn: 'অর্ডার করুন' },
  ordering_from:     { en: 'Ordering from', hi: 'से ऑर्डर कर रहे हैं', ta: 'இவரிடமிருந்து ஆர்டர்', ml: 'ഓർഡർ ചെയ്യുന്നത്', kn: 'ಇಲ್ಲಿಂದ ಆರ್ಡರ್', mr: 'येथून ऑर्डर', bn: 'এখান থেকে অর্ডার' },

  // tracking
  no_orders:         { en: 'No orders yet', hi: 'अभी कोई ऑर्डर नहीं', ta: 'இன்னும் ஆர்டர்கள் இல்லை', ml: 'ഇതുവരെ ഓർഡറുകൾ ഇല്ല', kn: 'ಇನ್ನೂ ಆರ್ಡರ್ ಇಲ್ಲ', mr: 'अजून ऑर्डर नाही', bn: 'এখনো কোন অর্ডার নেই' },
  active_tab:        { en: 'Active', hi: 'सक्रिय', ta: 'செயலில்', ml: 'സജീവം', kn: 'ಸಕ್ರಿಯ', mr: 'सक्रिय', bn: 'সক্রিয়' },
  past_tab:          { en: 'Past', hi: 'पिछले', ta: 'கடந்த', ml: 'കഴിഞ്ഞ', kn: 'ಹಿಂದಿನ', mr: 'मागील', bn: 'পূর্ববর্তী' },
  cancel_order:      { en: 'Cancel Order', hi: 'ऑर्डर रद्द करें', ta: 'ஆர்டரை ரத்துசெய்', ml: 'ഓർഡർ റദ്ദാക്കുക', kn: 'ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ', mr: 'ऑर्डर रद्द करा', bn: 'অর্ডার বাতিল' },
  rate_order:        { en: 'Rate your order', hi: 'अपने ऑर्डर को रेट करें', ta: 'உங்கள் ஆர்டரை மதிப்பிடுக', ml: 'നിങ്ങളുടെ ഓർഡർ റേറ്റ് ചെയ്യുക', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್ ರೇಟ್ ಮಾಡಿ', mr: 'तुमच्या ऑर्डरला रेट करा', bn: 'আপনার অর্ডার রেট করুন' },

  // profile
  sign_out:          { en: 'Sign out', hi: 'साइन आउट', ta: 'வெளியேறு', ml: 'സൈൻ ഔട്ട്', kn: 'ಸೈನ್ ಔಟ್', mr: 'साइन आउट', bn: 'সাইন আউট' },
  language:          { en: 'Language', hi: 'भाषा', ta: 'மொழி', ml: 'ഭാഷ', kn: 'ಭಾಷೆ', mr: 'भाषा', bn: 'ভাষা' },
  choose_language:   { en: 'Choose your language', hi: 'अपनी भाषा चुनें', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', ml: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക', kn: 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', mr: 'तुमची भाषा निवडा', bn: 'আপনার ভাষা চয়ন করুন' },
  recommended:       { en: 'Recommended for your region', hi: 'आपके क्षेत्र के लिए अनुशंसित', ta: 'உங்கள் பகுதிக்கு பரிந்துரைக்கப்படுகிறது', ml: 'നിങ്ങളുടെ പ്രദേശത്തിന് ശുപാർശ ചെയ്യുന്നു', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ', mr: 'तुमच्या क्षेत्रासाठी शिफारस', bn: 'আপনার এলাকার জন্য প্রস্তাবিত' },
  role:              { en: 'Role', hi: 'भूमिका', ta: 'பங்கு', ml: 'റോൾ', kn: 'ಪಾತ್ರ', mr: 'भूमिका', bn: 'ভূমিকা' },
  phone:             { en: 'Phone', hi: 'फ़ोन', ta: 'தொலைபேசி', ml: 'ഫോൺ', kn: 'ಫೋನ್', mr: 'फोन', bn: 'ফোন' },
  status:            { en: 'Status', hi: 'स्थिति', ta: 'நிலை', ml: 'സ്ഥിതി', kn: 'ಸ್ಥಿತಿ', mr: 'स्थिती', bn: 'অবস্থা' },

  // support
  need_help:         { en: 'Need help?', hi: 'मदद चाहिए?', ta: 'உதவி வேண்டுமா?', ml: 'സഹായം വേണോ?', kn: 'ಸಹಾಯ ಬೇಕೆ?', mr: 'मदत हवी?', bn: 'সাহায্য দরকার?' },

  // misc
  ok:                { en: 'OK', hi: 'ठीक है', ta: 'சரி', ml: 'ശരി', kn: 'ಸರಿ', mr: 'ठीक', bn: 'ঠিক আছে' },
  cancel:            { en: 'Cancel', hi: 'रद्द करें', ta: 'ரத்து', ml: 'റദ്ദാക്കുക', kn: 'ರದ್ದು', mr: 'रद्द', bn: 'বাতিল' },
  yes:               { en: 'Yes', hi: 'हाँ', ta: 'ஆம்', ml: 'അതെ', kn: 'ಹೌದು', mr: 'होय', bn: 'হ্যাঁ' },
  no:                { en: 'No', hi: 'नहीं', ta: 'இல்லை', ml: 'ഇല്ല', kn: 'ಇಲ್ಲ', mr: 'नाही', bn: 'না' },
};

const RegionToLang: Record<string, Lang> = {
  KL: 'ml', TN: 'ta', KA: 'kn', MH: 'mr', WB: 'bn',
  UP: 'hi', BR: 'hi', MP: 'hi', RJ: 'hi', HR: 'hi', DL: 'hi', JH: 'hi', CG: 'hi', UK: 'hi',
};

function detectLang(): Lang {
  try {
    // expo-localization not installed for size — fallback to JS Intl
    const lang = (Intl as any)?.Locale ? new (Intl as any).Locale((Intl as any).DateTimeFormat().resolvedOptions().locale).baseName : '';
    const parts = String(lang || '').split('-');
    const langCode = (parts[0] || '').toLowerCase();
    const region = (parts[1] || '').toUpperCase();
    if (region && RegionToLang[region]) return RegionToLang[region];
    if (['hi', 'ta', 'ml', 'kn', 'mr', 'bn'].includes(langCode)) return langCode as Lang;
  } catch {}
  return 'en';
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; suggested: Lang };
const I18nCtx = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (k) => k, suggested: 'en' });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [suggested, setSuggested] = useState<Lang>('en');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('yeaamigo_lang');
      const det = detectLang();
      setSuggested(det);
      if (stored && ['en', 'hi', 'ta', 'ml', 'kn', 'mr', 'bn'].includes(stored)) {
        setLangState(stored as Lang);
      } else {
        setLangState(det);
      }
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('yeaamigo_lang', l).catch(() => {});
  }, []);

  const t = useCallback((k: string) => {
    const row = dict[k];
    if (!row) return k;
    return row[lang] || row.en || k;
  }, [lang]);

  return <I18nCtx.Provider value={{ lang, setLang, t, suggested }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
