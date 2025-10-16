/**
 * Design System Tokens for Projects Module
 * Centralizes all design decisions for consistency across the module
 */

// ===== COLOR TOKENS =====
export const COLORS = {
  // Status colors - unified across all components
  status: {
    success: {
      background: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      hover: 'hover:bg-green-100',
    },
    warning: {
      background: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      hover: 'hover:bg-yellow-100',
    },
    error: {
      background: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      hover: 'hover:bg-red-100',
    },
    info: {
      background: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      hover: 'hover:bg-blue-100',
    },
    neutral: {
      background: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-700',
      hover: 'hover:bg-gray-100',
    },
  },

  // Project health indicators
  health: {
    optimal: {
      color: '#10B981', // green-500
      background: 'bg-green-50',
      text: 'text-green-700',
      icon: '●',
    },
    healthy: {
      color: '#22C55E', // green-500 lighter
      background: 'bg-green-50',
      text: 'text-green-600',
      icon: '●',
    },
    attention: {
      color: '#F59E0B', // amber-500
      background: 'bg-amber-50',
      text: 'text-amber-700',
      icon: '⚠',
    },
    critical: {
      color: '#EF4444', // red-500
      background: 'bg-red-50',
      text: 'text-red-700',
      icon: '○',
    },
    deficit: {
      color: '#DC2626', // red-600
      background: 'bg-red-100',
      text: 'text-red-800',
      icon: '●',
    },
  },

  // Primary brand colors
  primary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
} as const;

// ===== SPACING TOKENS =====
export const SPACING = {
  // Card padding
  card: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Gap between elements
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  // Margin utilities
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
} as const;

// ===== TYPOGRAPHY TOKENS =====
export const TYPOGRAPHY = {
  // Headings
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-semibold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-medium text-gray-900',
  h5: 'text-base font-medium text-gray-900',

  // Body text
  body: {
    lg: 'text-base text-gray-700',
    md: 'text-sm text-gray-700',
    sm: 'text-xs text-gray-600',
  },

  // Labels
  label: {
    lg: 'text-sm font-medium text-gray-700',
    md: 'text-xs font-medium text-gray-700',
    sm: 'text-xs font-medium text-gray-600',
  },

  // Special text
  muted: 'text-sm text-gray-500',
  caption: 'text-xs text-gray-500',
  link: 'text-sm text-blue-600 hover:text-blue-700 underline',
} as const;

// ===== BORDER RADIUS TOKENS =====
export const RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

// ===== SHADOW TOKENS =====
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
} as const;

// ===== COMPONENT-SPECIFIC TOKENS =====

// Badge variants
export const BADGE_VARIANTS = {
  // Project status badges
  projectStatus: {
    active: {
      label: 'Activo',
      variant: COLORS.status.success.badge,
    },
    completed: {
      label: 'Completado',
      variant: COLORS.status.neutral.badge,
    },
    paused: {
      label: 'Pausado',
      variant: COLORS.status.warning.badge,
    },
    cancelled: {
      label: 'Cancelado',
      variant: COLORS.status.error.badge,
    },
    draft: {
      label: 'Borrador',
      variant: COLORS.status.neutral.badge,
    },
  },

  // Payment/Installment status badges
  paymentStatus: {
    paid: {
      label: 'Pagado',
      variant: COLORS.status.success.badge,
    },
    pending: {
      label: 'Pendiente',
      variant: COLORS.status.warning.badge,
    },
    overdue: {
      label: 'Vencido',
      variant: COLORS.status.error.badge,
    },
    cancelled: {
      label: 'Cancelado',
      variant: COLORS.status.neutral.badge,
    },
  },
} as const;

// Card variants
export const CARD_VARIANTS = {
  default: `${RADIUS.lg} ${SHADOWS.sm} bg-white border border-gray-200`,
  elevated: `${RADIUS.xl} ${SHADOWS.lg} bg-white border border-gray-200`,
  flat: `${RADIUS.lg} bg-gray-50 border border-gray-200`,
  outlined: `${RADIUS.lg} border-2 border-gray-300 bg-white`,
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
} as const;

// Animation tokens
export const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
  hover: {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-lg',
  },
} as const;

// Health calculation thresholds
export const HEALTH_THRESHOLDS = {
  cashFlow: {
    optimal: 0.8,      // >80% balance/income
    healthy: 0.5,      // 50-80%
    attention: 0.2,    // 20-50%
    critical: 0,       // 0-20%
    deficit: -0.01,    // <0 (negative)
  },
  progress: {
    onTrack: 0.9,      // Progress >= 90% of expected
    slight: 0.75,      // 75-90%
    significant: 0.5,  // 50-75%
    severe: 0,         // <50%
  },
} as const;

// Helper function to get health status
export function getCashFlowHealth(
  currentBalance: number,
  totalIncome: number
): keyof typeof COLORS.health {
  if (currentBalance < 0) return 'deficit';
  if (totalIncome === 0) return 'neutral' as any;

  const ratio = currentBalance / totalIncome;

  if (ratio >= HEALTH_THRESHOLDS.cashFlow.optimal) return 'optimal';
  if (ratio >= HEALTH_THRESHOLDS.cashFlow.healthy) return 'healthy';
  if (ratio >= HEALTH_THRESHOLDS.cashFlow.attention) return 'attention';
  return 'critical';
}

// Helper function to get status badge config
export function getProjectStatusBadge(status: string) {
  const statusLower = status.toLowerCase() as keyof typeof BADGE_VARIANTS.projectStatus;
  return BADGE_VARIANTS.projectStatus[statusLower] || BADGE_VARIANTS.projectStatus.draft;
}

export function getPaymentStatusBadge(status: string) {
  const statusLower = status.toLowerCase() as keyof typeof BADGE_VARIANTS.paymentStatus;
  return BADGE_VARIANTS.paymentStatus[statusLower] || BADGE_VARIANTS.paymentStatus.pending;
}
