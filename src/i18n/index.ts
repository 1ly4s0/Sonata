import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import en from './translations/en';
import es from './translations/es';
import fr from './translations/fr';
import pt from './translations/pt';

function getDeviceLanguage(): string {
  try {
    let raw = 'en';
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      raw = settings?.AppleLocale ?? settings?.AppleLanguages?.[0] ?? 'en';
    } else {
      raw = NativeModules.I18nManager?.localeIdentifier ?? 'en';
    }
    // e.g. 'es_ES' or 'fr-FR' → 'es'
    return raw.split(/[_-]/)[0].toLowerCase();
  } catch {
    return 'en';
  }
}

const SUPPORTED = ['en', 'es', 'fr', 'pt'];
const lng = SUPPORTED.includes(getDeviceLanguage()) ? getDeviceLanguage() : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initAsync: false,
  });

export default i18n;
