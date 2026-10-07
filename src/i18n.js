import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import englishTranslation from './locales/ar/translation.json';

const i18n = createInstance();
const arabicTranslation = Object.fromEntries(
  Object.keys(englishTranslation).map((key) => [key, key])
);

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    ar: { translation: arabicTranslation },
    en: { translation: englishTranslation },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
