'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, LogOut, Settings, UserCircle, Menu, X, ShoppingBag, LayoutDashboard } from 'lucide-react';
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
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ModeToggle } from '../mode-toggle';
import { useMenuStore } from '@/store/useMenuStore';

const FALLBACK_NAV = [
  { name: 'Beranda', href: '/' },
  { name: 'Program', href: '/programs' },
  { name: 'Ujian', href: '/exams' },
  { name: 'Blog', href: '/blog' },
  { name: 'Tentang', href: '/about' },
];

const AUTHENTICATED_ONLY_PATHS = ['/exams'];

const requiresAuthentication = (href: string) =>
  AUTHENTICATED_ONLY_PATHS.some((path) => href === path || href.startsWith(`${path}/`));

const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  // Shared menu store — select raw cache to avoid creating new references
  const menuCache = useMenuStore((s) => s.cache);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const topbarMenus = menuCache['users:topbar']?.data ?? [];

  useMotionValueEvent(scrollY, "change", (latest) => {
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

  // Fetch menus once via shared store (deduplicated)
  useEffect(() => {
    fetchMenus('users', 'topbar');
  }, [fetchMenus]);

  // Derive navLinks from store data or fallback
  const navLinks = useMemo(() => {
    const topLevel = topbarMenus
      .filter(m => !m.parent_id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(m => ({ name: m.name, href: m.url }));
    
    const baseNav = topLevel.length > 0 ? topLevel : FALLBACK_NAV;
    const visibleNav = isAuthenticated
      ? baseNav
      : baseNav.filter((link) => !requiresAuthentication(link.href));

    if (isAuthenticated) {
      const isAdmin = user?.roles?.some(role => ['superadmin', 'admin', 'manajer_cabang', 'direktur'].includes(role));
      const dashboardLink = {
        name: isAdmin ? 'Admin Panel' : 'Dashboard',
        href: isAdmin ? '/admin' : '/dashboard'
      };
      
      const hasDashboard = visibleNav.some(link => link.href === '/dashboard' || link.href === '/admin');
      if (!hasDashboard) {
        const result = [...visibleNav];
        result.splice(1, 0, dashboardLink);
        return result;
      }
    }
    return visibleNav;
  }, [topbarMenus, isAuthenticated, user]);

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${scrolled
        ? 'glass border-b-white/10'
        : 'bg-transparent border-transparent'
        }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
            <img src="/logo/arkanin-logo.png" alt="Arkanin" className="h-8 w-8 object-contain group-hover:rotate-12 transition-transform" />
            <span className="text-primary">Arkanin</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar_url || user?.profile_image_url || ''} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.roles?.some(role => ['superadmin', 'admin', 'manajer_cabang'].includes(role)) ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer font-medium text-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer font-medium text-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <span className="mr-2 h-4 w-4">🛍️</span>
                      <span>Riwayat Order</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/20 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Masuk</Link>
              </Button>
              <Button asChild className="rounded-full px-6 shadow-md shadow-primary/20">
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background shadow-xl"
          >
            <div className="space-y-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 mt-4 border-t grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/auth/login">Masuk</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/auth/register">Daftar</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default TopBar;
