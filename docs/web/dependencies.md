# Web Frontend Dependencies & Libraries

Dokumen ini berisi daftar library dan dependensi utama yang digunakan dalam pengembangan frontend aplikasi web (Next.js). Semua dependensi ini sudah tercatat dalam `package.json` dan akan otomatis terinstall saat menjalankan `npm install`.

## Core Framework
- **Next.js 15**: Framework React utama.
- **React 19**: Library UI.
- **TypeScript**: Bahasa pemrograman dengan tipe statis.
- **Tailwind CSS 4**: Framework CSS utility-first.

## UI Components & Styling
- **Shadcn UI**: Koleksi komponen UI reusable (dibangun di atas Radix UI).
  - Menggunakan dependensi internal `@radix-ui/*` (Accordion, Avatar, Dialog, Dropdown, Label, Select, Separator, Slot, Tabs).
- **Lucide React**: Library ikon standar yang digunakan.
- **Framer Motion**: Library untuk animasi declarative.
- **Class Variance Authority (CVA)**: Untuk membuat varian komponen styling.
- **Clsx & Tailwind Merge**: Utilitas untuk menggabungkan class Tailwind secara kondisional dan aman.
- **Next Themes**: Manajemen tema (Light/Dark mode).
- **Vaul**: Komponen drawer untuk React.

## State Management & Data Fetching
- **Zustand**: State management yang ringan dan sederhana (digunakan untuk Auth, Cart, dll).
- **Axios**: HTTP Client untuk komunikasi dengan Backend API.

## Forms & Validation
- **React Hook Form**: Manajemen state form yang performant.
- **Zod**: Schema validation untuk data (digunakan bersama React Hook Form).
- **@hookform/resolvers**: Resolver untuk menghubungkan Zod dengan React Hook Form.

## Data Visualization & Reporting
- **Recharts**: Library charting untuk menampilkan grafik/statistik.
- **jsPDF & jsPDF-autotable**: Library untuk generate file PDF di sisi client.

## Development Tools
- **ESLint**: Linter code.
- **Prettier**: Code formatter (via plugin/config).
- **PostCSS & Autoprefixer**: CSS processing.

---

### Catatan Penggunaan
Untuk menggunakan library di atas, cukup import sesuai dokumentasi masing-masing. Tidak perlu melakukan instalasi manual (`npm install ...`) lagi kecuali Anda menambahkan library baru.

Contoh import umum:
```tsx
import { motion } from 'framer-motion';
import { useStore } from 'zustand';
import { z } from 'zod';
import { Button } from '@/components/ui/button'; // Shadcn UI component
```
