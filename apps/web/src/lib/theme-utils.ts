import { ColorPalette } from '@/types/theme';

/**
 * Convert color palette to CSS variables string
 * Can be used for generating Tailwind config or CSS files
 */
export function generateCSSVariables(palette: ColorPalette): string {
  return `
:root {
  --primary: ${palette.primary};
  --primary-foreground: ${palette.cardForeground};
  --secondary: ${palette.secondary};
  --secondary-foreground: ${palette.cardForeground};
  --destructive: ${palette.destructive};
  --destructive-foreground: #ffffff;
  --muted: ${palette.muted};
  --muted-foreground: ${palette.cardForeground};
  --accent: ${palette.accent};
  --accent-foreground: #ffffff;
  --foreground: ${palette.foreground};
  --background: ${palette.background};
  --card: ${palette.card};
  --card-foreground: ${palette.cardForeground};
  --popover: ${palette.popover};
  --popover-foreground: ${palette.popoverForeground};
  --border: ${palette.border};
  --input: ${palette.input};
  --ring: ${palette.ring};
  --chart-1: ${palette.chartOne};
  --chart-2: ${palette.chartTwo};
  --chart-3: ${palette.chartThree};
  --chart-4: ${palette.chartFour};
  --chart-5: ${palette.chartFive};
}
  `.trim();
}

/**
 * Export palette as JSON for backup/import
 */
export function exportPaletteAsJSON(palette: ColorPalette): string {
  return JSON.stringify(palette, null, 2);
}

/**
 * Export palette as JavaScript object
 */
export function exportPaletteAsJS(palette: ColorPalette): string {
  return `export const ${palette.name.replace(/\s+/g, '')}Palette = ${JSON.stringify(palette, null, 2)};`;
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generate complementary color
 */
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const r = 255 - rgb.r;
  const g = 255 - rgb.g;
  const b = 255 - rgb.b;

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/**
 * Generate contrasting text color (black or white)
 */
export function getContrastingTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return luminance > 128 ? '#000000' : '#FFFFFF';
}
