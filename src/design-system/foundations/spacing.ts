/**
 * Nivexa CRM Design System - Spacing Tokens
 * 
 * Spacing scale based on 4px grid system for consistent layout and component spacing.
 * Includes semantic spacing for density preferences and component-specific spacing.
 */

/**
 * Base spacing unit - 4px grid system
 * All spacing should be multiples of this base unit
 */
export const SPACING_BASE = 4;

/**
 * Core spacing scale
 * Based on 4px grid with carefully chosen increments for UI design
 */
export const spacing = {
  /** 0px - No spacing */
  0: '0',
  /** 1px - Hairline borders, very tight spacing */
  px: '1px',
  /** 2px - Micro spacing, fine adjustments */
  0.5: `${SPACING_BASE * 0.5}px`,
  /** 4px - Extra small spacing, tight layouts */
  1: `${SPACING_BASE * 1}px`,
  /** 6px - Small spacing between related elements */
  1.5: `${SPACING_BASE * 1.5}px`,
  /** 8px - Small spacing, form elements */
  2: `${SPACING_BASE * 2}px`,
  /** 10px - Small-medium spacing */
  2.5: `${SPACING_BASE * 2.5}px`,
  /** 12px - Medium spacing, comfortable layouts */
  3: `${SPACING_BASE * 3}px`,
  /** 14px - Medium-large spacing */
  3.5: `${SPACING_BASE * 3.5}px`,
  /** 16px - Standard spacing unit, paragraphs */
  4: `${SPACING_BASE * 4}px`,
  /** 20px - Large spacing between sections */
  5: `${SPACING_BASE * 5}px`,
  /** 24px - Extra large spacing, card padding */
  6: `${SPACING_BASE * 6}px`,
  /** 28px - Section breaks */
  7: `${SPACING_BASE * 7}px`,
  /** 32px - Large section spacing */
  8: `${SPACING_BASE * 8}px`,
  /** 36px - Extra large sections */
  9: `${SPACING_BASE * 9}px`,
  /** 40px - Page-level spacing */
  10: `${SPACING_BASE * 10}px`,
  /** 44px - Large page elements */
  11: `${SPACING_BASE * 11}px`,
  /** 48px - Major page sections */
  12: `${SPACING_BASE * 12}px`,
  /** 56px - Large gaps */
  14: `${SPACING_BASE * 14}px`,
  /** 64px - Extra large gaps */
  16: `${SPACING_BASE * 16}px`,
  /** 80px - Very large spacing */
  20: `${SPACING_BASE * 20}px`,
  /** 96px - Maximum spacing for layouts */
  24: `${SPACING_BASE * 24}px`,
  /** 128px - Huge spacing, rare usage */
  32: `${SPACING_BASE * 32}px`,
  /** 160px - Maximum layout spacing */
  40: `${SPACING_BASE * 40}px`,
  /** 192px - Extra large layout spacing */
  48: `${SPACING_BASE * 48}px`,
  /** 224px - Massive spacing */
  56: `${SPACING_BASE * 56}px`,
  /** 256px - Maximum possible spacing */
  64: `${SPACING_BASE * 64}px`,
  /** 320px - Super large spacing */
  80: `${SPACING_BASE * 80}px`,
  /** 384px - Ultra large spacing */
  96: `${SPACING_BASE * 96}px`,
} as const;

/**
 * Semantic spacing for different UI density preferences
 * These provide meaningful names for common spacing scenarios
 */
export const semanticSpacing = {
  /** Compact spacing - high information density */
  compact: {
    /** 2px - Very tight element spacing */
    elementGap: spacing[0.5],
    /** 4px - Tight content padding */
    contentPadding: spacing[1],
    /** 8px - Compact section spacing */
    sectionGap: spacing[2],
    /** 12px - Compact container padding */
    containerPadding: spacing[3],
    /** 16px - Compact page margins */
    pageMargin: spacing[4],
  },

  /** Normal spacing - balanced density and comfort */
  normal: {
    /** 4px - Standard element spacing */
    elementGap: spacing[1],
    /** 8px - Standard content padding */
    contentPadding: spacing[2],
    /** 16px - Standard section spacing */
    sectionGap: spacing[4],
    /** 24px - Standard container padding */
    containerPadding: spacing[6],
    /** 32px - Standard page margins */
    pageMargin: spacing[8],
  },

  /** Comfortable spacing - maximum readability and comfort */
  comfortable: {
    /** 8px - Relaxed element spacing */
    elementGap: spacing[2],
    /** 12px - Comfortable content padding */
    contentPadding: spacing[3],
    /** 24px - Comfortable section spacing */
    sectionGap: spacing[6],
    /** 32px - Comfortable container padding */
    containerPadding: spacing[8],
    /** 48px - Comfortable page margins */
    pageMargin: spacing[12],
  },
} as const;

/**
 * Component-specific spacing tokens
 * Predefined spacing for common component patterns
 */
export const componentSpacing = {
  /** Button spacing */
  button: {
    /** 4px 8px - Extra small button padding */
    paddingXs: `${spacing[1]} ${spacing[2]}`,
    /** 6px 12px - Small button padding */
    paddingSm: `${spacing[1.5]} ${spacing[3]}`,
    /** 8px 16px - Medium button padding */
    paddingMd: `${spacing[2]} ${spacing[4]}`,
    /** 12px 24px - Large button padding */
    paddingLg: `${spacing[3]} ${spacing[6]}`,
    /** 16px 32px - Extra large button padding */
    paddingXl: `${spacing[4]} ${spacing[8]}`,
    /** 8px - Space between buttons */
    gap: spacing[2],
  },

  /** Form spacing */
  form: {
    /** 4px - Input border to content */
    inputPadding: spacing[1],
    /** 8px - Form field internal padding */
    fieldPadding: spacing[2],
    /** 4px - Label to field spacing */
    labelGap: spacing[1],
    /** 16px - Space between form fields */
    fieldGap: spacing[4],
    /** 24px - Space between form sections */
    sectionGap: spacing[6],
    /** 6px - Helper text to field */
    helperGap: spacing[1.5],
  },

  /** Card spacing */
  card: {
    /** 12px - Compact card padding */
    paddingCompact: spacing[3],
    /** 16px - Standard card padding */
    paddingNormal: spacing[4],
    /** 24px - Comfortable card padding */
    paddingComfortable: spacing[6],
    /** 32px - Large card padding */
    paddingLarge: spacing[8],
    /** 16px - Space between cards */
    gap: spacing[4],
    /** 8px - Card header to content */
    headerGap: spacing[2],
  },

  /** Navigation spacing */
  navigation: {
    /** 8px - Nav item padding */
    itemPadding: spacing[2],
    /** 4px - Space between nav items */
    itemGap: spacing[1],
    /** 16px - Nav section spacing */
    sectionGap: spacing[4],
    /** 12px - Sidebar padding */
    sidebarPadding: spacing[3],
    /** 60px - Standard nav bar height */
    navBarHeight: `${SPACING_BASE * 15}px`,
  },

  /** Table spacing */
  table: {
    /** 8px - Cell padding horizontal */
    cellPaddingX: spacing[2],
    /** 12px - Cell padding vertical */
    cellPaddingY: spacing[3],
    /** 0 - No gap between table borders */
    borderSpacing: spacing[0],
    /** 16px - Space around table */
    containerPadding: spacing[4],
  },

  /** Modal and overlay spacing */
  modal: {
    /** 24px - Modal content padding */
    contentPadding: spacing[6],
    /** 16px - Modal header padding */
    headerPadding: spacing[4],
    /** 16px - Modal footer padding */
    footerPadding: spacing[4],
    /** 48px - Space from viewport edges */
    viewportMargin: spacing[12],
    /** 8px - Space between modal actions */
    actionGap: spacing[2],
  },

  /** Layout spacing */
  layout: {
    /** 16px - Standard container padding */
    containerPadding: spacing[4],
    /** 24px - Large container padding */
    containerPaddingLg: spacing[6],
    /** 32px - Section spacing */
    sectionGap: spacing[8],
    /** 48px - Page section spacing */
    pageSectionGap: spacing[12],
    /** 64px - Large page spacing */
    pageGap: spacing[16],
  },
} as const;

/**
 * Responsive spacing breakpoints
 * Different spacing values for different screen sizes
 */
export const responsiveSpacing = {
  mobile: {
    containerPadding: spacing[4],
    sectionGap: spacing[6],
    pageMargin: spacing[4],
  },
  tablet: {
    containerPadding: spacing[6],
    sectionGap: spacing[8],
    pageMargin: spacing[6],
  },
  desktop: {
    containerPadding: spacing[8],
    sectionGap: spacing[10],
    pageMargin: spacing[8],
  },
} as const;

/**
 * CSS custom properties for spacing
 * Use these in your CSS for consistent spacing
 */
export const spacingCssProperties = {
  ':root': {
    '--spacing-0': spacing[0],
    '--spacing-px': spacing.px,
    '--spacing-0-5': spacing[0.5],
    '--spacing-1': spacing[1],
    '--spacing-1-5': spacing[1.5],
    '--spacing-2': spacing[2],
    '--spacing-2-5': spacing[2.5],
    '--spacing-3': spacing[3],
    '--spacing-3-5': spacing[3.5],
    '--spacing-4': spacing[4],
    '--spacing-5': spacing[5],
    '--spacing-6': spacing[6],
    '--spacing-7': spacing[7],
    '--spacing-8': spacing[8],
    '--spacing-9': spacing[9],
    '--spacing-10': spacing[10],
    '--spacing-11': spacing[11],
    '--spacing-12': spacing[12],
    '--spacing-14': spacing[14],
    '--spacing-16': spacing[16],
    '--spacing-20': spacing[20],
    '--spacing-24': spacing[24],
    '--spacing-32': spacing[32],
    '--spacing-40': spacing[40],
    '--spacing-48': spacing[48],
    '--spacing-56': spacing[56],
    '--spacing-64': spacing[64],
    '--spacing-80': spacing[80],
    '--spacing-96': spacing[96],

    // Semantic spacing
    '--spacing-element-gap': semanticSpacing.normal.elementGap,
    '--spacing-content-padding': semanticSpacing.normal.contentPadding,
    '--spacing-section-gap': semanticSpacing.normal.sectionGap,
    '--spacing-container-padding': semanticSpacing.normal.containerPadding,
    '--spacing-page-margin': semanticSpacing.normal.pageMargin,
  },

  // Compact density override
  '[data-density="compact"]': {
    '--spacing-element-gap': semanticSpacing.compact.elementGap,
    '--spacing-content-padding': semanticSpacing.compact.contentPadding,
    '--spacing-section-gap': semanticSpacing.compact.sectionGap,
    '--spacing-container-padding': semanticSpacing.compact.containerPadding,
    '--spacing-page-margin': semanticSpacing.compact.pageMargin,
  },

  // Comfortable density override
  '[data-density="comfortable"]': {
    '--spacing-element-gap': semanticSpacing.comfortable.elementGap,
    '--spacing-content-padding': semanticSpacing.comfortable.contentPadding,
    '--spacing-section-gap': semanticSpacing.comfortable.sectionGap,
    '--spacing-container-padding': semanticSpacing.comfortable.containerPadding,
    '--spacing-page-margin': semanticSpacing.comfortable.pageMargin,
  },
} as const;

/**
 * Utility function to get spacing value
 * @param size - Spacing size key
 * @returns Spacing value in pixels
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size];
}

/**
 * Utility function to create custom spacing
 * @param multiplier - Multiple of base spacing unit
 * @returns Spacing value in pixels
 */
export function createSpacing(multiplier: number): string {
  return `${SPACING_BASE * multiplier}px`;
}

/**
 * Utility function to get component spacing
 * @param component - Component name
 * @param variant - Spacing variant
 * @returns Spacing value
 */
export function getComponentSpacing(
  component: keyof typeof componentSpacing,
  variant: string
): string {
  return (componentSpacing[component] as any)[variant] || spacing[4];
}

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingDensity = keyof typeof semanticSpacing;
export type ComponentSpacingCategory = keyof typeof componentSpacing;