'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CheckCircle2, XCircle, Clock, ExternalLink,
  Search, Filter, ArrowLeft, Loader2, Award, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';

const statusBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  applied: { label: 'Baru Masuk', variant: 'secondary' },
  under_review: { label: 'Ditinjau', variant: 'outline' },
  assessment: { label: 'Tes Tulis', variant: 'outline' },
  interview: { label: 'Wawancara', variant: 'default' },
  hired: { label: 'Diterima', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
  withdrawn: { label: 'Mengundurkan Diri', variant: 'outline' },
};

export default function AdminMentorApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for status update
  const [newStatus, setNewStatus] = useState('');
  const [testScore, setTestScore] = useState('');
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState('mentor_harian');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.admin.mentorApplications.list({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (res.data?.data) {
        setApplications(res.data.data);
      }
    } catch (err) {
      alertActions.error('Gagal memuat pelamar', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, [statusFilter]);

  const openEvaluationModal = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setTestScore(app.written_test_score ? String(app.written_test_score) : '');
    setNotes(app.interview_notes || '');
    setRole(app.assigned_role || 'mentor_harian');
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;

    setSaving(true);
    try {
      await apiClient.admin.mentorApplications.updateStatus(selectedApp.id, {
        status: newStatus,
        written_test_score: testScore ? Number(testScore) : undefined,
        interview_notes: notes || undefined,
        assigned_role: role,
      });
      alertActions.success('Status Diperbarui', `Pelamar telah dipindahkan ke tahap ${newStatus}.`);
      setModalOpen(false);
      void fetchApplications();
    } catch (err) {
      alertActions.error('Gagal memperbarui status', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30">ASA Operational Portal</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Rekrutmen Calon Pengajar (A-Teams)</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Pipeline seleksi, penilaian tes tulis, dan penerimaan mentor baru.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/become-mentor" target="_blank">
            <ExternalLink className="size-4 mr-1.5" />
            Formulir Publik Pendaftaran
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Cari nama atau email pelamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void fetchApplications(); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['', 'applied', 'under_review', 'assessment', 'interview', 'hired', 'rejected'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="text-xs shrink-0 capitalize"
            >
              {st ? (statusBadges[st]?.label || st) : 'Semua Status'}
            </Button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Users className="size-10 mx-auto text-zinc-400 mb-2 opacity-60" />
              <p className="font-medium">Tidak ada lamaran pengajar pada kriteria ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {applications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{app.name}</h3>
                      <Badge variant={statusBadges[app.status]?.variant ?? 'outline'}>
                        {statusBadges[app.status]?.label ?? app.status}
                      </Badge>
                      {app.assigned_role && (
                        <Badge variant="secondary" className="text-xs">
                          {app.assigned_role === 'mentor_utama' ? 'Mentor Utama' : 'Mentor Harian'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {app.specialization} · {app.email} · {app.phone}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1">
                      {app.cv_url && (
                        <a href={app.cv_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <FileText className="size-3" /> CV
                        </a>
                      )}
                      {app.certificate_url && (
                        <a href={app.certificate_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <Award className="size-3" /> Sertifikat
                        </a>
                      )}
                      {app.teaching_video_url && (
                        <a href={app.teaching_video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <ExternalLink className="size-3" /> Video Mengajar
                        </a>
                      )}
                      {app.written_test_score && (
                        <span>Nilai Tes: <strong>{app.written_test_score}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="self-end md:self-center">
                    <Button size="sm" onClick={() => openEvaluationModal(app)}>
                      Evaluasi & Tahap Seleksi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation & Status Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluasi Pelamar: {selectedApp?.name}</DialogTitle>
            <DialogDescription>
              {selectedApp?.specialization} · {selectedApp?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 text-sm">
            <div>
              <Label htmlFor="eval-status">Tahapan Seleksi</Label>
              <select
                id="eval-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="applied">Applied (Baru Masuk)</option>
                <option value="under_review">Under Review (Ditinjau Berkas)</option>
                <option value="assessment">Assessment (Tes Tulis)</option>
                <option value="interview">Interview (Wawancara)</option>
                <option value="hired">Hired (Diterima Menjadi Pengajar)</option>
                <option value="rejected">Rejected (Ditolak)</option>
                <option value="withdrawn">Withdrawn (Batal)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="eval-role">Penetapan Peran (Role Pengajar)</Label>
              <select
                id="eval-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="mentor_harian">Mentor Harian</option>
                <option value="mentor_utama">Mentor Utama</option>
              </select>
            </div>

            <div>
              <Label htmlFor="eval-score">Nilai Tes Tulis (0 - 100)</Label>
              <Input
                id="eval-score"
                type="number"
                placeholder="Contoh: 85.50"
                value={testScore}
                onChange={(e) => setTestScore(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="eval-notes">Notulensi Wawancara & Evaluasi ASA</Label>
              <Textarea
                id="eval-notes"
                rows={3}
                placeholder="Catatan kelebihan, gaya mengajar, atau rekomendasi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={() => void handleUpdateStatus()} disabled={saving}>
              {saving ? <><Loader2 className="size-4 animate-spin mr-2" />Menyimpan…</> : 'Simpan Evaluasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
