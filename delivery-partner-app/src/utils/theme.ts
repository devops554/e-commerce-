// src/utils/theme.ts

export const Colors = {
  // Primary brand — deep indigo-navy
  primary: '#1A1F5E',
  primaryLight: '#2D3494',
  primaryDark: '#0F1240',

  // Accent — electric cyan
  accent: '#00D4FF',
  accentDark: '#0099BB',

  // Secondary — purple for returns
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',

  // Success
  success: '#00C896',
  successLight: '#E6FAF5',

  // Warning
  warning: '#FF9F0A',
  warningLight: '#FFF3DC',

  // Danger
  danger: '#FF3B5C',
  dangerLight: '#FFE8EC',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F6FF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1FF',

  // Text
  textPrimary: '#0D1040',
  textSecondary: '#5C6280',
  textMuted: '#A0A8CC',
  textInverse: '#FFFFFF',

  // Border
  border: '#E0E4F5',
  borderDark: '#C5CBEA',

  // Dark mode
  dark: {
    background: '#080C30',
    surface: '#111640',
    surfaceAlt: '#1A1F5E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A8CC',
    border: '#2D3494',
  },

  // Status colors
  online: '#00C896',
  offline: '#A0A8CC',
  busy: '#FF9F0A',

  // COD
  cod: '#FF9F0A',
  online_payment: '#00C896',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
};

export const Shadow = {
  sm: {
    shadowColor: '#1A1F5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#1A1F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#1A1F5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};