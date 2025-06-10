/**
 * Material Design Tailwind Utility Classes
 * Provides shorter syntax for Material Design colors
 */

// Type for Material Design color tokens
export type MDColorToken = 
  | 'primary'
  | 'on-primary'
  | 'primary-container'
  | 'on-primary-container'
  | 'secondary'
  | 'on-secondary'
  | 'secondary-container'
  | 'on-secondary-container'
  | 'tertiary'
  | 'on-tertiary'
  | 'tertiary-container'
  | 'on-tertiary-container'
  | 'error'
  | 'on-error'
  | 'error-container'
  | 'on-error-container'
  | 'background'
  | 'on-background'
  | 'surface'
  | 'on-surface'
  | 'surface-variant'
  | 'on-surface-variant'
  | 'outline'
  | 'outline-variant'
  | 'shadow'
  | 'scrim'
  | 'inverse-surface'
  | 'inverse-on-surface'
  | 'inverse-primary'
  | 'surface-tint'
  | 'surface-dim'
  | 'surface-bright'
  | 'surface-container-lowest'
  | 'surface-container-low'
  | 'surface-container'
  | 'surface-container-high'
  | 'surface-container-highest';

// Utility function to generate Tailwind classes for Material Design colors
export const md = {
  bg: (token: MDColorToken): string => `bg-[var(--md-sys-color-${token})]`,
  text: (token: MDColorToken): string => `text-[var(--md-sys-color-${token})]`,
  border: (token: MDColorToken): string => `border-[var(--md-sys-color-${token})]`,
  from: (token: MDColorToken): string => `from-[var(--md-sys-color-${token})]`,
  to: (token: MDColorToken): string => `to-[var(--md-sys-color-${token})]`,
  via: (token: MDColorToken): string => `via-[var(--md-sys-color-${token})]`,
  ring: (token: MDColorToken): string => `ring-[var(--md-sys-color-${token})]`,
  divide: (token: MDColorToken): string => `divide-[var(--md-sys-color-${token})]`,
  stroke: (token: MDColorToken): string => `stroke-[var(--md-sys-color-${token})]`,
  fill: (token: MDColorToken): string => `fill-[var(--md-sys-color-${token})]`,
};

// Pre-defined class combinations for common Material Design patterns
export const mdClasses = {
  // Surface containers
  surfaceCard: `${md.bg('surface-container')} ${md.text('on-surface')} rounded-xl shadow-sm`,
  surfaceCardHigh: `${md.bg('surface-container-high')} ${md.text('on-surface')} rounded-xl shadow-sm`,
  surfaceCardHighest: `${md.bg('surface-container-highest')} ${md.text('on-surface')} rounded-xl shadow-sm`,
  
  // Primary buttons
  primaryButton: `${md.bg('primary')} ${md.text('on-primary')} hover:${md.bg('primary')} focus:${md.ring('primary')}`,
  primaryContainerButton: `${md.bg('primary-container')} ${md.text('on-primary-container')} hover:${md.bg('primary-container')} focus:${md.ring('primary-container')}`,
  
  // Secondary buttons
  secondaryButton: `${md.bg('secondary')} ${md.text('on-secondary')} hover:${md.bg('secondary')} focus:${md.ring('secondary')}`,
  secondaryContainerButton: `${md.bg('secondary-container')} ${md.text('on-secondary-container')} hover:${md.bg('secondary-container')} focus:${md.ring('secondary-container')}`,
  
  // Error states
  errorButton: `${md.bg('error')} ${md.text('on-error')} hover:${md.bg('error')} focus:${md.ring('error')}`,
  errorContainer: `${md.bg('error-container')} ${md.text('on-error-container')} rounded-lg p-4`,
  
  // Input fields
  inputField: `${md.bg('surface-container-highest')} ${md.text('on-surface')} ${md.border('outline-variant')} focus:${md.border('outline')}`,
  
  // Page backgrounds
  pageBackground: `${md.bg('background')} ${md.text('on-background')} min-h-screen`,
  surfaceBackground: `${md.bg('surface')} ${md.text('on-surface')} min-h-screen`,
};

// Alternative shorter syntax helper
export const bgMD = (token: MDColorToken) => md.bg(token);
export const textMD = (token: MDColorToken) => md.text(token);
export const borderMD = (token: MDColorToken) => md.border(token);
