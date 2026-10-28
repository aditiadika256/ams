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
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/70 sm:p-8 ${className}`}
    >
      {/* Top Header / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-zinc-200/60 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20">
              <FileUp className="size-5" />
            </div>
            Formulir Unggah Media Library
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Unggah materi pembelajaran digital langsung ke penyimpanan Cloud Storage & Edge CDN global.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] gap-1 py-1"
          >
            <Cloud className="size-3 text-sky-500" /> Cloud / CDN
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Drag & Drop File Zone */}
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-2">
            Pilih Berkas Materi <span className="text-rose-500">*</span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20'
                : 'border-zinc-300/80 bg-white/50 hover:border-primary/50 hover:bg-primary/5 dark:border-zinc-800 dark:bg-zinc-900/50'
            }`}
          >
            {file ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl bg-white/80 p-2.5 shadow-sm dark:bg-zinc-800/80 shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {formatBytes(file.size)} · {file.type || 'Berkas Biner'}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      Berkas Siap Diunggah
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 rounded-lg shrink-0"
                  title="Batalkan berkas ini"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label htmlFor="media-library-form-input" className="cursor-pointer flex flex-col items-center">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary dark:bg-primary/20 mb-2">
                  <FileUp className="size-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Klik untuk memilih file materi atau tarik ke area ini
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Format didukung: PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), Video (MP4/WebM), Audio (MP3), Gambar, Arsip (ZIP/RAR). Maksimal 100 MB.
                </p>
              </label>
            )}

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
        </div>

        {/* Program Connection & Folder Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target Program Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FolderOpen className="size-3.5 text-primary" />
              Kaitkan ke Program (Opsional)
            </label>
            <select
              aria-label="Kaitkan ke Program Pembelajaran"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              disabled={uploading}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white/90 px-3 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200"
            >
              <option value="">-- Berkas Global (Dapat Digunakan di Semua Program) --</option>
              {adminPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400">
              Biarkan kosong jika materi ini berupa panduan umum atau aset reusable.
            </p>
          </div>

          {/* Folder Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Kategori / Nama Folder <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Contoh: materials, curriculum, slides"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              disabled={uploading}
              required
              className="h-10 text-xs bg-white/90 dark:bg-zinc-900/90 rounded-xl"
            />
            {/* Quick folder chips */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-zinc-400">Saran:</span>
              {COMMON_FOLDERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolder(f)}
                  disabled={uploading}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition ${
                    folder === f
                      ? 'bg-primary/20 text-primary dark:bg-primary/30'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
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
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Alasan Pengunggahan / Catatan Audit <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="Tuliskan catatan alasan pengunggahan materi ini untuk keperluan log audit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={uploading}
            required
            minLength={5}
            className="h-10 text-xs bg-white/90 dark:bg-zinc-900/90 rounded-xl"
          />
          <p className="text-[11px] text-zinc-400">
            Dicatat dalam riwayat audit aktivitas media asset untuk transparansi pengembang dan pengawas sistem.
          </p>
        </div>

        {/* Progress Bar while uploading */}
        {uploading && uploadProgress !== null && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-primary">
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Mengunggah ke Cloud Storage...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200/80 overflow-hidden dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Form Action Buttons */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={onCancel}
            className="w-full sm:w-auto h-10 rounded-xl text-xs"
          >
            Batal
          </Button>
        )}

        <Button
          type="submit"
          disabled={uploading || !file}
          className="w-full sm:w-auto h-10 gap-2 rounded-xl text-xs font-semibold shadow-md shadow-primary/25"
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
