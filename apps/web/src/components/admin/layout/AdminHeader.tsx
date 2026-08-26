'use client';

import React from 'react';
import { PanelLeftOpen, Bell, Search, User, LogOut, Settings, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminTabs } from './AdminTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export function AdminHeader() {
  const { toggleSidebar } = useAdminStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full glass border-b border-white/10 shadow-sm">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-xl border-border/70 bg-background/80 shadow-sm md:hidden"
            aria-label="Buka navigasi admin"
            onClick={toggleSidebar}
          >
            <PanelLeftOpen className="size-5" />
          </Button>

          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anything (Ctrl + K)"
              className="pl-9 bg-white/10 border-white/10 focus-visible:ring-1 focus-visible:bg-white/20 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>
          <div className="h-8 w-px bg-border mx-2"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-full md:w-auto p-0 md:px-2 hover:bg-transparent md:hover:bg-accent flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium">{user?.name || 'Admin User'}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.roles?.[0] || 'Admin'}</div>
                </div>
                <Avatar className="h-9 w-9 border border-primary/20">
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
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Main Site</span>
                </Link>
              </DropdownMenuItem>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Bar */}
      <AdminTabs />
    </header>
  );
}
