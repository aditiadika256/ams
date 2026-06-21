'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check for admin roles (including specific admin roles)
      const adminRoles = ['superadmin', 'admin', 'direktur', 'manajer_cabang', 'admin_keuangan', 'admin_cabang', 'admin_kemitraan', 'admin_operasional', 'admin_teknologi', 'admin_pemasaran'];

      if (user.roles?.some(role => adminRoles.includes(role))) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data);
    } catch (err) {
      // Error handled by store
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    clearError();
    try {
      const response = await (await import('@/lib/api')).apiClient.auth.googleRedirect();
      if (response.success && response.data) {
        window.location.href = response.data;
        // Keep loading state — we're navigating away
        return;
      }
      throw new Error('Gagal mendapatkan URL Google');
    } catch (err: any) {
      setIsGoogleLoading(false);
      // Show error via the same error banner used for login
      useAuthStore.setState({
        error: err?.message || 'Gagal menghubungi Google. Silahkan coba lagi.',
      });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background/95 py-10 sm:py-16">
      {/* Simple, firm background pattern (optional, for texture) */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <AnimatedButton asChild variant="ghost" className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
      </AnimatedButton>

      <GlassCard className="relative z-10 w-full max-w-md mx-4 border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl">
        <GlassCardHeader className="text-center space-y-2 pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <img src="/logo/arkanin-logo.png" alt="Arkanin" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <GlassCardTitle className="text-3xl font-bold tracking-tight">
            Selamat Datang
          </GlassCardTitle>
          <GlassCardDescription className="text-muted-foreground">
            Masuk ke akun Arkanin Anda
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm font-medium text-destructive"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="bg-background/50 border-input hover:bg-background focus:bg-background transition-colors"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-background/50 border-input hover:bg-background focus:bg-background transition-colors"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
            <AnimatedButton
              type="submit"
              className="w-full mt-2"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </AnimatedButton>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">Atau lanjutkan dengan</span>
            </div>
          </div>

          <AnimatedButton
            type="button"
            variant="outline"
            className="w-full h-11 bg-background/50 hover:bg-background border-border"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menghubungi Google...
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="mr-2 h-5 w-5" alt="Google" />
                Masuk dengan Google
              </>
            )}
          </AnimatedButton>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-semibold text-primary hover:underline underline-offset-4 transition-all">
              Daftar sekarang
            </Link>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
