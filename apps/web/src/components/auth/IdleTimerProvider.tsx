'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import {
  readBrowserSession,
  SESSION_CONFIG,
  SESSION_STORAGE_KEYS,
  startBrowserSession,
  touchBrowserSession,
} from '@/lib/session';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

interface IdleTimerProviderProps {
  children: React.ReactNode;
}

const ACTIVITY_WRITE_THROTTLE_MS = 5_000;

export const IdleTimerProvider: React.FC<IdleTimerProviderProps> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const clearLocalSession = useAuthStore((state) => state.clearLocalSession);
  const pathname = usePathname();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(
    Math.ceil(SESSION_CONFIG.warningBeforeMs / 1000),
  );

  const warningVisibleRef = useRef(false);
  const lastActivityWriteRef = useRef(0);
  const logoutInProgressRef = useRef(false);

  const isExamPage = pathname?.startsWith('/exams/session');
  const idleTimeoutMs = isExamPage
    ? SESSION_CONFIG.examIdleTimeoutMs
    : SESSION_CONFIG.idleTimeoutMs;

  useEffect(() => {
    warningVisibleRef.current = showWarning;
  }, [showWarning]);

  const redirectToExpiredLogin = useCallback(() => {
    router.replace('/auth/login?reason=session_expired');
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (logoutInProgressRef.current) return;

    logoutInProgressRef.current = true;
    warningVisibleRef.current = false;
    setShowWarning(false);

    await logout();
    redirectToExpiredLogin();
  }, [logout, redirectToExpiredLogin]);

  const handleStayLoggedIn = useCallback(async () => {
    try {
      // Validate that the database-backed Sanctum token is still valid.
      await apiClient.auth.me();
      const now = Date.now();
      touchBrowserSession(now);
      lastActivityWriteRef.current = now;
      warningVisibleRef.current = false;
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to validate the current session:', error);
      clearLocalSession();
      redirectToExpiredLogin();
    }
  }, [clearLocalSession, redirectToExpiredLogin]);

  useEffect(() => {
    if (!isAuthenticated) {
      warningVisibleRef.current = false;
      logoutInProgressRef.current = false;
      setShowWarning(false);
      return;
    }

    const existingSession = readBrowserSession();
    const initialSession = existingSession ?? startBrowserSession();
    lastActivityWriteRef.current = initialSession.lastActivityAt;
    logoutInProgressRef.current = false;

    const recordActivity = () => {
      if (warningVisibleRef.current || logoutInProgressRef.current) return;

      const now = Date.now();
      if (now - lastActivityWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
        return;
      }

      lastActivityWriteRef.current = now;
      touchBrowserSession(now);
    };

    const checkSession = () => {
      if (logoutInProgressRef.current) return;

      const session = readBrowserSession();
      if (!session) {
        clearLocalSession();
        redirectToExpiredLogin();
        return;
      }

      const now = Date.now();
      const idleExpiresAt = session.lastActivityAt + idleTimeoutMs;
      const effectiveExpiresAt = Math.min(idleExpiresAt, session.expiresAt);
      const remainingMs = effectiveExpiresAt - now;

      if (remainingMs <= 0) {
        void handleLogout();
        return;
      }

      if (remainingMs <= SESSION_CONFIG.warningBeforeMs) {
        warningVisibleRef.current = true;
        setShowWarning(true);
        setCountdown(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else if (warningVisibleRef.current) {
        // Activity in another tab can also dismiss this warning.
        warningVisibleRef.current = false;
        setShowWarning(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-storage') {
        let authenticatedInStorage = false;

        if (event.newValue) {
          try {
            authenticatedInStorage =
              JSON.parse(event.newValue)?.state?.isAuthenticated === true;
          } catch {
            authenticatedInStorage = false;
          }
        }

        if (!authenticatedInStorage) {
          // A different tab logged out. Force a reload so Zustand rehydrates
          // from the shared, cleared localStorage state without write loops.
          window.location.replace('/auth/login?reason=session_expired');
        }
        return;
      }

      if (
        event.key &&
        Object.values(SESSION_STORAGE_KEYS).includes(
          event.key as (typeof SESSION_STORAGE_KEYS)[keyof typeof SESSION_STORAGE_KEYS],
        )
      ) {
        if (!event.newValue) {
          window.location.replace('/auth/login?reason=session_expired');
          return;
        }
        checkSession();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, recordActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const checker = window.setInterval(checkSession, 1_000);
    checkSession();

    return () => {
      window.clearInterval(checker);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    clearLocalSession,
    handleLogout,
    idleTimeoutMs,
    isAuthenticated,
    redirectToExpiredLogin,
  ]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={handleStayLoggedIn}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Apakah Anda masih di sini?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Untuk keamanan akun, sesi Anda akan berakhir otomatis dalam:
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 font-mono text-2xl font-bold text-yellow-500">
                  <Clock className="h-5 w-5 animate-pulse" />
                  {formatCountdown(countdown)}
                </div>

                {isExamPage && (
                  <p className="text-xs italic text-muted-foreground/80">
                    Waktu idle diperpanjang selama sesi ujian aktif.
                  </p>
                )}

                <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
                  <AnimatedButton
                    type="button"
                    variant="default"
                    onClick={handleStayLoggedIn}
                    className="order-1 flex-1 sm:order-2"
                  >
                    Tetap Masuk
                  </AnimatedButton>
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="order-2 flex-1 gap-2 border-border/80 hover:bg-destructive/10 hover:text-destructive sm:order-1"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
