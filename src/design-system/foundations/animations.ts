/**
 * Nivexa CRM Design System - Animation Tokens
 * 
 * Animation system with durations, easings, and transitions optimized for
 * modern CRM interfaces. Emphasizes performance and accessibility.
 */

/**
 * Animation durations
 * Carefully chosen durations for different types of animations
 */
export const durations = {
  /** 75ms - Instant feedback, micro-interactions */
  instant: '75ms',
  /** 150ms - Fast transitions, hover states */
  fast: '150ms',
  /** 200ms - Standard UI transitions */
  normal: '200ms',
  /** 300ms - Moderate transitions, modals */
  moderate: '300ms',
  /** 500ms - Slow transitions, page changes */
  slow: '500ms',
  /** 700ms - Very slow, complex animations */
  slower: '700ms',
  /** 1000ms - Maximum duration for UI animations */
  slowest: '1000ms',
} as const;

/**
 * Easing functions
 * Physics-based easings for natural motion
 */
export const easings = {
  /** Linear easing - constant speed */
  linear: 'cubic-bezier(0, 0, 1, 1)',
  
  /** Standard ease - default for most interactions */
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  /** Ease in - starts slow, accelerates */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  /** Ease out - starts fast, decelerates */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  
  /** Ease in-out - slow start and end */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  /** Sharp - quick and decisive */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  
  /** Spring - bouncy, energetic */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
  /** Bounce - playful bounce effect */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  /** Anticipate - slight reverse before forward motion */
  anticipate: 'cubic-bezier(0.175, 0.885, 0.32, 1.075)',
  
  /** Emphasized - material design emphasized easing */
  emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  
  /** Decelerated - material design decelerated easing */
  decelerated: 'cubic-bezier(0, 0, 0.2, 1)',
  
  /** Accelerated - material design accelerated easing */
  accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/**
 * Common transition presets
 * Pre-configured transitions for common use cases
 */
export const transitions = {
  /** All properties with standard easing */
  all: `all ${durations.normal} ${easings.ease}`,
  
  /** Color transitions for theme changes */
  colors: `color ${durations.fast} ${easings.ease}, background-color ${durations.fast} ${easings.ease}, border-color ${durations.fast} ${easings.ease}`,
  
  /** Transform transitions for animations */
  transform: `transform ${durations.normal} ${easings.ease}`,
  
  /** Opacity transitions for fade effects */
  opacity: `opacity ${durations.normal} ${easings.ease}`,
  
  /** Size transitions for responsive elements */
  size: `width ${durations.normal} ${easings.ease}, height ${durations.normal} ${easings.ease}`,
  
  /** Position transitions for layout changes */
  position: `top ${durations.normal} ${easings.ease}, right ${durations.normal} ${easings.ease}, bottom ${durations.normal} ${easings.ease}, left ${durations.normal} ${easings.ease}`,
  
  /** Shadow transitions for elevation changes */
  shadow: `box-shadow ${durations.normal} ${easings.ease}`,
  
  /** Border radius transitions for shape changes */
  borderRadius: `border-radius ${durations.normal} ${easings.ease}`,
  
  /** Fast color changes for interactions */
  colorsFast: `color ${durations.fast} ${easings.ease}, background-color ${durations.fast} ${easings.ease}, border-color ${durations.fast} ${easings.ease}`,
  
  /** Slow comprehensive transitions */
  allSlow: `all ${durations.slow} ${easings.ease}`,
} as const;

/**
 * Component-specific animation presets
 * Optimized animations for common components
 */
export const componentAnimations = {
  /** Button animations */
  button: {
    /** Standard button hover/focus */
    hover: `background-color ${durations.fast} ${easings.ease}, color ${durations.fast} ${easings.ease}, transform ${durations.fast} ${easings.ease}`,
    /** Button press animation */
    press: `transform ${durations.instant} ${easings.sharp}`,
    /** Loading state animation */
    loading: `opacity ${durations.normal} ${easings.ease}`,
  },

  /** Modal animations */
  modal: {
    /** Modal enter animation */
    enter: `opacity ${durations.moderate} ${easings.decelerated}, transform ${durations.moderate} ${easings.decelerated}`,
    /** Modal exit animation */
    exit: `opacity ${durations.fast} ${easings.accelerated}, transform ${durations.fast} ${easings.accelerated}`,
    /** Backdrop animation */
    backdrop: `opacity ${durations.moderate} ${easings.ease}`,
  },

  /** Dropdown animations */
  dropdown: {
    /** Dropdown enter */
    enter: `opacity ${durations.fast} ${easings.decelerated}, transform ${durations.fast} ${easings.decelerated}`,
    /** Dropdown exit */
    exit: `opacity ${durations.instant} ${easings.accelerated}, transform ${durations.instant} ${easings.accelerated}`,
  },

  /** Tooltip animations */
  tooltip: {
    /** Tooltip enter/exit */
    default: `opacity ${durations.fast} ${easings.ease}, transform ${durations.fast} ${easings.ease}`,
  },

  /** Card animations */
  card: {
    /** Card hover elevation */
    hover: `box-shadow ${durations.normal} ${easings.ease}, transform ${durations.normal} ${easings.ease}`,
    /** Card press feedback */
    press: `transform ${durations.instant} ${easings.sharp}`,
  },

  /** Form animations */
  form: {
    /** Input focus state */
    focus: `border-color ${durations.fast} ${easings.ease}, box-shadow ${durations.fast} ${easings.ease}`,
    /** Validation state changes */
    validation: `border-color ${durations.normal} ${easings.ease}, color ${durations.normal} ${easings.ease}`,
    /** Label floating animation */
    label: `transform ${durations.normal} ${easings.ease}, color ${durations.normal} ${easings.ease}`,
  },

  /** Navigation animations */
  navigation: {
    /** Nav item hover */
    item: `background-color ${durations.fast} ${easings.ease}, color ${durations.fast} ${easings.ease}`,
    /** Sidebar slide animation */
    sidebar: `transform ${durations.moderate} ${easings.emphasized}`,
    /** Tab switching */
    tab: `border-color ${durations.fast} ${easings.ease}, color ${durations.fast} ${easings.ease}`,
  },

  /** Loading animations */
  loading: {
    /** Spinner rotation */
    spinner: `transform ${durations.slowest} ${easings.linear}`,
    /** Pulse animation */
    pulse: `opacity ${durations.slow} ${easings.ease}`,
    /** Skeleton shimmer */
    skeleton: `background-position ${durations.slowest} ${easings.ease}`,
  },

  /** Toast notifications */
  toast: {
    /** Toast slide in */
    slideIn: `transform ${durations.moderate} ${easings.spring}, opacity ${durations.moderate} ${easings.ease}`,
    /** Toast slide out */
    slideOut: `transform ${durations.normal} ${easings.accelerated}, opacity ${durations.normal} ${easings.accelerated}`,
  },

  /** Page transitions */
  page: {
    /** Fade transition */
    fade: `opacity ${durations.moderate} ${easings.ease}`,
    /** Slide transition */
    slide: `transform ${durations.moderate} ${easings.emphasized}, opacity ${durations.moderate} ${easings.ease}`,
  },
} as const;

/**
 * Keyframe animations
 * Reusable keyframe animations for complex motion
 */
export const keyframes = {
  /** Fade in animation */
  fadeIn: {
    name: 'fadeIn',
    keyframes: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
  },

  /** Fade out animation */
  fadeOut: {
    name: 'fadeOut',
    keyframes: `
      from { opacity: 1; }
      to { opacity: 0; }
    `,
  },

  /** Slide up animation */
  slideUp: {
    name: 'slideUp',
    keyframes: `
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `,
  },

  /** Slide down animation */
  slideDown: {
    name: 'slideDown',
    keyframes: `
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `,
  },

  /** Scale in animation */
  scaleIn: {
    name: 'scaleIn',
    keyframes: `
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    `,
  },

  /** Scale out animation */
  scaleOut: {
    name: 'scaleOut',
    keyframes: `
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(0.8); opacity: 0; }
    `,
  },

  /** Spin animation */
  spin: {
    name: 'spin',
    keyframes: `
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
  },

  /** Pulse animation */
  pulse: {
    name: 'pulse',
    keyframes: `
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `,
  },

  /** Bounce animation */
  bounce: {
    name: 'bounce',
    keyframes: `
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
      40%, 43% { transform: translate3d(0, -30px, 0); }
      70% { transform: translate3d(0, -15px, 0); }
      90% { transform: translate3d(0, -4px, 0); }
    `,
  },

  /** Shake animation */
  shake: {
    name: 'shake',
    keyframes: `
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    `,
  },

  /** Shimmer animation for skeletons */
  shimmer: {
    name: 'shimmer',
    keyframes: `
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    `,
  },
} as const;

/**
 * Reduced motion preferences
 * Respect user accessibility preferences
 */
export const reducedMotion = {
  /** Safe animations for reduced motion */
  safe: {
    duration: durations.instant,
    easing: easings.ease,
    transition: `opacity ${durations.instant} ${easings.ease}`,
  },
  
  /** Media query for reduced motion */
  mediaQuery: '@media (prefers-reduced-motion: reduce)',
  
  /** CSS for reduced motion */
  css: `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `,
} as const;

/**
 * CSS custom properties for animations
 * Use these in your CSS for consistent animations
 */
export const animationCssProperties = {
  ':root': {
    '--duration-instant': durations.instant,
    '--duration-fast': durations.fast,
    '--duration-normal': durations.normal,
    '--duration-moderate': durations.moderate,
    '--duration-slow': durations.slow,
    '--duration-slower': durations.slower,
    '--duration-slowest': durations.slowest,

    '--easing-linear': easings.linear,
    '--easing-ease': easings.ease,
    '--easing-ease-in': easings.easeIn,
    '--easing-ease-out': easings.easeOut,
    '--easing-ease-in-out': easings.easeInOut,
    '--easing-sharp': easings.sharp,
    '--easing-spring': easings.spring,
    '--easing-bounce': easings.bounce,
    '--easing-emphasized': easings.emphasized,
    '--easing-decelerated': easings.decelerated,
    '--easing-accelerated': easings.accelerated,

    '--transition-all': transitions.all,
    '--transition-colors': transitions.colors,
    '--transition-transform': transitions.transform,
    '--transition-opacity': transitions.opacity,
    '--transition-shadow': transitions.shadow,
  },
} as const;

/**
 * Animation utilities
 */
export const animationUtils = {
  /**
   * Create a transition string
   * @param property - CSS property to transition
   * @param duration - Duration key
   * @param easing - Easing key
   * @returns Transition string
   */
  createTransition: (
    property: string,
    duration: keyof typeof durations = 'normal',
    easing: keyof typeof easings = 'ease'
  ): string => {
    return `${property} ${durations[duration]} ${easings[easing]}`;
  },

  /**
   * Create an animation string
   * @param name - Animation name
   * @param duration - Duration key
   * @param easing - Easing key
   * @param iterationCount - Number of iterations
   * @returns Animation string
   */
  createAnimation: (
    name: string,
    duration: keyof typeof durations = 'normal',
    easing: keyof typeof easings = 'ease',
    iterationCount: number | 'infinite' = 1
  ): string => {
    return `${name} ${durations[duration]} ${easings[easing]} ${iterationCount}`;
  },
};

export type AnimationDuration = keyof typeof durations;
export type AnimationEasing = keyof typeof easings;
export type AnimationTransition = keyof typeof transitions;
export type ComponentAnimationType = keyof typeof componentAnimations;