export interface Menu {
  id: number;
  name: string;
  icon?: string | null;
  url: string;
  layout: 'users' | 'admin';
  section: 'topbar' | 'bottomnavigation' | 'sidebar' | 'header';
  parent_id?: number | null;
  order: number;
  created_at?: string;
  updated_at?: string;
  children?: Menu[];
}
