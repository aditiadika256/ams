
import React from 'react';
import ProgramCard from '@/components/programs/ProgramCard';

const mockPrograms = [
  {
    id: 1,
    name: 'Tryout SKD CPNS 2024',
    level: 'CPNS',
    type: 'Tryout',
    price: 75000,
    imageUrl: 'https://via.placeholder.com/400x225/2563eb/ffffff?text=CPNS',
  },
  {
    id: 2,
    name: 'Bimbel Intensif UTBK 2025',
    level: 'SMA',
    type: 'Bimbel',
    price: 1250000,
    imageUrl: 'https://via.placeholder.com/400x225/10b981/ffffff?text=UTBK',
  },
  {
    id: 3,
    name: 'Paket Soal Ujian Sekolah',
    level: 'SMP',
    type: 'Tryout',
    price: 50000,
    imageUrl: 'https://via.placeholder.com/400x225/f97316/ffffff?text=Ujian',
  },
  {
    id: 4,
    name: 'Olimpiade Sains Nasional Prep',
    level: 'SD',
    type: 'Bimbel',
    price: 850000,
    imageUrl: 'https://via.placeholder.com/400x225/ef4444/ffffff?text=OSN',
  },
];

export default function ProgramsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Daftar Program</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockPrograms.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}
