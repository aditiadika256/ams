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

export type ComponentContentType = 'file' | 'drive_or_pdf' | 'video_url' | 'text' | 'link';

export interface ComponentContentConfig {
  content_type?: ComponentContentType;
  title?: string;
  summary?: string;
  body?: string;
  external_url?: string;
  drive_preview_url?: string;
  is_pdf?: boolean;
  media_asset_id?: number | null;
  media_name?: string;
  media_size?: number;
  duration_minutes?: number;
  is_published?: boolean;
  is_preview?: boolean;
}

export interface ProgramComponentDraft {
  id?: number;
  instanceKey: string;
  componentDefinitionId: number;
  label: string;
  isEnabled: boolean;
  sortOrder: number;
  configuration?: Record<string, unknown> & ComponentContentConfig;
  pendingFile?: File;
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
  components: ProgramComponentDraft[];
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
  programId?: number;
}
