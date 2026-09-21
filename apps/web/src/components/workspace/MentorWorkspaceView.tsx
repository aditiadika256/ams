'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, DollarSign, Download, Users,
  CheckCircle2, Video, FileText, ArrowRight, Loader2, Sparkles, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { MentorSessionModal } from '@/components/workspace/MentorSessionModal';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

function currency(val: number | string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function MentorWorkspaceView() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [mentorWallet, setMentorWallet] = useState<{ balance: number; pending_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [payslipOpen, setPayslipOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, logRes, walletRes] = await Promise.allSettled([
        apiClient.mentor.schedules(),
        apiClient.mentor.sessionLogs(),
        apiClient.wallet.me(),
      ]);

      if (schedRes.status === 'fulfilled' && schedRes.value.data) {
        setSchedules(schedRes.value.data);
      }
      if (logRes.status === 'fulfilled' && logRes.value.data?.data) {
        setSessionLogs(logRes.value.data.data);
      }
      if (walletRes.status === 'fulfilled' && walletRes.value.data) {
        setMentorWallet({
          balance: Number(walletRes.value.data.mentor_wallet.balance),
          pending_balance: Number(walletRes.value.data.mentor_wallet.pending_balance),
        });
      }
    } catch (err) {
      alertActions.error('Gagal memuat workspace mentor', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openPayslip = async (logId: number) => {
    try {
      const res = await apiClient.mentor.payslip(logId);
      if (res.data) {
        setPayslipData(res.data);
        setPayslipOpen(true);
      }
    } catch (err) {
      alertActions.error('Gagal memuat slip gaji', getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Memuat data pengajar A-Teams…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mentor Stats Header */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo Honor Tersedia</span>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {currency(mentorWallet?.balance ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline" className="w-full text-xs">
              <Link href="/wallet">Tarik Saldo di Dompet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sesi Terselesaikan</span>
            <CardTitle className="text-2xl font-bold mt-1">
              {sessionLogs.length} Sesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Presensi terkunci & honor otomatis masuk</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jadwal Mendatang</span>
            <CardTitle className="text-2xl font-bold mt-1">
              {schedules.filter((s) => !s.is_logged).length} Sesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Siap mengajar & catat presensi kelas</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Jadwal Mengajar Anda</h2>
          <Badge variant="outline" className="text-primary border-primary/30">
            A-Teams Teaching Schedule
          </Badge>
        </div>

        {schedules.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center text-zinc-500">
            <Calendar className="size-8 mx-auto text-zinc-400 mb-2 opacity-60" />
            <p className="text-sm font-medium">Belum ada sesi mengajar yang ditugaskan kepada Anda.</p>
            <p className="text-xs text-zinc-400 mt-1">Jadwal akan muncul setelah admin menetapkan penugasan sesi kelas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {schedules.map((session) => (
              <Card key={session.id} className="border-zinc-200 shadow-sm dark:border-zinc-800 overflow-hidden">
                <div className={`h-1.5 ${session.is_logged ? 'bg-emerald-500' : 'bg-primary'}`} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1.5">{session.program_name}</Badge>
                      <h3 className="font-bold text-lg leading-tight">{session.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{session.batch_name}</p>
                    </div>
                    {session.is_logged ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Selesai</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-400 text-amber-600">Terjadwal</Badge>
                    )}
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5" />
                      <span>{formatDate(session.starts_at)}</span>
                    </div>
                    {session.meeting_url && (
                      <div className="flex items-center gap-2">
                        <Video className="size-3.5 text-blue-500" />
                        <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">
                          Link Kelas Online
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {session.is_logged && session.honor ? `Honor: ${currency(session.honor)}` : 'Honor terhitung otomatis'}
                    </span>
                    <MentorSessionModal
                      sessionId={session.id}
                      sessionTitle={session.title}
                      isLogged={session.is_logged}
                      meetingUrl={session.meeting_url}
                      onSuccess={fetchData}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Honor Rekap & Payslip Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold tracking-tight">Rekapitulasi Honor & Slip Gaji Digital</h2>
        {sessionLogs.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center text-zinc-500 text-sm">
            Belum ada log sesi yang selesai.
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {sessionLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{log.topic}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {log.duration_minutes} menit · {log.student_count} siswa
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {log.session?.batch?.program?.name} · {formatDate(log.locked_at || log.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{currency(log.total_honor)}
                  </span>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => void openPayslip(log.id)}>
                    <FileText className="size-3.5" />
                    Slip Gaji
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Payslip Modal */}
      <Dialog open={payslipOpen} onOpenChange={setPayslipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Slip Gaji Digital
            </DialogTitle>
            <DialogDescription>
              Bukti resmi honor sesi mengajar Arkanin Education Platform.
            </DialogDescription>
          </DialogHeader>

          {payslipData && (
            <div className="space-y-4 py-2 text-sm border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs text-zinc-500">No. Referensi Slip</span>
                <span className="font-mono text-xs font-bold">{payslipData.payslip_number}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Nama Pengajar</p>
                <p className="font-medium">{payslipData.mentor?.name} ({payslipData.mentor?.specialization})</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Program & Sesi</p>
                <p className="font-medium">{payslipData.session?.program}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{payslipData.session?.topic}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                <div>
                  <span className="text-zinc-500">Durasi Kelas</span>
                  <p className="font-semibold">{payslipData.session?.duration_minutes} Menit</p>
                </div>
                <div>
                  <span className="text-zinc-500">Siswa Hadir</span>
                  <p className="font-semibold">{payslipData.session?.student_count} Siswa</p>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="font-bold">Total Honor Terkredit</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {currency(payslipData.payment?.total_honor ?? 0)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setPayslipOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
