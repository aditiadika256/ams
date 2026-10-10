export interface Menu {
  id: number;
  seed_key?: string | null;
  name: string;
  icon?: string | null;
  url: string;
  layout: 'users' | 'admin';
  section: 'topbar' | 'bottomnavigation' | 'sidebar' | 'header';
  parent_id?: number | null;
  order: number;
  permission?: string | null;
  created_at?: string;
  updated_at?: string;
  children?: Menu[];
}
