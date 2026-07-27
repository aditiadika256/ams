'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/loaders';
import Link from 'next/link';
import { Suspense } from 'react';

/* -------------------------------------------------------------------------- */
/*  Status types for the callback flow                                        */
/* -------------------------------------------------------------------------- */
type CallbackStatus = 'processing' | 'success' | 'error';

/* -------------------------------------------------------------------------- */
/*  Inner component (needs useSearchParams ➜ must be inside <Suspense>)       */
/* -------------------------------------------------------------------------- */
function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback, isAuthenticated, user } = useAuthStore();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Prevent double-invocation in React Strict Mode
  const hasProcessed = useRef(false);

  /* ── Process the query parameters on mount ─────────────────────────────── */
  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get('token');
    const expiresAt = searchParams.get('expires_at');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(error);
      return;
    }

    if (!token) {
      const message = 'Token tidak ditemukan. Silakan coba login kembali.';
      setStatus('error');
      setErrorMessage(message);
      return;
    }

    // Store the token and fetch the user
    handleGoogleCallback(token, expiresAt)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setErrorMessage(
          err?.message || 'Autentikasi Google gagal. Silahkan coba lagi.',
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Redirect after successful authentication ──────────────────────────── */
  useEffect(() => {
    if (status !== 'success' || !isAuthenticated || !user) return;

    const adminRoles = [
      'superadmin',
      'admin',
      'direktur',
      'manajer_cabang',
      'admin_keuangan',
      'admin_cabang',
      'admin_kemitraan',
      'admin_operasional',
      'admin_teknologi',
      'admin_pemasaran',
    ];

    const redirectTimer = setTimeout(() => {
      if (user.roles?.some((role) => adminRoles.includes(role))) {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [status, isAuthenticated, user, router]);

  /* ── UI ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden py-10 sm:py-16">
      {/* Background blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -45, 0],
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

      <GlassCard className="relative z-10 w-full max-w-md mx-4" gradient>
        <GlassCardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
              <img
                src="/logo/arkanin-logo.png"
                alt="Arkanin"
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          <GlassCardTitle className="text-2xl font-bold tracking-tight">
            {status === 'processing' && 'Memproses Login…'}
            {status === 'success' && 'Login Berhasil!'}
            {status === 'error' && 'Login Gagal'}
          </GlassCardTitle>
        </GlassCardHeader>

        <GlassCardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 py-6"
          >
            {/* Processing state */}
            {status === 'processing' && (
              <>
                <Spinner size="xl" />
                <p className="text-sm text-muted-foreground text-center">
                  Sedang memverifikasi akun Google Anda…
                </p>
              </>
            )}

            {/* Success state */}
            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 12,
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </motion.div>
                <div className="text-center space-y-2">
                  {user && (
                    <p className="text-sm font-medium">
                      Selamat datang, {user.name}!
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mengalihkan ke dashboard…
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  />
                </div>
              </>
            )}

            {/* Error state */}
            {status === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 12,
                  }}
                >
                  <XCircle className="h-16 w-16 text-destructive" />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
                <AnimatedButton
                  asChild
                  variant="glass"
                  className="w-full mt-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/auth/login">Kembali ke Login</Link>
                </AnimatedButton>
              </>
            )}
          </motion.div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page export — wraps inner component in Suspense (required by Next.js for  */
/*  pages using useSearchParams)                                               */
/* -------------------------------------------------------------------------- */
export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
