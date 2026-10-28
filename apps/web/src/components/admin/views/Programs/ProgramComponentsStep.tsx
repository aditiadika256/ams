'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  Blocks,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  Eye,
  ExternalLink,
  FileText,
  FileUp,
  FolderOpen,
  GraduationCap,
  HardDrive,
  Info,
  Layers,
  Link as LinkIcon,
  Loader2,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  Video,
  X,
  Folder,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import type { ComponentDefinition, MediaAsset } from '@/types/sales';
import type { ComponentContentConfig, ComponentContentType, ProgramComponentDraft, ProgramStepProps } from './wizard-types';
import { parseGoogleDriveUrl, isPdfUrl } from '@/lib/media';
import { MediaContentViewer } from '@/components/shared/MediaContentViewer';

function getComponentIcon(code: string) {
  switch (code) {
    case 'schedule':
    case 'meeting':
      return <Calendar className="size-4 text-emerald-500" />;
    case 'material':
    case 'reading':
      return <FileText className="size-4 text-blue-500" />;
    case 'media':
    case 'video':
      return <Video className="size-4 text-purple-500" />;
    case 'assessment':
    case 'exam':
      return <Radio className="size-4 text-amber-500" />;
    case 'certificate':
      return <GraduationCap className="size-4 text-rose-500" />;
    default:
      return <Blocks className="size-4 text-primary" />;
  }
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function extractMediaAssets(payload: unknown): MediaAsset[] {
  if (Array.isArray(payload)) {
    return payload as MediaAsset[];
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as MediaAsset[];
    }
    if (data && typeof data === 'object' && 'data' in data) {
      const nested = (data as { data: unknown }).data;
      if (Array.isArray(nested)) {
        return nested as MediaAsset[];
      }
    }
  }
  return [];
}

export function ProgramComponentsStep({ state, setState, definitions, programId }: ProgramStepProps) {
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<number | ''>('');
  const [expandedInstanceKey, setExpandedInstanceKey] = useState<string | null>(null);
  const [mediaLibraryModalKey, setMediaLibraryModalKey] = useState<string | null>(null);
  const [programMediaAssets, setProgramMediaAssets] = useState<MediaAsset[]>([]);
  const [centralMediaAssets, setCentralMediaAssets] = useState<MediaAsset[]>([]);
  const [libraryScope, setLibraryScope] = useState<'all' | 'program'>('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFolderFilter, setLibraryFolderFilter] = useState('all');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isUploadingModal, setIsUploadingModal] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState<number | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [livePreviewData, setLivePreviewData] = useState<{
    title: string;
    externalUrl?: string;
    mediaAsset?: MediaAsset | null;
  } | null>(null);

  const selectId = useId();

  // Load central media assets from central Media Library
  const loadCentralMediaAssets = useCallback(async () => {
    setLoadingMedia(true);
    try {
      const response = await apiClient.admin.mediaLibrary.list();
      setCentralMediaAssets(extractMediaAssets(response));
    } catch {
      // Fallback silently if central library endpoint fails
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  // Load existing media assets for program if editing
  const loadMediaAssets = useCallback(async () => {
    if (!programId) return;
    try {
      const response = await apiClient.admin.mediaAssets.list(programId);
      setProgramMediaAssets(extractMediaAssets(response));
    } catch {
      // Fallback silently if no media assets or endpoint loading fails
    }
  }, [programId]);

  useEffect(() => {
    void loadCentralMediaAssets();
    if (programId) {
      void loadMediaAssets();
    }
  }, [programId, loadMediaAssets, loadCentralMediaAssets]);

  // Filtered assets for modal
  const displayedMediaAssets = useMemo(() => {
    const source = libraryScope === 'program' && programId ? programMediaAssets : centralMediaAssets;
    return source.filter((asset) => {
      const q = librarySearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        asset.original_name.toLowerCase().includes(q) ||
        (asset.folder && asset.folder.toLowerCase().includes(q)) ||
        (asset.program?.name && asset.program.name.toLowerCase().includes(q));
      const matchFolder = libraryFolderFilter === 'all' || asset.folder === libraryFolderFilter;
      return matchSearch && matchFolder;
    });
  }, [libraryScope, programId, programMediaAssets, centralMediaAssets, librarySearch, libraryFolderFilter]);

  const availableFolders = useMemo(() => {
    const source = libraryScope === 'program' && programId ? programMediaAssets : centralMediaAssets;
    const folders = new Set<string>();
    source.forEach((a) => {
      if (a.folder) folders.add(a.folder);
    });
    return Array.from(folders);
  }, [libraryScope, programId, programMediaAssets, centralMediaAssets]);

  // Detect whether program has an active schedule component
  const scheduleComponentActive = useMemo(() => {
    return state.components.some((comp) => {
      if (!comp.isEnabled) return false;
      const def = definitions.find((d) => d.id === comp.componentDefinitionId);
      if (!def) return false;
      const code = def.code.toLowerCase();
      return code.includes('schedule') || code.includes('meeting') || code.includes('attendance');
    });
  }, [state.components, definitions]);

  // Handle adding a new component instance
  const handleAddComponent = (definitionId: number) => {
    const def = definitions.find((d) => d.id === definitionId);
    if (!def || !def.is_available) return;

    const existingCount = state.components.filter(
      (c) => c.componentDefinitionId === definitionId
    ).length;

    const defaultTitle = existingCount > 0 ? `${def.name} ${existingCount + 1}` : def.name;
    const defaultType: ComponentContentType =
      def.code === 'media' || def.code === 'video' ? 'video_url' : 'file';

    const newInstance: ProgramComponentDraft = {
      instanceKey: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      componentDefinitionId: def.id,
      label: defaultTitle,
      isEnabled: true,
      sortOrder: state.components.length + 1,
      configuration: {
        content_type: defaultType,
        title: defaultTitle,
        duration_minutes: 30,
        is_published: true,
      },
    };

    setState((current) => ({
      ...current,
      components: [...current.components, newInstance],
    }));

    setSelectedDefinitionId('');
    setExpandedInstanceKey(newInstance.instanceKey);
  };

  // Toggle on/off for specific instance
  const handleToggle = (instanceKey: string, checked: boolean) => {
    setState((current) => ({
      ...current,
      components: current.components.map((comp) =>
        comp.instanceKey === instanceKey ? { ...comp, isEnabled: checked } : comp
      ),
    }));
  };

  // Update custom label for instance
  const handleLabelChange = (instanceKey: string, label: string) => {
    setState((current) => ({
      ...current,
      components: current.components.map((comp) =>
        comp.instanceKey === instanceKey
          ? {
              ...comp,
              label,
              configuration: {
                ...comp.configuration,
                title: comp.configuration?.title || label,
              },
            }
          : comp
      ),
    }));
  };

  // Remove instance
  const handleRemove = (instanceKey: string) => {
    setState((current) => ({
      ...current,
      components: current.components.filter((comp) => comp.instanceKey !== instanceKey),
    }));
    if (expandedInstanceKey === instanceKey) setExpandedInstanceKey(null);
  };

  // Move component up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= state.components.length) return;

    setState((current) => {
      const updated = [...current.components];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return {
        ...current,
        components: updated.map((item, idx) => ({ ...item, sortOrder: idx + 1 })),
      };
    });
  };

  // Update content configuration
  const handleContentConfigChange = (
    instanceKey: string,
    updates: Partial<ComponentContentConfig>
  ) => {
    setState((current) => ({
      ...current,
      components: current.components.map((comp) =>
        comp.instanceKey === instanceKey
          ? {
              ...comp,
              configuration: {
                ...comp.configuration,
                ...updates,
              },
            }
          : comp
      ),
    }));
  };

  // Handle direct file upload (upload now if programId exists, else stage pendingFile)
  const handleDirectFileUpload = async (instanceKey: string, file?: File) => {
    if (!file) return;

    if (!programId) {
      // Stage file locally in draft state for deferred upload upon form submission
      setState((current) => ({
        ...current,
        components: current.components.map((comp) =>
          comp.instanceKey === instanceKey
            ? {
                ...comp,
                pendingFile: file,
                configuration: {
                  ...comp.configuration,
                  content_type: 'file',
                  media_name: file.name,
                  media_size: file.size,
                },
              }
            : comp
        ),
      }));
      alertActions.success('File siap diunggah', `${file.name} akan tersimpan saat formulir disubmit.`);
      return;
    }

    // Direct upload with progress if program already exists
    setUploadingKey(instanceKey);
    setUploadProgress(0);
    try {
      const response = await apiClient.admin.mediaAssets.upload(
        programId,
        file,
        'Mengunggah materi pembelajaran komponen program ke Cloudflare Storage (R2 / CDN)',
        setUploadProgress
      );
      if (!response.data) throw new Error('Respons unggah tidak memuat media asset.');

      const asset = response.data;
      setState((current) => ({
        ...current,
        components: current.components.map((comp) =>
          comp.instanceKey === instanceKey
            ? {
                ...comp,
                pendingFile: undefined,
                configuration: {
                  ...comp.configuration,
                  content_type: 'file',
                  media_asset_id: asset.id,
                  media_name: asset.original_name,
                  media_size: asset.size_bytes,
                },
              }
            : comp
        ),
      }));

      void loadMediaAssets();
      alertActions.success('File berhasil diunggah', `${file.name} tersimpan di Cloudflare Storage & CDN program.`);
    } catch (err) {
      alertActions.error('Unggah gagal', getErrorMessage(err, 'File tidak dapat diunggah.'));
    } finally {
      setUploadingKey(null);
      setUploadProgress(null);
    }
  };

  // Handle selecting an existing asset from the media library
  const handleSelectMediaAsset = (instanceKey: string, asset: MediaAsset) => {
    setState((current) => ({
      ...current,
      components: current.components.map((comp) =>
        comp.instanceKey === instanceKey
          ? {
              ...comp,
              pendingFile: undefined,
              configuration: {
                ...comp.configuration,
                content_type: 'file',
                media_asset_id: asset.id,
                media_name: asset.original_name,
                media_size: asset.size_bytes,
                external_url: asset.url || comp.configuration?.external_url,
              },
            }
          : comp
      ),
    }));
    setMediaLibraryModalKey(null);
    alertActions.success('Media terpilih', `${asset.original_name} berhasil ditautkan ke komponen.`);
  };

  // Direct upload from modal to central media library and attach immediately
  const handleModalDirectUpload = async (file?: File) => {
    if (!file || !mediaLibraryModalKey) return;
    setIsUploadingModal(true);
    setModalUploadProgress(0);
    try {
      const response = await apiClient.admin.mediaLibrary.upload(
        file,
        {
          program_id: programId,
          folder: 'materials',
          reason: 'Mengunggah materi pembelajaran baru ke Media Library',
        },
        (percent) => setModalUploadProgress(percent)
      );
      if (!response.data) throw new Error('Respons unggah tidak memuat media asset.');
      const newAsset = response.data;
      void loadCentralMediaAssets();
      if (programId) void loadMediaAssets();
      handleSelectMediaAsset(mediaLibraryModalKey, newAsset);
      alertActions.success('Unggah & Tautkan Berhasil', `${newAsset.original_name} berhasil diunggah ke Media Library.`);
    } catch (err) {
      alertActions.error('Unggah gagal', getErrorMessage(err, 'Gagal mengunggah file ke Media Library.'));
    } finally {
      setIsUploadingModal(false);
      setModalUploadProgress(null);
    }
  };

  // Remove attached file
  const handleRemoveFile = (instanceKey: string) => {
    setState((current) => ({
      ...current,
      components: current.components.map((comp) =>
        comp.instanceKey === instanceKey
          ? {
              ...comp,
              pendingFile: undefined,
              configuration: {
                ...comp.configuration,
                media_asset_id: null,
                media_name: undefined,
                media_size: undefined,
              },
            }
          : comp
      ),
    }));
  };

  return (
    <div className="grid gap-6">
      {/* Dynamic Program Mode Indicator */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 ${
          scheduleComponentActive
            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 shadow-[0_4px_24px_rgba(16,185,129,0.08)] dark:bg-emerald-950/20 dark:text-emerald-200'
            : 'border-blue-500/30 bg-blue-500/5 text-blue-900 shadow-[0_4px_24px_rgba(59,130,246,0.08)] dark:bg-blue-950/20 dark:text-blue-200'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-xl p-2.5 backdrop-blur-sm ${
                scheduleComponentActive
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              }`}
            >
              {scheduleComponentActive ? (
                <Calendar className="size-5 animate-pulse" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold tracking-wide">
                  {scheduleComponentActive
                    ? 'Mode Kelas Terjadwal (Online Live / Offline Class)'
                    : 'Mode Course Biasa (Self-Paced / Belajar Mandiri)'}
                </h4>
                <Badge
                  variant={scheduleComponentActive ? 'default' : 'secondary'}
                  className="text-[11px]"
                >
                  {scheduleComponentActive ? 'Terjadwal' : 'Mandiri'}
                </Badge>
              </div>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">
                {scheduleComponentActive
                  ? 'Program ini menyertakan komponen jadwal aktif. Sesi interaktif online live atau kelas tatap muka cabang akan diatur melalui jadwal pertemuan.'
                  : 'Program beroperasi sebagai modul belajar mandiri. Akses langsung aktif saat calon siswa membeli program dan bebas diselesaikan kapan saja.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Add Control */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Komposisi Komponen & Konten Program
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tambahkan komponen ke kurikulum dan atur file materi, video stream, atau wacana bacaan langsung di sini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <label htmlFor={selectId} className="sr-only">
                Pilih jenis komponen yang ingin ditambahkan
              </label>
              <select
                id={selectId}
                aria-label="Pilih komponen untuk ditambahkan"
                value={selectedDefinitionId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleAddComponent(Number(val));
                  }
                }}
                className="h-10 rounded-xl border border-zinc-200 bg-white/80 px-3 pr-8 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
              >
                <option value="">+ Tambah Komponen Baru…</option>
                {definitions.map((def) => (
                  <option key={def.id} value={def.id} disabled={!def.is_available}>
                    {def.name} {!def.is_available ? '(Belum tersedia)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Add Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Plus className="size-3" /> Tambah Cepat:
          </span>
          {definitions.filter((d) => d.is_available).map((def) => (
            <button
              key={def.id}
              type="button"
              onClick={() => handleAddComponent(def.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50/60 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
            >
              {getComponentIcon(def.code)}
              {def.name}
            </button>
          ))}
        </div>
      </div>

      {/* Component Instances List */}
      <div className="grid gap-4">
        {state.components.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
            <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900 text-zinc-400">
              <Blocks className="size-6" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Belum Ada Komponen Ditambahkan
            </h4>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Pilih komponen di atas untuk menyusun materi, asesmen, media, atau jadwal kelas pada program ini.
            </p>
          </div>
        ) : (
          state.components.map((component, index) => {
            const definition = definitions.find((d) => d.id === component.componentDefinitionId);
            const isExpanded = expandedInstanceKey === component.instanceKey;
            const config = component.configuration ?? {};
            const isUploading = uploadingKey === component.instanceKey;
            const hasFile = Boolean(component.pendingFile || config.media_name || config.media_asset_id);
            const isDrive = Boolean(config.external_url && parseGoogleDriveUrl(config.external_url).isGoogleDrive);
            const isPdfLink = Boolean(config.external_url && isPdfUrl(config.external_url));
            const hasDriveOrPdf = config.content_type === 'drive_or_pdf' || isDrive || isPdfLink;
            const hasVideo = Boolean(config.external_url && config.content_type === 'video_url');
            const hasText = Boolean(config.body && config.content_type === 'text');
            const hasLink = Boolean(config.external_url && config.content_type === 'link');
            const hasConfiguredContent = hasFile || hasDriveOrPdf || hasVideo || hasText || hasLink || Boolean(config.title);

            return (
              <div
                key={component.instanceKey}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  component.isEnabled
                    ? 'border-zinc-200/90 bg-white/80 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/70'
                    : 'border-zinc-200/40 bg-zinc-50/40 opacity-60 dark:border-zinc-800/40 dark:bg-zinc-900/30'
                }`}
              >
                {/* Top Header Row */}
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  {/* Left: Reorder, Icon & Definition Info */}
                  <div className="flex items-center gap-3">
                    {/* Order control */}
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Geser ke atas"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <span className="text-[10px] font-semibold text-zinc-400">{index + 1}</span>
                      <button
                        type="button"
                        aria-label="Geser ke bawah"
                        disabled={index === state.components.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>

                    {/* Icon */}
                    <div className="rounded-xl border border-zinc-200/60 bg-zinc-100/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                      {getComponentIcon(definition?.code ?? '')}
                    </div>

                    {/* Name and description */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {definition?.name ?? 'Komponen'}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          #{index + 1}
                        </Badge>
                      </div>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {definition?.description || definition?.code}
                      </span>
                    </div>
                  </div>

                  {/* Right: Label input, Switch Toggle, and Delete */}
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <div className="w-full md:w-56">
                      <Input
                        aria-label={`Label untuk ${definition?.name ?? 'komponen'}`}
                        placeholder="Label tampilan (opsional)"
                        value={component.label}
                        onChange={(e) => handleLabelChange(component.instanceKey, e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* On/Off Switch */}
                    <div className="flex items-center gap-2">
                      <Switch
                        aria-label={`Aktifkan atau nonaktifkan ${definition?.name ?? 'komponen'}`}
                        checked={component.isEnabled}
                        onCheckedChange={(checked) => handleToggle(component.instanceKey, checked)}
                      />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 min-w-8">
                        {component.isEnabled ? 'Aktif' : 'Off'}
                      </span>
                    </div>

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(component.instanceKey)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Hapus instance komponen ini"
                      aria-label="Hapus instance komponen ini"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Bar & Expand Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedInstanceKey(isExpanded ? null : component.instanceKey)}
                      className={`h-7 rounded-lg text-xs font-medium transition ${
                        isExpanded
                          ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                          : 'border-zinc-200/80 bg-white/80 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {isExpanded ? <ChevronUp className="mr-1.5 size-3.5" /> : <ChevronDown className="mr-1.5 size-3.5" />}
                      {hasConfiguredContent ? 'Edit Isi & Materi' : '+ Atur Isi & Materi'}
                    </Button>

                    {/* Status badges */}
                    {hasFile && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                        <FileText className="size-3 text-blue-500" />
                        <span className="max-w-44 truncate">
                          {component.pendingFile?.name || config.media_name || 'File Privat'}
                        </span>
                        {config.media_size ? <span className="opacity-70">({formatBytes(config.media_size)})</span> : null}
                        {component.pendingFile && (
                          <span className="rounded bg-amber-500/10 px-1 text-[10px] text-amber-600 dark:text-amber-400">
                            Draft Unggah
                          </span>
                        )}
                      </Badge>
                    )}

                    {isDrive && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        <HardDrive className="size-3 text-blue-500" />
                        <span>Google Drive View Page</span>
                      </Badge>
                    )}

                    {isPdfLink && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <FileText className="size-3 text-emerald-500" />
                        <span>Dokumen PDF View Page</span>
                      </Badge>
                    )}

                    {hasVideo && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                        <Video className="size-3 text-purple-500" />
                        <span className="max-w-44 truncate">{config.external_url}</span>
                      </Badge>
                    )}

                    {hasText && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                        <FileText className="size-3 text-emerald-500" />
                        <span>Materi Teks Wacana</span>
                      </Badge>
                    )}

                    {hasLink && !isDrive && !isPdfLink && (
                      <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                        <LinkIcon className="size-3 text-sky-500" />
                        <span className="max-w-44 truncate">{config.external_url}</span>
                      </Badge>
                    )}

                    {config.duration_minutes ? (
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Clock className="size-3" />
                        {config.duration_minutes} mnt
                      </span>
                    ) : null}

                    {config.is_published !== undefined && (
                      <Badge
                        variant={config.is_published ? 'default' : 'outline'}
                        className={`text-[10px] py-0 px-1.5 ${
                          config.is_published
                            ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        {config.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    )}

                    {!hasConfiguredContent && (
                      <span className="text-[11px] text-zinc-400 italic">
                        Materi belum diatur (Opsional)
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-400">
                    {definition?.handler_template ? `Handler: ${definition.handler_template}` : ''}
                  </span>
                </div>

                {/* Expandable Inline Content Management Panel */}
                {isExpanded && (
                  <div className="border-t border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <FileUp className="size-4 text-primary" />
                          Kelola Isi & Materi: {component.label || definition?.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Tentukan sumber materi, unggah dokumen privat, atau sematkan video streaming tanpa harus membuka menu terpisah.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedInstanceKey(null)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Tutup panel kelola isi"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    {/* Content Source Type Selector */}
                    <div className="mt-4 grid gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
                          Jenis Materi / Sumber Konten
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {[
                            { type: 'file' as const, label: 'Upload Cloudflare', icon: FileUp, desc: 'R2 & CDN Edge' },
                            { type: 'drive_or_pdf' as const, label: 'Link Drive / PDF', icon: HardDrive, desc: 'View Page Interaktif' },
                            { type: 'video_url' as const, label: 'Video Streaming', icon: Video, desc: 'YouTube / HLS' },
                            { type: 'text' as const, label: 'Wacana / Teks', icon: FileText, desc: 'Artikel / Teori' },
                            { type: 'link' as const, label: 'Tautan Lainnya', icon: LinkIcon, desc: 'URL Eksternal' },
                          ].map((item) => {
                            const isSelected = (config.content_type ?? 'file') === item.type;
                            const IconComponent = item.icon;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => handleContentConfigChange(component.instanceKey, { content_type: item.type })}
                                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:bg-primary/20'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                                }`}
                              >
                                <IconComponent className="size-4 mb-1" />
                                <span className="text-xs font-medium">{item.label}</span>
                                <span className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 1. File Upload / Media Library Section */}
                      {(config.content_type ?? 'file') === 'file' && (
                        <div className="grid gap-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <FileUp className="size-3.5 text-primary" />
                              File Materi Privat (Tersimpan Aman)
                            </span>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMediaLibraryModalKey(component.instanceKey);
                                void loadCentralMediaAssets();
                                if (programId) void loadMediaAssets();
                              }}
                              className="h-7 text-xs gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/15"
                            >
                              <FolderOpen className="size-3.5 text-primary" />
                              Pilih dari Media Library ({centralMediaAssets.length})
                            </Button>
                          </div>

                          {/* Existing File Preview Card */}
                          {hasFile ? (
                            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 dark:bg-emerald-950/20">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  <FileText className="size-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {component.pendingFile?.name || config.media_name || 'File Materi Privat'}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {config.media_size ? formatBytes(config.media_size) : 'File terlampir'} ·{' '}
                                    {component.pendingFile ? (
                                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        Staged (Akan diunggah saat simpan)
                                      </span>
                                    ) : (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Tersimpan di Program
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {(config.media_asset_id || config.external_url) && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const matchedAsset =
                                        programMediaAssets.find((a) => a.id === config.media_asset_id) ||
                                        centralMediaAssets.find((a) => a.id === config.media_asset_id);
                                      setLivePreviewData({
                                        title: config.media_name || 'Pratinjau File Materi',
                                        externalUrl: matchedAsset?.url || config.external_url,
                                        mediaAsset: matchedAsset || null,
                                      });
                                    }}
                                    className="h-7 px-2 text-xs gap-1 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-500/40 dark:text-emerald-300"
                                    title="Pratinjau materi ini"
                                  >
                                    <Eye className="size-3.5" />
                                    Lihat
                                  </Button>
                                )}
                                <label
                                  htmlFor={`replace-file-${component.instanceKey}`}
                                  className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                >
                                  Ganti File
                                </label>
                                <input
                                  id={`replace-file-${component.instanceKey}`}
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => void handleDirectFileUpload(component.instanceKey, e.target.files?.[0])}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(component.instanceKey)}
                                  className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600"
                                  title="Hapus file ini"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* Drag & Drop Upload Zone */
                            <div>
                              <label
                                htmlFor={`upload-file-${component.instanceKey}`}
                                className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-4 text-center transition hover:border-primary/60 hover:bg-primary/5 dark:border-zinc-700 dark:hover:bg-zinc-900"
                              >
                                {isUploading ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="size-6 animate-spin text-primary" />
                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                                      Mengunggah file... {uploadProgress !== null ? `${uploadProgress}%` : ''}
                                    </span>
                                    {uploadProgress !== null && (
                                      <div className="h-1.5 w-48 rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                                        <div
                                          className="h-full bg-primary transition-all duration-200"
                                          style={{ width: `${uploadProgress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 mb-1.5">
                                      <FileUp className="size-5" />
                                    </div>
                                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                      Klik untuk memilih file materi atau tarik ke sini
                                    </p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                      Format didukung: PDF, DOCX, PPTX, MP4, ZIP (Maks. 100 MB)
                                    </p>
                                  </>
                                )}
                              </label>
                              <input
                                id={`upload-file-${component.instanceKey}`}
                                type="file"
                                className="sr-only"
                                disabled={isUploading}
                                onChange={(e) => void handleDirectFileUpload(component.instanceKey, e.target.files?.[0])}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Google Drive Link or Direct PDF URL View Page Section */}
                      {config.content_type === 'drive_or_pdf' && (
                        <div className="grid gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 backdrop-blur-md dark:border-blue-500/20 dark:bg-blue-950/20">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <HardDrive className="size-4 text-blue-500" />
                                Tautan Google Drive atau URL Berkas PDF (View Page)
                              </label>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Siswa akan melihat materi ini langsung berupa <strong>View Page interaktif</strong> dengan viewer terintegrasi.
                              </p>
                            </div>

                            {config.external_url && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setLivePreviewData({
                                    title: config.title || component.label || 'Pratinjau View Page',
                                    externalUrl: config.external_url,
                                  })
                                }
                                className="h-7 text-xs gap-1.5 border-blue-500/30 bg-white/80 text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:bg-zinc-900 dark:text-blue-300"
                              >
                                <Eye className="size-3.5" />
                                Pratinjau View Page
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              type="url"
                              placeholder="Contoh: https://drive.google.com/file/d/.../view atau https://domain.com/modul.pdf"
                              value={config.external_url ?? ''}
                              onChange={(e) => {
                                const url = e.target.value;
                                const driveInfo = parseGoogleDriveUrl(url);
                                const isPdf = isPdfUrl(url);
                                handleContentConfigChange(component.instanceKey, {
                                  external_url: url,
                                  drive_preview_url: driveInfo.previewUrl,
                                  is_pdf: isPdf,
                                });
                              }}
                              className="text-xs h-9 bg-white/90 dark:bg-zinc-950/90"
                            />
                          </div>

                          {/* Smart detection badges */}
                          {config.external_url && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                              {parseGoogleDriveUrl(config.external_url).isGoogleDrive && (
                                <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                  <HardDrive className="size-3 text-blue-500" />
                                  <span>Google Drive Terdeteksi: Embed View Page Siap</span>
                                </div>
                              )}
                              {isPdfUrl(config.external_url) && (
                                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                  <FileText className="size-3 text-emerald-500" />
                                  <span>Dokumen PDF Terdeteksi: Interactive PDF Viewer Siap</span>
                                </div>
                              )}
                              {!parseGoogleDriveUrl(config.external_url).isGoogleDrive && !isPdfUrl(config.external_url) && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                  Format link umum. Disarankan menggunakan link file Google Drive atau URL berkas PDF.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Video Streaming URL Section */}
                      {config.content_type === 'video_url' && (
                        <div className="grid gap-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
                          <div>
                            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <Video className="size-3.5 text-purple-500" />
                              Tautan Video Streaming (YouTube / Vimeo / HLS)
                            </label>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Video akan langsung diputar pada player aman portal siswa.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="url"
                              placeholder="https://www.youtube.com/watch?v=... atau https://player.vimeo.com/..."
                              value={config.external_url ?? ''}
                              onChange={(e) =>
                                handleContentConfigChange(component.instanceKey, { external_url: e.target.value })
                              }
                              className="text-xs h-9"
                            />
                            {config.external_url && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(config.external_url, '_blank')}
                                className="h-9 shrink-0 gap-1 text-xs"
                              >
                                <ExternalLink className="size-3.5" /> Tes
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. Text / Reading Content Section */}
                      {config.content_type === 'text' && (
                        <div className="grid gap-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
                          <div>
                            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <FileText className="size-3.5 text-emerald-500" />
                              Isi Teks / Wacana Bacaan
                            </label>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Tuliskan materi pembelajaran teori, studi kasus, atau petunjuk belajar lengkap.
                            </p>
                          </div>
                          <textarea
                            rows={5}
                            placeholder="Tulis materi wacana di sini..."
                            value={config.body ?? ''}
                            onChange={(e) =>
                              handleContentConfigChange(component.instanceKey, { body: e.target.value })
                            }
                            className="rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                          />
                        </div>
                      )}

                      {/* 4. External URL Section */}
                      {config.content_type === 'link' && (
                        <div className="grid gap-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
                          <div>
                            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <LinkIcon className="size-3.5 text-sky-500" />
                              Tautan Eksternal Terverifikasi
                            </label>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Sematkan tautan folder Google Drive tugas, repositori GitHub, atau referensi resmi.
                            </p>
                          </div>
                          <Input
                            type="url"
                            placeholder="https://"
                            value={config.external_url ?? ''}
                            onChange={(e) =>
                              handleContentConfigChange(component.instanceKey, { external_url: e.target.value })
                            }
                            className="text-xs h-9"
                          />
                        </div>
                      )}

                      {/* Metadata Details (Judul, Ringkasan, Durasi, Status) */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Judul Materi Konten
                          </label>
                          <Input
                            placeholder="Judul materi (misal: Modul 1 - Pengenalan)"
                            value={config.title ?? component.label}
                            onChange={(e) =>
                              handleContentConfigChange(component.instanceKey, { title: e.target.value })
                            }
                            className="mt-1 h-9 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <Clock className="size-3 text-zinc-400" />
                            Estimasi Durasi Belajar (Menit)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Contoh: 30"
                            value={config.duration_minutes ?? ''}
                            onChange={(e) =>
                              handleContentConfigChange(component.instanceKey, {
                                duration_minutes: Number(e.target.value) || 0,
                              })
                            }
                            className="mt-1 h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Ringkasan / Catatan Materi (Opsional)
                        </label>
                        <Input
                          placeholder="Ringkasan singkat apa yang akan dipelajari siswa di materi ini"
                          value={config.summary ?? ''}
                          onChange={(e) =>
                            handleContentConfigChange(component.instanceKey, { summary: e.target.value })
                          }
                          className="mt-1 h-9 text-xs"
                        />
                      </div>

                      {/* Toggles: Published status & Preview */}
                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200/60 bg-white/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                        <div className="flex items-center gap-3">
                          <Switch
                            id={`publish-${component.instanceKey}`}
                            checked={config.is_published ?? true}
                            onCheckedChange={(checked) =>
                              handleContentConfigChange(component.instanceKey, { is_published: checked })
                            }
                          />
                          <div>
                            <label
                              htmlFor={`publish-${component.instanceKey}`}
                              className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block cursor-pointer"
                            >
                              Publikasikan Materi
                            </label>
                            <span className="text-[11px] text-zinc-500 block">
                              Materi langsung dapat diakses siswa terdaftar saat status Published.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Switch
                            id={`preview-${component.instanceKey}`}
                            checked={config.is_preview ?? false}
                            onCheckedChange={(checked) =>
                              handleContentConfigChange(component.instanceKey, { is_preview: checked })
                            }
                          />
                          <div>
                            <label
                              htmlFor={`preview-${component.instanceKey}`}
                              className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="size-3 text-zinc-500" />
                              Preview Terbuka (Gratis)
                            </label>
                            <span className="text-[11px] text-zinc-500 block">
                              Dapat dilihat calon siswa sebagai contoh silabus.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Done closing button */}
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setExpandedInstanceKey(null)}
                          className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                          <Check className="size-3.5" />
                          Selesai Atur Isi
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Media Library Picker Modal */}
      <Dialog
        open={Boolean(mediaLibraryModalKey)}
        onOpenChange={(open) => !open && setMediaLibraryModalKey(null)}
      >
        <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col rounded-3xl border border-white/30 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/95">
          <DialogHeader className="shrink-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20">
                    <FolderOpen className="size-5" />
                  </div>
                  Pilih dari Media Library Cloudflare
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 mt-1">
                  Pilih materi pembelajaran dari repositori terpusat Cloudflare Storage (R2 & Edge CDN) atau materi yang tersimpan di program ini.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] gap-1 py-1">
                  <Cloud className="size-3 text-sky-500" /> Cloudflare R2 / CDN
                </Badge>
              </div>
            </div>

            {/* Scope Tabs & Search Controls */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              {/* Scope Switcher */}
              <div className="flex items-center rounded-xl bg-zinc-100/80 p-1 dark:bg-zinc-900/80">
                <button
                  type="button"
                  onClick={() => setLibraryScope('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    libraryScope === 'all'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Semua Media Library ({centralMediaAssets.length})
                </button>
                {programId ? (
                  <button
                    type="button"
                    onClick={() => setLibraryScope('program')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      libraryScope === 'program'
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    Program Ini ({programMediaAssets.length})
                  </button>
                ) : null}
              </div>

              {/* Search & Folder Filter */}
              <div className="flex items-center gap-2">
                {availableFolders.length > 0 && (
                  <select
                    value={libraryFolderFilter}
                    onChange={(e) => setLibraryFolderFilter(e.target.value)}
                    aria-label="Filter berdasarkan folder media"
                    className="h-8 rounded-lg border border-zinc-200 bg-white/90 px-2.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <option value="all">Semua Folder</option>
                    {availableFolders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                )}

                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2 size-3.5 text-zinc-400" />
                  <Input
                    placeholder="Cari materi..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="h-8 pl-8 text-xs bg-white/90 dark:bg-zinc-900/90"
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      aria-label="Hapus teks pencarian"
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Upload Strip Inside Modal */}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileUp className="size-3.5 text-primary" />
                Ingin gunakan file baru?
              </span>

              <div className="flex items-center gap-2">
                {isUploadingModal ? (
                  <span className="flex items-center gap-1.5 text-primary text-xs font-medium">
                    <Loader2 className="size-3.5 animate-spin" />
                    Mengunggah... {modalUploadProgress !== null ? `${modalUploadProgress}%` : ''}
                  </span>
                ) : (
                  <>
                    <label
                      htmlFor="modal-direct-upload-file"
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition"
                    >
                      <Plus className="size-3.5" /> Unggah Baru & Tautkan
                    </label>
                    <input
                      id="modal-direct-upload-file"
                      type="file"
                      className="sr-only"
                      disabled={isUploadingModal}
                      onChange={(e) => void handleModalDirectUpload(e.target.files?.[0])}
                    />
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Asset List Grid */}
          <div className="mt-3 flex-1 overflow-y-auto pr-1">
            {loadingMedia ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2 text-xs text-zinc-500">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span>Memuat daftar Media Library...</span>
              </div>
            ) : displayedMediaAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900 text-zinc-400 mb-2">
                  <FolderOpen className="size-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {librarySearch ? 'Tidak ada materi sesuai pencarian' : 'Belum ada materi di repositori ini'}
                </p>
                <p className="text-[11px] text-zinc-500 max-w-sm mt-0.5">
                  {librarySearch
                    ? 'Coba ganti kata kunci pencarian atau ubah filter folder.'
                    : 'Gunakan tombol Unggah Baru di atas untuk menambahkan berkas materi baru ke Media Library.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {displayedMediaAssets.map((asset) => {
                  const isPdf = asset.mime_type.includes('pdf');
                  const isVid = asset.mime_type.includes('video');
                  return (
                    <div
                      key={asset.id}
                      className="group flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`rounded-xl p-2.5 shrink-0 ${
                            isPdf
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : isVid
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              : 'bg-primary/10 text-primary dark:bg-primary/20'
                          }`}
                        >
                          {isPdf ? <FileText className="size-5" /> : isVid ? <Video className="size-5" /> : <FileText className="size-5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={asset.original_name}>
                            {asset.original_name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {formatBytes(asset.size_bytes)} · {asset.mime_type.split('/')[1] || asset.mime_type}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            {asset.folder && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                <Folder className="mr-1 size-2.5 text-zinc-400" />
                                {asset.folder}
                              </Badge>
                            )}
                            {asset.program?.name && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 max-w-32 truncate">
                                {asset.program.name}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-sky-600 dark:text-sky-400 border-sky-500/20">
                              CDN Ready
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800/60">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLivePreviewData({
                              title: asset.original_name,
                              externalUrl: asset.url,
                              mediaAsset: asset,
                            });
                          }}
                          className="h-7 px-2 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
                        >
                          <Eye className="mr-1 size-3.5" /> Pratinjau
                        </Button>

                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (mediaLibraryModalKey) {
                              handleSelectMediaAsset(mediaLibraryModalKey, asset);
                            }
                          }}
                          className="h-7 text-xs font-medium gap-1 rounded-lg shadow-sm"
                        >
                          <CheckCircle2 className="size-3.5" /> Pilih Materi
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Preview Modal for View Page */}
      <Dialog open={Boolean(livePreviewData)} onOpenChange={(open) => !open && setLivePreviewData(null)}>
        <DialogContent className="max-w-4xl border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/95 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Eye className="size-4 text-primary" />
              Pratinjau Tampilan Siswa (View Page Interaktif)
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Berikut simulasi interaktif bagaimana siswa akan melihat materi Google Drive / PDF / Media di portal belajar.
            </DialogDescription>
          </DialogHeader>

          {livePreviewData && (
            <div className="mt-2">
              <MediaContentViewer
                title={livePreviewData.title}
                externalUrl={livePreviewData.externalUrl}
                mediaAsset={livePreviewData.mediaAsset}
                defaultHeight={500}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
        <Info className="size-4 shrink-0 text-primary" />
        <span>
          Setiap komponen yang berstatus <strong>Aktif</strong> akan otomatis muncul di kurikulum silabus siswa.
          Anda dapat menambahkan beberapa materi, media, atau asesmen sekaligus dan mengatur isinya langsung pada wizard ini.
        </span>
      </div>
    </div>
  );
}
