'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Settings,
  ShieldCheck,
  HelpCircle,
  User,
  ArrowLeft,
  Wallet,
  Coins,
  Bell,
} from 'lucide-react';

import PasswordForm from '@/components/profile/PasswordForm';
import HelpCenter from '@/components/profile/HelpCenter';
import IdentityForm from '@/components/profile/IdentityForm';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'help' | 'identity'>('password');

  return (
    <div className="container min-h-screen max-w-4xl mx-auto px-4 py-6 md:py-10 pb-28 md:pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl size-9 md:hidden">
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="size-6 text-primary" />
              Pengaturan Akun
            </h1>
            <p className="text-xs text-muted-foreground">
              Pengaturan kata sandi, identitas akun, dan pusat bantuan
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1.5 hidden sm:flex">
          <Link href="/profile">
            <User className="size-3.5" />
            Profil Lengkap
          </Link>
        </Button>
      </div>

      {/* Quick Navigation Cards on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl text-xs justify-start h-10 border-border/60"
        >
          <Link href="/wallet" className="flex items-center gap-2">
            <Wallet className="size-3.5 text-emerald-500" />
            <span>PIN Dompet</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl text-xs justify-start h-10 border-border/60"
        >
          <Link href="/points" className="flex items-center gap-2">
            <Coins className="size-3.5 text-amber-500" />
            <span>Poin Reward</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl text-xs justify-start h-10 border-border/60"
        >
          <Link href="/notifications" className="flex items-center gap-2">
            <Bell className="size-3.5 text-indigo-500" />
            <span>Notifikasi</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl text-xs justify-start h-10 border-border/60"
        >
          <Link href="/profile" className="flex items-center gap-2">
            <User className="size-3.5 text-primary" />
            <span>Identitas Diri</span>
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-12 p-1 bg-muted/60 rounded-2xl mb-6">
          <TabsTrigger value="password" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <ShieldCheck className="size-3.5 sm:size-4" />
            <span className="truncate">Ganti Sandi</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <HelpCircle className="size-3.5 sm:size-4" />
            <span className="truncate">Pusat Bantuan</span>
          </TabsTrigger>
          <TabsTrigger value="identity" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <User className="size-3.5 sm:size-4" />
            <span className="truncate">Identitas Diri</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ganti Kata Sandi */}
        <TabsContent value="password" className="outline-none focus:outline-none">
          <PasswordForm />
        </TabsContent>

        {/* Tab 2: Pusat Bantuan */}
        <TabsContent value="help" className="outline-none focus:outline-none">
          <HelpCenter />
        </TabsContent>

        {/* Tab 3: Identitas Diri */}
        <TabsContent value="identity" className="outline-none focus:outline-none">
          <IdentityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
