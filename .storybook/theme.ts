import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  
  // Brand
  brandTitle: 'Nivexa Design System',
  brandUrl: 'https://nivexa.com',
  brandImage: '/nivexa-logo.png',
  brandTarget: '_self',
  
  // Colors - Using Nivexa's color palette
  colorPrimary: '#8B5CF6', // Purple
  colorSecondary: '#10B981', // Green
  
  // UI
  appBg: '#F9FAFB',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E5E7EB',
  appBorderRadius: 8,
  
  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace',
  
  // Text colors
  textColor: '#111827',
  textInverseColor: '#F9FAFB',
  textMutedColor: '#6B7280',
  
  // Toolbar colors
  barTextColor: '#6B7280',
  barHoverColor: '#8B5CF6',
  barSelectedColor: '#8B5CF6',
  barBg: '#FFFFFF',
  
  // Form colors
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputTextColor: '#111827',
  inputBorderRadius: 6,
});

export const darkTheme = create({
  base: 'dark',
  
  // Brand
  brandTitle: 'Nivexa Design System',
  brandUrl: 'https://nivexa.com',
  brandImage: '/nivexa-logo-dark.png',
  brandTarget: '_self',
  
  // Colors - Dark theme
  colorPrimary: '#A78BFA', // Light Purple
  colorSecondary: '#34D399', // Light Green
  
  // UI
  appBg: '#111827',
  appContentBg: '#1F2937',
  appBorderColor: '#374151',
  appBorderRadius: 8,
  
  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace',
  
  // Text colors
  textColor: '#F9FAFB',
  textInverseColor: '#111827',
  textMutedColor: '#9CA3AF',
  
  // Toolbar colors
  barTextColor: '#D1D5DB',
  barHoverColor: '#A78BFA',
  barSelectedColor: '#A78BFA',
  barBg: '#1F2937',
  
  // Form colors
  inputBg: '#1F2937',
  inputBorder: '#4B5563',
  inputTextColor: '#F9FAFB',
  inputBorderRadius: 6,
});