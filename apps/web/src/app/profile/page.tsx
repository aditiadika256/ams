'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  User,
  ShieldCheck,
  HelpCircle,
  Wallet,
  Coins,
  ArrowLeft,
  BookOpen,
  Trophy,
  Loader2,
  FileText,
  Sparkles,
} from 'lucide-react';

import StudentProfileCard from '@/components/profile/StudentProfileCard';
import MentorTopicSection from '@/components/profile/MentorTopicSection';
import IdentityForm from '@/components/profile/IdentityForm';
import PasswordForm from '@/components/profile/PasswordForm';
import HelpCenter from '@/components/profile/HelpCenter';

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user } = useAuthStore();

  // Role detection
  const isMentor = Boolean(
    user?.roles?.some((r) => r === 'mentor') || user?.mentor
  );

  // Toggle mentor preview for testing if user isn't mentor yet
  const [showMentorSection, setShowMentorSection] = useState(false);

  useEffect(() => {
    if (isMentor) {
      setShowMentorSection(true);
    }
  }, [isMentor]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'identity', 'password', 'help'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const getRoleBadge = () => {
    const roles = user?.roles || [];
    if (roles.includes('superadmin') || roles.includes('super_admin')) {
      return {
        label: 'AMS Super Admin',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      };
    }
    if (roles.includes('admin') || roles.includes('manajer_cabang')) {
      return {
        label: 'ASA Admin Cabang',
        className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      };
    }
    if (roles.includes('finance') || roles.includes('keuangan')) {
      return {
        label: 'ASD Keuangan',
        className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      };
    }
    if (roles.includes('mentor')) {
      return {
        label: 'A-Team Mentor',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    }
    if (roles.includes('student')) {
      return {
        label: 'A+ Student Plus',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    }

    return {
      label: 'Member Arkanin',
      className: 'bg-primary/10 text-primary border-primary/20',
    };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="container min-h-screen max-w-4xl mx-auto px-4 py-6 md:py-10 pb-28 md:pb-16">
      {/* Top Header Navigation (Mobile Back Button & Title) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl size-9 md:hidden">
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Profil Pengguna
              </h1>
              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.className}`}>
                {roleBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola data identitas akun, foto, kontak OTP, cabang belajar, dan spesialisasi
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1.5 hidden sm:flex">
            <Link href="/achievements">
              <Trophy className="size-3.5 text-amber-500" />
              Achievement
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1.5 hidden sm:flex">
            <Link href="/wallet">
              <Wallet className="size-3.5 text-emerald-500" />
              Dompet Saldo
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation (Mobile First Segmented Control) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12 p-1 bg-muted/60 rounded-2xl mb-6">
          <TabsTrigger value="profile" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <User className="size-3.5 sm:size-4 text-primary" />
            <span className="truncate">Profil Akun</span>
          </TabsTrigger>
          <TabsTrigger value="identity" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <FileText className="size-3.5 sm:size-4" />
            <span className="truncate">Data Tambahan</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <ShieldCheck className="size-3.5 sm:size-4" />
            <span className="truncate">Kata Sandi</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="text-xs sm:text-sm font-semibold rounded-xl gap-1.5">
            <HelpCircle className="size-3.5 sm:size-4" />
            <span className="truncate">Bantuan</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profil Akun (Student Profile + Mentor Learning Topic Section) */}
        <TabsContent value="profile" className="outline-none focus:outline-none space-y-6">
          {/* Fitur & Konten Profil Student:
              - Nama Lengkap (Editable)
              - Foto Profile (Editable)
              - Email (Editable via OTP)
              - WhatsApp (Editable via OTP)
              - ID Pengguna (Fixed / Read-only)
              - Waktu Bergabung (Fixed / Read-only)
              - Branch (Editable dropdown)
          */}
          <StudentProfileCard />

          {/* Role Mentor Section Toggle if not mentor yet (Dev/Testing Friendly) */}
          {!isMentor && (
            <div className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4 text-emerald-500" />
                <span>Ingin melihat atau mengisi <strong>Learning Topic</strong> spesialisasi mentor?</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMentorSection((prev) => !prev)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/10 text-xs rounded-xl"
              >
                {showMentorSection ? 'Sembunyikan' : 'Buka Section Mentor'}
              </Button>
            </div>
          )}

          {/* Section Learning Topic khusus Profil Mentor (sesuai MentorController:L41) */}
          {showMentorSection && (
            <div className="pt-2">
              <MentorTopicSection />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Data Tambahan (TTL, Orang Tua, Sekolah, Maps Tag Lokasi, Foto Rumah) */}
        <TabsContent value="identity" className="outline-none focus:outline-none">
          <IdentityForm />
        </TabsContent>

        {/* Tab 3: Pengaturan Kata Sandi */}
        <TabsContent value="password" className="outline-none focus:outline-none">
          <PasswordForm />
        </TabsContent>

        {/* Tab 4: Pusat Bantuan */}
        <TabsContent value="help" className="outline-none focus:outline-none">
          <HelpCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="container min-h-[50vh] flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
