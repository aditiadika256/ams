'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Cloud,
  Copy,
  Check,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  HardDrive,
  Headphones,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  Presentation,
  Archive,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';
import { useSalesStore } from '@/store/useSalesStore';
import type { MediaAsset, Program } from '@/types/sales';
import { MediaContentViewer } from '@/components/shared/MediaContentViewer';
import { formatBytes } from '@/lib/media';
import { MediaLibraryForm } from './form';

type MediaTypeFilter = 'all' | 'pdf' | 'video' | 'audio' | 'image' | 'document';

export default function MediaLibraryView() {
  const { adminPrograms, fetchAdminPrograms } = useSalesStore();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<MediaTypeFilter>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Stats
  const [storageBytes, setStorageBytes] = useState(0);

  // Upload modal state (managed via separated MediaLibraryForm)
  const [uploadOpen, setUploadOpen] = useState(false);

  // Preview modal state
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Delete modal state
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy URL tracking
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // In-flight guard to prevent duplicate concurrent network requests
  const inFlightRef = useRef(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const loadAssets = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const response = await apiClient.admin.mediaLibrary.list({
        search: debouncedSearch.trim() || undefined,
        program_id: selectedProgramId !== 'all' ? selectedProgramId : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        folder: selectedFolder !== 'all' ? selectedFolder : undefined,
        per_page: 100,
      });

      const items = Array.isArray(response.data)
        ? response.data
        : ((response as unknown as { data?: { data?: MediaAsset[] } })?.data?.data ?? []);

      setAssets(items);
      if (response.meta?.total_storage_bytes !== undefined) {
        setStorageBytes(response.meta.total_storage_bytes);
      } else {
        const sum = items.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0);
        setStorageBytes(sum);
      }
    } catch (err) {
      alertActions.error('Gagal memuat media', getErrorMessage(err, 'Media library tidak dapat diakses.'));
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [debouncedSearch, selectedProgramId, selectedType, selectedFolder]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (adminPrograms.length === 0) {
      void fetchAdminPrograms({ per_page: 100 });
    }
  }, [adminPrograms.length, fetchAdminPrograms]);

  // Handle file deletion
  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;
    setIsDeleting(true);
    try {
      await apiClient.admin.mediaLibrary.remove(
        deletingAsset.id,
        deleteReason.trim() || 'Menghapus media usang dari Media Library'
      );
      alertActions.success('Media Dihapus', `${deletingAsset.original_name} berhasil dihapus.`);
      setDeletingAsset(null);
      setDeleteReason('');
      void loadAssets();
    } catch (err) {
      alertActions.error('Gagal menghapus berkas', getErrorMessage(err, 'Media tidak dapat dihapus.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle copy CDN Link
  const handleCopyCdn = (asset: MediaAsset) => {
    const url = asset.cdn_url || asset.view_url || asset.download_url;
    if (!url) return;
    void navigator.clipboard.writeText(url);
    setCopiedId(asset.id);
    alertActions.success('Tautan Disalin', 'URL CDN Cloudflare berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getMediaIcon = (mime: string, ext: string) => {
    const m = (mime || '').toLowerCase();
    const e = (ext || '').toLowerCase();
    if (m.includes('pdf') || e === 'pdf') {
      return <FileText className="size-5 text-red-500" />;
    }
    if (m.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(e)) {
      return <Video className="size-5 text-purple-500" />;
    }
    if (m.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(e)) {
      return <Headphones className="size-5 text-amber-500" />;
    }
    if (m.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(e)) {
      return <ImageIcon className="size-5 text-emerald-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(e) || m.includes('spreadsheet') || m.includes('excel')) {
      return <FileSpreadsheet className="size-5 text-emerald-600" />;
    }
    if (['pptx', 'ppt'].includes(e) || m.includes('presentation') || m.includes('powerpoint')) {
      return <Presentation className="size-5 text-amber-600" />;
    }
    if (['docx', 'doc', 'rtf'].includes(e) || m.includes('word')) {
      return <FileText className="size-5 text-blue-600" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e) || m.includes('zip') || m.includes('compressed')) {
      return <Archive className="size-5 text-indigo-500" />;
    }
    if (['txt', 'json', 'md', 'xml'].includes(e) || m.startsWith('text/') || m.includes('json')) {
      return <FileCode className="size-5 text-cyan-500" />;
    }
    return <FileText className="size-5 text-primary" />;
  };

  // Available unique folders from assets
  const availableFolders = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.folder) set.add(a.folder);
    });
    return Array.from(set);
  }, [assets]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20">
              <FolderOpen className="size-6" />
            </div>
            Media Library & Content Storage
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Pusat penyimpanan materi pembelajaran digital terhubung langsung ke Cloud, Edge CDN, dan Program Workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadAssets()}
            disabled={loading}
            className="h-9 gap-1.5 rounded-xl border-zinc-200 bg-white/70 backdrop-blur-md hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/70"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="h-9 gap-1.5 rounded-xl bg-primary shadow-sm shadow-primary/25"
          >
            <Plus className="size-4" />
            Unggah Berkas Baru
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assets */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Total Berkas</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <HardDrive className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{assets.length}</p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">Item tersimpan di storage</span>
        </div>

        {/* Total Storage */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Kapasitas Storage</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Cloud className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{formatBytes(storageBytes)}</p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Cloudflare R2 Bucket</span>
        </div>

        {/* Cloudflare CDN Status */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Edge CDN Delivery</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">R2 Public CDN Aktif</p>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block mt-1 font-mono">pub-043d267920b64ff7b8d21410e443f7ee.r2.dev</span>
        </div>

        {/* Programs Connected */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Program Terhubung</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <FolderOpen className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{adminPrograms.length}</p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">Program katalog aktif</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="search"
              placeholder="Cari berkas berdasarkan nama, folder, atau program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Program */}
            <select
              aria-label="Filter berdasarkan Program"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 shadow-xs transition hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="all">Semua Program ({adminPrograms.length})</option>
              <option value="none">Tanpa Program (Global Library)</option>
              {adminPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              aria-label="Filter berdasarkan Tipe File"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MediaTypeFilter)}
              className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 shadow-xs transition hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="all">Semua Tipe Berkas</option>
              <option value="pdf">Dokumen PDF</option>
              <option value="video">Video Pembelajaran</option>
              <option value="audio">Audio</option>
              <option value="image">Gambar / Banner</option>
              <option value="document">Dokumen Office / Zip</option>
            </select>

            {/* Filter by Folder */}
            {availableFolders.length > 0 && (
              <select
                aria-label="Filter berdasarkan Folder"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 shadow-xs transition hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="all">Semua Folder</option>
                {availableFolders.map((f) => (
                  <option key={f} value={f}>
                    Folder: {f}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Asset List / Grid */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/20 bg-white/40 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/40">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-zinc-500">Memuat koleksi media Cloudflare...</p>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary dark:bg-primary/20 mb-3">
            <FolderOpen className="size-8" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Belum Ada Berkas Media
          </h3>
          <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            {search || selectedProgramId !== 'all' || selectedType !== 'all'
              ? 'Tidak ada berkas yang sesuai dengan kriteria filter saat ini.'
              : 'Mulai unggah modul PDF, video, audio, atau dokumen pendukung untuk digunakan pada kurikulum program.'}
          </p>
          <Button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="mt-4 gap-1.5 rounded-xl text-xs"
          >
            <Plus className="size-4" />
            Unggah Berkas Sekarang
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => {
            const isCopied = copiedId === asset.id;
            return (
              <div
                key={asset.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/50 bg-white/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-zinc-950/70"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="rounded-xl border border-zinc-200/60 bg-zinc-100/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/80 shrink-0">
                      {getMediaIcon(asset.mime_type, asset.extension)}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {asset.cdn_url && (
                        <button
                          type="button"
                          onClick={() => handleCopyCdn(asset)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                          title="Salin CDN Edge URL"
                        >
                          {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPreviewAsset(asset)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-primary/10 hover:text-primary transition"
                        title="Buka Pratinjau Interaktif"
                      >
                        <Eye className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingAsset(asset)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-3">
                    <h4
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-primary transition"
                      onClick={() => setPreviewAsset(asset)}
                      title={asset.original_name}
                    >
                      {asset.original_name}
                    </h4>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>{formatBytes(asset.size_bytes)}</span>
                      <span>·</span>
                      <span className="uppercase">{asset.extension || 'FILE'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Program Badge & Folder */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                  {asset.program ? (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 max-w-36 truncate font-normal">
                      {asset.program.name}
                    </Badge>
                  ) : (
                    <span className="text-zinc-400 text-[10px]">Global Asset</span>
                  )}

                  <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                    {asset.folder || 'general'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/70 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Nama Berkas</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Ukuran</th>
                  <th className="px-4 py-3">Tipe MIME</th>
                  <th className="px-4 py-3">Folder</th>
                  <th className="px-4 py-3">Cloudflare CDN</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {getMediaIcon(asset.mime_type, asset.extension)}
                        <span
                          className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-64 cursor-pointer hover:underline"
                          onClick={() => setPreviewAsset(asset)}
                        >
                          {asset.original_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {asset.program ? asset.program.name : <span className="text-zinc-400 italic">Global</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatBytes(asset.size_bytes)}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">{asset.mime_type}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{asset.folder || 'general'}</td>
                    <td className="px-4 py-3">
                      {asset.cdn_url ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="size-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Private Storage</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewAsset(asset)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="size-3.5 mr-1" /> Pratinjau
                        </Button>
                        {asset.cdn_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCdn(asset)}
                            className="h-7 px-2 text-xs"
                          >
                            <Copy className="size-3.5 mr-1" /> Salin URL
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingAsset(asset)}
                          className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload File Modal (Separated Component) */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">Formulir Unggah Media Library</DialogTitle>
          <DialogDescription className="sr-only">Formulir untuk mengunggah materi pembelajaran baru ke Cloud Storage</DialogDescription>
          <MediaLibraryForm
            onSuccess={() => {
              setUploadOpen(false);
              void loadAssets();
            }}
            onCancel={() => setUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Interactive Media Viewer & Detail Modal */}
      <Dialog open={Boolean(previewAsset)} onOpenChange={(open) => !open && setPreviewAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
          <DialogHeader className="shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-xl border border-border/60 bg-muted/50 p-2.5 shrink-0">
                  {previewAsset ? getMediaIcon(previewAsset.mime_type, previewAsset.extension) : null}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base font-bold text-foreground truncate" title={previewAsset?.original_name}>
                    {previewAsset?.original_name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{previewAsset?.size_bytes ? formatBytes(previewAsset.size_bytes) : '0 Bytes'}</span>
                    <span>·</span>
                    <span className="font-mono">{previewAsset?.mime_type || '-'}</span>
                    {previewAsset?.folder && (
                      <>
                        <span>·</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          Folder: {previewAsset.folder}
                        </Badge>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                {previewAsset?.program ? (
                  <Badge variant="secondary" className="text-xs">
                    {previewAsset.program.name}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Aset Global
                  </Badge>
                )}
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs gap-1">
                  <Cloud className="size-3 text-sky-500" /> CDN Edge
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {previewAsset && (
            <div className="mt-3 flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Media Player / Format-Specific Viewer */}
              <MediaContentViewer
                title={previewAsset.original_name}
                mediaAsset={previewAsset}
                defaultHeight={460}
              />

              {/* Technical Details & Audit Trail Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Nama Asli Berkas:</span>
                    <span className="font-semibold text-foreground truncate max-w-48" title={previewAsset.original_name}>
                      {previewAsset.original_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Tipe MIME:</span>
                    <span className="font-mono text-foreground">{previewAsset.mime_type}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Kapasitas Penyimpanan:</span>
                    <span className="font-semibold text-foreground">
                      {formatBytes(previewAsset.size_bytes)} ({previewAsset.size_bytes ? previewAsset.size_bytes.toLocaleString() : '0'} bytes)
                    </span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-muted-foreground">Folder Penyimpanan:</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{previewAsset.folder || 'general'}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Diunggah Oleh:</span>
                    <span className="font-semibold text-foreground">
                      {previewAsset.uploader_name || (previewAsset.created_by ? `User #${previewAsset.created_by}` : 'Administrator')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Waktu Dibuat:</span>
                    <span className="text-foreground">
                      {previewAsset.created_at ? new Date(previewAsset.created_at).toLocaleString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Pembaruan Terakhir:</span>
                    <span className="text-foreground">
                      {previewAsset.updated_at ? new Date(previewAsset.updated_at).toLocaleString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-muted-foreground">Storage Disk:</span>
                    <span className="font-mono text-foreground">{previewAsset.storage_disk || 'cloudflare_r2'}</span>
                  </div>
                </div>

                {/* Checksum SHA-256 Full Width */}
                {previewAsset.checksum_sha256 && (
                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground font-medium">Integritas Hash SHA-256:</span>
                      <span className="font-mono text-[10px] text-foreground break-all">
                        {previewAsset.checksum_sha256}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const toDelete = previewAsset;
                      setPreviewAsset(null);
                      setDeletingAsset(toDelete);
                    }}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Trash2 className="size-3.5" /> Hapus Berkas
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {previewAsset.cdn_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCdn(previewAsset)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Copy className="size-3.5" />
                      Salin URL CDN
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const dlUrl = previewAsset.cdn_url || previewAsset.download_url || previewAsset.url;
                      if (dlUrl) window.open(dlUrl, '_blank');
                    }}
                    className="h-8 text-xs gap-1.5 rounded-xl"
                  >
                    <Download className="size-3.5" />
                    Unduh Berkas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingAsset)} onOpenChange={(open) => !isDeleting && setDeletingAsset(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-destructive">
              Konfirmasi Hapus Berkas Media
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus berkas <strong>{deletingAsset?.original_name}</strong>? Tindakan ini akan menghapus berkas dari Cloud storage.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Alasan Penghapusan (Audit)
              </label>
              <Input
                placeholder="Contoh: Modul sudah diganti dengan edisi 2026"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                required
                minLength={5}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingAsset(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting || !deleteReason.trim()}
                className="w-full sm:w-auto"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Hapus Berkas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
