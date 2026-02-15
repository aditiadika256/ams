'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/loaders';
import { AnimatedButton } from '@/components/ui/animated-button';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi').min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak sama',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await registerUser(data);
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-10 sm:py-16 relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse delay-700" />

      <Button asChild variant="ghost" className="absolute top-4 left-4 md:top-8 md:left-8 z-20 hover:bg-white/10 text-foreground">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
      </Button>

      <GlassCard className="w-full max-w-md mx-4 relative z-10" gradient>
        <GlassCardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
              <img src="/logo/arkanin-logo.png" alt="Arkanin" className="h-8 w-8 object-contain" />
            </div>
          </div>
          <GlassCardTitle className="text-2xl font-bold tracking-tight">Buat Akun Baru</GlassCardTitle>
          <p className="text-sm text-muted-foreground">Arkanin - Edutech Platform</p>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-500 backdrop-blur-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className="bg-white/5 border-white/10 focus:bg-white/10"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
                className="bg-white/5 border-white/10 focus:bg-white/10"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-white/5 border-white/10 focus:bg-white/10"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                {...register('password_confirmation')}
                className="bg-white/5 border-white/10 focus:bg-white/10"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
            <AnimatedButton type="submit" className="w-full h-12 mt-6" disabled={isLoading} variant="glass" asChild>
              {isLoading ? (
                <>
                  <Spinner size="sm" variant="white" className="mr-2" />
                  Mendaftar...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </AnimatedButton>
          </form>
        </GlassCardContent>
        <GlassCardFooter className="flex justify-center border-t border-white/10 p-6">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors">
              Masuk
            </Link>
          </p>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
}
