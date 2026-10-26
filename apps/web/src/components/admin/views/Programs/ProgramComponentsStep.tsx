'use client';

import { useId, useMemo, useState } from 'react';
import {
  Blocks,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  Info,
  Layers,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { ComponentDefinition } from '@/types/sales';
import type { ProgramComponentDraft, ProgramStepProps } from './wizard-types';

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

export function ProgramComponentsStep({ state, setState, definitions }: ProgramStepProps) {
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<number | ''>('');
  const selectId = useId();

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

    // Count existing instances of this definition to auto-generate a smart label
    const existingCount = state.components.filter(
      (c) => c.componentDefinitionId === definitionId
    ).length;

    const newInstance: ProgramComponentDraft = {
      instanceKey: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      componentDefinitionId: def.id,
      label: existingCount > 0 ? `${def.name} ${existingCount + 1}` : def.name,
      isEnabled: true,
      sortOrder: state.components.length + 1,
      configuration: {},
    };

    setState((current) => ({
      ...current,
      components: [...current.components, newInstance],
    }));

    setSelectedDefinitionId('');
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
        comp.instanceKey === instanceKey ? { ...comp, label } : comp
      ),
    }));
  };

  // Remove instance
  const handleRemove = (instanceKey: string) => {
    setState((current) => ({
      ...current,
      components: current.components.filter((comp) => comp.instanceKey !== instanceKey),
    }));
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
              Komposisi Komponen Program
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tambahkan satu atau lebih komponen ke kurikulum (misal: Materi 1, Materi 2, Media Library, dsb).
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
      <div className="grid gap-3">
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
            return (
              <div
                key={component.instanceKey}
                className={`group relative flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all duration-200 md:flex-row md:items-center md:justify-between ${
                  component.isEnabled
                    ? 'border-zinc-200/90 bg-white/80 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-950/70'
                    : 'border-zinc-200/40 bg-zinc-50/40 opacity-60 dark:border-zinc-800/40 dark:bg-zinc-900/30'
                }`}
              >
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
                  <div className="w-full md:w-60">
                    <Input
                      aria-label={`Label untuk ${definition?.name ?? 'komponen'}`}
                      placeholder="Label khusus tampilan (opsional)"
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
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
        <Info className="size-4 shrink-0 text-primary" />
        <span>
          Setiap komponen yang berstatus <strong>Aktif</strong> akan otomatis muncul di navigasi silabus siswa.
          Anda dapat menambahkan beberapa materi, media, atau asesmen sekaligus sesuai kebutuhan struktur kurikulum.
        </span>
      </div>
    </div>
  );
}
