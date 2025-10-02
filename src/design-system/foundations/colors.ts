/**
 * Nivexa CRM Design System - Color Tokens
 * 
 * Complete color palette with semantic colors supporting light/dark modes.
 * Uses CSS custom properties for runtime theming.
 */

/**
 * Primary color palette - Purple theme for Nivexa brand
 */
export const primaryColors = {
  /** Ultra light purple - backgrounds, subtle accents */
  50: 'hsl(252, 100%, 98%)',
  /** Very light purple - hover states, light backgrounds */
  100: 'hsl(252, 90%, 95%)',
  /** Light purple - borders, subtle elements */
  200: 'hsl(252, 85%, 90%)',
  /** Medium light purple - inactive states */
  300: 'hsl(252, 80%, 80%)',
  /** Medium purple - secondary text, icons */
  400: 'hsl(252, 75%, 65%)',
  /** Main purple - primary actions, links */
  500: 'hsl(252, 70%, 50%)',
  /** Dark purple - hover states, active elements */
  600: 'hsl(252, 75%, 45%)',
  /** Darker purple - pressed states */
  700: 'hsl(252, 80%, 35%)',
  /** Very dark purple - headings, high contrast text */
  800: 'hsl(252, 85%, 25%)',
  /** Ultra dark purple - maximum contrast */
  900: 'hsl(252, 90%, 15%)',
  /** Near black purple - extreme contrast */
  950: 'hsl(252, 95%, 8%)',
} as const;

/**
 * Secondary color palette - Green accents for success, growth
 */
export const secondaryColors = {
  /** Ultra light green */
  50: 'hsl(142, 100%, 98%)',
  /** Very light green */
  100: 'hsl(142, 90%, 95%)',
  /** Light green */
  200: 'hsl(142, 85%, 88%)',
  /** Medium light green */
  300: 'hsl(142, 80%, 75%)',
  /** Medium green */
  400: 'hsl(142, 75%, 60%)',
  /** Main green */
  500: 'hsl(142, 70%, 45%)',
  /** Dark green */
  600: 'hsl(142, 75%, 38%)',
  /** Darker green */
  700: 'hsl(142, 80%, 30%)',
  /** Very dark green */
  800: 'hsl(142, 85%, 22%)',
  /** Ultra dark green */
  900: 'hsl(142, 90%, 15%)',
  /** Near black green */
  950: 'hsl(142, 95%, 8%)',
} as const;

/**
 * Neutral color palette - Gray scale for text, backgrounds, borders
 */
export const neutralColors = {
  /** Pure white */
  0: 'hsl(0, 0%, 100%)',
  /** Ultra light gray - subtle backgrounds */
  50: 'hsl(210, 40%, 98%)',
  /** Very light gray - light backgrounds, dividers */
  100: 'hsl(210, 40%, 96%)',
  /** Light gray - borders, inactive elements */
  200: 'hsl(210, 40%, 92%)',
  /** Medium light gray - subtle borders */
  300: 'hsl(210, 40%, 85%)',
  /** Medium gray - placeholder text, icons */
  400: 'hsl(210, 40%, 70%)',
  /** Main gray - secondary text */
  500: 'hsl(210, 40%, 55%)',
  /** Dark gray - primary text, icons */
  600: 'hsl(210, 40%, 40%)',
  /** Darker gray - headings */
  700: 'hsl(210, 40%, 30%)',
  /** Very dark gray - high contrast text */
  800: 'hsl(210, 40%, 20%)',
  /** Ultra dark gray - maximum contrast */
  900: 'hsl(210, 40%, 12%)',
  /** Near black - extreme contrast */
  950: 'hsl(210, 40%, 6%)',
  /** Pure black */
  1000: 'hsl(0, 0%, 0%)',
} as const;

/**
 * Success color palette - Green for positive states
 */
export const successColors = {
  50: 'hsl(120, 100%, 97%)',
  100: 'hsl(120, 85%, 94%)',
  200: 'hsl(120, 80%, 87%)',
  300: 'hsl(120, 75%, 75%)',
  400: 'hsl(120, 70%, 60%)',
  500: 'hsl(120, 65%, 45%)',
  600: 'hsl(120, 70%, 38%)',
  700: 'hsl(120, 75%, 30%)',
  800: 'hsl(120, 80%, 22%)',
  900: 'hsl(120, 85%, 15%)',
  950: 'hsl(120, 90%, 8%)',
} as const;

/**
 * Warning color palette - Orange/Amber for caution states
 */
export const warningColors = {
  50: 'hsl(48, 100%, 96%)',
  100: 'hsl(48, 96%, 89%)',
  200: 'hsl(48, 97%, 77%)',
  300: 'hsl(46, 97%, 65%)',
  400: 'hsl(43, 96%, 56%)',
  500: 'hsl(38, 92%, 50%)',
  600: 'hsl(32, 95%, 44%)',
  700: 'hsl(26, 90%, 37%)',
  800: 'hsl(23, 83%, 31%)',
  900: 'hsl(22, 78%, 26%)',
  950: 'hsl(21, 85%, 14%)',
} as const;

/**
 * Error color palette - Red for destructive/error states
 */
export const errorColors = {
  50: 'hsl(0, 86%, 97%)',
  100: 'hsl(0, 93%, 94%)',
  200: 'hsl(0, 96%, 89%)',
  300: 'hsl(0, 94%, 82%)',
  400: 'hsl(0, 91%, 71%)',
  500: 'hsl(0, 84%, 60%)',
  600: 'hsl(0, 72%, 51%)',
  700: 'hsl(0, 74%, 42%)',
  800: 'hsl(0, 70%, 35%)',
  900: 'hsl(0, 63%, 31%)',
  950: 'hsl(0, 75%, 15%)',
} as const;

/**
 * Info color palette - Blue for informational states
 */
export const infoColors = {
  50: 'hsl(214, 100%, 97%)',
  100: 'hsl(214, 95%, 93%)',
  200: 'hsl(213, 97%, 87%)',
  300: 'hsl(212, 96%, 78%)',
  400: 'hsl(213, 94%, 68%)',
  500: 'hsl(217, 91%, 60%)',
  600: 'hsl(221, 83%, 53%)',
  700: 'hsl(224, 76%, 48%)',
  800: 'hsl(226, 71%, 40%)',
  900: 'hsl(224, 64%, 33%)',
  950: 'hsl(226, 70%, 20%)',
} as const;

/**
 * Semantic color mappings for components
 * These provide meaningful names for specific use cases
 */
export const semanticColors = {
  // Brand colors
  brand: {
    primary: primaryColors[500],
    primaryHover: primaryColors[600],
    primaryActive: primaryColors[700],
    primarySubtle: primaryColors[50],
    secondary: secondaryColors[500],
    secondaryHover: secondaryColors[600],
    secondaryActive: secondaryColors[700],
    secondarySubtle: secondaryColors[50],
  },

  // Text colors
  text: {
    primary: neutralColors[900],
    secondary: neutralColors[700],
    tertiary: neutralColors[500],
    disabled: neutralColors[400],
    inverse: neutralColors[0],
    link: primaryColors[600],
    linkHover: primaryColors[700],
  },

  // Background colors
  background: {
    primary: neutralColors[0],
    secondary: neutralColors[50],
    tertiary: neutralColors[100],
    elevated: neutralColors[0],
    overlay: 'hsla(210, 40%, 6%, 0.5)',
    disabled: neutralColors[200],
  },

  // Border colors
  border: {
    primary: neutralColors[200],
    secondary: neutralColors[300],
    focus: primaryColors[500],
    error: errorColors[500],
    disabled: neutralColors[200],
  },

  // State colors
  state: {
    success: successColors[500],
    successBg: successColors[50],
    successBorder: successColors[200],
    warning: warningColors[500],
    warningBg: warningColors[50],
    warningBorder: warningColors[200],
    error: errorColors[500],
    errorBg: errorColors[50],
    errorBorder: errorColors[200],
    info: infoColors[500],
    infoBg: infoColors[50],
    infoBorder: infoColors[200],
  },
} as const;

/**
 * Dark mode color overrides
 * Applied when [data-theme="dark"] is present
 */
export const darkModeColors = {
  // Text colors (inverted hierarchy)
  text: {
    primary: neutralColors[100],
    secondary: neutralColors[300],
    tertiary: neutralColors[500],
    disabled: neutralColors[600],
    inverse: neutralColors[900],
    link: primaryColors[400],
    linkHover: primaryColors[300],
  },

  // Background colors (dark surfaces)
  background: {
    primary: neutralColors[950],
    secondary: neutralColors[900],
    tertiary: neutralColors[800],
    elevated: neutralColors[900],
    overlay: 'hsla(0, 0%, 0%, 0.7)',
    disabled: neutralColors[800],
  },

  // Border colors (subtle on dark)
  border: {
    primary: neutralColors[700],
    secondary: neutralColors[600],
    focus: primaryColors[400],
    error: errorColors[400],
    disabled: neutralColors[700],
  },

  // State colors (adjusted for dark backgrounds)
  state: {
    success: successColors[400],
    successBg: 'hsla(120, 65%, 45%, 0.1)',
    successBorder: successColors[800],
    warning: warningColors[400],
    warningBg: 'hsla(38, 92%, 50%, 0.1)',
    warningBorder: warningColors[800],
    error: errorColors[400],
    errorBg: 'hsla(0, 84%, 60%, 0.1)',
    errorBorder: errorColors[800],
    info: infoColors[400],
    infoBg: 'hsla(217, 91%, 60%, 0.1)',
    infoBorder: infoColors[800],
  },
} as const;

/**
 * CSS custom properties for runtime theme switching
 * Use these in your CSS to support dynamic theming
 */
export const cssCustomProperties = {
  // Light mode (default)
  ':root': {
    '--color-primary-50': primaryColors[50],
    '--color-primary-100': primaryColors[100],
    '--color-primary-200': primaryColors[200],
    '--color-primary-300': primaryColors[300],
    '--color-primary-400': primaryColors[400],
    '--color-primary-500': primaryColors[500],
    '--color-primary-600': primaryColors[600],
    '--color-primary-700': primaryColors[700],
    '--color-primary-800': primaryColors[800],
    '--color-primary-900': primaryColors[900],
    '--color-primary-950': primaryColors[950],

    '--color-text-primary': semanticColors.text.primary,
    '--color-text-secondary': semanticColors.text.secondary,
    '--color-text-tertiary': semanticColors.text.tertiary,
    '--color-text-disabled': semanticColors.text.disabled,
    '--color-text-inverse': semanticColors.text.inverse,
    '--color-text-link': semanticColors.text.link,
    '--color-text-link-hover': semanticColors.text.linkHover,

    '--color-bg-primary': semanticColors.background.primary,
    '--color-bg-secondary': semanticColors.background.secondary,
    '--color-bg-tertiary': semanticColors.background.tertiary,
    '--color-bg-elevated': semanticColors.background.elevated,
    '--color-bg-overlay': semanticColors.background.overlay,
    '--color-bg-disabled': semanticColors.background.disabled,

    '--color-border-primary': semanticColors.border.primary,
    '--color-border-secondary': semanticColors.border.secondary,
    '--color-border-focus': semanticColors.border.focus,
    '--color-border-error': semanticColors.border.error,
    '--color-border-disabled': semanticColors.border.disabled,

    '--color-success': semanticColors.state.success,
    '--color-success-bg': semanticColors.state.successBg,
    '--color-success-border': semanticColors.state.successBorder,
    '--color-warning': semanticColors.state.warning,
    '--color-warning-bg': semanticColors.state.warningBg,
    '--color-warning-border': semanticColors.state.warningBorder,
    '--color-error': semanticColors.state.error,
    '--color-error-bg': semanticColors.state.errorBg,
    '--color-error-border': semanticColors.state.errorBorder,
    '--color-info': semanticColors.state.info,
    '--color-info-bg': semanticColors.state.infoBg,
    '--color-info-border': semanticColors.state.infoBorder,
  },

  // Dark mode overrides
  '[data-theme="dark"]': {
    '--color-text-primary': darkModeColors.text.primary,
    '--color-text-secondary': darkModeColors.text.secondary,
    '--color-text-tertiary': darkModeColors.text.tertiary,
    '--color-text-disabled': darkModeColors.text.disabled,
    '--color-text-inverse': darkModeColors.text.inverse,
    '--color-text-link': darkModeColors.text.link,
    '--color-text-link-hover': darkModeColors.text.linkHover,

    '--color-bg-primary': darkModeColors.background.primary,
    '--color-bg-secondary': darkModeColors.background.secondary,
    '--color-bg-tertiary': darkModeColors.background.tertiary,
    '--color-bg-elevated': darkModeColors.background.elevated,
    '--color-bg-overlay': darkModeColors.background.overlay,
    '--color-bg-disabled': darkModeColors.background.disabled,

    '--color-border-primary': darkModeColors.border.primary,
    '--color-border-secondary': darkModeColors.border.secondary,
    '--color-border-focus': darkModeColors.border.focus,
    '--color-border-error': darkModeColors.border.error,
    '--color-border-disabled': darkModeColors.border.disabled,

    '--color-success': darkModeColors.state.success,
    '--color-success-bg': darkModeColors.state.successBg,
    '--color-success-border': darkModeColors.state.successBorder,
    '--color-warning': darkModeColors.state.warning,
    '--color-warning-bg': darkModeColors.state.warningBg,
    '--color-warning-border': darkModeColors.state.warningBorder,
    '--color-error': darkModeColors.state.error,
    '--color-error-bg': darkModeColors.state.errorBg,
    '--color-error-border': darkModeColors.state.errorBorder,
    '--color-info': darkModeColors.state.info,
    '--color-info-bg': darkModeColors.state.infoBg,
    '--color-info-border': darkModeColors.state.infoBorder,
  },
} as const;

/**
 * Utility function to get color value with opacity
 * @param color - HSL color string
 * @param opacity - Opacity value (0-1)
 * @returns HSL color with alpha channel
 */
export function withOpacity(color: string, opacity: number): string {
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
  }
  return color;
}

/**
 * Color palette export for external usage
 */
export const colors = {
  primary: primaryColors,
  secondary: secondaryColors,
  neutral: neutralColors,
  success: successColors,
  warning: warningColors,
  error: errorColors,
  info: infoColors,
  semantic: semanticColors,
  darkMode: darkModeColors,
} as const;

export type ColorPalette = typeof colors;
export type PrimaryColorKey = keyof typeof primaryColors;
export type SemanticColorCategory = keyof typeof semanticColors;