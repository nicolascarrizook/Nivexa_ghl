/**
 * Nivexa CRM Design System - Foundation Tokens
 * 
 * Complete design token export for the Nivexa CRM design system.
 * This serves as the single source of truth for all design tokens.
 */

// Core design tokens
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';
export * from './shadows';
export * from './radii';

// Re-export main token objects for convenience
export { colors, semanticColors, darkModeColors, cssCustomProperties as colorCssProperties } from './colors';
export { typography, typographyScale, typographyCssProperties } from './typography';
export { spacing, semanticSpacing, componentSpacing, spacingCssProperties } from './spacing';
export { durations, easings, transitions, componentAnimations, animationCssProperties } from './animations';
export { shadows, darkShadows, focusShadows, componentShadows, shadowCssProperties } from './shadows';
export { radii, componentRadii, radiusCombinations, radiiCssProperties } from './radii';

/**
 * Complete design system tokens object
 * Use this for programmatic access to all tokens
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { durations, easings } from './animations';
import { shadows } from './shadows';
import { radii } from './radii';

export const designTokens = {
  colors,
  typography,
  spacing,
  animations: {
    durations,
    easings,
  },
  shadows,
  radii,
} as const;

/**
 * All CSS custom properties combined
 * Use this to inject all design tokens into your CSS
 */
import { cssCustomProperties as colorProps } from './colors';
import { typographyCssProperties } from './typography';
import { spacingCssProperties } from './spacing';
import { animationCssProperties } from './animations';
import { shadowCssProperties } from './shadows';
import { radiiCssProperties } from './radii';

export const allCssProperties = {
  ...colorProps,
  ...typographyCssProperties,
  ...spacingCssProperties,
  ...animationCssProperties,
  ...shadowCssProperties,
  ...radiiCssProperties,
} as const;

/**
 * Theme configuration object
 * Contains all theme-related tokens and utilities
 */
export const theme = {
  // Core tokens
  tokens: designTokens,
  
  // CSS properties for injection
  cssProperties: allCssProperties,
  
  // Theme modes
  modes: {
    light: 'light',
    dark: 'dark',
  } as const,
  
  // Density modes
  density: {
    compact: 'compact',
    normal: 'normal',
    comfortable: 'comfortable',
  } as const,
} as const;

/**
 * Type definitions for design tokens
 */
export type Theme = typeof theme;
export type ThemeMode = keyof typeof theme.modes;
export type ThemeDensity = keyof typeof theme.density;
export type DesignTokens = typeof designTokens;

/**
 * Utility function to create CSS custom properties string
 * @param properties - CSS properties object
 * @returns CSS string with custom properties
 */
export function createCssCustomProperties(properties: Record<string, any>): string {
  const cssStrings: string[] = [];
  
  Object.entries(properties).forEach(([selector, props]) => {
    const propStrings = Object.entries(props).map(
      ([prop, value]) => `  ${prop}: ${value};`
    );
    
    cssStrings.push(`${selector} {\n${propStrings.join('\n')}\n}`);
  });
  
  return cssStrings.join('\n\n');
}

/**
 * Utility function to inject design tokens into document head
 * @param customProperties - Optional custom properties to merge
 */
export function injectDesignTokens(customProperties?: Record<string, any>): void {
  const properties = customProperties 
    ? { ...allCssProperties, ...customProperties }
    : allCssProperties;
  
  const css = createCssCustomProperties(properties);
  
  // Remove existing design token styles
  const existingStyle = document.getElementById('nivexa-design-tokens');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and inject new style element
  const style = document.createElement('style');
  style.id = 'nivexa-design-tokens';
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Utility function to get token value by path
 * @param path - Dot notation path to token (e.g., 'colors.primary.500')
 * @returns Token value or undefined
 */
export function getToken(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], designTokens);
}

/**
 * Utility function to validate token path
 * @param path - Dot notation path to token
 * @returns Boolean indicating if path exists
 */
export function hasToken(path: string): boolean {
  return getToken(path) !== undefined;
}

/**
 * Default export for convenience
 */
export default theme;