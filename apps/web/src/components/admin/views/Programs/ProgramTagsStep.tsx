'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { Loader2, Plus, Search, Tag as TagIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';
import type { ProgramTag } from '@/types/sales';
import type { ProgramStepProps } from './wizard-types';

export function ProgramTagsStep({ state, setState, tags: initialTags }: ProgramStepProps) {
  const [availableTags, setAvailableTags] = useState<ProgramTag[]>(initialTags);
  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const toggleTag = (id: number) => {
    setState((current) => ({
      ...current,
      tagIds: current.tagIds.includes(id)
        ? current.tagIds.filter((tagId) => tagId !== id)
        : [...current.tagIds, id],
    }));
  };

  const handleAddCustomTag = async () => {
    const trimmed = inputVal.trim();
    if (!trimmed || isCreatingTag) return;

    // Check if tag already exists in availableTags
    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.code.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      if (!state.tagIds.includes(existing.id)) {
        toggleTag(existing.id);
      }
      setInputVal('');
      return;
    }

    setIsCreatingTag(true);
    const code = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tag';

    try {
      const response = await apiClient.admin.tags.create({
        name: trimmed,
        code,
        is_active: true,
      });

      const createdTag = response.data;
      if (createdTag && typeof createdTag.id === 'number') {
        setAvailableTags((prev) => [createdTag, ...prev]);
        setState((current) => ({
          ...current,
          tagIds: [...current.tagIds, createdTag.id],
        }));
        alertActions.success('Tag dibuat', `Tag "${trimmed}" berhasil didaftarkan ke sistem.`);
      }
    } catch (err: unknown) {
      // If code is already taken or tag exists, search existing tags from server
      try {
        const searchRes = await apiClient.admin.tags.list({ search: trimmed });
        const listData = Array.isArray(searchRes.data)
          ? searchRes.data
          : Array.isArray((searchRes as unknown as { data?: unknown })?.data)
            ? ((searchRes as unknown as { data: ProgramTag[] }).data)
            : [];
        const found = listData.find(
          (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.code.toLowerCase() === code.toLowerCase()
        );
        if (found) {
          if (!availableTags.some((t) => t.id === found.id)) {
            setAvailableTags((prev) => [found, ...prev]);
          }
          if (!state.tagIds.includes(found.id)) {
            toggleTag(found.id);
          }
          alertActions.success('Tag ditemukan', `Tag "${found.name}" dipilih.`);
        } else {
          alertActions.error('Gagal menambahkan tag', getErrorMessage(err, 'Terjadi kesalahan saat membuat tag.'));
        }
      } catch (innerErr) {
        alertActions.error('Gagal menambahkan tag', getErrorMessage(innerErr, 'Terjadi kesalahan saat mencari tag yang ada.'));
      }
    } finally {
      setIsCreatingTag(false);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const selectedTags = availableTags.filter((t) => state.tagIds.includes(t.id));

  const filteredTags = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableTags;
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(query) || (tag.code && tag.code.toLowerCase().includes(query))
    );
  }, [availableTags, searchQuery]);

  return (
    <div className="grid gap-6">
      {/* Free-Input Tag Bar */}
      <div className="rounded-2xl border border-border/60 bg-card/85 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-tag-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TagIcon className="size-4 text-primary" />
            Sistem Tag Bebas (Free-Input Tag)
          </label>
          <p className="text-xs text-muted-foreground">
            Ketik nama tag apa pun (misal: <em>CPNS 2026</em>, <em>Kedinasan</em>, <em>Matematika Dasar</em>) lalu tekan <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono text-foreground">Enter</kbd> untuk menambahkan secara bebas tanpa deklarasi kaku sebelumnya.
          </p>

          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <Input
              id="custom-tag-input"
              placeholder="Ketik nama tag baru..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreatingTag}
              className="h-10 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!inputVal.trim() || isCreatingTag}
              className="h-10 w-full sm:w-auto shrink-0 gap-1.5 text-xs font-medium"
            >
              {isCreatingTag ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {isCreatingTag ? 'Menyimpan...' : 'Tambah Tag'}
            </Button>
          </div>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              Tag Terpilih ({selectedTags.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className="gap-1.5 py-1 px-3 text-xs font-medium bg-primary text-primary-foreground shadow-sm"
                >
                  <TagIcon className="size-3" />
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    aria-label={`Hapus tag ${tag.name}`}
                    className="ml-1 rounded-full p-0.5 hover:bg-black/20 focus:outline-none"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Tags Quick Selection */}
      <fieldset className="grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Katalog Tag Tersedia ({availableTags.length}):
          </legend>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-tag-input"
              type="search"
              placeholder="Cari nama atau kode tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-8 text-xs bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {filteredTags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm p-6 text-center text-xs text-muted-foreground">
            <TagIcon className="mx-auto mb-2 size-5 text-muted-foreground/60" />
            Tidak ada tag yang cocok dengan &quot;{searchQuery}&quot;.
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ketik nama tag di bagian atas lalu klik Tambah Tag untuk membuatnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 max-h-72 overflow-y-auto pr-1">
            {filteredTags.map((tag) => {
              const isSelected = state.tagIds.includes(tag.id);
              return (
                <label
                  key={tag.id}
                  className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all duration-200 ${
                    isSelected
                      ? 'border-primary/50 bg-primary/10 font-semibold text-primary shadow-sm'
                      : 'border-border/60 bg-card/60 text-foreground hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTag(tag.id)}
                      className="size-4 accent-primary rounded"
                    />
                    <span>{tag.name}</span>
                  </div>
                  {tag.code && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {tag.code}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>
    </div>
  );
}
