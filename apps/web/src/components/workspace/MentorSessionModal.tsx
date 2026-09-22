'use client';

import { useEffect, useState } from 'react';
import {
  Users, CheckCircle2, Clock, Loader2, DollarSign,
  FileText, ShieldCheck, AlertCircle, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

interface StudentAttendanceItem {
  program_access_id: number;
  user_id: number;
  name: string;
  email?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface MentorSessionModalProps {
  sessionId: number;
  sessionTitle: string;
  isLogged?: boolean;
  meetingUrl?: string | null;
  onSuccess?: () => void;
}

function currency(val: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

export function MentorSessionModal({
  sessionId,
  sessionTitle,
  isLogged = false,
  meetingUrl,
  onSuccess,
}: MentorSessionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentAttendanceItem[]>([]);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(90);
  const [hourlyRate, setHourlyRate] = useState(75000);
  const [existingLog, setExistingLog] = useState<any>(null);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.mentor.getAttendances(sessionId);
      if (res.data) {
        setStudents(res.data.students || []);
        if (res.data.log) {
          setExistingLog(res.data.log);
          setTopic(res.data.log.topic || '');
          setNotes(res.data.log.notes || '');
          setDuration(res.data.log.duration_minutes || 90);
          setHourlyRate(Number(res.data.log.hourly_rate) || 75000);
        }
      }
    } catch (err) {
      alertActions.error('Gagal memuat data sesi', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void fetchSessionData();
  }, [open]);

  const updateStudentStatus = (programAccessId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudents((prev) =>
      prev.map((s) => (s.program_access_id === programAccessId ? { ...s, status } : s))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await apiClient.mentor.recordAttendance(
        sessionId,
        students.map((s) => ({
          program_access_id: s.program_access_id,
          user_id: s.user_id,
          status: s.status,
          notes: s.notes,
        }))
      );
      alertActions.success('Presensi tersimpan', 'Catatan absensi siswa berhasil diperbarui.');
    } catch (err) {
      alertActions.error('Gagal menyimpan presensi', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAndLog = async () => {
    if (!topic.trim()) {
      alertActions.error('Topik wajib diisi', 'Mohon tuliskan materi/topik yang dibahas pada sesi ini.');
      return;
    }

    setSaving(true);
    try {
      // First save attendances
      await apiClient.mentor.recordAttendance(
        sessionId,
        students.map((s) => ({
          program_access_id: s.program_access_id,
          user_id: s.user_id,
          status: s.status,
        }))
      );

      // Lock log and credit honor
      await apiClient.mentor.completeAndLog(sessionId, {
        topic: topic.trim(),
        notes: notes.trim() || undefined,
        duration_minutes: duration,
        hourly_rate: hourlyRate,
      });

      alertActions.success('Sesi Berhasil Diselesaikan!', 'Presensi dikunci dan honor telah masuk ke Dompet Mentor Anda.');
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      alertActions.error('Gagal menyelesaikan sesi', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const estimatedHonor = Math.round((duration / 60) * hourlyRate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isLogged ? 'outline' : 'default'} size="sm" className="gap-1.5">
          <Users className="size-4" />
          {isLogged ? 'Lihat Presensi' : 'Presensi & Log Sesi'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{sessionTitle}</DialogTitle>
            {isLogged && (
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                <CheckCircle2 className="size-3 mr-1" />
                Sesi Selesai & Honor Terkredit
              </Badge>
            )}
          </div>
          <DialogDescription>
            Centang kehadiran siswa yang hadir dan masukkan rangkuman materi sesi mengajar Anda.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-5 py-2">
            {meetingUrl && (
              <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <Video className="size-4" />
                  <span>Ruang Tatap Muka Online:</span>
                </div>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs bg-white dark:bg-zinc-900">
                  <a href={meetingUrl} target="_blank" rel="noopener noreferrer">Buka Link Zoom/GMeet</a>
                </Button>
              </div>
            )}

            {/* Attendance Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Daftar Kehadiran Siswa ({presentCount}/{students.length} Hadir)</Label>
                <span className="text-xs text-zinc-500">Pilih status per siswa</span>
              </div>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="p-4 text-center text-xs text-zinc-400">Belum ada siswa terdaftar di batch ini.</p>
                ) : (
                  students.map((st) => (
                    <div key={st.program_access_id} className="flex items-center justify-between p-2.5 text-sm">
                      <div>
                        <p className="font-medium">{st.name}</p>
                        <p className="text-xs text-zinc-500">{st.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['present', 'late', 'excused', 'absent'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            disabled={isLogged}
                            onClick={() => updateStudentStatus(st.program_access_id, mode)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              st.status === mode
                                ? mode === 'present'
                                  ? 'bg-emerald-600 text-white font-medium'
                                  : mode === 'late'
                                  ? 'bg-amber-500 text-white font-medium'
                                  : mode === 'excused'
                                  ? 'bg-blue-500 text-white font-medium'
                                  : 'bg-rose-600 text-white font-medium'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                            }`}
                          >
                            {mode === 'present' ? 'Hadir' : mode === 'late' ? 'Terlambat' : mode === 'excused' ? 'Izin' : 'Alpa'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Topic & Teaching Notes */}
            <div className="grid gap-3">
              <div>
                <Label htmlFor="session-topic">Topik / Materi yang Dibahas</Label>
                <Input
                  id="session-topic"
                  placeholder="Contoh: Pembahasan Soal Penalaran Matematika Bab 3"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLogged}
                />
              </div>
              <div>
                <Label htmlFor="session-notes">Catatan Tambahan untuk Kelas (Opsional)</Label>
                <Textarea
                  id="session-notes"
                  rows={2}
                  placeholder="Catatan keaktifan siswa, PR, atau kendala sesi…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLogged}
                />
              </div>
            </div>

            {/* Honor calculation summary */}
            <div className="rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 p-3.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Clock className="size-4" />
                <span>Durasi: <strong>{duration} menit</strong></span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span>Honor: <strong>{currency(estimatedHonor)}</strong></span>
              </div>
              <Badge variant="outline" className="text-xs">
                Kredit Langsung ke Dompet Mentor
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!isLogged ? (
            <>
              <Button variant="outline" onClick={() => void handleSaveAttendance()} disabled={saving || loading}>
                Simpan Draf Presensi
              </Button>
              <Button onClick={() => void handleCompleteAndLog()} disabled={saving || loading || !topic.trim()}>
                {saving ? <><Loader2 className="size-4 animate-spin mr-2" />Memproses…</> : 'Selesaikan & Kunci Honor'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
