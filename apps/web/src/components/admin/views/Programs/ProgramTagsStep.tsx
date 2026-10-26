'use client';

import { useState, type KeyboardEvent } from 'react';
import { Plus, Tag as TagIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { ProgramTag } from '@/types/sales';
import type { ProgramStepProps } from './wizard-types';

export function ProgramTagsStep({ state, setState, tags: initialTags }: ProgramStepProps) {
  const [availableTags, setAvailableTags] = useState<ProgramTag[]>(initialTags);
  const [inputVal, setInputVal] = useState('');

  const toggleTag = (id: number) => {
    setState((current) => ({
      ...current,
      tagIds: current.tagIds.includes(id)
        ? current.tagIds.filter((tagId) => tagId !== id)
        : [...current.tagIds, id],
    }));
  };

  const handleAddCustomTag = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Check if tag already exists in availableTags
    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.code.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      if (!state.tagIds.includes(existing.id)) {
        toggleTag(existing.id);
      }
    } else {
      // Create a virtual client tag instance
      const newTagId = -(Date.now() % 1000000); // Negative temp id or timestamp id
      const newTag: ProgramTag = {
        id: newTagId,
        name: trimmed,
        code: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        is_active: true,
      };

      setAvailableTags((prev) => [newTag, ...prev]);
      setState((current) => ({
        ...current,
        tagIds: [...current.tagIds, newTagId],
      }));
    }

    setInputVal('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const selectedTags = availableTags.filter((t) => state.tagIds.includes(t.id));

  return (
    <div className="grid gap-6">
      {/* Free-Input Tag Bar */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-tag-input" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TagIcon className="size-4 text-primary" />
            Sistem Tag Bebas (Free-Input Tag)
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ketik nama tag apa pun (misal: <em>CPNS 2026</em>, <em>Kedinasan</em>, <em>Matematika Dasar</em>) lalu tekan <kbd className="rounded border bg-zinc-100 px-1 py-0.5 text-[10px] font-mono dark:bg-zinc-800">Enter</kbd> untuk menambahkan secara bebas tanpa deklarasi kaku sebelumnya.
          </p>

          <div className="mt-2 flex gap-2">
            <Input
              id="custom-tag-input"
              placeholder="Ketik nama tag baru..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 text-sm"
            />
            <Button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!inputVal.trim()}
              className="h-10 shrink-0 gap-1.5"
            >
              <Plus className="size-4" />
              Tambah Tag
            </Button>
          </div>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-2">
              Tag Terpilih ({selectedTags.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className="gap-1.5 py-1 px-3 text-xs font-medium bg-primary/90 text-primary-foreground shadow-sm"
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
        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Katalog Tag Tersedia:
        </legend>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {availableTags.map((tag) => {
            const isSelected = state.tagIds.includes(tag.id);
            return (
              <label
                key={tag.id}
                className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/50 bg-primary/5 font-semibold text-primary shadow-sm dark:bg-primary/10'
                    : 'border-zinc-200/80 bg-white/60 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-300'
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
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                    {tag.code}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
