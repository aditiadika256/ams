export type AccessStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';

export interface WorkspaceTag { code: string; name: string }
export interface WorkspaceProgram {
  id: number; name: string; slug: string; short_description?: string | null;
  description?: string | null; thumbnail_url?: string | null; cover_url?: string | null;
  tags: WorkspaceTag[];
}
export interface WorkspaceBatch {
  id: number; name: string; code: string; starts_at?: string | null; ends_at?: string | null;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID'; timezone: string; status: string;
}
export interface WorkspaceSession {
  id: number; title: string; starts_at: string; ends_at: string; timezone: string;
  mode: string; location?: string | null; status: string; meeting_url?: string | null;
  mentor_assignment_mode: 'ADMIN' | 'STUDENT' | 'HYBRID';
  mentor_assignments?: WorkspaceMentorAssignment[];
}
export interface WorkspaceMentorAssignment {
  id: number; role: string; status: string; capacity?: number | null; reserved_count: number;
  mentor: { id: number; name: string; specialization?: string | null };
}
export interface WorkspaceSessionUpdate {
  id: number; program_access_id?: number | null; session_id: number; type: 'SESSION_RESCHEDULED';
  payload: { title: string; starts_at: string; ends_at: string; timezone: string; reason?: string | null };
  occurred_at: string; acknowledged_at?: string | null;
}
export interface WorkspaceComponent { code: string; name: string; label?: string | null; sort_order: number }
export interface WorkspaceCertificate { certificate_number: string; issued_at: string; revoked_at?: string | null }
export interface WorkspaceProgress {
  percent: number; content_count: number;
  breakdown: Record<string, Record<string, number>>;
  calculated_at?: string | null;
}
export interface WorkspaceAccess {
  id: number; user_id: number; status: AccessStatus; source_type: string;
  starts_at?: string | null; ends_at?: string | null; activated_at?: string | null;
  completed_at?: string | null; archived_at?: string | null; last_accessed_at?: string | null;
  program: WorkspaceProgram; batch?: WorkspaceBatch | null; next_session?: WorkspaceSession | null;
  primary_component?: string | null; progress: WorkspaceProgress;
  certificate?: WorkspaceCertificate | null;
  components?: WorkspaceComponent[];
}
export interface WorkspaceSummary {
  ACTIVE: number; WAITING: number; COMPLETED: number; EXPIRED: number;
  SUSPENDED: number; REVOKED: number; ARCHIVED: number;
}
export interface WorkspacePage {
  data: WorkspaceAccess[];
  links: Record<string, string | null>;
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
  summary: Partial<WorkspaceSummary>;
}
export interface CurriculumLesson { id: number; title: string; slug: string; content_type: string; order: number }
export interface CurriculumModule { id: number; title: string; description?: string | null; order: number; lessons: CurriculumLesson[] }
