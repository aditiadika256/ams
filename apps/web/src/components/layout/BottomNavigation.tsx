'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, FileText, ShoppingBag, User, LogIn, LayoutDashboard, PanelsTopLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useMenuStore } from '@/store/useMenuStore';

const iconMap: Record<string, any> = {
  Home: Home,
  LayoutGrid: LayoutGrid,
  FileText: FileText,
  ShoppingBag: ShoppingBag,
  User: User,
  LogIn: LogIn,
  LayoutDashboard: LayoutDashboard,
  PanelsTopLeft: PanelsTopLeft,
  Bell: Bell,
};

const DEFAULT_BOTTOM_NAV = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '/programs', icon: LayoutGrid, label: 'Programs' },
  { href: '/workspace', icon: PanelsTopLeft, label: 'Workspace', isCenter: true },
  { href: '/store', icon: ShoppingBag, label: 'Store' },
  { href: '/notifications', icon: Bell, label: 'Notification' },
];

const BottomNavigation = () => {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuthStore();

  // Shared menu store
  const menuCache = useMenuStore((s) => s.cache);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const bottomMenus = menuCache['users:bottomnavigation']?.data ?? [];

  useEffect(() => {
    fetchMenus('users', 'bottomnavigation');
  }, [fetchMenus]);

  const navItems = useMemo(() => {
    const filteredDynamicMenus = bottomMenus
      .filter((m) => !m.parent_id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (filteredDynamicMenus.length > 0) {
      return filteredDynamicMenus.map((m) => {
        const IconComponent = iconMap[m.icon || ''] || LayoutGrid;
        const isCenter = m.url === '/workspace' || m.seed_key === 'users.bottom.workspace';

        return {
          href: m.url,
          icon: IconComponent,
          label: m.name,
          isCenter,
        };
      });
    }

    return DEFAULT_BOTTOM_NAV;
  }, [bottomMenus]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: '100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed bottom-0 z-50 w-full border-t border-border/40 bg-background/85 backdrop-blur-xl md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item: any) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center justify-center group"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 active:scale-95 group-hover:scale-105',
                    isActive
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md'
                  )}
                >
                  <item.icon className="size-5" />
                </div>
                <span
                  className={cn(
                    'mt-1 text-[10px] font-semibold tracking-tight transition-colors',
                    isActive ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full group py-1"
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  'flex flex-col items-center gap-1 transition-all duration-200',
                  isActive
                    ? 'text-primary font-semibold -translate-y-0.5'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                <item.icon className={cn('size-5 transition-transform group-hover:scale-110', isActive && 'fill-current/15')} />
                <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px]">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
