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

// Static UI strings
const dict: T = {
  brand_name:        { en: 'YeaAmigo', hi: 'YeaAmigo', ta: 'YeaAmigo', ml: 'YeaAmigo', kn: 'YeaAmigo', mr: 'YeaAmigo', bn: 'YeaAmigo' },
  tagline:           { en: 'Food delivery made easy', hi: 'खाने की डिलीवरी अब आसान', ta: 'உணவு டெலிவரி இப்போது எளிது', ml: 'ഭക്ഷണ ഡെലിവറി ഇപ്പോൾ എളുപ്പം', kn: 'ಊಟ ಡೆಲಿವರಿ ಈಗ ಸುಲಭ', mr: 'जेवण डिलीव्हरी आता सोपी', bn: 'খাবার ডেলিভারি এখন সহজ' },

  welcome_back:      { en: 'Welcome back', hi: 'फिर से स्वागत है', ta: 'மீண்டும் வரவேற்கிறோம்', ml: 'വീണ്ടും സ്വാഗതം', kn: 'ಮತ್ತೆ ಸ್ವಾಗತ', mr: 'पुन्हा स्वागत आहे', bn: 'আবার স্বাগতম' },
  sign_in:           { en: 'Sign in', hi: 'साइन इन करें', ta: 'உள்நுழைக', ml: 'സൈൻ ഇൻ ചെയ്യുക', kn: 'ಸೈನ್ ಇನ್', mr: 'साइन इन', bn: 'সাইন ইন' },
  sign_in_to_continue:{en: 'Sign in to continue', hi: 'जारी रखने के लिए साइन इन करें', ta: 'தொடர உள்நுழைக', ml: 'തുടരാൻ സൈൻ ഇൻ ചെയ്യുക', kn: 'ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್', mr: 'सुरू ठेवण्यासाठी साइन इन करा', bn: 'চালিয়ে যেতে সাইন ইন করুন' },
  email:             { en: 'Email', hi: 'ईमेल', ta: 'மின்னஞ்சல்', ml: 'ഇമെയിൽ', kn: 'ಇಮೇಲ್', mr: 'ईमेल', bn: 'ইমেইল' },
  password:          { en: 'Password', hi: 'पासवर्ड', ta: 'கடவுச்சொல்', ml: 'പാസ്‌വേഡ്', kn: 'ಪಾಸ್‌ವರ್ಡ್', mr: 'पासवर्ड', bn: 'পাসওয়ার্ড' },
  new_to:            { en: 'New here?', hi: 'नए हैं?', ta: 'புதிதா?', ml: 'പുതിയതാണോ?', kn: 'ಹೊಸಬರೇ?', mr: 'नवीन आहात?', bn: 'নতুন?' },
  create_account:    { en: 'Create account', hi: 'खाता बनाएं', ta: 'கணக்கை உருவாக்கவும்', ml: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', kn: 'ಖಾತೆ ರಚಿಸಿ', mr: 'खाते तयार करा', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  demo_accounts:     { en: 'Demo accounts (password: YeaAmigo2026!)', hi: 'डेमो खाते (पासवर्ड: YeaAmigo2026!)', ta: 'டெமோ கணக்குகள் (கடவுச்சொல்: YeaAmigo2026!)', ml: 'ഡെമോ അക്കൗണ്ടുകൾ (പാസ്‌വേഡ്: YeaAmigo2026!)', kn: 'ಡೆಮೋ ಖಾತೆಗಳು (ಪಾಸ್‌ವರ್ಡ್: YeaAmigo2026!)', mr: 'डेमो खाती (पासवर्ड: YeaAmigo2026!)', bn: 'ডেমো অ্যাকাউন্ট (পাসওয়ার্ড: YeaAmigo2026!)' },

  delivering_to:     { en: 'Delivering to', hi: 'डिलीवरी पता', ta: 'டெலிவரி இடம்', ml: 'ഡെലിവറി ലൊക്കേഷൻ', kn: 'ಡೆಲಿವರಿ ಸ್ಥಳ', mr: 'डिलीव्हरी पत्ता', bn: 'ডেলিভারি ঠিকানা' },
  search_placeholder:{ en: 'Search restaurants or dishes...', hi: 'रेस्तरां या व्यंजन खोजें...', ta: 'உணவகங்கள் அல்லது உணவுகளை தேடுங்கள்...', ml: 'റെസ്റ്റോറന്റുകൾ അല്ലെങ്കിൽ വിഭവങ്ങൾ തിരയുക...', kn: 'ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ಅಥವಾ ಭಕ್ಷ್ಯಗಳನ್ನು ಹುಡುಕಿ...', mr: 'रेस्तराँ किंवा पदार्थ शोधा...', bn: 'রেস্তোরাঁ বা খাবার খুঁজুন...' },
  restaurants_near:  { en: 'restaurants near you', hi: 'आपके पास रेस्तरां', ta: 'அருகிலுள்ள உணவகங்கள்', ml: 'അടുത്തുള്ള റെസ്റ്റോറന്റുകൾ', kn: 'ಹತ್ತಿರದ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು', mr: 'जवळची रेस्तराँ', bn: 'কাছাকাছি রেস্তোরাঁ' },
  closed_label:      { en: 'Currently closed', hi: 'अभी बंद है', ta: 'தற்போது மூடப்பட்டுள்ளது', ml: 'ഇപ്പോൾ അടച്ചിരിക്കുന്നു', kn: 'ಪ್ರಸ್ತುತ ಮುಚ್ಚಲಾಗಿದೆ', mr: 'सध्या बंद', bn: 'এখন বন্ধ' },
  delivery_word:     { en: 'delivery', hi: 'डिलीवरी', ta: 'டெலிவரி', ml: 'ഡെലിവറി', kn: 'ಡೆಲಿವರಿ', mr: 'डिलीव्हरी', bn: 'ডেলিভারি' },
  min_word:          { en: 'min', hi: 'मिनट', ta: 'நிமி', ml: 'മിനിറ്റ്', kn: 'ನಿಮಿ', mr: 'मि', bn: 'মিনিট' },

  tab_home:          { en: 'Home', hi: 'होम', ta: 'முகப்பு', ml: 'ഹോം', kn: 'ಮುಖಪುಟ', mr: 'मुख्य', bn: 'হোম' },
  tab_orders:        { en: 'Orders', hi: 'ऑर्डर', ta: 'ஆர்டர்', ml: 'ഓർഡർ', kn: 'ಆರ್ಡರ್', mr: 'ऑर्डर', bn: 'অর্ডার' },
  tab_support:       { en: 'Support', hi: 'सहायता', ta: 'ஆதரவு', ml: 'പിന്തുണ', kn: 'ಸಹಾಯ', mr: 'मदत', bn: 'সাহায্য' },
  tab_profile:       { en: 'Profile', hi: 'प्रोफ़ाइल', ta: 'சுயவிவரம்', ml: 'പ്രൊഫൈൽ', kn: 'ಪ್ರೊಫೈಲ್', mr: 'प्रोफाइल', bn: 'প্রোফাইল' },
  tab_dashboard:     { en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'டாஷ்போர்டு', ml: 'ഡാഷ്ബോർഡ്', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', mr: 'डॅशबोर्ड', bn: 'ড্যাশবোর্ড' },
  tab_menu:          { en: 'Menu', hi: 'मेनू', ta: 'மெனு', ml: 'മെനു', kn: 'ಮೆನು', mr: 'मेनू', bn: 'মেনু' },
  tab_settings:      { en: 'Settings', hi: 'सेटिंग्स', ta: 'அமைப்புகள்', ml: 'ക്രമീകരണങ്ങൾ', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', mr: 'सेटिंग्ज', bn: 'সেটিংস' },
  tab_history:       { en: 'History', hi: 'इतिहास', ta: 'வரலாறு', ml: 'ചരിത്രം', kn: 'ಇತಿಹಾಸ', mr: 'इतिहास', bn: 'ইতিহাস' },
  tab_overview:      { en: 'Overview', hi: 'सारांश', ta: 'மேலோட்டம்', ml: 'അവലോകനം', kn: 'ಅವಲೋಕನ', mr: 'सारांश', bn: 'সারসংক্ষেপ' },
  tab_restaurants:   { en: 'Restaurants', hi: 'रेस्तरां', ta: 'உணவகம்', ml: 'റെസ്റ്റോറന്റ്', kn: 'ರೆಸ್ಟೋರೆಂಟ್', mr: 'रेस्तराँ', bn: 'রেস্তোরাঁ' },
  tab_users:         { en: 'Users', hi: 'उपयोगकर्ता', ta: 'பயனர்கள்', ml: 'ഉപയോക്താക്കൾ', kn: 'ಬಳಕೆದಾರರು', mr: 'वापरकर्ते', bn: 'ব্যবহারকারী' },

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
  add_to_order:      { en: 'Add', hi: 'जोड़ें', ta: 'சேர்', ml: 'ചേർക്കുക', kn: 'ಸೇರಿಸಿ', mr: 'जोडा', bn: 'যোগ করুন' },
  view_cart:         { en: 'View cart', hi: 'कार्ट देखें', ta: 'கூடை பார்', ml: 'കാർട്ട് കാണുക', kn: 'ಕಾರ್ಟ್ ನೋಡಿ', mr: 'कार्ट पहा', bn: 'কার্ট দেখুন' },

  your_orders:       { en: 'Your Orders', hi: 'आपके ऑर्डर', ta: 'உங்கள் ஆர்டர்கள்', ml: 'നിങ്ങളുടെ ഓർഡറുകൾ', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು', mr: 'तुमचे ऑर्डर', bn: 'আপনার অর্ডার' },
  no_orders:         { en: 'No orders yet', hi: 'अभी कोई ऑर्डर नहीं', ta: 'இன்னும் ஆர்டர்கள் இல்லை', ml: 'ഇതുവരെ ഓർഡറുകൾ ഇല്ല', kn: 'ಇನ್ನೂ ಆರ್ಡರ್ ಇಲ್ಲ', mr: 'अजून ऑर्डर नाही', bn: 'এখনো কোন অর্ডার নেই' },
  no_orders_sub:     { en: 'Your order history will appear here', hi: 'आपका ऑर्डर इतिहास यहाँ दिखेगा', ta: 'உங்கள் ஆர்டர் வரலாறு இங்கே காட்டப்படும்', ml: 'നിങ്ങളുടെ ഓർഡർ ചരിത്രം ഇവിടെ പ്രദർശിപ്പിക്കും', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಇತಿಹಾಸ ಇಲ್ಲಿ ತೋರಿಸುತ್ತದೆ', mr: 'तुमचा ऑर्डर इतिहास येथे दिसेल', bn: 'আপনার অর্ডার ইতিহাস এখানে দেখাবে' },
  active_tab:        { en: 'Active', hi: 'सक्रिय', ta: 'செயலில்', ml: 'സജീവം', kn: 'ಸಕ್ರಿಯ', mr: 'सक्रिय', bn: 'সক্রিয়' },
  past_tab:          { en: 'Past', hi: 'पिछले', ta: 'கடந்த', ml: 'കഴിഞ്ഞ', kn: 'ಹಿಂದಿನ', mr: 'मागील', bn: 'পূর্ববর্তী' },
  cancel_order:      { en: 'Cancel Order', hi: 'ऑर्डर रद्द करें', ta: 'ஆர்டரை ரத்துசெய்', ml: 'ഓർഡർ റദ്ദാക്കുക', kn: 'ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ', mr: 'ऑर्डर रद्द करा', bn: 'অর্ডার বাতিল' },
  rate_order:        { en: 'Rate your order', hi: 'अपने ऑर्डर को रेट करें', ta: 'உங்கள் ஆர்டரை மதிப்பிடுக', ml: 'നിങ്ങളുടെ ഓർഡർ റേറ്റ് ചെയ്യുക', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್ ರೇಟ್ ಮಾಡಿ', mr: 'तुमच्या ऑर्डरला रेट करा', bn: 'আপনার অর্ডার রেট করুন' },
  items_label:       { en: 'Items', hi: 'आइटम', ta: 'பொருட்கள்', ml: 'ഇനങ്ങൾ', kn: 'ಐಟಂಗಳು', mr: 'आयटम', bn: 'আইটেম' },

  sign_out:          { en: 'Sign out', hi: 'साइन आउट', ta: 'வெளியேறு', ml: 'സൈൻ ഔട്ട്', kn: 'ಸೈನ್ ಔಟ್', mr: 'साइन आउट', bn: 'সাইন আউট' },
  sign_out_confirm:  { en: 'Sign out of YeaAmigo?', hi: 'YeaAmigo से साइन आउट करें?', ta: 'YeaAmigo-விலிருந்து வெளியேற?', ml: 'YeaAmigo-ൽ നിന്ന് സൈൻ ഔട്ട് ചെയ്യണോ?', kn: 'YeaAmigo-ಯಿಂದ ಸೈನ್ ಔಟ್ ಮಾಡಬೇಕೇ?', mr: 'YeaAmigo मधून साइन आउट करायचे?', bn: 'YeaAmigo থেকে সাইন আউট করবেন?' },
  signed_out_msg:    { en: 'Signed out successfully', hi: 'सफलतापूर्वक साइन आउट हो गए', ta: 'வெற்றிகரமாக வெளியேறினீர்கள்', ml: 'വിജയകരമായി സൈൻ ഔട്ട് ചെയ്തു', kn: 'ಯಶಸ್ವಿಯಾಗಿ ಸೈನ್ ಔಟ್ ಆಗಿದೆ', mr: 'यशस्वीरीत्या साइन आउट झाले', bn: 'সফলভাবে সাইন আউট হয়েছে' },
  language:          { en: 'Language', hi: 'भाषा', ta: 'மொழி', ml: 'ഭാഷ', kn: 'ಭಾಷೆ', mr: 'भाषा', bn: 'ভাষা' },
  choose_language:   { en: 'Choose your language', hi: 'अपनी भाषा चुनें', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', ml: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക', kn: 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', mr: 'तुमची भाषा निवडा', bn: 'আপনার ভাষা চয়ন করুন' },
  recommended:       { en: 'Recommended', hi: 'अनुशंसित', ta: 'பரிந்துரை', ml: 'ശുപാർശ', kn: 'ಶಿಫಾರಸು', mr: 'शिफारस', bn: 'প্রস্তাবিত' },
  role:              { en: 'Role', hi: 'भूमिका', ta: 'பங்கு', ml: 'റോൾ', kn: 'ಪಾತ್ರ', mr: 'भूमिका', bn: 'ভূমিকা' },
  phone:             { en: 'Phone', hi: 'फ़ोन', ta: 'தொலைபேசி', ml: 'ഫോൺ', kn: 'ಫೋನ್', mr: 'फोन', bn: 'ফোন' },
  status:            { en: 'Status', hi: 'स्थिति', ta: 'நிலை', ml: 'സ്ഥിതി', kn: 'ಸ್ಥಿತಿ', mr: 'स्थिती', bn: 'অবস্থা' },

  need_help:         { en: 'Need help?', hi: 'मदद चाहिए?', ta: 'உதவி வேண்டுமா?', ml: 'സഹായം വേണോ?', kn: 'ಸಹಾಯ ಬೇಕೆ?', mr: 'मदत हवी?', bn: 'সাহায্য দরকার?' },

  // Address
  select_address:    { en: 'Select delivery address', hi: 'डिलीवरी पता चुनें', ta: 'டெலிவரி முகவரி தேர்ந்தெடு', ml: 'ഡെലിവറി വിലാസം തിരഞ്ഞെടുക്കുക', kn: 'ಡೆಲಿವರಿ ವಿಳಾಸ ಆಯ್ಕೆ', mr: 'डिलीव्हरी पत्ता निवडा', bn: 'ডেলিভারি ঠিকানা নির্বাচন' },
  search_address:    { en: 'Search address...', hi: 'पता खोजें...', ta: 'முகவரியைத் தேடு...', ml: 'വിലാസം തിരയുക...', kn: 'ವಿಳಾಸ ಹುಡುಕಿ...', mr: 'पत्ता शोधा...', bn: 'ঠিকানা খুঁজুন...' },
  use_current_loc:   { en: 'Use current location', hi: 'वर्तमान स्थान का उपयोग', ta: 'தற்போதைய இடம்', ml: 'നിലവിലെ ലൊക്കേഷൻ', kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಳ', mr: 'सध्याचे स्थान', bn: 'বর্তমান অবস্থান' },
  confirm_location:  { en: 'Confirm location', hi: 'स्थान की पुष्टि करें', ta: 'இடத்தை உறுதி செய்', ml: 'ലൊക്കേഷൻ സ്ഥിരീകരിക്കുക', kn: 'ಸ್ಥಳ ದೃಢೀಕರಿಸಿ', mr: 'स्थान निश्चित करा', bn: 'অবস্থান নিশ্চিত করুন' },
  saved_addresses:   { en: 'Saved addresses', hi: 'सहेजे गए पते', ta: 'சேமித்த முகவரிகள்', ml: 'സംരക്ഷിച്ച വിലാസങ്ങൾ', kn: 'ಉಳಿಸಿದ ವಿಳಾಸಗಳು', mr: 'जतन केलेले पत्ते', bn: 'সংরক্ষিত ঠিকানা' },
  drag_pin_hint:     { en: 'Drag pin to fine-tune', hi: 'पिन को खींचकर समायोजित करें', ta: 'பின்னைத் தேர்ந்தெடுக்க இழுக்கவும்', ml: 'പിൻ വലിച്ച് ക്രമീകരിക്കുക', kn: 'ಪಿನ್ ಎಳೆಯಿರಿ', mr: 'पिन ओढून जुळवा', bn: 'পিন টেনে সেট করুন' },
  label_home:        { en: 'Home', hi: 'घर', ta: 'வீடு', ml: 'വീട്', kn: 'ಮನೆ', mr: 'घर', bn: 'বাড়ি' },
  label_work:        { en: 'Work', hi: 'कार्यालय', ta: 'அலுவலகம்', ml: 'ഓഫീസ്', kn: 'ಕಚೇರಿ', mr: 'कार्यालय', bn: 'অফিস' },
  label_other:       { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', ml: 'മറ്റുള്ളവ', kn: 'ಇತರೆ', mr: 'इतर', bn: 'অন্যান্য' },
  save_address:      { en: 'Save address', hi: 'पता सहेजें', ta: 'முகவரியைச் சேமி', ml: 'വിലാസം സംരക്ഷിക്കുക', kn: 'ವಿಳಾಸ ಉಳಿಸಿ', mr: 'पत्ता जतन करा', bn: 'ঠিকানা সংরক্ষণ' },

  ok:                { en: 'OK', hi: 'ठीक है', ta: 'சரி', ml: 'ശരി', kn: 'ಸರಿ', mr: 'ठीक', bn: 'ঠিক আছে' },
  cancel:            { en: 'Cancel', hi: 'रद्द करें', ta: 'ரத்து', ml: 'റദ്ദാക്കുക', kn: 'ರದ್ದು', mr: 'रद्द', bn: 'বাতিল' },
  confirm:           { en: 'Confirm', hi: 'पुष्टि करें', ta: 'உறுதிசெய்', ml: 'സ്ഥിരീകരിക്കുക', kn: 'ದೃಢೀಕರಿಸಿ', mr: 'पुष्टी', bn: 'নিশ্চিত' },
  yes:               { en: 'Yes', hi: 'हाँ', ta: 'ஆம்', ml: 'അതെ', kn: 'ಹೌದು', mr: 'होय', bn: 'হ্যাঁ' },
  no:                { en: 'No', hi: 'नहीं', ta: 'இல்லை', ml: 'ഇല്ല', kn: 'ಇಲ್ಲ', mr: 'नाही', bn: 'না' },
  close:             { en: 'Close', hi: 'बंद', ta: 'மூடு', ml: 'അടയ്ക്കുക', kn: 'ಮುಚ್ಚಿ', mr: 'बंद', bn: 'বন্ধ' },
  back:              { en: 'Back', hi: 'वापस', ta: 'பின்', ml: 'പിന്നോട്ട്', kn: 'ಹಿಂದೆ', mr: 'मागे', bn: 'পিছনে' },
  loading:           { en: 'Loading...', hi: 'लोड हो रहा है...', ta: 'ஏற்றுகிறது...', ml: 'ലോഡിങ്...', kn: 'ಲೋಡ್...', mr: 'लोड होत आहे...', bn: 'লোড হচ্ছে...' },

  // Home hero
  hero_line1:        { en: 'Good food,', hi: 'अच्छा खाना,', ta: 'நல்ல உணவு,', ml: 'നല്ല ഭക്ഷണം,', kn: 'ಒಳ್ಳೆಯ ಊಟ,', mr: 'चांगले जेवण,', bn: 'ভালো খাবার,' },
  hero_line2:        { en: 'great amigos.', hi: 'बढ़िया अमीगो।', ta: 'சிறந்த அமிகோ.', ml: 'മികച്ച അമിഗോ.', kn: 'ಶ್ರೇಷ್ಠ ಅಮಿಗೋ.', mr: 'उत्तम अमिगो.', bn: 'দুর্দান্ত অ্যামিগো।' },
  delivery_fee_short:{ en: 'delivery', hi: 'डिलीवरी', ta: 'டெலிவரி', ml: 'ഡെലിവറി', kn: 'ಡೆಲಿವರಿ', mr: 'डिलीव्हरी', bn: 'ডেলিভারি' },
  hygiene_label:     { en: 'Hygiene', hi: 'स्वच्छता', ta: 'சுகாதாரம்', ml: 'ശുചിത്വം', kn: 'ಸ್ವಚ್ಛತೆ', mr: 'स्वच्छता', bn: 'স্বাস্থ্যবিধি' },

  // Order tracking
  order_placed:      { en: 'Placed', hi: 'दिया गया', ta: 'வைக்கப்பட்டது', ml: 'നൽകി', kn: 'ಇಡಲಾಗಿದೆ', mr: 'दिले', bn: 'রাখা হয়েছে' },
  order_confirmed:   { en: 'Confirmed', hi: 'पुष्टि की गई', ta: 'உறுதிசெய்யப்பட்டது', ml: 'സ്ഥിരീകരിച്ചു', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ', mr: 'पुष्टी झाली', bn: 'নিশ্চিত হয়েছে' },
  order_preparing:   { en: 'Preparing', hi: 'तैयार हो रहा है', ta: 'தயாரிக்கப்படுகிறது', ml: 'തയ്യാറാക്കുന്നു', kn: 'ತಯಾರಿಸುತ್ತಿದೆ', mr: 'तयार होत आहे', bn: 'প্রস্তুত হচ্ছে' },
  order_ready:       { en: 'Ready', hi: 'तैयार', ta: 'தயார்', ml: 'തയ്യാർ', kn: 'ಸಿದ್ಧ', mr: 'तयार', bn: 'প্রস্তুত' },
  order_assigned:    { en: 'Rider assigned', hi: 'राइडर असाइन', ta: 'ரைடர் ஒதுக்கப்பட்டது', ml: 'റൈഡർ നൽകി', kn: 'ರೈಡರ್ ನಿಯೋಜಿಸಲಾಗಿದೆ', mr: 'रायडर नियुक्त', bn: 'রাইডার নিযুক্ত' },
  order_enroute:     { en: 'On the way', hi: 'रास्ते में', ta: 'வழியில்', ml: 'വഴിയിൽ', kn: 'ದಾರಿಯಲ್ಲಿ', mr: 'मार्गावर', bn: 'পথে' },
  order_delivered:   { en: 'Delivered', hi: 'पहुँचाया गया', ta: 'வழங்கப்பட்டது', ml: 'എത്തിച്ചു', kn: 'ತಲುಪಿಸಲಾಗಿದೆ', mr: 'पोहोचवले', bn: 'পৌঁছেছে' },
  order_cancelled_msg:{ en: 'This order was cancelled.', hi: 'यह ऑर्डर रद्द कर दिया गया।', ta: 'இந்த ஆர்டர் ரத்து செய்யப்பட்டது.', ml: 'ഈ ഓർഡർ റദ്ദാക്കി.', kn: 'ಈ ಆರ್ಡರ್ ರದ್ದಾಗಿದೆ.', mr: 'हा ऑर्डर रद्द झाला.', bn: 'অর্ডারটি বাতিল হয়েছে।' },
  msg_pending:       { en: 'Waiting for the restaurant to confirm your order...', hi: 'रेस्तरां की पुष्टि का इंतज़ार है...', ta: 'உணவகம் உறுதிசெய்ய காத்திருக்கிறது...', ml: 'റെസ്റ്റോറന്റിന്റെ സ്ഥിരീകരണത്തിനായി കാത്തിരിക്കുന്നു...', kn: 'ರೆಸ್ಟೋರೆಂಟ್ ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ...', mr: 'रेस्तराँच्या पुष्टीची प्रतीक्षा...', bn: 'রেস্তোরাঁর নিশ্চিতকরণের অপেক্ষা...' },
  msg_confirmed:     { en: 'Great! The restaurant has confirmed your order.', hi: 'बढ़िया! रेस्तरां ने आपके ऑर्डर की पुष्टि कर दी।', ta: 'அருமை! உணவகம் உங்கள் ஆர்டரை உறுதிசெய்தது.', ml: 'കൊള്ളാം! റെസ്റ്റോറന്റ് സ്ഥിരീകരിച്ചു.', kn: 'ಸೂಪರ್! ರೆಸ್ಟೋರೆಂಟ್ ದೃಢೀಕರಿಸಿದೆ.', mr: 'छान! रेस्तराँने पुष्टी केली.', bn: 'দারুণ! রেস্তোরাঁ নিশ্চিত করেছে।' },
  msg_preparing:     { en: 'Your food is being freshly prepared.', hi: 'आपका खाना ताज़ा बनाया जा रहा है।', ta: 'உங்கள் உணவு புதிதாக தயாரிக்கப்படுகிறது.', ml: 'നിങ്ങളുടെ ഭക്ഷണം പുതുതായി തയ്യാറാക്കുന്നു.', kn: 'ನಿಮ್ಮ ಊಟ ತಾಜಾ ತಯಾರಾಗುತ್ತಿದೆ.', mr: 'तुमचे जेवण ताजे बनवले जात आहे.', bn: 'খাবার তাজা তৈরি হচ্ছে।' },
  msg_ready:         { en: 'Your food is ready and waiting for a rider.', hi: 'खाना तैयार है, राइडर का इंतज़ार।', ta: 'உணவு தயார், ரைடருக்காக காத்திருக்கிறது.', ml: 'ഭക്ഷണം തയ്യാർ, റൈഡറിനായി കാത്തിരിക്കുന്നു.', kn: 'ಊಟ ಸಿದ್ಧ, ರೈಡರ್‌ಗಾಗಿ ಕಾಯುತ್ತಿದೆ.', mr: 'जेवण तयार, रायडरची प्रतीक्षा.', bn: 'খাবার প্রস্তুত, রাইডারের অপেক্ষা।' },
  msg_assigned:      { en: 'A rider has been assigned. They are heading to the restaurant.', hi: 'राइडर असाइन हो गया। वो रेस्तरां जा रहे हैं।', ta: 'ரைடர் ஒதுக்கப்பட்டார். அவர் உணவகத்திற்கு வருகிறார்.', ml: 'റൈഡർ പുറപ്പെട്ടു.', kn: 'ರೈಡರ್ ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಹೊರಟಿದ್ದಾರೆ.', mr: 'रायडर रेस्तराँकडे जात आहे.', bn: 'রাইডার রেস্তোরাঁর দিকে যাচ্ছে।' },
  msg_enroute:       { en: 'Your order is on the way!', hi: 'आपका ऑर्डर रास्ते में है!', ta: 'உங்கள் ஆர்டர் வழியில்!', ml: 'നിങ്ങളുടെ ഓർഡർ വരുന്നു!', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್ ದಾರಿಯಲ್ಲಿದೆ!', mr: 'तुमचा ऑर्डर मार्गावर!', bn: 'আপনার অর্ডার পথে!' },
  msg_delivered:     { en: 'Order delivered. Enjoy your food!', hi: 'ऑर्डर पहुँच गया। आनंद लें!', ta: 'ஆர்டர் வழங்கப்பட்டது. சாப்பிட்டு மகிழுங்கள்!', ml: 'ഓർഡർ എത്തിച്ചു. ഭക്ഷണം ആസ്വദിക്കൂ!', kn: 'ಆರ್ಡರ್ ತಲುಪಿತು. ಆನಂದಿಸಿ!', mr: 'ऑर्डर पोहोचला. आनंद घ्या!', bn: 'অর্ডার পৌঁছেছে। উপভোগ করুন!' },
  rider_label:       { en: 'Rider', hi: 'राइडर', ta: 'ரைடர்', ml: 'റൈഡർ', kn: 'ರೈಡರ್', mr: 'रायडर', bn: 'রাইডার' },

  // Rating
  food_rating:       { en: 'Food', hi: 'खाना', ta: 'உணவு', ml: 'ഭക്ഷണം', kn: 'ಊಟ', mr: 'जेवण', bn: 'খাবার' },
  delivery_rating:   { en: 'Delivery', hi: 'डिलीवरी', ta: 'டெலிவரி', ml: 'ഡെലിവറി', kn: 'ಡೆಲಿವರಿ', mr: 'डिलीव्हरी', bn: 'ডেলিভারি' },
  optional_comment:  { en: 'Optional comment', hi: 'वैकल्पिक टिप्पणी', ta: 'விருப்ப கருத்து', ml: 'ഐച്ഛിക അഭിപ്രായം', kn: 'ಐಚ್ಛಿಕ ಕಾಮೆಂಟ್', mr: 'ऐच्छिक टिप्पणी', bn: 'ঐচ্ছিক মন্তব্য' },
  submit_review:     { en: 'Submit review', hi: 'समीक्षा भेजें', ta: 'மதிப்பீடு சமர்ப்பி', ml: 'അവലോകനം നൽകുക', kn: 'ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ', mr: 'पुनरावलोकन सबमिट', bn: 'রিভিউ জমা' },

  // Support
  support_title:     { en: 'Need help?', hi: 'मदद चाहिए?', ta: 'உதவி வேண்டுமா?', ml: 'സഹായം വേണോ?', kn: 'ಸಹಾಯ ಬೇಕೆ?', mr: 'मदत हवी?', bn: 'সাহায্য দরকার?' },
  support_sub:       { en: "We'll get back within 24 hours.", hi: '24 घंटे में जवाब देंगे।', ta: '24 மணி நேரத்தில் பதிலளிப்போம்.', ml: '24 മണിക്കൂറിനുള്ളിൽ മറുപടി നൽകും.', kn: '24 ಗಂಟೆಯೊಳಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತೇವೆ.', mr: '24 तासात उत्तर देऊ.', bn: '24 ঘণ্টায় উত্তর দেব।' },
  what_wrong:        { en: 'What went wrong?', hi: 'क्या समस्या है?', ta: 'என்ன தவறு?', ml: 'എന്താണ് കുഴപ്പം?', kn: 'ಏನು ತಪ್ಪಾಗಿದೆ?', mr: 'काय चूक झाली?', bn: 'কী সমস্যা?' },
  describe_issue:    { en: 'Describe the issue', hi: 'समस्या लिखें', ta: 'பிரச்சினையை விவரி', ml: 'പ്രശ്നം വിവരിക്കുക', kn: 'ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ', mr: 'समस्या वर्णन करा', bn: 'সমস্যা বর্ণনা' },
  submit_ticket:     { en: 'Submit ticket', hi: 'टिकट जमा करें', ta: 'டிக்கெட் சமர்ப்பி', ml: 'ടിക്കറ്റ് അയക്കുക', kn: 'ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ', mr: 'तिकिट सबमिट', bn: 'টিকেট জমা' },
  cat_missing:       { en: 'Missing item', hi: 'गुम आइटम', ta: 'விடுபட்ட பொருள்', ml: 'നഷ്ടപ്പെട്ട ഇനം', kn: 'ಕಾಣೆಯಾದ ಐಟಂ', mr: 'गहाळ वस्तू', bn: 'অনুপস্থিত আইটেম' },
  cat_wrong:         { en: 'Wrong order', hi: 'गलत ऑर्डर', ta: 'தவறான ஆர்டர்', ml: 'തെറ്റായ ഓർഡർ', kn: 'ತಪ್ಪು ಆರ್ಡರ್', mr: 'चुकीचा ऑर्डर', bn: 'ভুল অর্ডার' },
  cat_late:          { en: 'Late delivery', hi: 'देर से डिलीवरी', ta: 'தாமதமான டெலிவரி', ml: 'വൈകിയ ഡെലിവറി', kn: 'ತಡವಾದ ಡೆಲಿವರಿ', mr: 'उशीरा डिलीव्हरी', bn: 'দেরি ডেলিভারি' },
  cat_other:         { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', ml: 'മറ്റുള്ളവ', kn: 'ಇತರೆ', mr: 'इतर', bn: 'অন্যান্য' },

  // Address picker
  current_location:  { en: 'Current location', hi: 'वर्तमान स्थान', ta: 'தற்போதைய இடம்', ml: 'നിലവിലെ ലൊക്കേഷൻ', kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಳ', mr: 'सध्याचे स्थान', bn: 'বর্তমান অবস্থান' },
  pick_on_map:       { en: 'Pick on map', hi: 'मानचित्र पर चुनें', ta: 'வரைபடத்தில் தேர்ந்தெடு', ml: 'മാപ്പിൽ തിരഞ്ഞെടുക്കുക', kn: 'ನಕ್ಷೆಯಲ್ಲಿ ಆಯ್ಕೆ', mr: 'नकाशावर निवडा', bn: 'ম্যাপে বাছুন' },
  enter_manually:    { en: 'Enter manually', hi: 'मैन्युअली दर्ज करें', ta: 'கையால் உள்ளிடு', ml: 'നേരിട്ട് നൽകുക', kn: 'ಕೈಯಿಂದ ನಮೂದಿಸಿ', mr: 'मॅन्युअली टाका', bn: 'হাতে লিখুন' },
  address_line1:     { en: 'Street / Area', hi: 'सड़क / क्षेत्र', ta: 'தெரு / பகுதி', ml: 'തെരുവ് / പ്രദേശം', kn: 'ರಸ್ತೆ / ಪ್ರದೇಶ', mr: 'रस्ता / क्षेत्र', bn: 'রাস্তা / এলাকা' },
  address_line2:     { en: 'Apartment, landmark (optional)', hi: 'अपार्टमेंट, लैंडमार्क (वैकल्पिक)', ta: 'அபார்ட்மென்ட், அடையாளம் (விரும்பினால்)', ml: 'അപാർട്മെന്റ്, അടയാളം', kn: 'ಅಪಾರ್ಟ್‌ಮೆಂಟ್, ಗುರುತು', mr: 'अपार्टमेंट, खूण', bn: 'অ্যাপার্টমেন্ট, ল্যান্ডমার্ক' },
  city_label:        { en: 'City', hi: 'शहर', ta: 'நகரம்', ml: 'നഗരം', kn: 'ನಗರ', mr: 'शहर', bn: 'শহর' },
  pincode_label:     { en: 'Pincode', hi: 'पिनकोड', ta: 'பின்கோடு', ml: 'പിൻകോഡ്', kn: 'ಪಿನ್‌ಕೋಡ್', mr: 'पिनकोड', bn: 'পিনকোড' },
  label_as:          { en: 'Label as', hi: 'लेबल', ta: 'லேபிள்', ml: 'ലേബൽ', kn: 'ಲೇಬಲ್', mr: 'लेबल', bn: 'লেবেল' },
  permission_denied: { en: 'Location permission denied', hi: 'स्थान अनुमति अस्वीकृत', ta: 'இடம் அனுமதி மறுக்கப்பட்டது', ml: 'ലൊക്കേഷൻ അനുമതി നിരസിച്ചു', kn: 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ', mr: 'स्थान परवानगी नाकारली', bn: 'অবস্থান অনুমতি প্রত্যাখ্যাত' },

  // Empty/loading mascot strings
  cart_empty_sub:    { en: 'Browse restaurants to start an order', hi: 'ऑर्डर शुरू करने के लिए रेस्तरां देखें', ta: 'ஆர்டர் தொடங்க உணவகங்களை பார்க்கவும்', ml: 'ഓർഡർ ആരംഭിക്കാൻ റെസ്റ്റോറന്റുകൾ ബ്രൗസ് ചെയ്യുക', kn: 'ಆರ್ಡರ್ ಪ್ರಾರಂಭಿಸಲು ರೆಸ್ಟೋರೆಂಟ್ ನೋಡಿ', mr: 'ऑर्डर सुरू करण्यासाठी रेस्तराँ पहा', bn: 'অর্ডার শুরু করতে রেস্তোরাঁ দেখুন' },
};

// Dynamic content lookup (restaurant names, dish names, descriptions, cuisines)
// Acts like a "smart phrasebook" — backend data passes through tn()
const phrases: T = {
  // Cuisines
  'Pizza':    { en: 'Pizza', hi: 'पिज़्ज़ा', ta: 'பீட்சா', ml: 'പിസ്സ', kn: 'ಪಿಜ್ಜಾ', mr: 'पिझ्झा', bn: 'পিজা' },
  'Italian':  { en: 'Italian', hi: 'इतालवी', ta: 'இத்தாலி', ml: 'ഇറ്റാലിയൻ', kn: 'ಇಟಾಲಿಯನ್', mr: 'इटालियन', bn: 'ইতালিয়ান' },
  'Indian':   { en: 'Indian', hi: 'भारतीय', ta: 'இந்தியன்', ml: 'ഇന്ത്യൻ', kn: 'ಭಾರತೀಯ', mr: 'भारतीय', bn: 'ভারতীয়' },
  'Chinese':  { en: 'Chinese', hi: 'चीनी', ta: 'சீனம்', ml: 'ചൈനീസ്', kn: 'ಚೀನೀ', mr: 'चायनीज', bn: 'চাইনিজ' },
  'Thai':     { en: 'Thai', hi: 'थाई', ta: 'தாய்', ml: 'തായ്', kn: 'ಥಾಯ್', mr: 'थाई', bn: 'থাই' },
  'Mexican':  { en: 'Mexican', hi: 'मेक्सिकन', ta: 'மெக்சிகன்', ml: 'മെക്സിക്കൻ', kn: 'ಮೆಕ್ಸಿಕನ್', mr: 'मेक्सिकन', bn: 'মেক্সিকান' },
  'Vegan':    { en: 'Vegan', hi: 'वीगन', ta: 'வீகன்', ml: 'വീഗൻ', kn: 'ವೀಗನ್', mr: 'व्हीगन', bn: 'ভেগান' },
  'Burgers':  { en: 'Burgers', hi: 'बर्गर', ta: 'பர்கர்', ml: 'ബർഗർ', kn: 'ಬರ್ಗರ್', mr: 'बर्गर', bn: 'বার্গার' },
  'Breakfast':{ en: 'Breakfast', hi: 'नाश्ता', ta: 'காலை உணவு', ml: 'പ്രഭാതഭക്ഷണം', kn: 'ತಿಂಡಿ', mr: 'न्याहारी', bn: 'নাশতা' },
  'All':      { en: 'All', hi: 'सभी', ta: 'அனைத்தும்', ml: 'എല്ലാം', kn: 'ಎಲ್ಲಾ', mr: 'सर्व', bn: 'সব' },

  // Categories
  'Pizzas':   { en: 'Pizzas', hi: 'पिज़्ज़े', ta: 'பீட்சாக்கள்', ml: 'പിസ്സകൾ', kn: 'ಪಿಜ್ಜಾಗಳು', mr: 'पिझ्झा', bn: 'পিজা' },
  'Sides':    { en: 'Sides', hi: 'साइड्स', ta: 'பக்கம்', ml: 'സൈഡുകൾ', kn: 'ಸೈಡ್‌ಗಳು', mr: 'साइड्स', bn: 'সাইডস' },
  'Drinks':   { en: 'Drinks', hi: 'पेय', ta: 'பானங்கள்', ml: 'പാനീയങ്ങൾ', kn: 'ಪಾನೀಯಗಳು', mr: 'पेय', bn: 'পানীয়' },
  'Curries':  { en: 'Curries', hi: 'करी', ta: 'கறிகள்', ml: 'കറികൾ', kn: 'ಕರಿಗಳು', mr: 'करी', bn: 'কারি' },

  // Restaurant descriptions
  "Authentic Neapolitan pizza, hand-stretched dough, wood-fired in 90 seconds.": {
    en: "Authentic Neapolitan pizza, hand-stretched dough, wood-fired in 90 seconds.",
    hi: "असली नेपोलिटन पिज़्ज़ा, हाथ से बनाया गया आटा, 90 सेकंड में लकड़ी की भट्टी में।",
    ta: "உண்மையான நெப்போலிட்டன் பீட்சா, கையால் இழுக்கப்பட்ட மாவு, 90 விநாடிகளில் சூளை.",
    ml: "ആധികാരിക നെപ്പോളിറ്റൻ പിസ്സ, കൈകൊണ്ട് നീട്ടിയ മാവ്, 90 സെക്കൻഡിൽ ചുട്ടെടുത്തത്.",
    kn: "ಅಸಲಿ ನೆಪೋಲಿಟನ್ ಪಿಜ್ಜಾ, ಕೈಯಿಂದ ಎಳೆದ ಹಿಟ್ಟು, 90 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ಒಲೆಯಲ್ಲಿ.",
    mr: "खरा नेपोलिटन पिझ्झा, हाताने ताणलेले पीठ, 90 सेकंदात भट्टीत.",
    bn: "প্রকৃত নেপোলিটান পিজা, হাতে তৈরি ডো, 90 সেকেন্ডে কাঠের চুলায়।",
  },
  "Family recipes from Mumbai. Warm spices, fresh herbs, slow-cooked curries.": {
    en: "Family recipes from Mumbai. Warm spices, fresh herbs, slow-cooked curries.",
    hi: "मुंबई के पारिवारिक नुस्खे। गर्म मसाले, ताज़ी जड़ी-बूटियाँ, धीमी आँच पर पकी हुई करी।",
    ta: "மும்பையின் குடும்ப ரெசிபிகள். சூடான மசாலா, புதிய மூலிகைகள், மெதுவாக சமைத்த கறிகள்.",
    ml: "മുംബൈയിലെ കുടുംബ പാചകം. ഊഷ്മള മസാല, പുതിയ ഇലകൾ, പതുക്കെ വേവിച്ച കറികൾ.",
    kn: "ಮುಂಬೈನ ಕುಟುಂಬ ಪಾಕವಿಧಾನ. ಬೆಚ್ಚಗಿನ ಮಸಾಲೆ, ತಾಜಾ ಗಿಡಮೂಲಿಕೆಗಳು, ನಿಧಾನ ಬೇಯಿಸಿದ ಕರಿಗಳು.",
    mr: "मुंबईच्या कौटुंबिक रेसिपी. उबदार मसाले, ताजी पाने, मंद आचेवर शिजवलेल्या करी.",
    bn: "মুম্বাইয়ের পারিবারিক রেসিপি। উষ্ণ মশলা, তাজা ভেষজ, ধীরে রান্না করা কারি।",
  },

  // Dish names + descriptions
  'Margherita': { en: 'Margherita', hi: 'मार्गेरीटा', ta: 'மார்கரிட்டா', ml: 'മാർഗരിറ്റ', kn: 'ಮಾರ್ಗರಿಟಾ', mr: 'मार्गेरिटा', bn: 'মার্গেরিটা' },
  'Diavola':    { en: 'Diavola', hi: 'दीवोला', ta: 'டயவோலா', ml: 'ഡിയവോള', kn: 'ಡಯವೋಲಾ', mr: 'डियावोला', bn: 'ডিয়াভোলা' },
  'Quattro Formaggi': { en: 'Quattro Formaggi', hi: 'क्वाट्रो फ़ोरमाजी', ta: 'குவாட்ரோ ஃபோர்மாஜி', ml: 'ക്വാട്രോ ഫോർമാജി', kn: 'ಕ್ವಾಟ್ರೋ ಫೋರ್ಮಾಜಿ', mr: 'क्वात्रो फॉर्माजी', bn: 'কোয়াত্রো ফরমাজ্জি' },
  'Garlic Bread': { en: 'Garlic Bread', hi: 'गार्लिक ब्रेड', ta: 'பூண்டு ரொட்டி', ml: 'വെളുത്തുള്ളി റൊട്ടി', kn: 'ಬೆಳ್ಳುಳ್ಳಿ ಬ್ರೆಡ್', mr: 'गार्लिक ब्रेड', bn: 'রসুন রুটি' },
  'Caesar Salad': { en: 'Caesar Salad', hi: 'सीज़र सलाद', ta: 'சீசர் சாலட்', ml: 'സീസർ സലാഡ്', kn: 'ಸೀಜರ್ ಸಲಾಡ್', mr: 'सीझर सॅलड', bn: 'সিজার সালাদ' },
  'Italian Lemonade': { en: 'Italian Lemonade', hi: 'इतालवी नींबू पानी', ta: 'இத்தாலிய எலுமிச்சை சாறு', ml: 'ഇറ്റാലിയൻ നാരങ്ങ വെള്ളം', kn: 'ಇಟಾಲಿಯನ್ ನಿಂಬೆ', mr: 'इटालियन लिंबू पाणी', bn: 'ইতালিয়ান লেমনেড' },
  'Butter Chicken': { en: 'Butter Chicken', hi: 'बटर चिकन', ta: 'பட்டர் சிக்கன்', ml: 'ബട്ടർ ചിക്കൻ', kn: 'ಬಟರ್ ಚಿಕನ್', mr: 'बटर चिकन', bn: 'বাটার চিকেন' },
  'Chana Masala': { en: 'Chana Masala', hi: 'छोले मसाला', ta: 'சனா மசாலா', ml: 'ചന മസാല', kn: 'ಚನಾ ಮಸಾಲಾ', mr: 'चना मसाला', bn: 'ছোলে মসলা' },
  'Lamb Rogan Josh': { en: 'Lamb Rogan Josh', hi: 'लैम्ब रोगन जोश', ta: 'ஆட்டிறைச்சி ரோகன் ஜோஷ்', ml: 'ലാംബ് റോഗൻ ജോഷ്', kn: 'ಮಟನ್ ರೋಗನ್ ಜೋಶ್', mr: 'लांब रोगन जोश', bn: 'ল্যাম্ব রোগান জোশ' },
  'Garlic Naan': { en: 'Garlic Naan', hi: 'गार्लिक नान', ta: 'பூண்டு நான்', ml: 'വെളുത്തുള്ളി നാൻ', kn: 'ಬೆಳ್ಳುಳ್ಳಿ ನಾನ್', mr: 'गार्लिक नान', bn: 'রসুন নান' },
  'Samosa (2pc)': { en: 'Samosa (2pc)', hi: 'समोसा (2 पीस)', ta: 'சமோசா (2)', ml: 'സമോസ (2)', kn: 'ಸಮೋಸಾ (2)', mr: 'समोसा (2)', bn: 'সিঙাড়া (2)' },
  'Mango Lassi': { en: 'Mango Lassi', hi: 'आम लस्सी', ta: 'மாம்பழ லஸ்ஸி', ml: 'മാമ്പഴ ലസ്സി', kn: 'ಮಾವಿನ ಲಸ್ಸಿ', mr: 'आंबा लस्सी', bn: 'আম লস্যি' },

  // Descriptions
  'San Marzano tomato, fior di latte, basil': { en: 'San Marzano tomato, fior di latte, basil', hi: 'सैन मार्ज़ानो टमाटर, ताज़ा मोज़ेरेला, तुलसी', ta: 'சான் மார்சானோ தக்காளி, மொஸரெல்லா, துளசி', ml: 'സാൻ മാർസാനോ തക്കാളി, മൊസരെല്ല, തുളസി', kn: 'ಸಾನ್ ಮಾರ್ಜಾನೋ ಟೊಮಾಟೊ, ಮೊಸ್ಸರೆಲ್ಲ, ತುಳಸಿ', mr: 'सान मार्झानो टोमॅटो, मोझरेला, तुळस', bn: 'সান মার্জানো টমেটো, মোজারেলা, তুলসি' },
  'Spicy salami, tomato, mozzarella, chilli oil': { en: 'Spicy salami, tomato, mozzarella, chilli oil', hi: 'मसालेदार सलामी, टमाटर, मोज़ेरेला, मिर्च का तेल', ta: 'காரமான சலாமி, தக்காளி, மொஸரெல்லா, மிளகாய் எண்ணெய்', ml: 'എരിവുള്ള സലാമി, തക്കാളി, മൊസരെല്ല, മുളക് എണ്ണ', kn: 'ಮಸಾಲೆ ಸಲಾಮಿ, ಟೊಮಾಟೊ, ಮೊಸ್ಸರೆಲ್ಲ, ಮೆಣಸಿನ ಎಣ್ಣೆ', mr: 'तिखट सलामी, टोमॅटो, मोझरेला, मिरची तेल', bn: 'ঝাল সালামি, টমেটো, মোজারেলা, মরিচ তেল' },
  'Four cheese blend on white base': { en: 'Four cheese blend on white base', hi: 'सफ़ेद बेस पर चार चीज़', ta: 'வெள்ளை அடிப்படையில் நான்கு சீஸ்', ml: 'വെള്ളയിൽ നാല് ചീസ്', kn: 'ಬಿಳಿ ಬೇಸ್‌ನಲ್ಲಿ ನಾಲ್ಕು ಚೀಸ್', mr: 'पांढऱ्या बेसवर चार चीझ', bn: 'সাদা বেসে চার ধরনের চিজ' },
  'Wood-fired focaccia, garlic butter, herbs': { en: 'Wood-fired focaccia, garlic butter, herbs', hi: 'लकड़ी की भट्टी का फोकाशिया, गार्लिक बटर, जड़ी-बूटियाँ', ta: 'விறகு அடுப்பில் சுட்ட ஃபோகாச்சியா, பூண்டு வெண்ணெய்', ml: 'വിറക് അടുപ്പിൽ ഫോക്കാച്ചിയ, വെളുത്തുള്ളി വെണ്ണ', kn: 'ಮರದ ಒಲೆಯ ಫೋಕಾಚಿಯಾ, ಬೆಳ್ಳುಳ್ಳಿ ಬೆಣ್ಣೆ', mr: 'लाकूड भट्टीचा फोकाचा, गार्लिक बटर', bn: 'কাঠের চুলায় ফোকাচ্চিয়া, রসুন মাখন' },
  'Cos lettuce, parmesan, anchovy dressing': { en: 'Cos lettuce, parmesan, anchovy dressing', hi: 'कॉस लेट्यूस, परमेज़ान, एंकोवी ड्रेसिंग', ta: 'காஸ் கீரை, பார்மேசன், ஆங்கோவி', ml: 'കോസ് ലെറ്റ്യൂസ്, പാർമെസാൻ, ആങ്കോവി', kn: 'ಕೋಸ್ ಲೆಟಸ್, ಪಾರ್ಮೆಸಾನ್, ಆಂಚೋವಿ', mr: 'कोस लेट्यूस, परमेझान, अँकोव्ही', bn: 'কোস লেটুস, পারমেসান, অ্যাঞ্চোভি' },
  'Sicilian lemons, sparkling': { en: 'Sicilian lemons, sparkling', hi: 'सिसिली नींबू, स्पार्कलिंग', ta: 'சிசிலி எலுமிச்சை, ஸ்பார்க்ளிங்', ml: 'സിസിലിയൻ നാരങ്ങ, സ്പാർക്ലിങ്', kn: 'ಸಿಸಿಲಿಯನ್ ನಿಂಬೆ, ಸ್ಪಾರ್ಕ್ಲಿಂಗ್', mr: 'सिसिलियन लिंबू, स्पार्कलिंग', bn: 'সিসিলিয়ান লেবু, স্পার্কলিং' },
  'Tandoori chicken in creamy tomato sauce': { en: 'Tandoori chicken in creamy tomato sauce', hi: 'क्रीमी टमाटर सॉस में तंदूरी चिकन', ta: 'கிரீமி தக்காளி சாஸில் தந்தூரி சிக்கன்', ml: 'ക്രീമി തക്കാളി സോസിൽ തന്തൂരി ചിക്കൻ', kn: 'ಕ್ರೀಮಿ ಟೊಮಾಟೊ ಸಾಸ್‌ನಲ್ಲಿ ತಂದೂರಿ ಚಿಕನ್', mr: 'क्रीमी टोमॅटो सॉसमध्ये तंदूरी चिकन', bn: 'ক্রিমি টমেটো সসে তন্দুরি চিকেন' },
  'Spiced chickpeas, tomato, ginger': { en: 'Spiced chickpeas, tomato, ginger', hi: 'मसालेदार छोले, टमाटर, अदरक', ta: 'மசாலா கொண்டைக்கடலை, தக்காளி, இஞ்சி', ml: 'മസാല കടല, തക്കാളി, ഇഞ്ചി', kn: 'ಮಸಾಲೆ ಕಡಲೆ, ಟೊಮಾಟೊ, ಶುಂಠಿ', mr: 'मसालेदार छोले, टोमॅटो, आले', bn: 'মসলাদার ছোলা, টমেটো, আদা' },
  'Slow-cooked lamb, Kashmiri spices': { en: 'Slow-cooked lamb, Kashmiri spices', hi: 'धीमी आँच पर पका लैम्ब, कश्मीरी मसाले', ta: 'மெதுவாக சமைத்த ஆட்டிறைச்சி, காஷ்மீர் மசாலா', ml: 'പതുക്കെ വേവിച്ച ആട്ടിറച്ചി, കാശ്മീരി മസാല', kn: 'ನಿಧಾನ ಬೇಯಿಸಿದ ಮಟನ್, ಕಾಶ್ಮೀರಿ ಮಸಾಲೆ', mr: 'मंद आचेवर शिजवलेला लांब, काश्मिरी मसाले', bn: 'ধীরে রান্না করা ভেড়ার মাংস, কাশ্মীরি মশলা' },
  'Tandoor-baked, garlic, coriander': { en: 'Tandoor-baked, garlic, coriander', hi: 'तंदूर में पका, गार्लिक, धनिया', ta: 'தந்தூரில் சுட்ட, பூண்டு, கொத்தமல்லி', ml: 'തന്തൂരിൽ ചുട്ടത്, വെളുത്തുള്ളി, മല്ലി', kn: 'ತಂದೂರಿನಲ್ಲಿ ಬೇಯಿಸಿದ, ಬೆಳ್ಳುಳ್ಳಿ, ಕೊತ್ತಂಬರಿ', mr: 'तंदूरमध्ये भाजलेले, गार्लिक, कोथिंबीर', bn: 'তন্দুরে রান্না, রসুন, ধনে' },
  'Crispy pastry, spiced potato & peas': { en: 'Crispy pastry, spiced potato & peas', hi: 'कुरकुरी पेस्ट्री, मसालेदार आलू और मटर', ta: 'மொறுமொறுப்பான பேஸ்ட்ரி, மசாலா உருளைக்கிழங்கு', ml: 'കരുമുരാ പേസ്ട്രി, മസാല ഉരുളക്കിഴങ്ങ്', kn: 'ಗರಿಗರಿ ಪೇಸ್ಟ್ರಿ, ಮಸಾಲೆ ಆಲೂಗಡ್ಡೆ', mr: 'कुरकुरीत पेस्ट्री, मसालेदार बटाटा', bn: 'মুচমুচে পেস্ট্রি, মসলাদার আলু ও মটর' },
  'Yogurt, mango, cardamom': { en: 'Yogurt, mango, cardamom', hi: 'दही, आम, इलायची', ta: 'தயிர், மாம்பழம், ஏலக்காய்', ml: 'തൈര്, മാമ്പഴം, ഏലയ്ക്ക', kn: 'ಮೊಸರು, ಮಾವು, ಏಲಕ್ಕಿ', mr: 'दही, आंबा, वेलची', bn: 'দই, আম, এলাচ' },

  // Dietary tags
  'Vegetarian': { en: 'Vegetarian', hi: 'शाकाहारी', ta: 'சைவம்', ml: 'സസ്യാഹാരം', kn: 'ಸಸ್ಯಾಹಾರಿ', mr: 'शाकाहारी', bn: 'নিরামিষ' },
  'Spicy': { en: 'Spicy', hi: 'मसालेदार', ta: 'காரம்', ml: 'എരിവ്', kn: 'ಖಾರ', mr: 'तिखट', bn: 'ঝাল' },
  'Gluten-Free': { en: 'Gluten-Free', hi: 'ग्लूटन-मुक्त', ta: 'குளூட்டன் இலா', ml: 'ഗ്ലൂട്ടൻ-രഹിതം', kn: 'ಗ್ಲೂಟನ್-ರಹಿತ', mr: 'ग्लूटन-मुक्त', bn: 'গ্লুটেন-মুক্ত' },
};

const RegionToLang: Record<string, Lang> = {
  KL: 'ml', TN: 'ta', KA: 'kn', MH: 'mr', WB: 'bn',
  UP: 'hi', BR: 'hi', MP: 'hi', RJ: 'hi', HR: 'hi', DL: 'hi', JH: 'hi', CG: 'hi', UK: 'hi',
};

function detectLang(): Lang {
  try {
    const lang = (Intl as any)?.Locale ? new (Intl as any).Locale((Intl as any).DateTimeFormat().resolvedOptions().locale).baseName : '';
    const parts = String(lang || '').split('-');
    const langCode = (parts[0] || '').toLowerCase();
    const region = (parts[1] || '').toUpperCase();
    if (region && RegionToLang[region]) return RegionToLang[region];
    if (['hi', 'ta', 'ml', 'kn', 'mr', 'bn'].includes(langCode)) return langCode as Lang;
  } catch {}
  return 'en';
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; tn: (s: string | undefined | null) => string; suggested: Lang };
const I18nCtx = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (k) => k, tn: (s) => s || '', suggested: 'en' });

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

  const tn = useCallback((s: string | undefined | null) => {
    if (!s) return '';
    const row = phrases[s];
    if (row) return row[lang] || row.en || s;
    // Try lowercase match
    const lower = s.toLowerCase();
    for (const k of Object.keys(phrases)) {
      if (k.toLowerCase() === lower) return phrases[k][lang] || phrases[k].en || s;
    }
    return s; // fallback to original
  }, [lang]);

  return <I18nCtx.Provider value={{ lang, setLang, t, tn, suggested }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
