'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
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
  password: z.string().min(6, 'Password minimal 6 karakter'),
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
    defaultValues: {
      email: 'superadmin@arkanin.com',
      password: 'password',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data);
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden py-10 sm:py-16">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -45, 0],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

      <AnimatedButton asChild variant="ghost" className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
      </AnimatedButton>

      <GlassCard className="relative z-10 w-full max-w-md mx-4" gradient>
        <GlassCardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
              <img src="/logo/arkanin-logo.png" alt="Arkanin" className="h-8 w-8 object-contain" />
            </div>
          </div>
          <GlassCardTitle className="text-2xl font-bold tracking-tight">
            Selamat Datang
          </GlassCardTitle>
          <GlassCardDescription>
            Masuk untuk mengakses Edutech Platform
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-destructive/20 bg-destructive/10 backdrop-blur-sm p-4 text-center text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <AnimatedButton
              type="submit"
              className="w-full"
              variant="glass"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline underline-offset-4">
              Daftar sekarang
            </Link>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
