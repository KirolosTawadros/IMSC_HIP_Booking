import { COLORS, DARK_COLORS } from './Colors';

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  largeTitle: 32,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
  },
  
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  
  // Button heights
  button: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Input heights
  input: {
    sm: 40,
    md: 48,
    lg: 56,
  },
};

export const SHADOW = {
  // Light shadows
  light: {
    small: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  
  // Dark shadows
  dark: {
    small: {
      shadowColor: DARK_COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: DARK_COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: DARK_COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export const FONTS = {
  // Font weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  // Font families (you can add custom fonts here)
  family: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

export const ANIMATION = {
  // Animation durations
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Animation easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Export the main theme object
export const THEME = {
  colors: COLORS,
  darkColors: DARK_COLORS,
  sizes: SIZES,
  shadow: SHADOW,
  fonts: FONTS,
  animation: ANIMATION,
};

export default THEME; 