'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMenuStore } from '@/store/useMenuStore';
import type { Menu as MenuType } from '@/types/system';

const IconMap: Record<string, any> = {
  LayoutDashboard,
  PieChart,
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  Menu,
};

// Hardcoded fallback so sidebar renders instantly while API loads
const FALLBACK_ADMIN_MENUS: MenuType[] = [
  { id: -1, name: 'Dashboard', icon: 'LayoutDashboard', url: 'admin://view/dashboard', layout: 'admin', section: 'sidebar', order: 0, parent_id: null },
  { id: -2, name: 'Users', icon: 'Users', url: 'admin://view/users', layout: 'admin', section: 'sidebar', order: 1, parent_id: null },
  { id: -3, name: 'Menu', icon: 'Menu', url: 'admin://view/menus', layout: 'admin', section: 'sidebar', order: 2, parent_id: null },
  { id: -4, name: 'Settings', icon: 'Settings', url: 'admin://view/settings', layout: 'admin', section: 'sidebar', order: 3, parent_id: null },
];

export function AdminSidebar() {
  const { addTab, sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminStore();
  const { logout } = useAuthStore();

  // Shared menu store — cached & deduplicated
  const menuCache = useMenuStore((s) => s.cache);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const sidebarMenus = menuCache['admin:sidebar']?.data ?? [];

  // Use dynamic menus if loaded, otherwise show fallback immediately
  const dynamicMenus = React.useMemo(() => {
    if (sidebarMenus.length > 0) {
      return [...sidebarMenus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return FALLBACK_ADMIN_MENUS;
  }, [sidebarMenus]);

  React.useEffect(() => {
    // Ensure sidebar is open on desktop by default - ONLY on mount
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  React.useEffect(() => {
    fetchMenus('admin', 'sidebar');
  }, [fetchMenus]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  const openMenu = (m: MenuType) => {
    if (m.url?.startsWith('admin://view/')) {
      const viewKey = m.url.replace('admin://view/', '');
      addTab({
        title: m.name,
        view: viewKey as any,
        icon: m.icon || 'LayoutDashboard'
      });
    } else {
      window.location.href = m.url;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: sidebarOpen ? 0 : 0
        }}
        className={cn(
          "fixed left-0 top-0 h-screen glass border-r border-white/10 z-50 flex flex-col transition-all duration-300 shadow-xl",
          !sidebarOpen && "items-center" // Center items when collapsed
        )}
      >
        {/* Header */}
        <div className={cn("h-16 flex items-center border-b border-white/10", sidebarOpen ? "px-6 justify-between" : "justify-center")}>
          {sidebarOpen ? (
            <>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  A
                </div>
                <span>Arkanin<span className="text-muted-foreground font-normal">.Admin</span></span>
              </Link>
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Header Content when sidebar is open (overlay mode) */}
          <div className="md:hidden flex items-center gap-2 font-bold text-xl text-primary">
            {!sidebarOpen && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                A
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 px-4">
          {dynamicMenus.length > 0 ? (
            dynamicMenus
              .filter(m => !m.parent_id)
              .map((m) => {
                const Icon = (m.icon && IconMap[m.icon]) || LayoutDashboard;
                return (
                  <div key={m.id} className="space-y-1">
                    <Button
                      variant="ghost"
                      size={sidebarOpen ? "default" : "icon"}
                      className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
                      onClick={() => openMenu(m)}
                    >
                      <Icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                      {sidebarOpen && <span>{m.name}</span>}
                    </Button>
                    {dynamicMenus
                      .filter(c => c.parent_id === m.id)
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((c) => {
                        const CIcon = (c.icon && IconMap[c.icon]) || FileText;
                        return (
                          <Button
                            key={c.id}
                            variant="ghost"
                            size={sidebarOpen ? "default" : "icon"}
                            className={cn("w-full justify-start pl-8", !sidebarOpen && "justify-center px-0")}
                            onClick={() => openMenu(c)}
                          >
                            <CIcon className={cn("h-4 w-4", sidebarOpen && "mr-3")} />
                            {sidebarOpen && <span>{c.name}</span>}
                          </Button>
                        );
                      })}
                  </div>
                );
              })
          ) : (
            <div className="text-xs text-muted-foreground px-2">Tidak ada menu. Tambahkan di Menu Management.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            size={sidebarOpen ? "default" : "icon"}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
