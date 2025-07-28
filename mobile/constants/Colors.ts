/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

// نظام الألوان الحديث للتطبيق
export const COLORS = {
  // الألوان الأساسية
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  secondary: '#8B5CF6', // Purple
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',
  
  // ألوان الحالة
  success: '#10B981', // Emerald
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444', // Red
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  info: '#3B82F6', // Blue
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // ألوان الخلفية
  background: '#F8FAFC', // Slate 50
  backgroundSecondary: '#F1F5F9', // Slate 100
  backgroundTertiary: '#E2E8F0', // Slate 200
  
  // ألوان البطاقات
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  cardBorder: '#E2E8F0',
  
  // ألوان النصوص
  text: '#1E293B', // Slate 800
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',
  
  // ألوان الحقول
  input: '#FFFFFF',
  inputBorder: '#D1D5DB', // Gray 300
  inputFocus: '#6366F1',
  inputError: '#EF4444',
  
  // ألوان الأزرار
  buttonPrimary: '#6366F1',
  buttonSecondary: '#8B5CF6',
  buttonSuccess: '#10B981',
  buttonWarning: '#F59E0B',
  buttonError: '#EF4444',
  buttonDisabled: '#9CA3AF', // Gray 400
  
  // ألوان الظلال
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // ألوان التدرجات
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
  gradientSuccess: '#10B981',
  gradientWarning: '#F59E0B',
  gradientError: '#EF4444',
  
  // ألوان الحالة للحجوزات
  bookingPending: '#F59E0B',
  bookingApproved: '#10B981',
  bookingRejected: '#EF4444',
  bookingCancelled: '#6B7280', // Gray 500
  
  // ألوان إضافية
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  divider: '#E5E7EB', // Gray 200
};

// ألوان الوضع المظلم
export const DARK_COLORS = {
  // الألوان الأساسية
  primary: '#818CF8', // Indigo 400
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  
  secondary: '#A78BFA', // Purple 400
  secondaryLight: '#C4B5FD',
  secondaryDark: '#8B5CF6',
  
  // ألوان الحالة
  success: '#34D399', // Emerald 400
  successLight: '#6EE7B7',
  successDark: '#10B981',
  
  warning: '#FBBF24', // Amber 400
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',
  
  error: '#F87171', // Red 400
  errorLight: '#FCA5A5',
  errorDark: '#EF4444',
  
  info: '#60A5FA', // Blue 400
  infoLight: '#93C5FD',
  infoDark: '#3B82F6',
  
  // ألوان الخلفية
  background: '#0F172A', // Slate 900
  backgroundSecondary: '#1E293B', // Slate 800
  backgroundTertiary: '#334155', // Slate 700
  
  // ألوان البطاقات
  card: '#1E293B', // Slate 800
  cardSecondary: '#334155', // Slate 700
  cardBorder: '#475569', // Slate 600
  
  // ألوان النصوص
  text: '#F1F5F9', // Slate 100
  textSecondary: '#CBD5E1', // Slate 300
  textTertiary: '#94A3B8', // Slate 400
  textInverse: '#0F172A', // Slate 900
  
  // ألوان الحقول
  input: '#1E293B', // Slate 800
  inputBorder: '#475569', // Slate 600
  inputFocus: '#818CF8',
  inputError: '#F87171',
  
  // ألوان الأزرار
  buttonPrimary: '#818CF8',
  buttonSecondary: '#A78BFA',
  buttonSuccess: '#34D399',
  buttonWarning: '#FBBF24',
  buttonError: '#F87171',
  buttonDisabled: '#64748B', // Slate 500
  
  // ألوان الظلال
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // ألوان التدرجات
  gradientStart: '#818CF8',
  gradientEnd: '#A78BFA',
  gradientSuccess: '#34D399',
  gradientWarning: '#FBBF24',
  gradientError: '#F87171',
  
  // ألوان الحالة للحجوزات
  bookingPending: '#FBBF24',
  bookingApproved: '#34D399',
  bookingRejected: '#F87171',
  bookingCancelled: '#94A3B8', // Slate 400
  
  // ألوان إضافية
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  divider: '#475569', // Slate 600
};
