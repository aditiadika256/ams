import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorPalette, ColorPaletteFormData, DEFAULT_PALETTE } from '@/types/theme';
import { applyColorsToCSSVariables, extractComputedColors } from '@/lib/css-extractor';

interface ThemeState {
  palette: ColorPalette | null;
  palettes: ColorPalette[];
  isLoading: boolean;
  error: string | null;
  appliedFromCss: boolean; // Track if CSS was applied first
  _isFetching: boolean; // Internal flag to prevent double fetches

  // Actions
  setPalette: (palette: ColorPalette) => void;
  setPalettes: (palettes: ColorPalette[]) => void;
  createPalette: (data: ColorPaletteFormData) => Promise<void>;
  updatePalette: (id: string, data: ColorPaletteFormData) => Promise<void>;
  deletePalette: (id: string) => Promise<void>;
  setDefaultPalette: (id: string) => Promise<void>;
  fetchPalettes: () => Promise<void>;
  fetchActivePalette: () => Promise<void>;
  applyPaletteToDom: (palette: ColorPalette) => void;
  applyDefaultsFromCss: () => void; // New: apply CSS defaults first
  clearError: () => void;
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to get API headers
const getApiHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to convert HSL string to hex
// Input: "243.8 90.5% 58.2%" → Output: "#5b61f5"
const hslToHex = (hslString: string): string => {
  const parts = hslString.trim().split(/[\s%]+/).filter(p => p);
  if (parts.length < 3) return '#000000';

  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1]) / 100;
  let l = parseFloat(parts[2]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let r = 0, g = 0, b = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r = c; g = x;
  } else if (hPrime >= 1 && hPrime < 2) {
    r = x; g = c;
  } else if (hPrime >= 2 && hPrime < 3) {
    g = c; b = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    g = x; b = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r = x; b = c;
  } else if (hPrime >= 5 && hPrime <= 6) {
    r = c; b = x;
  }

  const m = l - c / 2;
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
};

// Helper function to extract CSS variables from computed style
const extractCssVariables = (): Record<string, string> => {
  if (typeof document === 'undefined') return {};

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const isDarkMode = document.documentElement.classList.contains('dark');

  const cssVarNames = [
    'primary', 'secondary', 'destructive', 'muted', 'accent',
    'foreground', 'background', 'card', 'card-foreground',
    'popover', 'popover-foreground', 'border', 'input', 'ring'
  ];

  const variables: Record<string, string> = {};

  cssVarNames.forEach(name => {
    const value = computedStyle.getPropertyValue(`--${name}`).trim();
    if (value) {
      // Convert HSL to hex
      variables[name] = hslToHex(value);
    }
  });

  return variables;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      palette: null,
      palettes: [],
      isLoading: false,
      error: null,
      appliedFromCss: false,
      _isFetching: false,

      setPalette: (palette: ColorPalette) => {
        set({ palette });
        get().applyPaletteToDom(palette);
      },

      setPalettes: (palettes: ColorPalette[]) => set({ palettes }),

      createPalette: async (data: ColorPaletteFormData) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/admin/theme/palettes`, {
            method: 'POST',
            headers: getApiHeaders(true),
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create palette');
          }
          const newPalette = await response.json();
          set((state) => ({
            palettes: [...state.palettes, newPalette],
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Create palette error:', errorMsg);
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw error;
        }
      },

      updatePalette: async (id: string, data: ColorPaletteFormData) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/admin/theme/palettes/${id}`, {
            method: 'PUT',
            headers: getApiHeaders(true),
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update palette');
          }
          const updated = await response.json();
          set((state) => ({
            palette: state.palette?.id === id ? updated : state.palette,
            palettes: state.palettes.map((p) => (p.id === id ? updated : p)),
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Update palette error:', errorMsg);
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw error;
        }
      },

      deletePalette: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/admin/theme/palettes/${id}`, {
            method: 'DELETE',
            headers: getApiHeaders(true),
          });
          if (!response.ok) throw new Error('Failed to delete palette');
          set((state) => ({
            palettes: state.palettes.filter((p) => p.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      setDefaultPalette: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/admin/theme/palettes/${id}/default`, {
            method: 'POST',
            headers: getApiHeaders(true),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to set default palette');
          }
          const updated = await response.json();
          set((state) => ({
            palette: updated,
            palettes: state.palettes.map((p) => ({
              ...p,
              isDefault: p.id === id,
            })),
            isLoading: false,
          }));
          // Apply theme changes immediately
          Promise.resolve().then(() => get().applyPaletteToDom(updated));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Set default palette error:', errorMsg);
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw error;
        }
      },

      fetchPalettes: async () => {
        // Prevent concurrent fetches
        if (get()._isFetching) return;
        
        set({ isLoading: true, error: null, _isFetching: true });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/admin/theme/palettes`, {
            headers: getApiHeaders(true),
          });
          if (!response.ok) throw new Error('Failed to fetch palettes');
          const data = await response.json();
          set({ palettes: data, isLoading: false, _isFetching: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
            _isFetching: false,
          });
        }
      },

      fetchActivePalette: async () => {
        // Prevent concurrent fetches of active palette
        const state = get();
        if (state._isFetching || state.palette !== null) return;
        
        set({ isLoading: true, error: null, _isFetching: true });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/theme/palettes/active`);
          if (!response.ok) throw new Error('Failed to fetch active palette');
          const data = await response.json();
          set({ palette: data, isLoading: false, _isFetching: false });
          // Defer DOM application to next microtask to avoid race conditions
          Promise.resolve().then(() => get().applyPaletteToDom(data));
        } catch (error) {
          const fallbackPalette = {
            id: 'default',
            ...DEFAULT_PALETTE,
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
            palette: fallbackPalette,
            _isFetching: false,
          });
          // Defer DOM application to next microtask
          Promise.resolve().then(() => get().applyPaletteToDom(fallbackPalette));
        }
      },

      applyDefaultsFromCss: () => {
        // Extract current CSS variable values from globals.css
        const cssColors = extractComputedColors();
        
        if (Object.keys(cssColors).length > 0) {
          // Apply the CSS defaults to state for reference
          set({ appliedFromCss: true });
          // CSS is already applied via globals.css, nothing to inject
        }
      },

      applyPaletteToDom: (palette: ColorPalette) => {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        
        // Map palette fields to CSS variable names
        // Convert palette field names to CSS variable format
        const colorMap: Record<string, string> = {
          '--primary': palette.primary,
          '--primary-foreground': palette.cardForeground,
          '--secondary': palette.secondary,
          '--secondary-foreground': palette.cardForeground,
          '--destructive': palette.destructive,
          '--destructive-foreground': '#ffffff',
          '--muted': palette.muted,
          '--muted-foreground': palette.cardForeground,
          '--accent': palette.accent,
          '--accent-foreground': '#ffffff',
          '--foreground': palette.foreground,
          '--background': palette.background,
          '--card': palette.card,
          '--card-foreground': palette.cardForeground,
          '--popover': palette.popover,
          '--popover-foreground': palette.popoverForeground,
          '--border': palette.border,
          '--input': palette.input,
          '--ring': palette.ring,
          '--chart-1': palette.chartOne,
          '--chart-2': palette.chartTwo,
          '--chart-3': palette.chartThree,
          '--chart-4': palette.chartFour,
          '--chart-5': palette.chartFive,
        };

        // Apply hex colors directly to CSS variables using the utility
        applyColorsToCSSVariables(colorMap);
        
        // Store palette ID for reference
        localStorage.setItem('applied-palette-id', palette.id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
