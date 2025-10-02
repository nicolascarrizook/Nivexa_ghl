/**
 * Nivexa CRM Design System - Border Radius Tokens
 * 
 * Border radius system for consistent rounded corners across components.
 * Designed for modern CRM interface with appropriate radius values.
 */

/**
 * Core border radius scale
 * Based on 4px increments for consistency with spacing system
 */
export const radii = {
  /** 0px - No border radius, sharp corners */
  none: '0',
  
  /** 2px - Minimal rounding, subtle softening */
  xs: '2px',
  
  /** 4px - Small radius, form inputs, small buttons */
  sm: '4px',
  
  /** 6px - Medium-small radius, cards, larger buttons */
  md: '6px',
  
  /** 8px - Standard radius, panels, modals */
  lg: '8px',
  
  /** 12px - Large radius, prominent elements */
  xl: '12px',
  
  /** 16px - Extra large radius, hero elements */
  '2xl': '16px',
  
  /** 20px - Very large radius, special containers */
  '3xl': '20px',
  
  /** 24px - Maximum radius for rectangular elements */
  '4xl': '24px',
  
  /** 50% - Full circle, avatars, icon buttons */
  full: '50%',
} as const;

/**
 * Component-specific border radius tokens
 * Predefined radius values for consistent component styling
 */
export const componentRadii = {
  /** Button border radius */
  button: {
    /** Small button radius */
    sm: radii.sm,
    /** Medium button radius (default) */
    md: radii.md,
    /** Large button radius */
    lg: radii.lg,
    /** Round button (icon buttons) */
    round: radii.full,
  },

  /** Input border radius */
  input: {
    /** Text inputs, selects */
    default: radii.md,
    /** Search inputs with icons */
    search: radii.lg,
    /** Pill-shaped inputs */
    pill: radii.full,
  },

  /** Card border radius */
  card: {
    /** Standard card radius */
    default: radii.lg,
    /** Small card radius */
    sm: radii.md,
    /** Large card radius */
    lg: radii.xl,
    /** Extra large card radius */
    xl: radii['2xl'],
  },

  /** Modal and overlay radius */
  modal: {
    /** Modal content radius */
    content: radii.xl,
    /** Small modal radius */
    sm: radii.lg,
    /** Large modal radius */
    lg: radii['2xl'],
    /** Drawer radius (only top corners) */
    drawer: radii.lg,
  },

  /** Badge and chip radius */
  badge: {
    /** Standard badge radius */
    default: radii.sm,
    /** Pill-shaped badge */
    pill: radii.full,
    /** Rounded badge */
    rounded: radii.md,
  },

  /** Avatar radius */
  avatar: {
    /** Square avatar with slight rounding */
    square: radii.md,
    /** Rounded avatar */
    rounded: radii.lg,
    /** Circular avatar */
    circle: radii.full,
  },

  /** Image radius */
  image: {
    /** Standard image radius */
    default: radii.lg,
    /** Small image radius */
    sm: radii.md,
    /** Large image radius */
    lg: radii.xl,
    /** Circular image */
    circle: radii.full,
  },

  /** Panel and container radius */
  panel: {
    /** Standard panel radius */
    default: radii.lg,
    /** Compact panel radius */
    compact: radii.md,
    /** Large panel radius */
    large: radii.xl,
    /** Nested panel radius (smaller than parent) */
    nested: radii.md,
  },

  /** Navigation radius */
  navigation: {
    /** Nav item radius */
    item: radii.md,
    /** Tab radius */
    tab: radii.md,
    /** Pill-shaped nav item */
    pill: radii.full,
  },

  /** Dropdown radius */
  dropdown: {
    /** Dropdown menu radius */
    menu: radii.lg,
    /** Select dropdown radius */
    select: radii.md,
    /** Combobox dropdown radius */
    combobox: radii.lg,
  },

  /** Tooltip radius */
  tooltip: {
    /** Standard tooltip radius */
    default: radii.md,
    /** Small tooltip radius */
    sm: radii.sm,
    /** Large tooltip radius */
    lg: radii.lg,
  },

  /** Table radius */
  table: {
    /** Table container radius */
    container: radii.lg,
    /** Table cell radius (for special cells) */
    cell: radii.sm,
    /** Table header radius */
    header: radii.md,
  },

  /** Progress indicator radius */
  progress: {
    /** Progress bar radius */
    bar: radii.full,
    /** Step indicator radius */
    step: radii.full,
    /** Track radius */
    track: radii.full,
  },

  /** Alert radius */
  alert: {
    /** Standard alert radius */
    default: radii.lg,
    /** Compact alert radius */
    compact: radii.md,
    /** Toast notification radius */
    toast: radii.lg,
  },
} as const;

/**
 * Border radius combinations for complex layouts
 * Predefined combinations for common layout patterns
 */
export const radiusCombinations = {
  /** Top corners only */
  top: {
    sm: `${radii.sm} ${radii.sm} 0 0`,
    md: `${radii.md} ${radii.md} 0 0`,
    lg: `${radii.lg} ${radii.lg} 0 0`,
    xl: `${radii.xl} ${radii.xl} 0 0`,
  },

  /** Bottom corners only */
  bottom: {
    sm: `0 0 ${radii.sm} ${radii.sm}`,
    md: `0 0 ${radii.md} ${radii.md}`,
    lg: `0 0 ${radii.lg} ${radii.lg}`,
    xl: `0 0 ${radii.xl} ${radii.xl}`,
  },

  /** Left corners only */
  left: {
    sm: `${radii.sm} 0 0 ${radii.sm}`,
    md: `${radii.md} 0 0 ${radii.md}`,
    lg: `${radii.lg} 0 0 ${radii.lg}`,
    xl: `${radii.xl} 0 0 ${radii.xl}`,
  },

  /** Right corners only */
  right: {
    sm: `0 ${radii.sm} ${radii.sm} 0`,
    md: `0 ${radii.md} ${radii.md} 0`,
    lg: `0 ${radii.lg} ${radii.lg} 0`,
    xl: `0 ${radii.xl} ${radii.xl} 0`,
  },

  /** Top-left corner only */
  topLeft: {
    sm: `${radii.sm} 0 0 0`,
    md: `${radii.md} 0 0 0`,
    lg: `${radii.lg} 0 0 0`,
    xl: `${radii.xl} 0 0 0`,
  },

  /** Top-right corner only */
  topRight: {
    sm: `0 ${radii.sm} 0 0`,
    md: `0 ${radii.md} 0 0`,
    lg: `0 ${radii.lg} 0 0`,
    xl: `0 ${radii.xl} 0 0`,
  },

  /** Bottom-left corner only */
  bottomLeft: {
    sm: `0 0 0 ${radii.sm}`,
    md: `0 0 0 ${radii.md}`,
    lg: `0 0 0 ${radii.lg}`,
    xl: `0 0 0 ${radii.xl}`,
  },

  /** Bottom-right corner only */
  bottomRight: {
    sm: `0 0 ${radii.sm} 0`,
    md: `0 0 ${radii.md} 0`,
    lg: `0 0 ${radii.lg} 0`,
    xl: `0 0 ${radii.xl} 0`,
  },
} as const;

/**
 * Responsive border radius
 * Different radius values for different screen sizes
 */
export const responsiveRadii = {
  /** Mobile-first radius (smaller on mobile) */
  mobile: {
    card: radii.md,
    modal: radii.lg,
    button: radii.sm,
  },
  
  /** Tablet radius */
  tablet: {
    card: radii.lg,
    modal: radii.xl,
    button: radii.md,
  },
  
  /** Desktop radius (larger for better visual hierarchy) */
  desktop: {
    card: radii.xl,
    modal: radii['2xl'],
    button: radii.lg,
  },
} as const;

/**
 * CSS custom properties for border radius
 * Use these in your CSS for consistent border radius
 */
export const radiiCssProperties = {
  ':root': {
    '--radius-none': radii.none,
    '--radius-xs': radii.xs,
    '--radius-sm': radii.sm,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--radius-xl': radii.xl,
    '--radius-2xl': radii['2xl'],
    '--radius-3xl': radii['3xl'],
    '--radius-4xl': radii['4xl'],
    '--radius-full': radii.full,

    // Component-specific radius
    '--radius-button': componentRadii.button.md,
    '--radius-input': componentRadii.input.default,
    '--radius-card': componentRadii.card.default,
    '--radius-modal': componentRadii.modal.content,
    '--radius-badge': componentRadii.badge.default,
    '--radius-avatar': componentRadii.avatar.rounded,
    '--radius-panel': componentRadii.panel.default,
    '--radius-dropdown': componentRadii.dropdown.menu,
    '--radius-tooltip': componentRadii.tooltip.default,
    '--radius-alert': componentRadii.alert.default,
  },

  // Responsive overrides for smaller screens
  '@media (max-width: 768px)': {
    '--radius-card': responsiveRadii.mobile.card,
    '--radius-modal': responsiveRadii.mobile.modal,
    '--radius-button': responsiveRadii.mobile.button,
  },

  // Enhanced radius for larger screens
  '@media (min-width: 1024px)': {
    '--radius-card': responsiveRadii.desktop.card,
    '--radius-modal': responsiveRadii.desktop.modal,
    '--radius-button': responsiveRadii.desktop.button,
  },
} as const;

/**
 * Utility functions for border radius
 */
export const radiiUtils = {
  /**
   * Get border radius value
   * @param size - Radius size key
   * @returns Border radius value
   */
  getRadius: (size: keyof typeof radii): string => {
    return radii[size];
  },

  /**
   * Get component-specific radius
   * @param component - Component name
   * @param variant - Radius variant
   * @returns Border radius value
   */
  getComponentRadius: (
    component: keyof typeof componentRadii,
    variant: string = 'default'
  ): string => {
    const componentRadius = componentRadii[component] as any;
    return componentRadius[variant] || componentRadius.default || radii.md;
  },

  /**
   * Create custom radius combination
   * @param topLeft - Top-left radius
   * @param topRight - Top-right radius
   * @param bottomRight - Bottom-right radius
   * @param bottomLeft - Bottom-left radius
   * @returns Border radius string
   */
  createRadius: (
    topLeft: keyof typeof radii,
    topRight: keyof typeof radii = topLeft,
    bottomRight: keyof typeof radii = topLeft,
    bottomLeft: keyof typeof radii = topRight
  ): string => {
    return `${radii[topLeft]} ${radii[topRight]} ${radii[bottomRight]} ${radii[bottomLeft]}`;
  },

  /**
   * Get radius combination
   * @param side - Side combination
   * @param size - Radius size
   * @returns Border radius string
   */
  getRadiusCombination: (
    side: keyof typeof radiusCombinations,
    size: keyof typeof radiusCombinations.top
  ): string => {
    return radiusCombinations[side][size];
  },

  /**
   * Get responsive radius
   * @param breakpoint - Screen size breakpoint
   * @param component - Component type
   * @returns Border radius value
   */
  getResponsiveRadius: (
    breakpoint: keyof typeof responsiveRadii,
    component: keyof typeof responsiveRadii.mobile
  ): string => {
    return responsiveRadii[breakpoint][component];
  },
};

export type RadiusSize = keyof typeof radii;
export type ComponentRadiusCategory = keyof typeof componentRadii;
export type RadiusCombination = keyof typeof radiusCombinations;
export type ResponsiveBreakpoint = keyof typeof responsiveRadii;