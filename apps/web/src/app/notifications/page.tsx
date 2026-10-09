'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Clock, BookOpen, CreditCard, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationItem {
  id: string;
  type: 'academic' | 'finance' | 'announcement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'academic',
    title: 'Sesi Belajar Dimulai Hari Ini',
    message: 'Kelas bimbingan intensif Anda akan dimulai pukul 16:00 WIB. Pastikan link Zoom dan modul sudah diunduh.',
    time: '15 menit lalu',
    read: false,
    link: '/workspace',
  },
  {
    id: '2',
    type: 'academic',
    title: 'TryOut CBT Baru Tersedia',
    message: 'Paket simulasi ujian SKD CPNS 2026 telah dibuka. Kerjakan sekarang untuk mengumpulkan poin reward!',
    time: '2 jam lalu',
    read: false,
    link: '/exams',
  },
  {
    id: '3',
    type: 'finance',
    title: 'Pembayaran Program Terverifikasi',
    message: 'Order #ORD-2026-0042 telah berhasil diverifikasi oleh tim keuangan. Akses program telah aktif.',
    time: '1 hari lalu',
    read: true,
    link: '/orders',
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Event Poin Ganda di Store',
    message: 'Dapatkan 2x bonus poin untuk setiap pengerjaan latihan soal minggu ini. Tukarkan dengan buku modul gratis!',
    time: '2 hari lalu',
    read: true,
    link: '/store',
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'finance' | 'announcement'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container min-h-screen max-w-3xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl size-9 md:hidden">
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="size-6 text-primary" />
              Notifikasi
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notifikasi baru belum dibaca` : 'Semua notifikasi telah dibaca'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs rounded-xl gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Tandai Dibaca
          </Button>
        )}
      </div>

      {/* Tabs Filter */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full mb-6">
        <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="all" className="text-xs font-medium rounded-lg">Semua</TabsTrigger>
          <TabsTrigger value="academic" className="text-xs font-medium rounded-lg">Akademik</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs font-medium rounded-lg">Transaksi</TabsTrigger>
          <TabsTrigger value="announcement" className="text-xs font-medium rounded-lg">Promo</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List Notifications */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-dashed py-12 text-center bg-card/40">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Bell className="size-6" />
              </div>
              <p className="font-semibold text-foreground">Tidak Ada Notifikasi</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Belum ada pembaruan pada kategori ini. Anda akan mendapatkan info ketika ada aktivitas baru.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => {
            const Icon =
              item.type === 'academic'
                ? BookOpen
                : item.type === 'finance'
                ? CreditCard
                : Sparkles;

            const iconColor =
              item.type === 'academic'
                ? 'text-primary bg-primary/10'
                : item.type === 'finance'
                ? 'text-emerald-500 bg-emerald-500/10'
                : 'text-amber-500 bg-amber-500/10';

            return (
              <Card
                key={item.id}
                className={`transition-all duration-200 border-border/60 hover:border-primary/40 ${
                  !item.read ? 'bg-primary/5 dark:bg-primary/[0.03] border-primary/20' : 'bg-card/70'
                }`}
              >
                <CardContent className="p-4 flex gap-3.5 items-start">
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-foreground truncate">{item.title}</h2>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{item.message}</p>
                    {item.link && (
                      <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs font-semibold text-primary">
                        <Link href={item.link}>Buka Detail &rarr;</Link>
                      </Button>
                    )}
                  </div>
                  {!item.read && (
                    <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
