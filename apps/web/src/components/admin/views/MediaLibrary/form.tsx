'use client';

import { useState } from 'react';
import {
  Cloud,
  FileText,
  FileUp,
  FolderOpen,
  Loader2,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Presentation,
  Video,
  Music,
  Image as ImageIcon,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';
import { useSalesStore } from '@/store/useSalesStore';
import type { MediaAsset } from '@/types/sales';
import { formatBytes } from '@/lib/media';

export interface MediaLibraryFormProps {
  onSuccess?: (asset: MediaAsset) => void;
  onCancel?: () => void;
  initialProgramId?: number | string;
  initialFolder?: string;
  className?: string;
}

const COMMON_FOLDERS = [
  'materials',
  'documents',
  'curriculum',
  'slides',
  'videos',
  'audio',
  'exams',
];

export function MediaLibraryForm({
  onSuccess,
  onCancel,
  initialProgramId,
  initialFolder = 'materials',
  className = '',
}: MediaLibraryFormProps) {
  const { adminPrograms } = useSalesStore();

  const [file, setFile] = useState<File | null>(null);
  const [programId, setProgramId] = useState<string>(
    initialProgramId !== undefined && initialProgramId !== null ? String(initialProgramId) : ''
  );
  const [folder, setFolder] = useState(initialFolder);
  const [reason, setReason] = useState('Mengunggah materi pembelajaran baru ke Cloudflare Media Library');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alertActions.error('Berkas diperlukan', 'Silakan pilih berkas yang ingin diunggah.');
      return;
    }

    if (!reason.trim()) {
      alertActions.error('Alasan diperlukan', 'Mohon isi catatan alasan pengunggahan untuk audit log.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await apiClient.admin.mediaLibrary.upload(
        file,
        {
          program_id: programId ? Number(programId) : undefined,
          folder: folder.trim() || 'materials',
          reason: reason.trim() || 'Mengunggah berkas media pembelajaran ke Cloud',
        },
        (percent) => setUploadProgress(percent)
      );

      if (!response.data) {
        throw new Error('Respons upload tidak mengembalikan data media.');
      }

      alertActions.success(
        'Unggah Berhasil',
        `${file.name} berhasil disimpan di Cloud Storage & Edge CDN.`
      );

      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset
      setFile(null);
      setUploadProgress(null);
    } catch (err) {
      alertActions.error(
        'Gagal Mengunggah Berkas',
        getErrorMessage(err, 'Terjadi kendala saat menyimpan berkas ke Cloudflare Storage.')
      );
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
      return <Video className="size-8 text-purple-500" />;
    }
    if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
      return <Music className="size-8 text-amber-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      return <ImageIcon className="size-8 text-emerald-500" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="size-8 text-red-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="size-8 text-emerald-600" />;
    }
    if (['pptx', 'ppt'].includes(ext)) {
      return <Presentation className="size-8 text-amber-600" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="size-8 text-indigo-500" />;
    }
    return <FileText className="size-8 text-primary" />;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative rounded-2xl border border-border/60 bg-card/85 p-5 shadow-xl backdrop-blur-xl sm:p-7 dark:border-border/50 dark:bg-card/80 ${className}`}
    >
      {/* Top Header / Title */}
      <div className="flex items-center justify-between pb-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
            <FileUp className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Formulir Unggah Media Library
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Unggah materi pembelajaran digital langsung ke penyimpanan Cloud Storage & Edge CDN global.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="hidden sm:inline-flex border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] gap-1 py-1 font-medium shrink-0"
        >
          <Cloud className="size-3 text-sky-500" /> Cloud / Edge CDN
        </Badge>
      </div>

      <div className="mt-6 space-y-5">
        {/* Drag & Drop File Zone */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">
            Pilih Berkas Materi <span className="text-destructive">*</span>
          </label>

          {file ? (
            <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 p-2 shadow-xs">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBytes(file.size)} · {file.type || 'Berkas Biner'}
                    </p>
                    <Badge variant="outline" className="mt-1.5 text-[10px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Berkas Siap Diunggah
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => setFile(null)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  title="Batalkan berkas ini"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                isDragOver
                  ? 'border-primary bg-primary/10 scale-[1.005]'
                  : 'border-border/80 bg-muted/30 hover:border-primary/60 hover:bg-muted/50'
              }`}
            >
              <label htmlFor="media-library-form-input" className="cursor-pointer flex flex-col items-center w-full">
                <div className="rounded-xl bg-primary/10 p-3 text-primary dark:bg-primary/20 mb-2">
                  <FileUp className="size-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Klik untuk memilih file materi atau tarik ke area ini
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Format didukung: PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), Video (MP4/WebM), Audio (MP3), Gambar, Arsip (ZIP/RAR). Maksimal 100 MB.
                </p>
              </label>

              <input
                id="media-library-form-input"
                type="file"
                required={!file}
                disabled={uploading}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Program Connection & Folder Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target Program Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FolderOpen className="size-3.5 text-primary" />
              Kaitkan ke Program (Opsional)
            </label>
            <select
              aria-label="Kaitkan ke Program Pembelajaran"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              disabled={uploading}
              className="h-10 w-full rounded-xl border border-input/60 bg-background/70 px-3 text-xs font-medium text-foreground shadow-xs transition hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="">-- Berkas Global (Dapat Digunakan di Semua Program) --</option>
              {adminPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Biarkan kosong jika materi ini berupa panduan umum atau aset reusable.
            </p>
          </div>

          {/* Folder Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kategori / Nama Folder <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Contoh: materials, curriculum, slides"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              disabled={uploading}
              required
              className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground rounded-xl shadow-xs"
            />
            {/* Quick folder chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">Saran:</span>
              {COMMON_FOLDERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolder(f)}
                  disabled={uploading}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    folder === f
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'border border-border/60 bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Trail: Upload Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Alasan Pengunggahan / Catatan Audit <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Tuliskan catatan alasan pengunggahan materi ini untuk keperluan log audit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={uploading}
            required
            minLength={5}
            className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground rounded-xl shadow-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Dicatat dalam riwayat audit aktivitas media asset untuk transparansi pengembang dan pengawas sistem.
          </p>
        </div>

        {/* Progress Bar while uploading */}
        {uploading && uploadProgress !== null && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 dark:bg-primary/10">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Mengunggah ke Cloud Storage...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Form Action Buttons */}
      <div className="mt-7 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 border-t border-border/60">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={onCancel}
            className="w-full sm:w-auto min-h-11 sm:min-h-10 px-5 rounded-xl text-xs font-medium border-border/70 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Batal
          </Button>
        )}

        <Button
          type="submit"
          disabled={uploading || !file}
          className="w-full sm:w-auto min-h-11 sm:min-h-10 px-6 gap-2 rounded-xl text-xs font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sedang Mengunggah...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Unggah ke Cloud
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
export default MediaLibraryForm;
