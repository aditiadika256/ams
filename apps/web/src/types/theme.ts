export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  destructive: string;
  muted: string;
  accent: string;
  foreground: string;
  background: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
  chartOne: string;
  chartTwo: string;
  chartThree: string;
  chartFour: string;
  chartFive: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ColorPaletteFormData {
  name: string;
  primary: string;
  secondary: string;
  destructive: string;
  muted: string;
  accent: string;
  foreground: string;
  background: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
  chartOne: string;
  chartTwo: string;
  chartThree: string;
  chartFour: string;
  chartFive: string;
}

export const DEFAULT_PALETTE: ColorPaletteFormData = {
  name: 'Default',
  primary: '#5b61f5',
  secondary: '#eaf2fd',
  destructive: '#f93a3a',
  muted: '#b0b9d1',
  accent: '#06b6d4',
  foreground: '#0f1419',
  background: '#f5fafd',
  card: '#ffffff',
  cardForeground: '#0f1419',
  popover: '#ffffff',
  popoverForeground: '#0f1419',
  border: '#dce5ed',
  input: '#dce5ed',
  ring: '#5b61f5',
  chartOne: '#5b61f5',
  chartTwo: '#a855f7',
  chartThree: '#ec4899',
  chartFour: '#f59e0b',
  chartFive: '#10b981',
};
