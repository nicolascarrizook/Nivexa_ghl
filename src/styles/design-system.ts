/**
 * Nivexa Design System
 * Ultra-minimalist design system based on ProjectDetailsPage patterns
 */

// Design Tokens
export const designTokens = {
  // Color Palette - Pure grays only
  colors: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6', 
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },

  // Typography Scale - System fonts for professional look
  typography: {
    fontFamily: {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px', 
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5', 
      relaxed: '1.625',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
    }
  },

  // Spacing System - 4px base unit
  spacing: {
    0: '0px',
    1: '4px',   // 0.25rem
    2: '8px',   // 0.5rem
    3: '12px',  // 0.75rem
    4: '16px',  // 1rem
    5: '20px',  // 1.25rem
    6: '24px',  // 1.5rem
    8: '32px',  // 2rem
    10: '40px', // 2.5rem
    12: '48px', // 3rem
    16: '64px', // 4rem
    20: '80px', // 5rem
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
  },

  // Shadows - None for ultra-minimal look
  shadows: {
    none: 'none',
    subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out', // Primary transition from ProjectDetailsPage
    slow: '500ms ease-in-out',
  }
} as const;

// Component Variants
export const componentVariants = {
  // Text Variants
  text: {
    // Headings
    'heading-xl': {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      letterSpacing: designTokens.typography.letterSpacing.tight,
      color: designTokens.colors.gray[900],
    },
    'heading-lg': {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      letterSpacing: designTokens.typography.letterSpacing.tight,
      color: designTokens.colors.gray[900],
    },
    'heading-md': {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      color: designTokens.colors.gray[900],
    },
    'heading-sm': {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      color: designTokens.colors.gray[900],
    },
    
    // Body text
    'body-lg': {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
      color: designTokens.colors.gray[700],
    },
    'body-md': {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
      color: designTokens.colors.gray[700],
    },
    'body-sm': {
      fontSize: designTokens.typography.fontSize.xs,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
      color: designTokens.colors.gray[600],
    },

    // Labels
    'label-lg': {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      color: designTokens.colors.gray[700],
    },
    'label-sm': {
      fontSize: designTokens.typography.fontSize.xs,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.tight,
      color: designTokens.colors.gray[500],
      textTransform: 'uppercase' as const,
      letterSpacing: designTokens.typography.letterSpacing.wide,
    },

    // Muted text
    'muted': {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
      color: designTokens.colors.gray[500],
    }
  },

  // Button Variants (based on ProjectDetailsPage patterns)
  button: {
    primary: {
      backgroundColor: designTokens.colors.gray[900],
      color: designTokens.colors.white,
      border: `1px solid ${designTokens.colors.gray[900]}`,
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      borderRadius: designTokens.borderRadius.base,
      transition: designTokens.transitions.normal,
      ':hover': {
        backgroundColor: designTokens.colors.gray[800],
      }
    },
    secondary: {
      backgroundColor: designTokens.colors.white,
      color: designTokens.colors.gray[700],
      border: `1px solid ${designTokens.colors.gray[300]}`,
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      borderRadius: designTokens.borderRadius.base,
      transition: designTokens.transitions.normal,
      ':hover': {
        backgroundColor: designTokens.colors.gray[50],
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: designTokens.colors.gray[500],
      border: 'none',
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      borderRadius: designTokens.borderRadius.base,
      transition: designTokens.transitions.normal,
      ':hover': {
        color: designTokens.colors.gray[700],
        backgroundColor: designTokens.colors.gray[100],
      }
    }
  },

  // Card Variants
  card: {
    default: {
      backgroundColor: designTokens.colors.white,
      border: `1px solid ${designTokens.colors.gray[200]}`,
      borderRadius: designTokens.borderRadius.base,
      padding: designTokens.spacing[6],
    },
    compact: {
      backgroundColor: designTokens.colors.white,
      border: `1px solid ${designTokens.colors.gray[200]}`,
      borderRadius: designTokens.borderRadius.base,
      padding: designTokens.spacing[4],
    },
    bordered: {
      backgroundColor: designTokens.colors.white,
      border: `1px solid ${designTokens.colors.gray[200]}`,
      borderRadius: designTokens.borderRadius.base,
      padding: designTokens.spacing[6],
    }
  },

  // Status Indicators
  status: {
    active: {
      backgroundColor: designTokens.colors.gray[100],
      color: designTokens.colors.gray[600],
      padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.xs,
      fontWeight: designTokens.typography.fontWeight.medium,
      borderRadius: designTokens.borderRadius.base,
    },
    completed: {
      backgroundColor: designTokens.colors.gray[100],
      color: designTokens.colors.gray[600],
      padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.xs,
      fontWeight: designTokens.typography.fontWeight.medium,
      borderRadius: designTokens.borderRadius.base,
    }
  }
} as const;

// Loading State Patterns
export const loadingPatterns = {
  skeleton: {
    backgroundColor: designTokens.colors.gray[200],
    borderRadius: designTokens.borderRadius.base,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  shimmer: {
    background: `linear-gradient(90deg, ${designTokens.colors.gray[200]} 0%, ${designTokens.colors.gray[100]} 50%, ${designTokens.colors.gray[200]} 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  }
} as const;

// Layout Patterns
export const layoutPatterns = {
  page: {
    backgroundColor: designTokens.colors.white,
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1280px', // 7xl equivalent
    margin: '0 auto',
    paddingLeft: designTokens.spacing[6],
    paddingRight: designTokens.spacing[6],
  },
  section: {
    paddingTop: designTokens.spacing[8],
    paddingBottom: designTokens.spacing[8],
  },
  divider: {
    height: '1px',
    backgroundColor: designTokens.colors.gray[200],
    border: 'none',
  }
} as const;

// Utility Functions
export const utils = {
  // Generate CSS custom properties
  generateCSSCustomProperties: () => {
    const properties: Record<string, string> = {};
    
    // Colors
    Object.entries(designTokens.colors.gray).forEach(([key, value]) => {
      properties[`--color-gray-${key}`] = value;
    });
    properties['--color-white'] = designTokens.colors.white;

    // Typography
    Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
      properties[`--font-size-${key}`] = value;
    });

    // Spacing
    Object.entries(designTokens.spacing).forEach(([key, value]) => {
      properties[`--spacing-${key}`] = value;
    });

    // Transitions
    Object.entries(designTokens.transitions).forEach(([key, value]) => {
      properties[`--transition-${key}`] = value;
    });

    return properties;
  },

  // Get component variant styles
  getComponentVariant: (component: keyof typeof componentVariants, variant: string) => {
    // @ts-ignore - Dynamic access needed
    return componentVariants[component]?.[variant] || {};
  },

  // Build className helper
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
  }
};

export default designTokens;