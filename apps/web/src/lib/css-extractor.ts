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
 * Apply color values to CSS variables on :root.
 * Expects a Record where keys are full CSS variable names (e.g. "--primary")
 * and values are the raw values to set (e.g. "243.8 90.5% 58.2%").
 */
export function applyColorsToCSSVariables(
  colors: Record<string, string>
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  Object.entries(colors).forEach(([cssVar, value]) => {
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
