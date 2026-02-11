/**
 * Extract CSS variables from the computed document style
 * Reads current values from globals.css or inline styles
 */
export function extractComputedColors(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const colorVariables = [
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'destructive',
    'destructive-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'foreground',
    'background',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'border',
    'input',
    'ring',
  ];

  const colors: Record<string, string> = {};

  colorVariables.forEach((varName) => {
    const value = computedStyle.getPropertyValue(`--${varName}`).trim();
    if (value) {
      colors[varName] = value;
    }
  });

  return colors;
}

/**
 * Get the current mode (light or dark)
 */
export function getCurrentThemeMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Apply color palette to CSS variables while preserving globals.css structure
 * This merges palette colors with existing CSS without overwriting everything
 */
export function applyColorsToCSSVariables(
  colors: Record<string, string>
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Map palette field names to CSS variable names
  const mappings: Record<string, string> = {
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    foreground: '--foreground',
    background: '--background',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    chartOne: '--chart-1',
    chartTwo: '--chart-2',
    chartThree: '--chart-3',
    chartFour: '--chart-4',
    chartFive: '--chart-5',
  };

  // Apply only the colors that are provided, preserve others
  Object.entries(mappings).forEach(([paletteKey, cssVar]) => {
    const value = colors[paletteKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  });
}

/**
 * Get color value from CSS (either from globals.css or overrides)
 * Useful for reading current applied colors
 */
export function getCSSVariable(varName: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}
