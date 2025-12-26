import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminViewKey = 
  | 'dashboard' 
  | 'users' 
  | 'finance' 
  | 'cms-posts' 
  | 'cms-pages' 
  | 'mentors'
  | 'programs'
  | 'curriculum-builder'
  | 'menus'
  | 'roles'
  | 'settings';

export interface AdminTab {
  id: string;
  title: string;
  view: AdminViewKey;
  icon?: string;
  data?: any;
}

interface AdminStore {
  tabs: AdminTab[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  
  // Actions
  addTab: (tab: Omit<AdminTab, 'id'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  resetTabs: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      tabs: [
        { id: 'dashboard-default', title: 'Dashboard', view: 'dashboard', icon: 'LayoutDashboard' }
      ],
      activeTabId: 'dashboard-default',
      sidebarOpen: true,

      addTab: (newTab) => {
        const { tabs } = get();
        // Check if a tab with the same title/view already exists to avoid duplicates if desired
        // Or strictly strictly allow multiples. 
        // For "browser-like", we usually allow multiples, but for admin, 
        // usually we just focus existing if opened. Let's focus existing for same view type to avoid clutter unless data differs.
        
        const existingTab = tabs.find(t => t.view === newTab.view && JSON.stringify(t.data) === JSON.stringify(newTab.data));
        
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        const id = `${newTab.view}-${Date.now()}`;
        set({ 
          tabs: [...tabs, { ...newTab, id }], 
          activeTabId: id 
        });
      },

      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter(t => t.id !== id);
        
        // If we closed the active tab, switch to the last one
        if (activeTabId === id && newTabs.length > 0) {
          set({ 
            tabs: newTabs, 
            activeTabId: newTabs[newTabs.length - 1].id 
          });
        } else if (newTabs.length === 0) {
           // Always keep at least dashboard?
           set({ 
             tabs: [{ id: 'dashboard-default', title: 'Dashboard', view: 'dashboard', icon: 'LayoutDashboard' }], 
             activeTabId: 'dashboard-default' 
           });
        } else {
          set({ tabs: newTabs });
        }
      },

      setActiveTab: (id) => set({ activeTabId: id }),
      
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      resetTabs: () => set({ 
        tabs: [{ id: 'dashboard-default', title: 'Dashboard', view: 'dashboard', icon: 'LayoutDashboard' }], 
        activeTabId: 'dashboard-default' 
      }),
    }),
    {
      name: 'admin-store',
      // We can blacklist data if it's too large
    }
  )
);
