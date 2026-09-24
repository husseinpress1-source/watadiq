import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

const STORAGE_KEY = 'watad-locale';

function readStoredLocale(): 'ar' | 'en' {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 'en';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  } catch {
    return 'en';
  }
}

function applyDocumentLanguage(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}

const initial = readStoredLocale();

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initial,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

applyDocumentLanguage(initial);

i18n.on('languageChanged', (lng) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, lng);
    }
  } catch {
    /* storage blocked */
  }
  applyDocumentLanguage(lng);
});

export default i18n;
