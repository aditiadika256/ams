'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

interface EnrollmentCodeModalProps {
  trigger?: React.ReactNode;
}

export function EnrollmentCodeModal({ trigger }: EnrollmentCodeModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await apiClient.access.redeem('enrollment-code', trimmed, idempotencyKey);
      alertActions.success('Berhasil!', 'Kode pendaftaran berhasil diklaim. Menuju Workspace…');
      setOpen(false);
      setCode('');
      if (response.data?.id) {
        router.push(`/workspace/accesses/${response.data.id}`);
      } else {
        router.push('/workspace');
      }
    } catch (err) {
      alertActions.error('Gagal mengklaim kode', getErrorMessage(err, 'Kode tidak valid atau sudah kedaluwarsa.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Gift className="size-4" />
            Punya Kode Pendaftaran?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Klaim Kode Pendaftaran</DialogTitle>
          <DialogDescription>
            Masukkan kode pendaftaran (enrollment code) yang Anda miliki untuk mengakses program secara gratis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Label htmlFor="enrollment-code">Kode Pendaftaran</Label>
          <Input
            id="enrollment-code"
            placeholder="Contoh: ARKANIN2026"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter' && code.trim()) void handleRedeem(); }}
            disabled={loading}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={() => void handleRedeem()} disabled={loading || !code.trim()}>
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Memproses…</> : 'Klaim Kode'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
