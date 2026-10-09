'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileQuestion,
  ExternalLink,
  ChevronDown,
  BookOpen,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: 'Bagaimana cara mendaftar dan mengaktifkan program belajar?',
    answer:
      'Pilih program yang Anda minati di menu Programs, lakukan checkout pembayaran (transfer bank, VA, QRIS, atau saldo akun). Setelah pembayaran diverifikasi otomatis atau disetujui admin, akses program akan langsung terbuka di menu Workspace.',
  },
  {
    question: 'Bagaimana cara mengikuti ujian TryOut CBT dan mendapat poin?',
    answer:
      'Masuk ke menu Workspace atau Programs, buka modul assessment TryOut CBT. Kerjakan soal hingga selesai dan submit. Poin reward gamifikasi akan otomatis masuk ke dompet poin Anda jika passing grade terpenuhi.',
  },
  {
    question: 'Apa yang harus dilakukan jika transaksi program ditolak/dibatalkan?',
    answer:
      'Jika transaksi dibatalkan oleh admin atau kadaluarsa, seluruh dana Anda secara otomatis dikembalikan ke Saldo Dompet Siswa (Student Wallet). Saldo tersebut dapat digunakan untuk membeli program lain atau ditarik kembali ke rekening bank.',
  },
  {
    question: 'Bagaimana jika lupa PIN Transaksi Dompet atau kata sandi?',
    answer:
      'Untuk kata sandi, Anda dapat meresetnya melalui menu Pengaturan > Ganti Kata Sandi atau opsi lupa password di halaman login. Untuk reset PIN transaksi 6 digit, buka menu Dompet Saldo dan pilih opsi Lupa PIN.',
  },
  {
    question: 'Bagaimana alur pengajuan penarikan dana (Withdrawal) bagi Mentor?',
    answer:
      'Mentor dapat memantau akumulasi honor mengajar di Workspace A-Teams. Ajukan pencairan dana melalui menu Dompet Saldo dengan memasukkan nomor rekening bank dan PIN transaksi 6 digit.',
  },
];

export default function HelpCenter() {
  const handleOpenWhatsApp = () => {
    window.open(
      'https://wa.me/6281234567890?text=Halo%20Admin%20Arkanin%2C%20saya%20membutuhkan%20bantuan%20terkait%20akun%20saya.',
      '_blank'
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Help Banner / Direct Contact */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-sm overflow-hidden">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Layanan Bantuan Aktif
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Butuh Bantuan Cepat? Hubungi Kami
            </h2>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Tim Layanan Pelanggan dan Operasional Cabang Arkanin siap membantu kendala akun, materi bimbingan, pembayaran, dan ujian CBT Anda.
            </p>
          </div>

          <Button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-semibold shadow-md shadow-emerald-600/20 h-11 px-5"
          >
            <MessageCircle className="size-4" />
            Chat WhatsApp CS
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/60 p-4 space-y-1.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Clock className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Jam Operasional</h4>
          <p className="text-[11px] text-muted-foreground">Senin - Sabtu: 08:00 - 20:00 WIB</p>
        </Card>

        <Card className="border-border/60 p-4 space-y-1.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Mail className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Email Dukungan</h4>
          <p className="text-[11px] text-muted-foreground truncate">support@arkanin.my.id</p>
        </Card>

        <Card className="border-border/60 p-4 space-y-1.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <BookOpen className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Panduan Belajar</h4>
          <p className="text-[11px] text-muted-foreground">Tersedia panduan PDF & Video</p>
        </Card>
      </div>

      {/* FAQ Accordion */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileQuestion className="size-5 text-primary" />
            Pertanyaan yang Sering Diajukan (FAQ)
          </CardTitle>
          <CardDescription className="text-xs">
            Temukan jawaban cepat atas pertanyaan umum seputar platform Arkanin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/40">
                <AccordionTrigger className="text-xs sm:text-sm font-medium text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
