'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAlertStore } from '@/store/useAlertStore';

export function AppAlertProvider() {
  const alert = useAlertStore((state) => state.alert);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);

  useEffect(() => {
    return () => dismissAlert();
  }, [dismissAlert]);

  if (!alert) {
    return null;
  }

  const isSuccess = alert.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
      aria-live={isSuccess ? 'polite' : 'assertive'}
    >
      <Alert
        variant={isSuccess ? 'success' : 'destructive'}
        className="pointer-events-auto w-full max-w-xl pr-12 shadow-lg shadow-black/10"
      >
        <Icon className="h-4 w-4" />
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.message}</AlertDescription>
        <button
          type="button"
          onClick={dismissAlert}
          aria-label="Tutup notifikasi"
          className="absolute right-3 top-3 rounded-md p-1 text-current opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
