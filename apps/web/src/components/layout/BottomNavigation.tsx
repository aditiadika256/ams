'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, FileText, ShoppingBag, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

const BottomNavigation = () => {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuthStore();

  const navItems = useMemo(() => {
    const items = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/programs', icon: LayoutGrid, label: 'Program' },
    ];

    if (isAuthenticated) {
      items.push(
        { href: '/exams', icon: FileText, label: 'Ujian' },
        { href: '/orders', icon: ShoppingBag, label: 'Order' },
        { href: '/profile', icon: User, label: 'Akun' }
      );
    } else {
      items.push(
        { href: '/auth/login', icon: LogIn, label: 'Masuk' }
      );
    }

    return items;
  }, [isAuthenticated]);

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
      className="fixed bottom-0 z-50 w-full border-t bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 md:hidden pb-safe"
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
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
