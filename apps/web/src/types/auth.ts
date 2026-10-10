export interface UserProfile {
  id?: number;
  user_id?: number;
  phone?: string;
  birth_place?: string;
  birth_date?: string;
  parent_name?: string;
  parent_phone?: string;
  school_name?: string;
  school_level?: string;
  school_major?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  maps_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  house_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload extends Partial<UserProfile> {
  name?: string;
  branch_id?: number | null;
}

export interface BranchItem {
  id: number;
  name: string;
  code?: string;
}

export interface MentorData {
  id: number;
  specialization?: string;
  bio?: string;
  experience_years?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  email_verified_at?: string;
  profile_image_url?: string;
  avatar_url?: string;
  google_id?: string;
  provider?: string;
  roles: string[];
  permissions: string[];
  branch_id?: number | null;
  branch?: BranchItem | null;
  mentor?: MentorData | null;
  profile?: UserProfile | null;
  created_at?: string;
  updated_at?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

