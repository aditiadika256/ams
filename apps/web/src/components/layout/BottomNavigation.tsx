'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, FileText, ShoppingBag, User, LogIn, LayoutDashboard } from 'lucide-react';
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
  LayoutDashboard: LayoutDashboard
};

const BottomNavigation = () => {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, user } = useAuthStore();

  // Shared menu store — select raw cache to avoid creating new references
  const menuCache = useMenuStore((s) => s.cache);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const bottomMenus = menuCache['users:bottomnavigation']?.data ?? [];

  useEffect(() => {
    fetchMenus('users', 'bottomnavigation');
  }, [fetchMenus]);

  const navItems = useMemo(() => {
    const filteredDynamicMenus = bottomMenus
      .filter(m => !m.parent_id)
      .filter(m => {
        if (!isAuthenticated) {
          // Hide orders and profile/akun for guest users
          return m.url !== '/orders' && m.url !== '/profile';
        }
        return true;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (filteredDynamicMenus.length > 0) {
      return filteredDynamicMenus.map(m => {
        const IconComponent = iconMap[m.icon || ''] || LayoutGrid;
        let href = m.url;
        let label = m.name;
        let Icon = IconComponent;

        if (isAuthenticated && m.url === '/') {
          href = '/dashboard';
          label = 'Dashboard';
          Icon = LayoutDashboard;
        }

        return {
          href,
          icon: Icon,
          label
        };
      });
    }

    const fallback = [];
    if (isAuthenticated) {
      fallback.push({ href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
    } else {
      fallback.push({ href: '/', icon: Home, label: 'Home' });
    }
    fallback.push({ href: '/programs', icon: LayoutGrid, label: 'Program' });
    if (isAuthenticated) {
      fallback.push({ href: '/exams', icon: FileText, label: 'Ujian' });
      fallback.push({ href: '/orders', icon: ShoppingBag, label: 'Order' });
      fallback.push({ href: '/profile', icon: User, label: 'Akun' });
    } else {
      fallback.push({ href: '/auth/login', icon: LogIn, label: 'Masuk' });
    }
    return fallback;
  }, [isAuthenticated, bottomMenus]);

  useMotionValueEvent(scrollY, "change", (latest) => {
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
      className="fixed bottom-0 z-50 w-full border-t border-white/10 glass md:hidden pb-safe"
    >
      <div className="mx-auto flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                />
              )}
              <div className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary -translate-y-1" : "text-muted-foreground hover:text-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "fill-current/20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
