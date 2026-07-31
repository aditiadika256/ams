'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Database,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from '@/store/useAlertStore';
import { useProgramLookupStore } from '@/store/useProgramLookupStore';
import type { ApiResponse } from '@/types/auth';
import type {
  LaravelPaginator,
  LaravelPaginatorMeta,
  ProgramMasterCreatePayload,
  ProgramMasterFormPayload,
  ProgramMasterQuery,
  ProgramMasterRecord,
  ProgramMasterUpdatePayload,
} from '@/types/program-master';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewToggle } from '@/components/ui/view-toggle';
import type { ViewMode } from '@/components/ui/view-toggle';
import { ProgramMasterForm } from './form';

type ProgramMasterClient = {
  list: (
    query?: ProgramMasterQuery
  ) => Promise<ApiResponse<LaravelPaginator<ProgramMasterRecord>>>;
  create: (
    payload: ProgramMasterCreatePayload
  ) => Promise<ApiResponse<ProgramMasterRecord>>;
  update: (
    id: number,
    payload: ProgramMasterUpdatePayload
  ) => Promise<ApiResponse<ProgramMasterRecord>>;
  remove: (id: number) => Promise<void>;
};

export interface ProgramMasterResourceConfig {
  title: string;
  description: string;
  singularLabel: string;
  pluralLabel: string;
  api: ProgramMasterClient;
}

interface LookupMasterViewProps {
  config: ProgramMasterResourceConfig;
}

const DEFAULT_PER_PAGE = 12;

function statusDetails(status: ProgramMasterRecord['row_status']) {
  if (status === 1) {
    return { label: 'Aktif', variant: 'default' as const, className: 'bg-emerald-600 text-white' };
  }

  if (status === 0) {
    return { label: 'Tidak aktif', variant: 'secondary' as const, className: '' };
  }

  return { label: 'Dihapus', variant: 'destructive' as const, className: '' };
}

function LoadingState({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-xl border border-border/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function LookupMasterView({ config }: LookupMasterViewProps) {
  const [records, setRecords] = useState<ProgramMasterRecord[]>([]);
  const [meta, setMeta] = useState<LaravelPaginatorMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | '-1' | '0' | '1'>('1');
  const [sortBy, setSortBy] = useState<ProgramMasterQuery['sort_by']>('sort_order');
  const [sortDir, setSortDir] = useState<ProgramMasterQuery['sort_dir']>('asc');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProgramMasterRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const latestRequestId = useRef(0);

  const invalidateLookups = useProgramLookupStore((state) => state.invalidate);
  const forceRefreshLookups = useProgramLookupStore((state) => state.forceRefresh);

  const loadRecords = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setLoadError(null);

    const query: ProgramMasterQuery = {
      page,
      per_page: DEFAULT_PER_PAGE,
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    if (search) {
      query.search = search;
    }
    if (status !== 'all') {
      query.row_status = Number(status) as -1 | 0 | 1;
    }

    try {
      const response = await config.api.list(query);
      if (requestId !== latestRequestId.current) return;

      if (!response.success || !response.data) {
        throw new Error(response.message || `Daftar ${config.pluralLabel} gagal dimuat.`);
      }

      setRecords(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      setLoadError(getErrorMessage(error, `Daftar ${config.pluralLabel} gagal dimuat.`));
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [config, page, search, sortBy, sortDir, status]);

  useEffect(() => {
    void loadRecords();

    return () => {
      latestRequestId.current += 1;
    };
  }, [loadRecords]);

  const refreshAfterMutation = async () => {
    invalidateLookups();
    await Promise.all([loadRecords(), forceRefreshLookups()]);
  };

  const openCreate = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const openEdit = (record: ProgramMasterRecord) => {
    if (record.row_status === -1) return;

    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: ProgramMasterFormPayload) => {
    setIsSubmitting(true);
    try {
      if (selectedRecord) {
        await config.api.update(
          selectedRecord.id,
          payload as ProgramMasterUpdatePayload
        );
        alertActions.success(
          `${config.singularLabel} berhasil diperbarui`,
          `${payload.name} berhasil disimpan.`
        );
      } else {
        await config.api.create(payload as ProgramMasterCreatePayload);
        alertActions.success(
          `${config.singularLabel} berhasil ditambahkan`,
          `${payload.name} tersedia pada daftar master.`
        );
      }

      setIsModalOpen(false);
      setSelectedRecord(null);
      await refreshAfterMutation();
    } catch (error) {
      alertActions.error(
        `Gagal menyimpan ${config.singularLabel}`,
        getErrorMessage(error, `${config.singularLabel} gagal disimpan.`)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (record: ProgramMasterRecord) => {
    if (deletingId !== null || record.row_status === -1) return;
    if (!window.confirm(`Hapus ${config.singularLabel} "${record.name}"?`)) return;

    setDeletingId(record.id);
    try {
      await config.api.remove(record.id);
      alertActions.success(
        `${config.singularLabel} berhasil dihapus`,
        `${record.name} tidak lagi tersedia pada LoV Program.`
      );

      invalidateLookups();
      await forceRefreshLookups();

      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadRecords();
      }
    } catch (error) {
      alertActions.error(
        `Gagal menghapus ${config.singularLabel}`,
        getErrorMessage(error, `${record.name} gagal dihapus.`)
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (record: ProgramMasterRecord) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 active:scale-[0.98]"
          aria-label={`Aksi ${record.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => openEdit(record)}
          disabled={record.row_status === -1}
        >
          <Edit className="mr-2 h-4 w-4" />
          {record.row_status === -1 ? 'Tidak dapat diedit' : 'Edit'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleDelete(record)}
          disabled={record.row_status === -1 || deletingId !== null}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {record.row_status === -1 ? 'Sudah dihapus' : 'Hapus'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{config.title}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button onClick={openCreate} className="w-full active:scale-[0.98] sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah {config.singularLabel}
        </Button>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void loadRecords()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <GlassCard>
        <GlassCardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <GlassCardTitle>Daftar {config.pluralLabel}</GlassCardTitle>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_140px_auto]">
            <form
              className="relative md:col-span-2 xl:col-span-1"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
              }}
            >
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={`Cari ${config.pluralLabel}...`}
                className="pl-9 pr-20"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8"
              >
                Cari
              </Button>
            </form>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as 'all' | '-1' | '0' | '1');
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aktif</SelectItem>
                <SelectItem value="0">Tidak aktif</SelectItem>
                <SelectItem value="-1">Dihapus</SelectItem>
                <SelectItem value="all">Semua status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as NonNullable<ProgramMasterQuery['sort_by']>);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Urutkan berdasarkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sort_order">Urutan</SelectItem>
                <SelectItem value="name">Nama</SelectItem>
                <SelectItem value="code">Kode</SelectItem>
                <SelectItem value="created_at">Tanggal dibuat</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortDir}
              onValueChange={(value) => {
                setSortDir(value as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Menaik</SelectItem>
                <SelectItem value="desc">Menurun</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => void loadRecords()}
              disabled={isLoading}
              className="active:scale-[0.98]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Muat ulang
            </Button>
          </div>
        </GlassCardHeader>

        <GlassCardContent>
          {isLoading && records.length === 0 ? (
            <LoadingState viewMode={viewMode} />
          ) : records.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Data tidak ditemukan</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ubah pencarian atau filter, atau tambahkan {config.singularLabel} baru.
                </p>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Kode</th>
                    <th className="px-4 py-3 font-medium">Urutan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {records.map((record) => {
                    const details = statusDetails(record.row_status);
                    return (
                      <tr key={record.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">{record.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{record.code}</td>
                        <td className="px-4 py-3 tabular-nums">{record.sort_order}</td>
                        <td className="px-4 py-3">
                          <Badge variant={details.variant} className={details.className}>
                            {details.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">{renderActions(record)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {records.map((record) => {
                const details = statusDetails(record.row_status);
                return (
                  <div
                    key={record.id}
                    className="flex min-h-40 flex-col rounded-xl border border-border/70 bg-background/40 p-5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/60">
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {renderActions(record)}
                    </div>
                    <div className="mt-5">
                      <h3 className="font-semibold text-foreground">{record.name}</h3>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{record.code}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
                      <span className="text-xs text-muted-foreground">
                        Urutan <span className="font-medium tabular-nums text-foreground">{record.sort_order}</span>
                      </span>
                      <Badge variant={details.variant} className={details.className}>
                        {details.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <PaginationControls
            currentPage={meta?.current_page ?? page}
            lastPage={meta?.last_page ?? 1}
            total={meta?.total ?? 0}
            from={meta?.from}
            to={meta?.to}
            onPageChange={setPage}
            itemLabel={config.pluralLabel}
            isLoading={isLoading}
            className="mt-5"
          />
        </GlassCardContent>
      </GlassCard>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsModalOpen(open);
            if (!open) setSelectedRecord(null);
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? `Edit ${config.singularLabel}` : `Tambah ${config.singularLabel}`}
            </DialogTitle>
            <DialogDescription>
              Kelola nilai yang tersedia pada pilihan input Program.
            </DialogDescription>
          </DialogHeader>
          <ProgramMasterForm
            key={selectedRecord?.id ?? 'create'}
            initialData={selectedRecord}
            singularLabel={config.singularLabel}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
