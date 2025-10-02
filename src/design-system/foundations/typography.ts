/**
 * Nivexa CRM Design System - Typography Tokens
 * 
 * Typography system with font families, sizes, weights, line heights, and letter spacing.
 * Designed for modern CRM interface with excellent readability and hierarchy.
 */

/**
 * Font family definitions
 * Primary: Inter - Modern, readable sans-serif optimized for UI
 * Mono: JetBrains Mono - For code blocks and data display
 */
export const fontFamilies = {
  /** Primary UI font - Inter with system fallbacks */
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(', '),

  /** Monospace font for code and data */
  mono: [
    '"JetBrains Mono"',
    '"SF Mono"',
    'Monaco',
    'Inconsolata',
    '"Liberation Mono"',
    '"Andale Mono"',
    '"Ubuntu Mono"',
    'Consolas',
    'monospace',
  ].join(', '),

  /** Display font for headings (same as sans but can be customized) */
  display: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(', '),
} as const;

/**
 * Font weights
 * Limited set for consistency and performance
 */
export const fontWeights = {
  /** Thin weight - rarely used, for special cases */
  thin: 100,
  /** Extra light weight - very subtle text */
  extraLight: 200,
  /** Light weight - secondary text */
  light: 300,
  /** Normal weight - body text default */
  normal: 400,
  /** Medium weight - emphasized text */
  medium: 500,
  /** Semi-bold weight - subheadings */
  semiBold: 600,
  /** Bold weight - headings, strong emphasis */
  bold: 700,
  /** Extra bold weight - large headings */
  extraBold: 800,
  /** Black weight - maximum emphasis */
  black: 900,
} as const;

/**
 * Font sizes
 * Modular scale based on 16px base with 1.125 ratio
 */
export const fontSizes = {
  /** 10px - Very small text, captions, labels */
  xs: '0.625rem',
  /** 12px - Small text, meta information */
  sm: '0.75rem',
  /** 14px - Body text, standard UI text */
  base: '0.875rem',
  /** 16px - Emphasized body text, form inputs */
  lg: '1rem',
  /** 18px - Large body text, subheadings */
  xl: '1.125rem',
  /** 20px - H4 headings */
  '2xl': '1.25rem',
  /** 24px - H3 headings */
  '3xl': '1.5rem',
  /** 30px - H2 headings */
  '4xl': '1.875rem',
  /** 36px - H1 headings */
  '5xl': '2.25rem',
  /** 48px - Display headings */
  '6xl': '3rem',
  /** 60px - Large display headings */
  '7xl': '3.75rem',
  /** 72px - Extra large display headings */
  '8xl': '4.5rem',
  /** 96px - Maximum display headings */
  '9xl': '6rem',
} as const;

/**
 * Line heights
 * Optimized for readability across different font sizes
 */
export const lineHeights = {
  /** 1.0 - Tight spacing for headings */
  none: '1',
  /** 1.25 - Very tight, large headings */
  tight: '1.25',
  /** 1.375 - Snug, subheadings */
  snug: '1.375',
  /** 1.5 - Normal, body text */
  normal: '1.5',
  /** 1.625 - Relaxed, comfortable reading */
  relaxed: '1.625',
  /** 2.0 - Loose, very comfortable */
  loose: '2',
  
  // Specific line heights for pixel-perfect control
  /** 12px line height */
  3: '0.75rem',
  /** 16px line height */
  4: '1rem',
  /** 20px line height */
  5: '1.25rem',
  /** 24px line height */
  6: '1.5rem',
  /** 28px line height */
  7: '1.75rem',
  /** 32px line height */
  8: '2rem',
  /** 36px line height */
  9: '2.25rem',
  /** 40px line height */
  10: '2.5rem',
} as const;

/**
 * Letter spacing
 * Subtle adjustments for optimal readability
 */
export const letterSpacing = {
  /** -0.05em - Very tight, large headings */
  tighter: '-0.05em',
  /** -0.025em - Tight, headings */
  tight: '-0.025em',
  /** 0em - Normal spacing */
  normal: '0em',
  /** 0.025em - Wide, small text */
  wide: '0.025em',
  /** 0.05em - Wider, all caps text */
  wider: '0.05em',
  /** 0.1em - Widest, tracked text */
  widest: '0.1em',
} as const;

/**
 * Typography scale definitions
 * Semantic typography styles for consistent usage
 */
export const typographyScale = {
  /** Display headings - largest text */
  display: {
    '2xl': {
      fontSize: fontSizes['8xl'],
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tighter,
      fontWeight: fontWeights.bold,
    },
    xl: {
      fontSize: fontSizes['7xl'],
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tighter,
      fontWeight: fontWeights.bold,
    },
    lg: {
      fontSize: fontSizes['6xl'],
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
      fontWeight: fontWeights.bold,
    },
    md: {
      fontSize: fontSizes['5xl'],
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontWeight: fontWeights.bold,
    },
    sm: {
      fontSize: fontSizes['4xl'],
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.semiBold,
    },
  },

  /** Heading styles */
  heading: {
    h1: {
      fontSize: fontSizes['5xl'],
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontWeight: fontWeights.bold,
    },
    h2: {
      fontSize: fontSizes['4xl'],
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontWeight: fontWeights.bold,
    },
    h3: {
      fontSize: fontSizes['3xl'],
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.semiBold,
    },
    h4: {
      fontSize: fontSizes['2xl'],
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.semiBold,
    },
    h5: {
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.medium,
    },
    h6: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.medium,
    },
  },

  /** Body text styles */
  body: {
    xl: {
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
    },
    lg: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
    },
    md: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
    },
    sm: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
    },
    xs: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.normal,
    },
  },

  /** Label and UI text styles */
  label: {
    lg: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.medium,
    },
    md: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.medium,
    },
    sm: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.medium,
    },
  },

  /** Caption and meta text */
  caption: {
    lg: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
    },
    md: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.normal,
    },
    sm: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.wider,
      fontWeight: fontWeights.normal,
    },
  },

  /** Code and monospace text */
  code: {
    lg: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
    md: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
    sm: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
  },
} as const;

/**
 * CSS custom properties for typography
 * Use these in your CSS for consistent typography
 */
export const typographyCssProperties = {
  ':root': {
    '--font-family-sans': fontFamilies.sans,
    '--font-family-mono': fontFamilies.mono,
    '--font-family-display': fontFamilies.display,

    '--font-weight-thin': fontWeights.thin.toString(),
    '--font-weight-extralight': fontWeights.extraLight.toString(),
    '--font-weight-light': fontWeights.light.toString(),
    '--font-weight-normal': fontWeights.normal.toString(),
    '--font-weight-medium': fontWeights.medium.toString(),
    '--font-weight-semibold': fontWeights.semiBold.toString(),
    '--font-weight-bold': fontWeights.bold.toString(),
    '--font-weight-extrabold': fontWeights.extraBold.toString(),
    '--font-weight-black': fontWeights.black.toString(),

    '--font-size-xs': fontSizes.xs,
    '--font-size-sm': fontSizes.sm,
    '--font-size-base': fontSizes.base,
    '--font-size-lg': fontSizes.lg,
    '--font-size-xl': fontSizes.xl,
    '--font-size-2xl': fontSizes['2xl'],
    '--font-size-3xl': fontSizes['3xl'],
    '--font-size-4xl': fontSizes['4xl'],
    '--font-size-5xl': fontSizes['5xl'],
    '--font-size-6xl': fontSizes['6xl'],

    '--line-height-none': lineHeights.none,
    '--line-height-tight': lineHeights.tight,
    '--line-height-snug': lineHeights.snug,
    '--line-height-normal': lineHeights.normal,
    '--line-height-relaxed': lineHeights.relaxed,
    '--line-height-loose': lineHeights.loose,

    '--letter-spacing-tighter': letterSpacing.tighter,
    '--letter-spacing-tight': letterSpacing.tight,
    '--letter-spacing-normal': letterSpacing.normal,
    '--letter-spacing-wide': letterSpacing.wide,
    '--letter-spacing-wider': letterSpacing.wider,
    '--letter-spacing-widest': letterSpacing.widest,
  },
} as const;

/**
 * Utility function to create typography CSS object
 * @param scale - Typography scale object
 * @returns CSS-in-JS object
 */
export function createTypographyStyle(scale: typeof typographyScale.body.md) {
  return {
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    fontWeight: scale.fontWeight,
    fontFamily: scale.fontFamily || fontFamilies.sans,
  };
}

/**
 * Typography export for external usage
 */
export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  scale: typographyScale,
} as const;

export type FontWeight = keyof typeof fontWeights;
export type FontSize = keyof typeof fontSizes;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
export type TypographyScale = typeof typographyScale;