'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/loaders';
import { AnimatedButton } from '@/components/ui/animated-button';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi').min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
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
    try {
      await registerUser(data);
    } catch (err) {
      // Error handled by store
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
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
      useAuthStore.setState({
        error: err?.message || 'Gagal menghubungi Google. Silahkan coba lagi.',
      });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
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
                className="bg-white/10 border-white/20 focus:bg-white/20 focus:border-primary/50 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
                className="bg-white/10 border-white/20 focus:bg-white/20 focus:border-primary/50 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-white/10 border-white/20 focus:bg-white/20 focus:border-primary/50 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                {...register('password_confirmation')}
                className="bg-white/10 border-white/20 focus:bg-white/20 focus:border-primary/50 transition-all"
              />
              {errors.password_confirmation && (
                <p className="text-xs text-red-500">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
            <AnimatedButton
              type="submit"
              className="w-full h-12 mt-6"
              disabled={isLoading}
              variant="glass"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground backdrop-blur-sm">Atau daftar dengan</span>
            </div>
          </div>

          <AnimatedButton
            type="button"
            variant="outline"
            className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGoogleLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Menghubungi Google…
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="mr-2 h-5 w-5" alt="Google" />
                Google
              </>
            )}
          </AnimatedButton>
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
