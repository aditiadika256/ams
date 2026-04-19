import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import type { Menu } from '@/types/system';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const EMPTY: Menu[] = []; // Stable reference to avoid infinite re-renders

interface MenuCache {
    data: Menu[];
    fetchedAt: number;
}

interface MenuState {
    cache: Record<string, MenuCache>;
    loading: Record<string, boolean>;
    // In-flight dedup: promises keyed by cache key
    _inflight: Record<string, Promise<Menu[]>>;

    getMenus: (layout: string, section: string) => Menu[];
    isLoading: (layout: string, section: string) => boolean;
    fetchMenus: (layout: string, section: string) => Promise<void>;
}

function cacheKey(layout: string, section: string) {
    return `${layout}:${section}`;
}

export const useMenuStore = create<MenuState>((set, get) => ({
    cache: {},
    loading: {},
    _inflight: {},

    getMenus: (layout, section) => {
        const key = cacheKey(layout, section);
        return get().cache[key]?.data ?? EMPTY;
    },

    isLoading: (layout, section) => {
        const key = cacheKey(layout, section);
        return get().loading[key] ?? false;
    },

    fetchMenus: async (layout, section) => {
        const key = cacheKey(layout, section);
        const state = get();

        // Skip if data is fresh
        const cached = state.cache[key];
        if (cached && Date.now() - cached.fetchedAt < STALE_TIME) {
            return;
        }

        // Deduplicate in-flight requests — return existing promise
        if (key in state._inflight) {
            await state._inflight[key];
            return;
        }

        set((s) => ({ loading: { ...s.loading, [key]: true } }));

        const promise = apiClient.menus
            .get({ layout: layout as any, section: section as any })
            .then((res) => {
                const menus = (res.data || []) as Menu[];
                set((s) => ({
                    cache: {
                        ...s.cache,
                        [key]: { data: menus, fetchedAt: Date.now() },
                    },
                    loading: { ...s.loading, [key]: false },
                }));
                return menus;
            })
            .catch(() => {
                set((s) => ({ loading: { ...s.loading, [key]: false } }));
                return [] as Menu[];
            })
            .finally(() => {
                // Remove in-flight entry
                set((s) => {
                    const { [key]: _, ...rest } = s._inflight;
                    return { _inflight: rest };
                });
            });

        // Register in-flight promise
        set((s) => ({ _inflight: { ...s._inflight, [key]: promise } }));

        await promise;
    },
}));
