export const colors = {
  dark: {
    //   Primary
    primary: '#FF6B00',
    primaryDark: '#E55A00',
    primaryLight: '#FF8C1A',
    primaryBg: 'rgba(255, 107, 0, 0.12)',
    primaryGlow: 'rgba(255, 107, 0, 0.35)',

    //   Secondary / Text
    secondary: '#FFFFFF',
    gray: '#A0A0A0',
    grayLight: '#6B6B6B',
    grayDark: '#D4D4D4',
    textMuted: '#8A8A8A',

    //   Backgrounds
    bg: '#0A0A0A',
    bgLight: '#141414',
    surface: '#141414',
    surface2: '#1E1E1E',
    surface3: '#262626',
    white: '#141414',

    //   Status
    success: '#22C55E',
    successBg: 'rgba(34, 197, 94, 0.12)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.12)',
    danger: '#EF4444',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerHover: '#DC2626',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.12)',

    //   Borders
    border: '#262626',
    borderDark: '#333333',
    borderLight: '#1A1A1A',

    //   Overlay
    overlay: 'rgba(0, 0, 0, 0.75)',

    //   Misc
    text: '#FFFFFF',
    textInverse: '#0A0A0A',
    transparent: 'transparent',
  },

  light: {
    //   Primary
    primary: '#FF6B00',
    primaryDark: '#E55A00',
    primaryLight: '#FF8C1A',
    primaryBg: 'rgba(255, 107, 0, 0.08)',
    primaryGlow: 'rgba(255, 107, 0, 0.25)',

    //   Secondary / Text
    secondary: '#0A0A0A',
    gray: '#6B6B6B',
    grayLight: '#A0A0A0',
    grayDark: '#333333',
    textMuted: '#8A8A8A',

    //   Backgrounds
    bg: '#F5F5F5',
    bgLight: '#FFFFFF',
    surface: '#FFFFFF',
    surface2: '#F9F9F9',
    surface3: '#EFEFEF',
    white: '#FFFFFF',

    //   Status
    success: '#16A34A',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerHover: '#B91C1C',
    info: '#2563EB',
    infoBg: '#EFF6FF',

    //   Borders
    border: '#E5E5E5',
    borderDark: '#D4D4D4',
    borderLight: '#F0F0F0',

    //   Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',

    //   Misc
    text: '#0A0A0A',
    textInverse: '#FFFFFF',
    transparent: 'transparent',
  },
};

//   Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 42,
    '5xl': 56,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.6,
  },
};

//   Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

//   Border Radius
export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

//   Shadows (iOS + Android)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.8,
    shadowRadius: 48,
    elevation: 12,
  },
  primary: (primaryGlow) => ({
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  }),
};

export const transitions = {
  fast: 150,
  base: 250,
  slow: 400,
};

//   Container Widths
export const containers = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
};

//   Z-Index
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  tooltip: 1050,
};

//   Theme Object الكامل
export const themes = {
  dark: {
    colors: colors.dark,
    typography,
    spacing,
    radius,
    shadows,
    transitions,
    containers,
    zIndex,
    isDark: true,
  },
  light: {
    colors: colors.light,
    typography,
    spacing,
    radius,
    shadows,
    transitions,
    containers,
    zIndex,
    isDark: false,
  },
};

export default themes;