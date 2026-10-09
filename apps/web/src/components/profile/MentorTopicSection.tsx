'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Sparkles,
  Plus,
  X,
  Save,
  Loader2,
  GraduationCap,
  Award,
  CheckCircle2,
  Briefcase,
  Layers,
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Penalaran Umum (TPS)',
  'Penalaran Matematika',
  'Literasi Bahasa Indonesia',
  'Literasi Bahasa Inggris',
  'Matematika Saintek',
  'Fisika UTBK & Ujian Mandiri',
  'Kimia Analitik & Organik',
  'Biologi Sel & Genetika',
  'Tes Wawasan Kebangsaan (TWK CPNS)',
  'Tes Inteligensia Umum (TIU Kedinasan)',
  'Struktur Data & Algoritma',
  'Fullstack Web Development',
];

export default function MentorTopicSection() {
  const { user, fetchUser } = useAuthStore();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [loading, setLoading] = useState(false);

  // Load existing mentor specialization from user
  useEffect(() => {
    if (user?.mentor) {
      if (user.mentor.specialization) {
        const topics = user.mentor.specialization
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        setSelectedTopics(topics);
      }
      if (user.mentor.bio) {
        setBio(user.mentor.bio);
      }
      if (user.mentor.experience_years !== undefined) {
        setExperienceYears(user.mentor.experience_years);
      }
    }
  }, [user]);

  // Toggle a suggested topic
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics((prev) => prev.filter((t) => t !== topic));
    } else {
      setSelectedTopics((prev) => [...prev, topic]);
    }
  };

  // Add custom topic
  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopic.trim();
    if (!trimmed) return;
    if (selectedTopics.includes(trimmed)) {
      alertActions.error('Topik Sudah Ada', 'Topik tersebut sudah ditambahkan ke daftar spesialisasi Anda.');
      return;
    }
    setSelectedTopics((prev) => [...prev, trimmed]);
    setCustomTopic('');
  };

  // Remove topic
  const handleRemoveTopic = (topic: string) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic));
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopics.length === 0) {
      alertActions.error('Topik Kosong', 'Pilih minimal satu topik pembelajaran atau spesialisasi mentor.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.auth.updateMentorSpecialization({
        specialization: selectedTopics.join(', '),
        bio,
        experience_years: experienceYears,
      });
      alertActions.success('Learning Topic Tersimpan', 'Spesialisasi dan topik bimbingan mentor berhasil diperbarui.');
      await fetchUser();
    } catch (err: any) {
      alertActions.error('Gagal Menyimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan topik mentor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-emerald-500/30 shadow-md bg-gradient-to-br from-card via-card to-emerald-500/[0.04]">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="size-4" />
              </div>
              Section Learning Topic (Spesialisasi Mentor)
            </CardTitle>
            <CardDescription className="text-xs">
              Topik materi dan bidang keahlian bimbingan Anda yang akan dicari siswa saat booking sesi privat.
            </CardDescription>
          </div>
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold gap-1 text-[11px] py-1 px-2.5">
            <Sparkles className="size-3" />
            A-Team Mentor Feature
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Topik Aktif Saat Ini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Layers className="size-3.5 text-emerald-500" />
              Topik Bimbingan Terpilih ({selectedTopics.length})
            </Label>
            {selectedTopics.length > 0 && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Aktif di Profil Mentor
              </span>
            )}
          </div>

          <div className="min-h-16 p-3 bg-muted/40 rounded-2xl border border-border/60 flex flex-wrap gap-2 items-center">
            {selectedTopics.length > 0 ? (
              selectedTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="default"
                  className="rounded-xl px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topic)}
                    className="hover:opacity-80 rounded-full p-0.5 focus:outline-none"
                    title={`Hapus ${topic}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic px-1">
                Belum ada topik yang dipilih. Silakan klik topik rekomendasi di bawah atau tambahkan topik custom.
              </p>
            )}
          </div>
        </div>

        {/* Tambah Topik Custom */}
        <form onSubmit={handleAddCustomTopic} className="space-y-2">
          <Label htmlFor="custom-topic" className="text-xs font-semibold">
            Tambah Topik Kustom
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Contoh: Kalkulus Lanjut, Fisika Kuantum, TOEFL ITP..."
              className="h-10 text-sm rounded-xl"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!customTopic.trim()}
              className="h-10 px-4 rounded-xl text-xs gap-1.5 shrink-0 border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600"
            >
              <Plus className="size-3.5" />
              Tambah
            </Button>
          </div>
        </form>

        {/* Pilihan Topik Populer / Rekomendasi */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" />
            Topik Pembelajaran Rekomendasi Arkanin
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'bg-card border-border/60 text-muted-foreground hover:border-emerald-500/30 hover:text-foreground'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Plus className="size-3 opacity-60" />
                  )}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio & Pengalaman Mengajar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="mentor-bio" className="text-xs font-semibold flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-primary" />
              Bio Singkat Mentor
            </Label>
            <Textarea
              id="mentor-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan latar belakang pendidikan, metode mengajar, dan pencapaian Anda..."
              rows={3}
              className="text-sm rounded-xl resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-years" className="text-xs font-semibold flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-amber-500" />
              Pengalaman (Tahun)
            </Label>
            <Input
              id="exp-years"
              type="number"
              min={0}
              max={50}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="h-10 text-sm rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Total tahun pengalaman mengajar atau bimbingan belajar.
            </p>
          </div>
        </div>

        {/* Tombol Simpan Spesialisasi Mentor */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan Learning Topic...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Simpan Learning Topic Mentor
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
