'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, FileText, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/programs', icon: LayoutGrid, label: 'Program' },
  { href: '/exams', icon: FileText, label: 'Ujian' },
  { href: '/orders', icon: ShoppingBag, label: 'Transaksi' },
];

const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-around px-4 sm:px-6 lg:px-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("h-6 w-6 mb-1", isActive && "fill-current")} />
              <span className="text-xs tracking-tight font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
