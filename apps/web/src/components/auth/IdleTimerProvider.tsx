'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, LogOut, ShieldAlert } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

interface IdleTimerProviderProps {
  children: React.ReactNode;
}

export const IdleTimerProvider: React.FC<IdleTimerProviderProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds

  const lastActiveTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configure timeouts: 120 minutes on exam session, 30 minutes on other pages
  const isExamPage = pathname?.startsWith('/exams/session');
  const IDLE_TIMEOUT = isExamPage ? 120 * 60 * 1000 : 30 * 60 * 1000;
  const WARNING_BEFORE = 2 * 60 * 1000; // Show warning 2 minutes before logout

  const resetActivity = () => {
    lastActiveTimeRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(120);
    }
  };

  const handleStayLoggedIn = async () => {
    resetActivity();
    try {
      // Fetch profile to update "last_used_at" for token on backend
      await apiClient.auth.me();
    } catch (err) {
      console.error('Failed to keep backend session alive:', err);
    }
  };

  const handleLogout = async () => {
    setShowWarning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    await logout();
    router.push('/auth/login?reason=session_expired');
  };

  // Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      // Only reset activity if we're not currently showing the warning modal
      if (!showWarning) {
        resetActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, activityHandler);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [isAuthenticated, showWarning]);

  // Main inactivity timer checker (runs every second)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActiveTimeRef.current;
      const warningThreshold = IDLE_TIMEOUT - WARNING_BEFORE;

      if (elapsed >= IDLE_TIMEOUT) {
        // Log out immediately
        handleLogout();
      } else if (elapsed >= warningThreshold && !showWarning) {
        // Show warning modal
        setShowWarning(true);
        // Calculate remaining seconds exactly
        const remainingSeconds = Math.max(0, Math.ceil((IDLE_TIMEOUT - elapsed) / 1000));
        setCountdown(remainingSeconds);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isAuthenticated, IDLE_TIMEOUT, showWarning]);

  // Countdown timer (runs when warning modal is active)
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={handleStayLoggedIn}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Warning icon with pulsing animation */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
                  <div className="relative h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 text-yellow-500">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Apakah Anda masih di sini? 🤔
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Anda sudah tidak aktif untuk beberapa waktu. Untuk alasan keamanan, Anda akan keluar secara otomatis dalam:
                  </p>
                </div>

                {/* Big Countdown Timer */}
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 font-mono font-bold text-2xl">
                  <Clock className="h-5 w-5 animate-pulse" />
                  {formatCountdown(countdown)}
                </div>

                {isExamPage && (
                  <p className="text-xs text-muted-foreground/80 italic">
                    * Waktu idle diperpanjang selama sesi ujian aktif untuk menghindari pemutusan hubungan yang tidak disengaja.
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 w-full pt-4">
                  <AnimatedButton
                    type="button"
                    variant="default"
                    onClick={handleStayLoggedIn}
                    className="flex-1 order-1 sm:order-2"
                  >
                    Tetap Masuk
                  </AnimatedButton>
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="flex-1 border-border/80 hover:bg-destructive/10 hover:text-destructive order-2 sm:order-1 gap-2"
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
