/**
 * Nivexa CRM Design System - Shadow Tokens
 * 
 * Elevation system with carefully crafted shadows for depth and hierarchy.
 * Supports both light and dark modes with appropriate shadow colors.
 */

/**
 * Base shadow colors
 * Light mode shadows use neutral colors, dark mode uses deeper shadows
 */
export const shadowColors = {
  light: {
    /** Primary shadow color - neutral with alpha */
    primary: 'hsla(210, 40%, 12%, 0.15)',
    /** Secondary shadow color - lighter shadow */
    secondary: 'hsla(210, 40%, 12%, 0.08)',
    /** Accent shadow - slight blue tint for focus states */
    accent: 'hsla(252, 70%, 50%, 0.25)',
    /** Error shadow - red tint for error states */
    error: 'hsla(0, 84%, 60%, 0.25)',
    /** Warning shadow - orange tint for warning states */
    warning: 'hsla(38, 92%, 50%, 0.25)',
    /** Success shadow - green tint for success states */
    success: 'hsla(120, 65%, 45%, 0.25)',
  },
  dark: {
    /** Primary shadow color - deeper black for dark mode */
    primary: 'hsla(0, 0%, 0%, 0.3)',
    /** Secondary shadow color - medium black */
    secondary: 'hsla(0, 0%, 0%, 0.15)',
    /** Accent shadow - purple tint for focus states */
    accent: 'hsla(252, 70%, 50%, 0.4)',
    /** Error shadow - red tint for error states */
    error: 'hsla(0, 84%, 60%, 0.4)',
    /** Warning shadow - orange tint for warning states */
    warning: 'hsla(38, 92%, 50%, 0.4)',
    /** Success shadow - green tint for success states */
    success: 'hsla(120, 65%, 45%, 0.4)',
  },
} as const;

/**
 * Shadow elevation scale
 * Based on Material Design elevation with custom adjustments for CRM UI
 */
export const shadows = {
  /** No shadow - flat elements */
  none: 'none',
  
  /** xs - 1dp elevation - subtle borders replacement */
  xs: `0 1px 2px 0 ${shadowColors.light.secondary}`,
  
  /** sm - 2dp elevation - cards, buttons */
  sm: `
    0 1px 3px 0 ${shadowColors.light.primary},
    0 1px 2px 0 ${shadowColors.light.secondary}
  `,
  
  /** md - 4dp elevation - dropdown menus, dialogs */
  md: `
    0 4px 6px -1px ${shadowColors.light.primary},
    0 2px 4px -1px ${shadowColors.light.secondary}
  `,
  
  /** lg - 8dp elevation - popovers, tooltips */
  lg: `
    0 10px 15px -3px ${shadowColors.light.primary},
    0 4px 6px -2px ${shadowColors.light.secondary}
  `,
  
  /** xl - 12dp elevation - modals, drawers */
  xl: `
    0 20px 25px -5px ${shadowColors.light.primary},
    0 10px 10px -5px ${shadowColors.light.secondary}
  `,
  
  /** 2xl - 16dp elevation - maximum elevation for overlays */
  '2xl': `
    0 25px 50px -12px ${shadowColors.light.primary}
  `,
  
  /** inner - inset shadow for depressed elements */
  inner: `inset 0 2px 4px 0 ${shadowColors.light.secondary}`,
} as const;

/**
 * Dark mode shadow overrides
 * Deeper shadows for dark backgrounds
 */
export const darkShadows = {
  none: 'none',
  xs: `0 1px 2px 0 ${shadowColors.dark.secondary}`,
  sm: `
    0 1px 3px 0 ${shadowColors.dark.primary},
    0 1px 2px 0 ${shadowColors.dark.secondary}
  `,
  md: `
    0 4px 6px -1px ${shadowColors.dark.primary},
    0 2px 4px -1px ${shadowColors.dark.secondary}
  `,
  lg: `
    0 10px 15px -3px ${shadowColors.dark.primary},
    0 4px 6px -2px ${shadowColors.dark.secondary}
  `,
  xl: `
    0 20px 25px -5px ${shadowColors.dark.primary},
    0 10px 10px -5px ${shadowColors.dark.secondary}
  `,
  '2xl': `
    0 25px 50px -12px ${shadowColors.dark.primary}
  `,
  inner: `inset 0 2px 4px 0 ${shadowColors.dark.secondary}`,
} as const;

/**
 * Focus shadows for interactive elements
 * Colored shadows for focus states and accessibility
 */
export const focusShadows = {
  light: {
    /** Primary focus shadow - brand color */
    primary: `0 0 0 3px ${shadowColors.light.accent}`,
    /** Error focus shadow */
    error: `0 0 0 3px ${shadowColors.light.error}`,
    /** Warning focus shadow */
    warning: `0 0 0 3px ${shadowColors.light.warning}`,
    /** Success focus shadow */
    success: `0 0 0 3px ${shadowColors.light.success}`,
    /** Combined elevation and focus */
    elevated: `
      ${shadows.md},
      0 0 0 3px ${shadowColors.light.accent}
    `,
  },
  dark: {
    /** Primary focus shadow - brand color */
    primary: `0 0 0 3px ${shadowColors.dark.accent}`,
    /** Error focus shadow */
    error: `0 0 0 3px ${shadowColors.dark.error}`,
    /** Warning focus shadow */
    warning: `0 0 0 3px ${shadowColors.dark.warning}`,
    /** Success focus shadow */
    success: `0 0 0 3px ${shadowColors.dark.success}`,
    /** Combined elevation and focus */
    elevated: `
      ${darkShadows.md},
      0 0 0 3px ${shadowColors.dark.accent}
    `,
  },
} as const;

/**
 * Component-specific shadows
 * Predefined shadows for common component patterns
 */
export const componentShadows = {
  /** Button shadows */
  button: {
    /** Default button elevation */
    default: shadows.xs,
    /** Hovered button elevation */
    hover: shadows.sm,
    /** Pressed button (no shadow) */
    pressed: 'none',
    /** Focus state */
    focus: focusShadows.light.primary,
    /** Primary button with elevation and focus */
    primaryFocus: focusShadows.light.elevated,
  },

  /** Card shadows */
  card: {
    /** Default card elevation */
    default: shadows.sm,
    /** Hovered card elevation */
    hover: shadows.md,
    /** Interactive card pressed state */
    pressed: shadows.xs,
    /** Elevated card for important content */
    elevated: shadows.lg,
  },

  /** Input shadows */
  input: {
    /** Default input border replacement */
    default: shadows.xs,
    /** Focused input state */
    focus: focusShadows.light.primary,
    /** Error input state */
    error: focusShadows.light.error,
    /** Warning input state */
    warning: focusShadows.light.warning,
    /** Success input state */
    success: focusShadows.light.success,
  },

  /** Modal and overlay shadows */
  modal: {
    /** Modal backdrop shadow */
    backdrop: shadows['2xl'],
    /** Modal content shadow */
    content: shadows.xl,
    /** Drawer shadow */
    drawer: shadows.xl,
  },

  /** Dropdown shadows */
  dropdown: {
    /** Dropdown menu shadow */
    menu: shadows.lg,
    /** Select dropdown shadow */
    select: shadows.md,
    /** Combobox dropdown shadow */
    combobox: shadows.lg,
  },

  /** Tooltip shadows */
  tooltip: {
    /** Default tooltip shadow */
    default: shadows.md,
    /** Large tooltip with more content */
    large: shadows.lg,
  },

  /** Navigation shadows */
  navigation: {
    /** Header navigation shadow */
    header: shadows.sm,
    /** Sidebar shadow */
    sidebar: shadows.lg,
    /** Tab bar shadow */
    tabs: shadows.xs,
  },

  /** Table shadows */
  table: {
    /** Table container shadow */
    container: shadows.sm,
    /** Table header shadow */
    header: shadows.xs,
    /** Table row hover shadow */
    rowHover: shadows.xs,
  },
} as const;

/**
 * Glow effects for special states
 * Subtle glow effects for loading, success, and attention states
 */
export const glowEffects = {
  light: {
    /** Primary brand glow */
    primary: `0 0 20px hsla(252, 70%, 50%, 0.3)`,
    /** Success glow */
    success: `0 0 20px hsla(120, 65%, 45%, 0.3)`,
    /** Error glow */
    error: `0 0 20px hsla(0, 84%, 60%, 0.3)`,
    /** Warning glow */
    warning: `0 0 20px hsla(38, 92%, 50%, 0.3)`,
    /** Info glow */
    info: `0 0 20px hsla(217, 91%, 60%, 0.3)`,
    /** Pulse animation glow */
    pulse: `0 0 0 10px hsla(252, 70%, 50%, 0.1)`,
  },
  dark: {
    /** Primary brand glow */
    primary: `0 0 20px hsla(252, 70%, 50%, 0.5)`,
    /** Success glow */
    success: `0 0 20px hsla(120, 65%, 45%, 0.5)`,
    /** Error glow */
    error: `0 0 20px hsla(0, 84%, 60%, 0.5)`,
    /** Warning glow */
    warning: `0 0 20px hsla(38, 92%, 50%, 0.5)`,
    /** Info glow */
    info: `0 0 20px hsla(217, 91%, 60%, 0.5)`,
    /** Pulse animation glow */
    pulse: `0 0 0 10px hsla(252, 70%, 50%, 0.15)`,
  },
} as const;

/**
 * CSS custom properties for shadows
 * Use these in your CSS for consistent shadows with theme support
 */
export const shadowCssProperties = {
  ':root': {
    '--shadow-color-primary': shadowColors.light.primary,
    '--shadow-color-secondary': shadowColors.light.secondary,
    '--shadow-color-accent': shadowColors.light.accent,
    '--shadow-color-error': shadowColors.light.error,
    '--shadow-color-warning': shadowColors.light.warning,
    '--shadow-color-success': shadowColors.light.success,

    '--shadow-none': shadows.none,
    '--shadow-xs': shadows.xs,
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-xl': shadows.xl,
    '--shadow-2xl': shadows['2xl'],
    '--shadow-inner': shadows.inner,

    '--shadow-focus-primary': focusShadows.light.primary,
    '--shadow-focus-error': focusShadows.light.error,
    '--shadow-focus-warning': focusShadows.light.warning,
    '--shadow-focus-success': focusShadows.light.success,
    '--shadow-focus-elevated': focusShadows.light.elevated,

    '--glow-primary': glowEffects.light.primary,
    '--glow-success': glowEffects.light.success,
    '--glow-error': glowEffects.light.error,
    '--glow-warning': glowEffects.light.warning,
    '--glow-info': glowEffects.light.info,
    '--glow-pulse': glowEffects.light.pulse,
  },

  '[data-theme="dark"]': {
    '--shadow-color-primary': shadowColors.dark.primary,
    '--shadow-color-secondary': shadowColors.dark.secondary,
    '--shadow-color-accent': shadowColors.dark.accent,
    '--shadow-color-error': shadowColors.dark.error,
    '--shadow-color-warning': shadowColors.dark.warning,
    '--shadow-color-success': shadowColors.dark.success,

    '--shadow-xs': darkShadows.xs,
    '--shadow-sm': darkShadows.sm,
    '--shadow-md': darkShadows.md,
    '--shadow-lg': darkShadows.lg,
    '--shadow-xl': darkShadows.xl,
    '--shadow-2xl': darkShadows['2xl'],
    '--shadow-inner': darkShadows.inner,

    '--shadow-focus-primary': focusShadows.dark.primary,
    '--shadow-focus-error': focusShadows.dark.error,
    '--shadow-focus-warning': focusShadows.dark.warning,
    '--shadow-focus-success': focusShadows.dark.success,
    '--shadow-focus-elevated': focusShadows.dark.elevated,

    '--glow-primary': glowEffects.dark.primary,
    '--glow-success': glowEffects.dark.success,
    '--glow-error': glowEffects.dark.error,
    '--glow-warning': glowEffects.dark.warning,
    '--glow-info': glowEffects.dark.info,
    '--glow-pulse': glowEffects.dark.pulse,
  },
} as const;

/**
 * Utility functions for shadow manipulation
 */
export const shadowUtils = {
  /**
   * Get shadow for current theme
   * @param size - Shadow size
   * @param theme - Theme mode
   * @returns Shadow string
   */
  getShadow: (size: keyof typeof shadows, theme: 'light' | 'dark' = 'light'): string => {
    return theme === 'dark' ? darkShadows[size] : shadows[size];
  },

  /**
   * Get focus shadow for current theme
   * @param type - Focus type
   * @param theme - Theme mode
   * @returns Shadow string
   */
  getFocusShadow: (
    type: keyof typeof focusShadows.light,
    theme: 'light' | 'dark' = 'light'
  ): string => {
    return theme === 'dark' ? focusShadows.dark[type] : focusShadows.light[type];
  },

  /**
   * Get component shadow
   * @param component - Component name
   * @param variant - Shadow variant
   * @param theme - Theme mode
   * @returns Shadow string
   */
  getComponentShadow: (
    component: keyof typeof componentShadows,
    variant: string,
    theme: 'light' | 'dark' = 'light'
  ): string => {
    const shadow = (componentShadows[component] as any)[variant];
    if (!shadow) return shadows.none;
    
    // For focus shadows, return theme-appropriate version
    if (variant.includes('focus')) {
      return theme === 'dark' ? 
        shadow.replace(/hsla\(252, 70%, 50%, 0\.25\)/g, shadowColors.dark.accent) :
        shadow;
    }
    
    return shadow;
  },

  /**
   * Create custom shadow with specified color
   * @param size - Shadow size template
   * @param color - Custom shadow color
   * @returns Shadow string
   */
  createCustomShadow: (size: keyof typeof shadows, color: string): string => {
    return shadows[size].replace(/hsla\([^)]+\)/g, color);
  },
};

export type ShadowSize = keyof typeof shadows;
export type FocusShadowType = keyof typeof focusShadows.light;
export type ComponentShadowCategory = keyof typeof componentShadows;
export type GlowEffectType = keyof typeof glowEffects.light;