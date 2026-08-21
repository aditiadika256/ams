import type {
  BatchMode,
  ComponentDefinition,
  Program,
  ProgramBatch,
  ProgramTag,
  ProgramVisibility,
} from '@/types/sales';
import type { Dispatch, SetStateAction } from 'react';

export interface BatchDraft {
  id?: number;
  name: string;
  code: string;
  mode: BatchMode;
  capacity: string;
  location: string;
  timezone: string;
  registration_starts_at: string;
  registration_ends_at: string;
  starts_at: string;
  ends_at: string;
  price_override: string;
  allow_retakes: boolean;
}

export interface ProgramWizardState {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  basePrice: string;
  visibility: ProgramVisibility;
  completionMode: 'NONE' | 'MATERIAL' | 'ASSESSMENT' | 'BOTH';
  tagIds: number[];
  componentIds: number[];
  componentLabels: Record<number, string>;
  childIds: number[];
  batches: BatchDraft[];
  reason: string;
}

export interface ProgramStepProps {
  state: ProgramWizardState;
  setState: Dispatch<SetStateAction<ProgramWizardState>>;
  tags: ProgramTag[];
  definitions: ComponentDefinition[];
  programs: Program[];
  initialBatches: ProgramBatch[];
}
