import { create } from 'zustand';
import { api, apiClient } from '@/lib/api';

export interface Mentor {
  id: number;
  user_id: number;
  specialization: string;
  bio: string | null;
  experience_years: number;
  social_links: any;
  is_active: boolean;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  schedules?: MentorSchedule[];
}

export interface MentorSchedule {
  id: number;
  mentor_id: number;
  title: string | null;
  description: string | null;
  subject: string | null;
  location: string | null;
  status: 'scheduled' | 'done' | 'rescheduled' | 'cancelled';
  guest_email: string | null;
  color_hex: string | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  mentor?: Mentor;
}

export interface ProgramModule {
  id: number;
  program_id: number;
  title: string;
  description: string | null;
  order: number;
  is_published: boolean;
  lessons?: ProgramLesson[];
}

export interface ProgramLesson {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url: string | null;
  content_body: string | null;
  duration_minutes: number;
  order: number;
  is_published: boolean;
  is_preview: boolean;
}

interface LearningState {
  mentors: Mentor[];
  isLoading: boolean;
  error: string | null;

  fetchMentors: () => Promise<void>;
  createMentor: (data: any) => Promise<void>;
  updateMentor: (id: number, data: any) => Promise<void>;
  deleteMentor: (id: number) => Promise<void>;

  mentorSchedules: MentorSchedule[];
  fetchMentorSchedules: (mentorId: number, params?: any) => Promise<MentorSchedule[]>;
  studentSchedules: MentorSchedule[];
  fetchStudentSchedules: () => Promise<MentorSchedule[]>;
  addSchedule: (mentorId: number, data: any) => Promise<void>;
  updateSchedule: (mentorId: number, scheduleId: number, data: any) => Promise<void>;
  deleteSchedule: (mentorId: number, scheduleId: number) => Promise<void>;

  fetchCurriculum: (programId: number) => Promise<ProgramModule[]>;
  createModule: (programId: number, data: any) => Promise<void>;
  updateModule: (moduleId: number, data: any) => Promise<void>;
  deleteModule: (moduleId: number) => Promise<void>;

  createLesson: (moduleId: number, data: any) => Promise<void>;
  updateLesson: (lessonId: number, data: any) => Promise<void>;
  deleteLesson: (lessonId: number) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  mentors: [],
  isLoading: false,
  error: null,

  fetchMentors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/learning/mentors');
      set({ mentors: response.data.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createMentor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/learning/mentors', data);
      await get().fetchMentors();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateMentor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/learning/mentors/${id}`, data);
      await get().fetchMentors();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMentor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.learning.mentors.remove(id);
      await get().fetchMentors();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  mentorSchedules: [],
  studentSchedules: [],

  fetchMentorSchedules: async (mentorId, params = {}) => {
    try {
      const response = await api.get(`/learning/mentors/${mentorId}/schedules`, { params });
      set({ mentorSchedules: response.data });
      return response.data;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  fetchStudentSchedules: async () => {
    try {
      const response = await api.get('/learning/schedules');
      set({ studentSchedules: response.data });
      return response.data;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  addSchedule: async (mentorId, data) => {
    try {
      await api.post(`/learning/mentors/${mentorId}/schedules`, data);
      await get().fetchMentorSchedules(mentorId);
    } catch (error: any) {
      throw error;
    }
  },

  updateSchedule: async (mentorId, scheduleId, data) => {
    try {
      await api.put(`/learning/mentors/${mentorId}/schedules/${scheduleId}`, data);
      await get().fetchMentorSchedules(mentorId);
    } catch (error: any) {
      throw error;
    }
  },

  deleteSchedule: async (mentorId, scheduleId) => {
    try {
      await apiClient.learning.schedules.remove(mentorId, scheduleId);
      await get().fetchMentorSchedules(mentorId);
    } catch (error: any) {
      throw error;
    }
  },

  fetchCurriculum: async (programId) => {
    try {
      const response = await api.get(`/learning/programs/${programId}/curriculum`);
      return response.data;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  createModule: async (programId, data) => {
    try {
      await api.post(`/learning/programs/${programId}/modules`, data);
    } catch (error: any) {
      throw error;
    }
  },

  updateModule: async (moduleId, data) => {
    try {
      await api.put(`/learning/modules/${moduleId}`, data);
    } catch (error: any) {
      throw error;
    }
  },

  deleteModule: async (moduleId) => {
    try {
      await apiClient.learning.curriculum.modules.remove(moduleId);
    } catch (error: any) {
      throw error;
    }
  },

  createLesson: async (moduleId, data) => {
    try {
      await api.post(`/learning/modules/${moduleId}/lessons`, data);
    } catch (error: any) {
      throw error;
    }
  },

  updateLesson: async (lessonId, data) => {
    try {
      await api.put(`/learning/lessons/${lessonId}`, data);
    } catch (error: any) {
      throw error;
    }
  },

  deleteLesson: async (lessonId) => {
    try {
      await apiClient.learning.curriculum.lessons.remove(lessonId);
    } catch (error: any) {
      throw error;
    }
  },
}));
