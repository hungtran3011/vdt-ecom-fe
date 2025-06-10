// Material Design color utility for shorter Tailwind class names
export const md = {
  // Primary colors
  primary: 'var(--md-sys-color-primary)',
  onPrimary: 'var(--md-sys-color-on-primary)',
  primaryContainer: 'var(--md-sys-color-primary-container)',
  onPrimaryContainer: 'var(--md-sys-color-on-primary-container)',
  
  // Secondary colors
  secondary: 'var(--md-sys-color-secondary)',
  onSecondary: 'var(--md-sys-color-on-secondary)',
  secondaryContainer: 'var(--md-sys-color-secondary-container)',
  onSecondaryContainer: 'var(--md-sys-color-on-secondary-container)',
  
  // Tertiary colors
  tertiary: 'var(--md-sys-color-tertiary)',
  onTertiary: 'var(--md-sys-color-on-tertiary)',
  tertiaryContainer: 'var(--md-sys-color-tertiary-container)',
  onTertiaryContainer: 'var(--md-sys-color-on-tertiary-container)',
  
  // Error colors
  error: 'var(--md-sys-color-error)',
  onError: 'var(--md-sys-color-on-error)',
  errorContainer: 'var(--md-sys-color-error-container)',
  onErrorContainer: 'var(--md-sys-color-on-error-container)',
  
  // Surface colors
  background: 'var(--md-sys-color-background)',
  onBackground: 'var(--md-sys-color-on-background)',
  surface: 'var(--md-sys-color-surface)',
  onSurface: 'var(--md-sys-color-on-surface)',
  surfaceVariant: 'var(--md-sys-color-surface-variant)',
  onSurfaceVariant: 'var(--md-sys-color-on-surface-variant)',
  surfaceContainer: 'var(--md-sys-color-surface-container)',
  surfaceContainerHigh: 'var(--md-sys-color-surface-container-high)',
  surfaceContainerHighest: 'var(--md-sys-color-surface-container-highest)',
  surfaceContainerLow: 'var(--md-sys-color-surface-container-low)',
  surfaceContainerLowest: 'var(--md-sys-color-surface-container-lowest)',
  
  // Other colors
  outline: 'var(--md-sys-color-outline)',
  outlineVariant: 'var(--md-sys-color-outline-variant)',
  shadow: 'var(--md-sys-color-shadow)',
  scrim: 'var(--md-sys-color-scrim)',
  inverseSurface: 'var(--md-sys-color-inverse-surface)',
  inverseOnSurface: 'var(--md-sys-color-inverse-on-surface)',
  inversePrimary: 'var(--md-sys-color-inverse-primary)',
  surfaceTint: 'var(--md-sys-color-surface-tint)',
};

// Helper function to create style objects with shorter syntax
export const mdBg = (color: keyof typeof md) => ({ backgroundColor: md[color] });
export const mdText = (color: keyof typeof md) => ({ color: md[color] });
export const mdBorder = (color: keyof typeof md) => ({ borderColor: md[color] });
