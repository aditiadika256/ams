import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProgramLookupStore } from '@/store/useProgramLookupStore';
import type {
  Program,
  ProgramLookupRelation,
  ProgramMutationPayload,
} from '@/types/sales';
import type { ProgramLookupOption } from '@/types/program-master';

interface ProgramFormProps {
  initialData?: Program | null;
  onSubmit: (data: ProgramMutationPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

type SelectOption = ProgramLookupOption | ProgramLookupRelation;

function optionsWithCurrent(
  options: ProgramLookupOption[],
  current?: ProgramLookupRelation | null
): SelectOption[] {
  if (!current) {
    return options;
  }

  if (options.some((option) => option.id === current.id)) {
    return options.map((option) => (
      option.id === current.id ? current : option
    ));
  }

  return [...options, current].sort((left, right) => {
    const leftOrder =
      (left as Partial<ProgramLookupRelation>).sort_order
      ?? Number.MAX_SAFE_INTEGER;
    const rightOrder =
      (right as Partial<ProgramLookupRelation>).sort_order
      ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder || left.name.localeCompare(right.name);
  });
}

function isInactive(option: SelectOption): boolean {
  return 'row_status' in option && option.row_status !== 1;
}

function optionStatusLabel(option: SelectOption): string {
  if (!('row_status' in option) || option.row_status === 1) {
    return '';
  }

  return option.row_status === -1 ? 'Dihapus' : 'Tidak aktif';
}

function inactiveStatusDescription(option: SelectOption): string {
  return 'row_status' in option && option.row_status === -1
    ? 'telah dihapus'
    : 'sudah tidak aktif';
}

export function ProgramForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProgramFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [programLevelId, setProgramLevelId] = useState(
    String(initialData?.program_level_id ?? initialData?.program_level?.id ?? '')
  );
  const [programTypeId, setProgramTypeId] = useState(
    String(initialData?.program_type_id ?? initialData?.program_type?.id ?? '')
  );
  const [price, setPrice] = useState(initialData?.price || 0);
  const [active, setActive] = useState(initialData?.active ?? true);
  const {
    levels,
    types,
    isLoading: isLookupLoading,
    error: lookupError,
    fetchLookups,
  } = useProgramLookupStore();

  useEffect(() => {
    void fetchLookups();
  }, [fetchLookups]);

  const levelOptions = useMemo(
    () => optionsWithCurrent(levels, initialData?.program_level),
    [initialData?.program_level, levels]
  );
  const typeOptions = useMemo(
    () => optionsWithCurrent(types, initialData?.program_type),
    [initialData?.program_type, types]
  );

  const numericLevelId = Number(programLevelId);
  const numericTypeId = Number(programTypeId);
  const selectedLevelOption = levelOptions.find(
    (option) => option.id === numericLevelId
  );
  const selectedTypeOption = typeOptions.find(
    (option) => option.id === numericTypeId
  );
  const selectedLevelIsInactive =
    selectedLevelOption !== undefined && isInactive(selectedLevelOption);
  const selectedTypeIsInactive =
    selectedTypeOption !== undefined && isInactive(selectedTypeOption);
  const hasValidLevel = Number.isInteger(numericLevelId) &&
    numericLevelId > 0 &&
    selectedLevelOption !== undefined &&
    !selectedLevelIsInactive;
  const hasValidType = Number.isInteger(numericTypeId) &&
    numericTypeId > 0 &&
    selectedTypeOption !== undefined &&
    !selectedTypeIsInactive;
  const lookupsAvailable = levelOptions.length > 0 && typeOptions.length > 0;
  const submitDisabled =
    isLoading ||
    isLookupLoading ||
    Boolean(lookupError) ||
    !lookupsAvailable ||
    !hasValidLevel ||
    !hasValidType;
  const levelDescriptionIds = [
    lookupError ? 'program-lookup-error' : '',
    selectedLevelIsInactive ? 'program-level-status-error' : '',
  ].filter(Boolean).join(' ') || undefined;
  const typeDescriptionIds = [
    lookupError ? 'program-lookup-error' : '',
    selectedTypeIsInactive ? 'program-type-status-error' : '',
  ].filter(Boolean).join(' ') || undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    void onSubmit({
      name: name.trim(),
      program_level_id: numericLevelId,
      program_type_id: numericTypeId,
      price: Number(price),
      active,
    });
  };

  const renderLookupState = (kind: 'level' | 'type') => {
    if (isLookupLoading) {
      return (
        <SelectItem value={`__loading-${kind}`} disabled>
          Memuat pilihan...
        </SelectItem>
      );
    }

    if (lookupError) {
      return (
        <SelectItem value={`__error-${kind}`} disabled>
          Pilihan gagal dimuat
        </SelectItem>
      );
    }

    return (
      <SelectItem value={`__empty-${kind}`} disabled>
        Belum ada pilihan aktif
      </SelectItem>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {lookupError && (
        <div
          id="program-lookup-error"
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{lookupError}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void fetchLookups({ force: true })}
            disabled={isLookupLoading}
            className="shrink-0 border-destructive/30 bg-transparent hover:bg-destructive/10"
          >
            <RefreshCw
              className={`mr-2 h-3.5 w-3.5 ${isLookupLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Coba lagi
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="program-name">Nama Program</Label>
        <Input
          id="program-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="Masukkan nama program"
          className="border-input/50 bg-background/50 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="program-level">Jenjang / Level</Label>
          <Select
            value={programLevelId}
            onValueChange={setProgramLevelId}
            disabled={isLookupLoading || levelOptions.length === 0}
          >
            <SelectTrigger
              id="program-level"
              aria-describedby={levelDescriptionIds}
              aria-invalid={selectedLevelIsInactive}
              className="border-input/50 bg-background/50 dark:border-white/10 dark:bg-white/5"
            >
              <SelectValue placeholder="Pilih level" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              {levelOptions.length > 0
                ? levelOptions.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={String(option.id)}
                      disabled={isInactive(option)}
                    >
                      {option.name}
                      {optionStatusLabel(option)
                        ? ` (${optionStatusLabel(option)})`
                        : ''}
                    </SelectItem>
                  ))
                : renderLookupState('level')}
            </SelectContent>
          </Select>
          {selectedLevelIsInactive && selectedLevelOption && (
            <p
              id="program-level-status-error"
              role="alert"
              className="text-xs text-destructive"
            >
              Level program saat ini {inactiveStatusDescription(selectedLevelOption)}.{' '}
              Pilih level program aktif pengganti sebelum menyimpan.
            </p>
          )}
          {isLookupLoading && (
            <p className="text-xs text-muted-foreground" role="status">
              Memuat daftar level program...
            </p>
          )}
          {!isLookupLoading && !lookupError && levelOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Tambahkan level program aktif pada menu Master.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="program-type">Tipe Program</Label>
          <Select
            value={programTypeId}
            onValueChange={setProgramTypeId}
            disabled={isLookupLoading || typeOptions.length === 0}
          >
            <SelectTrigger
              id="program-type"
              aria-describedby={typeDescriptionIds}
              aria-invalid={selectedTypeIsInactive}
              className="border-input/50 bg-background/50 dark:border-white/10 dark:bg-white/5"
            >
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              {typeOptions.length > 0
                ? typeOptions.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={String(option.id)}
                      disabled={isInactive(option)}
                    >
                      {option.name}
                      {optionStatusLabel(option)
                        ? ` (${optionStatusLabel(option)})`
                        : ''}
                    </SelectItem>
                  ))
                : renderLookupState('type')}
            </SelectContent>
          </Select>
          {selectedTypeIsInactive && selectedTypeOption && (
            <p
              id="program-type-status-error"
              role="alert"
              className="text-xs text-destructive"
            >
              Tipe program saat ini {inactiveStatusDescription(selectedTypeOption)}.{' '}
              Pilih tipe program aktif pengganti sebelum menyimpan.
            </p>
          )}
          {isLookupLoading && (
            <p className="text-xs text-muted-foreground" role="status">
              Memuat daftar tipe program...
            </p>
          )}
          {!isLookupLoading && !lookupError && typeOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Tambahkan tipe program aktif pada menu Master.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="program-price">Harga (IDR)</Label>
        <Input
          id="program-price"
          type="number"
          min={0}
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          required
          placeholder="0"
          className="border-input/50 bg-background/50 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          id="program-active"
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="rounded border-input/50 bg-background/50 text-primary focus:ring-primary focus:ring-opacity-50 dark:border-white/10 dark:bg-white/5"
        />
        <Label htmlFor="program-active" className="cursor-pointer">
          Aktif / Publikasikan
        </Label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={submitDisabled}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading
            ? 'Menyimpan...'
            : isLookupLoading
              ? 'Memuat pilihan...'
              : 'Simpan Program'}
        </Button>
      </div>
    </form>
  );
}
