export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
export type ProgramVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
export type BatchStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
export type BatchMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export interface MentorOption { id: number; name: string; specialization?: string | null }
export interface SessionMentorAssignment {
  id: number; mentor_id: number; role: string; status: string;
  capacity?: number | null; reserved_count: number;
  mentor: MentorOption;
}

export interface ProgramTag {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
  archived_at?: string | null;
}

export interface ComponentDefinition {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  config_schema?: Record<string, unknown> | null;
  is_available: boolean;
  sort_order: number;
}

export interface ProgramComponent {
  id?: number;
  definition_id?: number;
  component_definition_id?: number;
  code: string;
  name: string;
  is_enabled: boolean;
  label?: string | null;
  sort_order: number;
  configuration: Record<string, unknown>;
}

export interface ProgramChild {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_required: boolean;
}

export interface ProgramBatch {
  id: number;
  program_id: number;
  name: string;
  code: string;
  registration_starts_at?: string | null;
  registration_ends_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  capacity?: number | null;
  enrolled_count: number;
  mode: BatchMode;
  location?: string | null;
  timezone: string;
  price_override?: string | null;
  status: BatchStatus;
  allow_retakes: boolean;
}

export interface ProgramSession {
  id: number;
  program_batch_id: number;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  mode: BatchMode;
  mentor_assignment_mode: 'ADMIN' | 'STUDENT' | 'HYBRID';
  location?: string | null;
  meeting_url?: string | null;
  capacity?: number | null;
  reserved_count: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  mentor_assignments?: SessionMentorAssignment[];
}

export interface ProgramSessionPayload {
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  mode: BatchMode;
  mentor_assignment_mode?: 'ADMIN' | 'STUDENT' | 'HYBRID';
  location?: string | null;
  meeting_url?: string | null;
  capacity?: number | null;
  reason?: string;
}

export interface Program {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  cover_url?: string | null;
  base_price: string;
  currency: 'IDR';
  visibility: ProgramVisibility;
  status: ProgramStatus;
  completion_rule?: Record<string, unknown> | null;
  published_at?: string | null;
  archived_at?: string | null;
  tags?: ProgramTag[];
  components?: ProgramComponent[];
  children?: ProgramChild[];
  created_at?: string;
  updated_at?: string;
}

export interface ProgramMutationPayload {
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  cover_url?: string | null;
  base_price: string;
  currency: 'IDR';
  visibility: ProgramVisibility;
  completion_rule?: Record<string, unknown> | null;
}

export interface ProgramWizardPayload {
  basics: ProgramMutationPayload;
  tag_ids: number[];
  components: Array<{
    component_definition_id: number;
    is_enabled: boolean;
    label?: string | null;
    sort_order: number;
    configuration: Record<string, unknown>;
  }>;
  children: Array<{
    program_id: number;
    sort_order: number;
    is_required: boolean;
  }>;
  batches: Array<{
    id?: number;
    name: string;
    code: string;
    registration_starts_at?: string | null;
    registration_ends_at?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    capacity?: number | null;
    mode: BatchMode;
    location?: string | null;
    timezone: string;
    price_override?: string | null;
    allow_retakes: boolean;
  }>;
  delete_batch_ids: number[];
  reason: string;
}

export interface OrderItem {
  id: number;
  program_id: number;
  program_batch_id?: number | null;
  program_name: string;
  program_slug: string;
  batch_name?: string | null;
  batch_code?: string | null;
  unit_price: string;
  currency: 'IDR';
  quantity: 1;
  snapshot?: Record<string, unknown> | null;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  total: string;
  currency: 'IDR';
  payment_provider?: string | null;
  payment_reference: string;
  snap_token?: string | null;
  meta?: Record<string, unknown> | null;
  paid_at?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  programs: Array<{
    id: number;
    batch_id?: number | null;
    quantity: 1;
  }>;
  payment_provider?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: Record<string, string | null>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}
