'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeInitializer() {
  useEffect(() => {
    // Single initialization call - prevents double fetches
    const initialize = async () => {
      const state = useThemeStore.getState();
      
      // Step 1: Apply globals.css defaults first
      state.applyDefaultsFromCss();
      
      // Step 2: Then fetch and apply database palette (if any)
      // This will override CSS defaults if a palette is set
      // fetchActivePalette has internal guards against double fetching
      await state.fetchActivePalette();
    };

    initialize();
  }, []);  // Empty deps: only run once on mount

  return null;
}
