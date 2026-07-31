import React, { useState } from 'react';
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
import type {
  ProgramMasterFormPayload,
  ProgramMasterRecord,
} from '@/types/program-master';

interface ProgramMasterFormProps {
  initialData?: ProgramMasterRecord | null;
  singularLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: ProgramMasterFormPayload) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrors {
  code?: string;
  name?: string;
  sort_order?: string;
}

export function ProgramMasterForm({
  initialData,
  singularLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProgramMasterFormProps) {
  const isEditing = Boolean(initialData);
  const [code, setCode] = useState(initialData?.code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [rowStatus, setRowStatus] = useState<'0' | '1'>(
    initialData?.row_status === 1 ? '1' : '0'
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = code.trim().toLowerCase();
    const normalizedName = name.trim();
    const nextErrors: FieldErrors = {};

    if (!isEditing) {
      if (!normalizedCode) {
        nextErrors.code = 'Kode wajib diisi.';
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedCode)) {
        nextErrors.code = 'Gunakan huruf kecil, angka, dan tanda hubung.';
      } else if (normalizedCode.length > 20) {
        nextErrors.code = 'Kode maksimal 20 karakter.';
      }
    }

    if (!normalizedName) {
      nextErrors.name = 'Nama wajib diisi.';
    } else if (normalizedName.length > 100) {
      nextErrors.name = 'Nama maksimal 100 karakter.';
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 65535) {
      nextErrors.sort_order = 'Urutan harus berupa angka 0 sampai 65535.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const sharedPayload = {
      name: normalizedName,
      sort_order: sortOrder,
      row_status: Number(rowStatus) as 0 | 1,
    };

    await onSubmit(
      isEditing
        ? sharedPayload
        : {
            ...sharedPayload,
            code: normalizedCode,
          }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="program-master-code">Kode</Label>
          <Input
            id="program-master-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toLowerCase());
              setErrors((current) => ({ ...current, code: undefined }));
            }}
            required={!isEditing}
            disabled={isEditing || isSubmitting}
            maxLength={20}
            autoComplete="off"
            aria-invalid={Boolean(errors.code)}
            aria-describedby={`program-master-code-help${
              errors.code ? ' program-master-code-error' : ''
            }`}
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
          <p id="program-master-code-help" className="text-xs text-muted-foreground">
            {isEditing
              ? 'Kode bersifat permanen dan tidak dapat diubah.'
              : 'Huruf kecil, angka, atau tanda hubung. Contoh: sekolah-dasar.'}
          </p>
          {errors.code && (
            <p id="program-master-code-error" className="text-xs text-destructive">
              {errors.code}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="program-master-name">Nama {singularLabel}</Label>
          <Input
            id="program-master-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            required
            disabled={isSubmitting}
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={`program-master-name-help${
              errors.name ? ' program-master-name-error' : ''
            }`}
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
          <p id="program-master-name-help" className="text-xs text-muted-foreground">
            Nama ini ditampilkan pada pilihan program.
          </p>
          {errors.name && (
            <p id="program-master-name-error" className="text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="program-master-order">Urutan</Label>
          <Input
            id="program-master-order"
            type="number"
            min={0}
            max={65535}
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(Number(event.target.value));
              setErrors((current) => ({ ...current, sort_order: undefined }));
            }}
            required
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.sort_order)}
            aria-describedby={
              errors.sort_order ? 'program-master-order-error' : undefined
            }
            className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
          />
          {errors.sort_order && (
            <p id="program-master-order-error" className="text-xs text-destructive">
              {errors.sort_order}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="program-master-status">Status</Label>
          <Select
            value={rowStatus}
            onValueChange={(value) => setRowStatus(value as '0' | '1')}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="program-master-status"
              aria-describedby="program-master-status-help"
              className="bg-background/50 border-input/50 dark:bg-white/5 dark:border-white/10"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-white/10">
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Tidak aktif</SelectItem>
            </SelectContent>
          </Select>
          <p id="program-master-status-help" className="text-xs text-muted-foreground">
            Hanya data aktif yang tersedia pada LoV Program.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="active:scale-[0.98]"
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="active:scale-[0.98]">
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : `Tambah ${singularLabel}`}
        </Button>
      </div>
    </form>
  );
}
