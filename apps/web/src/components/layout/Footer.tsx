import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative w-full pt-40 pb-8 px-4 sm:px-6 lg:px-8 mt-auto overflow-hidden">
      {/* Decorative background grid for the footer area */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none -z-10" />

      {/* CTA Banner (Overlapping) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-20">
        <div className="bg-primary rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-primary-foreground relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
          
          <div className="relative z-10 space-y-4 max-w-xl">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Mulai Perjalanan Belajar Anda!</h3>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Daftar sebagai student atau member premium untuk mengakses kelas eksklusif, atau telusuri produk digital kami untuk mempercepat peningkatan karir Anda.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Button size="lg" variant="secondary" asChild className="font-bold rounded-full w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/register">Daftar Sekarang</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground rounded-full w-full sm:w-auto backdrop-blur-sm" asChild>
              <Link href="/products">Lihat Produk</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="mx-auto w-full max-w-7xl pt-32 pb-8 md:pt-40 border border-border/50 bg-card/40 backdrop-blur-2xl rounded-[2.5rem] shadow-xl px-8 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                <img src="/logo/arkanin-logo.png" alt="Arkanin" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Arkanin</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Platform Edutech modern tempat pelajar, inovator, dan profesional berkumpul untuk berbagi pengetahuan, berkolaborasi, dan tumbuh bersama membangun masa depan.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="p-2.5 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground shadow-sm hover:shadow-md hover:-translate-y-1"><Facebook className="h-4 w-4" /></Link>
              <Link href="#" className="p-2.5 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground shadow-sm hover:shadow-md hover:-translate-y-1"><Instagram className="h-4 w-4" /></Link>
              <Link href="#" className="p-2.5 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground shadow-sm hover:shadow-md hover:-translate-y-1"><Twitter className="h-4 w-4" /></Link>
              <Link href="#" className="p-2.5 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground shadow-sm hover:shadow-md hover:-translate-y-1"><Linkedin className="h-4 w-4" /></Link>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Perusahaan</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors font-medium">Tentang Kami</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors font-medium">Layanan</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors font-medium">Karir</Link></li>
              <li><Link href="/testimonials" className="hover:text-primary transition-colors font-medium">Testimoni</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Program Kami</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors font-medium">Daftar Kursus</Link></li>
              <li><Link href="/membership" className="hover:text-primary transition-colors font-medium">Membership Premium</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors font-medium">Produk Digital</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors font-medium">Artikel & Blog</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Hubungi Kami</h4>
            <ul className="space-y-5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Telepon</span>
                  <span className="font-medium mt-0.5">+62 123 4567 890</span>
                </div>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Email</span>
                  <span className="font-medium mt-0.5">support@arkanin.com</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground">
            © {new Date().getFullYear()} Arkanin. Hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Syarat Penggunaan</Link>
            <Link href="/legal" className="hover:text-primary transition-colors">Legalitas</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Peta Situs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
