
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data - in a real application, you would fetch this based on the id
const mockPrograms = [
  {
    id: 1,
    name: 'Tryout SKD CPNS 2024',
    level: 'CPNS',
    type: 'Tryout',
    price: 75000,
    imageUrl: 'https://via.placeholder.com/800x450/2563eb/ffffff?text=CPNS',
    description: 'Persiapkan diri Anda untuk seleksi CPNS 2024 dengan paket tryout SKD terlengkap. Simulasi ujian dengan sistem CAT BKN, materi terupdate, dan pembahasan soal mendalam.',
    features: ['Simulasi Realistis', 'Soal HOTS Terbaru', 'Analisis Hasil Detail', 'Ranking Nasional'],
  },
  {
    id: 2,
    name: 'Bimbingan Intensif PPPK Guru',
    level: 'PPPK',
    type: 'Bimbingan',
    price: 450000,
    imageUrl: 'https://via.placeholder.com/800x450/2563eb/ffffff?text=PPPK',
    description: 'Program bimbingan intensif untuk menghadapi seleksi PPPK Guru. Dibimbing oleh mentor berpengalaman dengan materi pedagogik, profesional, dan sosial-kultural.',
    features: ['Mentor Ahli', 'Sesi Live Teaching', 'Grup Diskusi Aktif', 'Materi Lengkap'],
  },
  {
    id: 3,
    name: 'Paket Soal Mandiri Sekolah Kedinasan',
    level: 'SEKDIN',
    type: 'Paket Soal',
    price: 120000,
    imageUrl: 'https://via.placeholder.com/800x450/2563eb/ffffff?text=SEKDIN',
    description: 'Kumpulan soal dan pembahasan untuk persiapan mandiri masuk Sekolah Kedinasan impian Anda. Mencakup berbagai jenis tes dari berbagai instansi.',
    features: ['Bank Soal Lengkap', 'Pembahasan Jelas', 'Tips & Trik', 'Akses Fleksibel'],
  },
  {
    id: 4,
    name: 'Tryout Akbar BUMN Batch #3',
    level: 'BUMN',
    type: 'Tryout',
    price: 65000,
    imageUrl: 'https://via.placeholder.com/800x450/2563eb/ffffff?text=BUMN',
    description: 'Ikuti tryout akbar untuk rekrutmen bersama BUMN. Uji kemampuan Anda pada tes TKD dan Core Values AKHLAK BUMN.',
    features: ['Standar Rekrutmen BUMN', 'Sistem Penilaian Mirip Asli', 'Pembahasan Soal', 'Sertifikat Digital'],
  },
];

// This is a Server Component, so we can get params directly
export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const program = mockPrograms.find(p => p.id.toString() === params.id);

  if (!program) {
    return (
      <div className="container py-6 text-center">
        <p>Program tidak ditemukan.</p>
        <Button asChild variant="link">
          <Link href="/programs">Kembali ke Daftar Program</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="p-0">
          {program.imageUrl && (
            <div className="aspect-video w-full bg-muted rounded-t-lg mb-4">
              <img
                src={program.imageUrl}
                alt={program.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
          )}
          <div className="px-6 pb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <CardTitle className="text-2xl tracking-tight font-bold">{program.name}</CardTitle>
              <Badge variant="default">{program.level.toUpperCase()}</Badge>
            </div>
            <p className="text-muted-foreground">{program.type}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{program.description}</p>
          
          <h3 className="font-semibold mb-3 text-lg">Fitur Program</h3>
          <ul className="list-disc list-inside space-y-2">
            {program.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 px-6 py-4 rounded-b-lg">
          <p className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(program.price)}
          </p>
          <Button size="lg" className="w-full sm:w-auto">Daftar Sekarang</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
