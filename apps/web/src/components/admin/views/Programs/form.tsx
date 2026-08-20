'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  ComponentDefinition,
  Program,
  ProgramBatch,
  ProgramTag,
  ProgramWizardPayload,
} from '@/types/sales';
import { ProgramBasicsStep } from './ProgramBasicsStep';
import { ProgramTagsStep } from './ProgramTagsStep';
import { ProgramComponentsStep } from './ProgramComponentsStep';
import { ProgramCollectionStep } from './ProgramCollectionStep';
import { ProgramBatchesStep } from './ProgramBatchesStep';
import { ProgramReviewStep } from './ProgramReviewStep';
import type { BatchDraft, ProgramWizardState } from './wizard-types';

interface ProgramFormProps {
  initialData?: Program | null;
  initialBatches?: ProgramBatch[];
  tags: ProgramTag[];
  definitions: ComponentDefinition[];
  programs: Program[];
  onSubmit: (data: ProgramWizardPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const steps = [
  { label: 'Dasar', component: ProgramBasicsStep },
  { label: 'Tags', component: ProgramTagsStep },
  { label: 'Komponen', component: ProgramComponentsStep },
  { label: 'Collection', component: ProgramCollectionStep },
  { label: 'Batch', component: ProgramBatchesStep },
  { label: 'Review', component: ProgramReviewStep },
] as const;

function toLocalDateTime(value?: string | null): string {
  return value ? value.slice(0, 16) : '';
}

function toBatchDraft(batch: ProgramBatch): BatchDraft {
  return {
    id: batch.id,
    name: batch.name,
    code: batch.code,
    mode: batch.mode,
    capacity: batch.capacity === null || batch.capacity === undefined ? '' : String(batch.capacity),
    location: batch.location ?? '',
    timezone: batch.timezone,
    registration_starts_at: toLocalDateTime(batch.registration_starts_at),
    registration_ends_at: toLocalDateTime(batch.registration_ends_at),
    starts_at: toLocalDateTime(batch.starts_at),
    ends_at: toLocalDateTime(batch.ends_at),
    price_override: batch.price_override ?? '',
    allow_retakes: batch.allow_retakes,
  };
}

function initialState(program?: Program | null, batches: ProgramBatch[] = []): ProgramWizardState {
  return {
    name: program?.name ?? '',
    slug: program?.slug ?? '',
    shortDescription: program?.short_description ?? '',
    description: program?.description ?? '',
    thumbnailUrl: program?.thumbnail_url ?? '',
    basePrice: program?.base_price ?? '0',
    visibility: program?.visibility ?? 'PUBLIC',
    tagIds: program?.tags?.map((tag) => tag.id) ?? [],
    componentIds: program?.components?.filter((component) => component.is_enabled).map((component) => component.definition_id ?? component.component_definition_id ?? 0).filter(Boolean) ?? [],
    componentLabels: Object.fromEntries((program?.components ?? []).map((component) => [component.definition_id ?? component.component_definition_id ?? 0, component.label ?? ''])),
    childIds: program?.children?.map((child) => child.id) ?? [],
    batches: batches.map(toBatchDraft),
    reason: program ? 'Memperbarui konfigurasi program' : 'Membuat konfigurasi program',
  };
}

export function ProgramForm({
  initialData,
  initialBatches = [],
  tags,
  definitions,
  programs,
  onSubmit,
  onCancel,
  isLoading,
}: ProgramFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [state, setState] = useState<ProgramWizardState>(() => initialState(initialData, initialBatches));

  useEffect(() => {
    setState(initialState(initialData, initialBatches));
    setActiveStep(0);
  }, [initialData, initialBatches]);

  const Step = steps[activeStep].component;
  const availablePrograms = useMemo(
    () => programs.filter((program) => program.id !== initialData?.id && program.status !== 'ARCHIVED'),
    [initialData?.id, programs],
  );

  const basicsValid = state.name.trim().length > 0
    && /^[a-z0-9-]+$/.test(state.slug)
    && state.basePrice !== ''
    && Number(state.basePrice) >= 0;
  const reviewValid = state.reason.trim().length >= 5;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < steps.length - 1) {
      if (activeStep === 0 && !basicsValid) return;
      setActiveStep((current) => current + 1);
      return;
    }
    if (!basicsValid || !reviewValid || isLoading) return;

    void onSubmit({
      basics: {
        name: state.name.trim(),
        slug: state.slug.trim(),
        short_description: state.shortDescription.trim() || null,
        description: state.description.trim() || null,
        thumbnail_url: state.thumbnailUrl.trim() || null,
        cover_url: null,
        base_price: state.basePrice,
        currency: 'IDR',
        visibility: state.visibility,
        completion_rule: null,
      },
      tag_ids: state.tagIds,
      components: state.componentIds.map((definitionId, index) => ({
        component_definition_id: definitionId,
        is_enabled: true,
        label: state.componentLabels[definitionId]?.trim() || null,
        sort_order: index + 1,
        configuration: {},
      })),
      children: state.childIds.map((programId, index) => ({
        program_id: programId,
        sort_order: index + 1,
        is_required: true,
      })),
      batches: state.batches.map((batch) => ({
        id: batch.id,
        name: batch.name.trim(),
        code: batch.code.trim(),
        registration_starts_at: batch.registration_starts_at || null,
        registration_ends_at: batch.registration_ends_at || null,
        starts_at: batch.starts_at || null,
        ends_at: batch.ends_at || null,
        capacity: batch.capacity ? Number(batch.capacity) : null,
        mode: batch.mode,
        location: batch.location.trim() || null,
        timezone: batch.timezone || 'Asia/Makassar',
        price_override: batch.price_override || null,
        allow_retakes: batch.allow_retakes,
      })),
      delete_batch_ids: initialBatches
        .filter((batch) => !state.batches.some((draft) => draft.id === batch.id))
        .map((batch) => batch.id),
      reason: state.reason.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <nav aria-label="Tahapan konfigurasi program" className="overflow-x-auto pb-1">
        <ol className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <li key={step.label}>
              <button
                type="button"
                onClick={() => index <= activeStep && setActiveStep(index)}
                disabled={index > activeStep}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  index === activeStep && 'border-primary bg-primary text-primary-foreground',
                  index < activeStep && 'border-primary/30 bg-primary/10 text-primary',
                  index > activeStep && 'cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-800',
                )}
              >
                <span className="grid size-5 place-items-center rounded-full border border-current text-xs">
                  {index < activeStep ? <Check className="size-3" /> : index + 1}
                </span>
                {step.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-h-80">
        <Step
          state={state}
          setState={setState}
          tags={tags}
          definitions={definitions}
          programs={availablePrograms}
          initialBatches={initialBatches}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <div className="flex gap-2">
          {activeStep > 0 && (
            <Button type="button" variant="outline" onClick={() => setActiveStep((current) => current - 1)}>
              <ArrowLeft className="mr-2 size-4" />Kembali
            </Button>
          )}
          <Button type="submit" disabled={isLoading || (activeStep === 0 && !basicsValid) || (activeStep === steps.length - 1 && !reviewValid)}>
            {activeStep === steps.length - 1 ? (isLoading ? 'Menyimpan…' : 'Simpan program') : <>Lanjut<ArrowRight className="ml-2 size-4" /></>}
          </Button>
        </div>
      </div>
    </form>
  );
}
