import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { es } from './locales/es';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'mis-gastos.language';

function detectLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') {
    return stored;
  }

  const browser = navigator.language.slice(0, 2).toLowerCase();
  return browser === 'en' ? 'en' : 'es';
}

export function currentLocale(): string {
  return i18n.language === 'en' ? 'en-GB' : 'es-ES';
}

function applyDocumentLanguage(language: string): void {
  document.documentElement.lang = language;
}

const initialLanguage = detectLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(initialLanguage);

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
  applyDocumentLanguage(language);
});

export default i18n;
