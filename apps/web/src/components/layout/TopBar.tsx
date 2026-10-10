'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  PanelsTopLeft,
  LayoutGrid,
  ShoppingBag,
  Bell,
  Settings,
  ShoppingCart,
  User,
  LogOut,
  UserCircle,
  LayoutDashboard,
  Coins,
  Wallet,
  Package,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ModeToggle } from '../mode-toggle';
import { useMenuStore } from '@/store/useMenuStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Home: Home,
  PanelsTopLeft: PanelsTopLeft,
  LayoutGrid: LayoutGrid,
  ShoppingBag: ShoppingBag,
  Bell: Bell,
};

// Default desktop navigation items (icon-only with hover title)
const DEFAULT_DESKTOP_NAV = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Workspace', href: '/workspace', icon: PanelsTopLeft },
  { name: 'Programs', href: '/programs', icon: LayoutGrid },
  { name: 'Store', href: '/store', icon: ShoppingBag },
];

const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  // Shared menu store
  const menuCache = useMenuStore((s) => s.cache);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const topbarMenus = menuCache['users:topbar']?.data ?? [];

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 20);
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch menus once via shared store
  useEffect(() => {
    fetchMenus('users', 'topbar');
  }, [fetchMenus]);

  // Derive desktop main nav items (posisi: Beranda, Workspace, Programs, Store)
  const navLinks = useMemo(() => {
    const topLevel = topbarMenus
      .filter((m) => !m.parent_id && m.url !== '/notifications')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (topLevel.length > 0) {
      return topLevel.map((m) => ({
        name: m.name,
        href: m.url,
        icon: iconMap[m.icon || ''] || LayoutGrid,
      }));
    }

    return DEFAULT_DESKTOP_NAV;
  }, [topbarMenus]);

  const branding = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        badge: null,
        title: 'Arkanin',
        subtitle: null,
        accentColor: 'text-primary',
        badgeBg: '',
      };
    }

    const roles = user.roles || [];
    if (roles.includes('superadmin') || roles.includes('super_admin')) {
      return {
        badge: 'AMS',
        title: 'Arkanin',
        subtitle: 'Management System',
        accentColor: 'text-rose-500',
        badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      };
    }
    if (roles.includes('admin') || roles.includes('manajer_cabang')) {
      return {
        badge: 'ASA',
        title: 'Arkanin',
        subtitle: 'Super App',
        accentColor: 'text-indigo-500',
        badgeBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
      };
    }
    if (roles.includes('finance') || roles.includes('keuangan')) {
      return {
        badge: 'ASD',
        title: 'Arkanin',
        subtitle: 'Super Diamond',
        accentColor: 'text-cyan-500',
        badgeBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
      };
    }
    if (roles.includes('mentor')) {
      return {
        badge: 'A-Team',
        title: 'Arkanin',
        subtitle: 'Mentor Workspace',
        accentColor: 'text-emerald-500',
        badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    }

    // Default for students: A+
    return {
      badge: 'A+',
      title: 'Arkanin',
      subtitle: 'Student Plus',
      accentColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    };
  }, [isAuthenticated, user]);

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/40 shadow-sm'
          : 'bg-background/50 backdrop-blur-md border-b border-border/20'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Branding Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            title="Arkanin Education Platform"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight group"
          >
            <div className="relative flex items-center justify-center">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-xl text-primary transition-transform group-hover:scale-105">
                A
              </div>
              {branding.badge && (
                <span
                  className={`absolute -bottom-1 -right-2 rounded-full border px-1 text-[9px] font-black uppercase tracking-tighter shadow-sm ${branding.badgeBg}`}
                >
                  {branding.badge}
                </span>
              )}
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1">
                <span className="text-foreground tracking-tight">Arkanin</span>
                {branding.badge && (
                  <span className={`font-black ${branding.accentColor}`}>
                    {branding.badge}
                  </span>
                )}
              </div>
              {branding.subtitle && (
                <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">
                  {branding.subtitle}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation: Icon-only default, sliding title beside icon on hover that pushes adjacent icons */}
          {/* Posisi: Beranda, Workspace, Programs, Store */}
          <nav className="hidden md:flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/50 transition-all duration-300">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname?.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group relative flex items-center h-10 px-2.5 rounded-xl transition-all duration-300 ease-out select-none overflow-hidden',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                  )}
                  aria-label={link.name}
                >
                  <Icon className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                  {/* Slide-out title on hover: expands width smoothly & shifts adjacent icons to the right */}
                  <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-out transform -translate-x-1 group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-2 group-hover:translate-x-0">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Notification (Terpisah di pojok kanan untuk Desktop) */}
          <div className="relative group hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                'rounded-xl size-10 text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors',
                pathname === '/notifications' && 'text-primary bg-primary/10'
              )}
            >
              <Link href="/notifications" aria-label="Notifikasi">
                <Bell className="size-5" />
              </Link>
            </Button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-150 z-50 whitespace-nowrap bg-popover/95 text-popover-foreground text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg border border-border/80 backdrop-blur-sm">
              Notifikasi
            </div>
          </div>

          {/* 2. Settings (Sesuai wireframe - icon Gear) */}
          {/* <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                'rounded-xl size-10 text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors',
                pathname === '/settings' && 'text-primary bg-primary/10'
              )}
            >
              <Link href="/settings" aria-label="Pengaturan">
                <Settings className="size-5" />
              </Link>
            </Button>
            <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-150 z-50 whitespace-nowrap bg-popover/95 text-popover-foreground text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg border border-border/80 backdrop-blur-sm">
              Pengaturan
            </div>
          </div> */}

          {/* 3. Shopping Cart (Sesuai wireframe - icon Troli) */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                'rounded-xl size-10 text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors',
                pathname === '/store' && 'text-primary bg-primary/10'
              )}
            >
              <Link href="/store" aria-label="Store / Keranjang">
                <ShoppingCart className="size-5" />
              </Link>
            </Button>
            <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-150 z-50 whitespace-nowrap bg-popover/95 text-popover-foreground text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg border border-border/80 backdrop-blur-sm">
              Store & Keranjang
            </div>
          </div>

          {/* Mode Toggle (Dark/Light) */}
          <ModeToggle />

          {/* 4. Avatar / User Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0"
                >
                  <Avatar className="size-9">
                    <AvatarImage
                      src={user?.avatar_url || user?.profile_image_url || ''}
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.name ? getInitials(user.name) : <User className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 p-2 shadow-xl border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold leading-none">{user?.name || 'User'}</p>
                      {branding.badge && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${branding.badgeBg}`}>
                          {branding.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.roles?.some((role) =>
                  ['superadmin', 'admin', 'manajer_cabang'].includes(role)
                ) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer font-medium text-primary">
                      <LayoutDashboard className="mr-2.5 size-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* 3 Menu Terpisah untuk Student dan Mentor: Profile, Achievement, Setting */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer font-medium">
                    <UserCircle className="mr-2.5 size-4 text-primary" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/achievements" className="cursor-pointer font-medium">
                    <Trophy className="mr-2.5 size-4 text-amber-500" />
                    <span>Achievement</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer font-medium">
                    <Settings className="mr-2.5 size-4 text-muted-foreground" />
                    <span>Setting</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive-foreground focus:bg-destructive/20 cursor-pointer font-medium"
                >
                  <LogOut className="mr-2.5 size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
                <Link href="/auth/login">Masuk</Link>
              </Button>
              <Button size="sm" asChild className="rounded-xl px-4 text-xs font-semibold shadow-sm">
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
