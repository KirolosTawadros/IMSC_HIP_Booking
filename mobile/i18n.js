import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import ar from './assets/locales/ar.json';
import en from './assets/locales/en.json';

const i18n = new I18n({ ar, en });
i18n.enableFallback = true;
i18n.locale = Localization.locale || 'en';

export const t = (key, config) => i18n.t(key, config);
export default i18n; 