'use client';

import React from 'react';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useAdminStore,
  type AdminViewKey,
} from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMenuStore } from '@/store/useMenuStore';
import type { Menu as MenuType } from '@/types/system';
import {
  buildMenuTree,
  filterMenuTree,
  getCollapsedMenuItems,
  getExpandableMenuIds,
} from './adminSidebarMenu';

const IconMap: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PieChart,
  Settings,
  ShieldCheck,
  Tags,
  Users,
};

const EMPTY_MENUS: MenuType[] = [];

// Hardcoded fallback so sidebar renders instantly while API loads.
const FALLBACK_ADMIN_MENUS: MenuType[] = [
  { id: -1, name: 'Dashboard', icon: 'LayoutDashboard', url: 'admin://view/dashboard', layout: 'admin', section: 'sidebar', order: 0, parent_id: null },
  { id: -2, name: 'Users', icon: 'Users', url: 'admin://view/users', layout: 'admin', section: 'sidebar', order: 1, parent_id: null },
  { id: -3, name: 'Menu', icon: 'Menu', url: 'admin://view/menus', layout: 'admin', section: 'sidebar', order: 2, parent_id: null },
  { id: -4, name: 'Settings', icon: 'Settings', url: 'admin://view/settings', layout: 'admin', section: 'sidebar', order: 3, parent_id: null },
];

export function AdminSidebar() {
  const {
    addTab,
    sidebarMobileOpen,
    sidebarOpen,
    setSidebarMobileOpen,
    toggleSidebar,
  } = useAdminStore();
  const { logout } = useAuthStore();
  const [isMobile, setIsMobile] = React.useState(false);
  const [expandedMenuIds, setExpandedMenuIds] = React.useState<Set<number>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const sidebarRef = React.useRef<HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const mobileTriggerRef = React.useRef<HTMLElement | null>(null);

  // Shared menu store - cached and deduplicated.
  const menuCache = useMenuStore((state) => state.cache);
  const fetchMenus = useMenuStore((state) => state.fetchMenus);
  const sidebarMenus = menuCache['admin:sidebar']?.data ?? EMPTY_MENUS;

  const dynamicMenus = React.useMemo(() => {
    if (sidebarMenus.length > 0) {
      return [...sidebarMenus].sort(
        (left, right) => (left.order ?? 0) - (right.order ?? 0),
      );
    }

    return FALLBACK_ADMIN_MENUS;
  }, [sidebarMenus]);

  const menuTree = React.useMemo(
    () => buildMenuTree(dynamicMenus),
    [dynamicMenus],
  );
  const visibleMenus = React.useMemo(
    () => filterMenuTree(menuTree, searchQuery),
    [menuTree, searchQuery],
  );
  const collapsedMenuItems = React.useMemo(
    () => getCollapsedMenuItems(menuTree),
    [menuTree],
  );
  const isSearching = searchQuery.trim().length > 0;
  const isSidebarExpanded = isMobile || sidebarOpen;

  React.useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const syncMobileState = () => setIsMobile(mobileQuery.matches);

    syncMobileState();
    mobileQuery.addEventListener('change', syncMobileState);

    return () => mobileQuery.removeEventListener('change', syncMobileState);
  }, []);

  React.useEffect(() => {
    if (!isMobile || !sidebarMobileOpen) {
      return;
    }

    mobileTriggerRef.current = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () => {
      const sidebar = sidebarRef.current;

      if (!sidebar) {
        return [];
      }

      return Array.from(sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), '
        + 'select:not([disabled]), textarea:not([disabled]), '
        + '[tabindex]:not([tabindex="-1"])',
      )).filter((element) => (
        !element.hidden && element.getClientRects().length > 0
      ));
    };

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSidebarMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const elements = getFocusableElements();

      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
    };
  }, [isMobile, setSidebarMobileOpen, sidebarMobileOpen]);

  React.useEffect(() => {
    fetchMenus('admin', 'sidebar');
  }, [fetchMenus]);

  React.useEffect(() => {
    const expandableIds = getExpandableMenuIds(menuTree);

    setExpandedMenuIds((currentIds) => {
      const nextIds = new Set(currentIds);
      expandableIds.forEach((id) => nextIds.add(id));
      return nextIds;
    });
  }, [menuTree]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  const openMenu = (menu: MenuType) => {
    if (menu.url?.startsWith('admin://view/')) {
      const viewKey = menu.url.replace('admin://view/', '');
      addTab({
        title: menu.name,
        view: viewKey as AdminViewKey,
        icon: menu.icon || 'LayoutDashboard',
      });
    } else {
      window.location.href = menu.url;
    }

    if (window.innerWidth < 768) {
      setSidebarMobileOpen(false);
    }
  };

  const toggleParentMenu = (menuId: number) => {
    setExpandedMenuIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(menuId)) {
        nextIds.delete(menuId);
      } else {
        nextIds.add(menuId);
      }

      return nextIds;
    });
  };

  const openMenuSearch = () => {
    if (!sidebarOpen) {
      toggleSidebar();
    }

    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const renderExpandedMenus = (
    menus: ReturnType<typeof buildMenuTree>,
    depth = 0,
  ): React.ReactNode => menus.map((menu) => {
    const Icon = (menu.icon && IconMap[menu.icon]) || LayoutDashboard;
    const hasChildren = menu.children.length > 0;
    const isExpanded = isSearching || expandedMenuIds.has(menu.id);
    const submenuId = `admin-sidebar-menu-${menu.id}`;

    return (
      <div key={menu.id}>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-11 w-full justify-start gap-3 overflow-hidden px-3 md:h-9',
            hasChildren
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-foreground',
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          aria-controls={hasChildren ? submenuId : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          onClick={() => (
            hasChildren ? toggleParentMenu(menu.id) : openMenu(menu)
          )}
        >
          <Icon className={cn('shrink-0', depth === 0 ? 'size-5' : 'size-4')} />
          <span className="min-w-0 flex-1 truncate text-left">{menu.name}</span>
          {hasChildren && (
            <ChevronRight
              className={cn(
                'size-4 shrink-0 transition-transform duration-200',
                isExpanded && 'rotate-90',
              )}
            />
          )}
        </Button>

        {hasChildren && (
          <div
            id={submenuId}
            role="group"
            aria-hidden={!isExpanded}
            inert={!isExpanded}
            className={cn(
              'grid transition-[grid-template-rows] duration-200 ease-out',
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col gap-1 py-1">
                {renderExpandedMenus(menu.children, depth + 1)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

  const renderCollapsedMenus = () => collapsedMenuItems.map((menu) => {
    const Icon = (menu.icon && IconMap[menu.icon]) || FileText;

    return (
      <Button
        key={menu.id}
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        title={menu.name}
        aria-label={menu.name}
        onClick={() => openMenu(menu)}
      >
        <Icon className="size-5" />
      </Button>
    );
  });

  const showNoResults = isSearching && visibleMenus.length === 0;

  const expandedNavigation = (
    <>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          placeholder="Cari menu..."
          aria-label="Cari menu"
          className="h-11 bg-background/60 pl-9 pr-11 md:h-9 md:pr-9"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 size-11 md:size-9"
            aria-label="Hapus pencarian menu"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <nav aria-label="Menu admin" className="mt-3 flex flex-col gap-1">
        {showNoResults ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Menu &quot;{searchQuery.trim()}&quot; tidak ditemukan.
          </p>
        ) : (
          renderExpandedMenus(visibleMenus)
        )}
      </nav>
    </>
  );

  const collapsedNavigation = (
    <nav
      aria-label="Menu admin ringkas"
      className="flex flex-col items-center gap-1"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Cari menu"
        aria-label="Cari menu"
        onClick={openMenuSearch}
      >
        <Search className="size-5" />
      </Button>
      {renderCollapsedMenus()}
    </nav>
  );

  return (
    <>
      {sidebarMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/10 transition-opacity duration-200 dark:bg-slate-950/25 md:hidden"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        data-state={sidebarOpen ? 'expanded' : 'collapsed'}
        role={isMobile ? 'dialog' : undefined}
        aria-label={isMobile ? 'Navigasi admin' : undefined}
        aria-modal={isMobile && sidebarMobileOpen ? true : undefined}
        aria-hidden={isMobile && !sidebarMobileOpen}
        inert={isMobile && !sidebarMobileOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-dvh w-[86vw] max-w-80 flex-col overflow-hidden border-r border-border/70 bg-background shadow-[12px_0_40px_-24px_rgba(15,23,42,0.45)] transition-transform duration-300 ease-out',
          'md:h-auto md:max-w-none md:border-white/10 md:bg-background/70 md:backdrop-blur-xl md:shadow-xl md:transition-[width,transform]',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          sidebarOpen ? 'md:w-[280px]' : 'md:w-[80px] md:items-center',
        )}
      >
        <div
          className={cn(
            'flex h-16 w-full shrink-0 items-center border-b border-border/70 md:border-white/10',
            isSidebarExpanded ? 'justify-between px-4' : 'justify-center px-2',
          )}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-xl font-bold text-primary md:hidden"
          >
            <img
              src="/logo/arkanin-logo.png"
              alt="Arkanin"
              className="size-8 shrink-0 object-contain"
            />
            <span className="truncate">
              Arkanin
              <span className="font-normal text-muted-foreground">.Admin</span>
            </span>
          </Link>

          {sidebarOpen ? (
            <>
              <Link
                href="/"
                className="hidden min-w-0 items-center gap-2 text-xl font-bold text-primary md:flex"
              >
                <img
                  src="/logo/arkanin-logo.png"
                  alt="Arkanin"
                  className="size-8 shrink-0 object-contain"
                />
                <span className="truncate">
                  Arkanin
                  <span className="font-normal text-muted-foreground">.Admin</span>
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden shrink-0 md:inline-flex"
                aria-label="Ciutkan sidebar"
                title="Ciutkan sidebar"
                onClick={toggleSidebar}
              >
                <PanelLeftClose className="size-5" />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Perluas sidebar"
              title="Perluas sidebar"
              onClick={toggleSidebar}
            >
              <PanelLeftOpen className="size-5" />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ml-auto size-11 shrink-0 rounded-xl border-border/70 bg-muted/40 md:hidden"
            aria-label="Tutup navigasi admin"
            onClick={() => setSidebarMobileOpen(false)}
          >
            <PanelLeftClose className="size-5" />
          </Button>
        </div>

        <div
          className={cn(
            'min-h-0 w-full flex-1 overscroll-contain overflow-y-auto px-3 py-4',
            isSidebarExpanded ? 'md:px-3' : 'md:px-2',
          )}
        >
          {isSidebarExpanded ? expandedNavigation : collapsedNavigation}
        </div>

        <div
          className={cn(
            'w-full shrink-0 border-t px-4 py-4',
            isSidebarExpanded ? 'md:px-4' : 'md:px-2',
          )}
        >
          <Button
            type="button"
            variant="outline"
            size={isSidebarExpanded ? 'default' : 'icon'}
            className={cn(
              'h-11 w-full text-red-500 hover:bg-red-50 hover:text-red-600 md:h-9 dark:hover:bg-red-950/30',
              isSidebarExpanded ? 'justify-start' : 'justify-center px-0',
            )}
            title={!isSidebarExpanded ? 'Logout' : undefined}
            aria-label={!isSidebarExpanded ? 'Logout' : undefined}
            onClick={handleLogout}
          >
            <LogOut className={cn('size-5', isSidebarExpanded && 'mr-1')} />
            {isSidebarExpanded && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
