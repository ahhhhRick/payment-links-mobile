export const colors = {
  // Brand — Cash App green
  brand: '#00C62A',
  brandDim: 'rgba(0, 198, 42, 0.12)',

  // Backgrounds — light mode: warm off-white base
  // dark mode equivalent: #0A0A14
  background: '#FFFFFF',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F2F2F2',

  // Surfaces
  surfaceDefault: '#FFFFFF',
  surfaceElevated: '#F0F0F0',
  surfacePressed: '#E8E8E8',

  // Aliases kept for component compat
  glassSurface: '#FFFFFF',
  glassSurfaceMid: '#F0F0F0',
  glassBorder: '#E0E0E0',
  glassHighlight: 'rgba(255, 255, 255, 0.80)',

  // Primary action — black button in light mode (Arcade prominent)
  primary: '#000000',
  primaryText: '#FFFFFF',
  primaryLight: 'rgba(0, 0, 0, 0.06)',

  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Status — adjusted for legibility on light backgrounds
  success: '#008A1E',
  successLight: 'rgba(0, 138, 30, 0.10)',
  warning: '#A05C00',
  warningLight: 'rgba(160, 92, 0, 0.10)',
  danger: '#CC0000',
  dangerLight: 'rgba(204, 0, 0, 0.10)',
  info: '#0055CC',
  infoLight: 'rgba(0, 85, 204, 0.10)',

  // Borders / dividers
  border: '#E0E0E0',
  borderLight: '#EEEEEE',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.10)',
}

// Arcade spacing tokens: small=8, medium=16, large=24
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

// Arcade border-radius tokens
export const radius = {
  sm: 6,       // xsmall: list item numbers
  md: 8,       // small: input fields
  lg: 16,      // medium: cards, input cards
  xl: 24,      // large: modals, cards
  xxl: 40,     // xlarge: half sheets
  full: 9999,  // pill: buttons, search, toggle
}

// Arcade type scale (approximate)
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,   // Arcade body/label size
  xl: 20,
  xxl: 24,
  xxxl: 34, // Arcade hero display
}

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}
