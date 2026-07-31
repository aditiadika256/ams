export type ProgramMasterRowStatus = -1 | 0 | 1;

export interface ProgramLookupOption {
  id: number;
  code: string;
  name: string;
}

export interface ProgramLookupData {
  levels: ProgramLookupOption[];
  types: ProgramLookupOption[];
}

export interface ProgramMasterRecord extends ProgramLookupOption {
  row_status: ProgramMasterRowStatus;
  sort_order: number;
}

export interface ProgramMasterCreatePayload {
  code: string;
  name: string;
  row_status: 0 | 1;
  sort_order: number;
}

export interface ProgramMasterUpdatePayload {
  name: string;
  row_status: 0 | 1;
  sort_order: number;
}

export type ProgramMasterFormPayload =
  | ProgramMasterCreatePayload
  | ProgramMasterUpdatePayload;

export interface ProgramMasterQuery {
  search?: string;
  row_status?: ProgramMasterRowStatus;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'code' | 'sort_order' | 'created_at';
  sort_dir?: 'asc' | 'desc';
}

export interface LaravelPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface LaravelPaginatorMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: LaravelPaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface LaravelPaginatorLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface LaravelPaginator<T> {
  data: T[];
  links: LaravelPaginatorLinks;
  meta: LaravelPaginatorMeta;
}
