import { create } from 'zustand';
import { api, apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

let latestMentorsRequestId = 0;
let latestMentorSchedulesRequestId = 0;

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
  deleteModule: (moduleId: number, moduleTitle?: string) => Promise<void>;

  createLesson: (moduleId: number, data: any) => Promise<void>;
  updateLesson: (lessonId: number, data: any) => Promise<void>;
  deleteLesson: (lessonId: number, lessonTitle?: string) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  mentors: [],
  isLoading: false,
  error: null,

  fetchMentors: async () => {
    const requestId = ++latestMentorsRequestId;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/learning/mentors');
      if (requestId === latestMentorsRequestId) {
        set({ mentors: response.data.data });
      }
    } catch (error: any) {
      if (requestId === latestMentorsRequestId) {
        set({ error: error.message });
      }
    } finally {
      if (requestId === latestMentorsRequestId) {
        set({ isLoading: false });
      }
    }
  },

  createMentor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/learning/mentors', data);
      if (response.data) {
        set((state) => ({
          mentors: [
            response.data,
            ...state.mentors.filter((mentor) => mentor.id !== response.data.id),
          ],
        }));
      }
      await get().fetchMentors();
      alertActions.success(
        'Mentor berhasil ditambahkan',
        `${response.data?.user?.name || `User #${data.user_id}`} sekarang terdaftar sebagai mentor.`
      );
    } catch (error: any) {
      const message = getErrorMessage(error, 'Mentor gagal ditambahkan.');
      set({ error: null });
      alertActions.error('Gagal menambahkan mentor', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateMentor: async (id, data) => {
    set({ isLoading: true, error: null });
    const mentorName = get().mentors.find((mentor) => mentor.id === id)?.user?.name || `Mentor #${id}`;
    try {
      const response = await api.put(`/learning/mentors/${id}`, data);
      if (response.data) {
        set((state) => ({
          mentors: state.mentors.map((mentor) =>
            mentor.id === id ? response.data : mentor
          ),
        }));
      }
      await get().fetchMentors();
      alertActions.success('Mentor berhasil diperbarui', `Profil ${mentorName} berhasil disimpan.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Profil mentor gagal diperbarui.');
      set({ error: null });
      alertActions.error('Gagal memperbarui mentor', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMentor: async (id) => {
    set({ isLoading: true, error: null });
    const mentorName = get().mentors.find((mentor) => mentor.id === id)?.user?.name || `Mentor #${id}`;
    try {
      await apiClient.learning.mentors.remove(id);
      set((state) => ({
        mentors: state.mentors.filter((mentor) => mentor.id !== id),
      }));
      await get().fetchMentors();
      alertActions.success('Mentor berhasil dihapus', `${mentorName} tidak lagi terdaftar sebagai mentor.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Mentor gagal dihapus.');
      set({ error: null });
      alertActions.error('Gagal menghapus mentor', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  mentorSchedules: [],
  studentSchedules: [],

  fetchMentorSchedules: async (mentorId, params = {}) => {
    const requestId = ++latestMentorSchedulesRequestId;
    try {
      const response = await api.get(`/learning/mentors/${mentorId}/schedules`, { params });
      if (requestId === latestMentorSchedulesRequestId) {
        set({ mentorSchedules: response.data });
      }
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
      const response = await api.post(`/learning/mentors/${mentorId}/schedules`, data);
      if (response.data) {
        const created = response.data as MentorSchedule;
        set((state) => ({
          mentorSchedules: [
            created,
            ...state.mentorSchedules.filter((schedule) => schedule.id !== created.id),
          ],
        }));
      }
      await get().fetchMentorSchedules(mentorId);
      alertActions.success(
        'Jadwal berhasil ditambahkan',
        `${data.title || data.subject || 'Jadwal mentoring'} berhasil dibuat.`
      );
    } catch (error: any) {
      alertActions.error(
        'Gagal menambahkan jadwal',
        getErrorMessage(error, 'Jadwal mentoring gagal dibuat.')
      );
      throw error;
    }
  },

  updateSchedule: async (mentorId, scheduleId, data) => {
    try {
      const response = await api.put(`/learning/mentors/${mentorId}/schedules/${scheduleId}`, data);
      if (response.data) {
        const updated = response.data as MentorSchedule;
        set((state) => ({
          mentorSchedules: state.mentorSchedules.map((schedule) =>
            schedule.id === scheduleId ? updated : schedule
          ),
        }));
      }
      await get().fetchMentorSchedules(mentorId);
      alertActions.success(
        'Jadwal berhasil diperbarui',
        `${data.title || data.subject || `Jadwal #${scheduleId}`} berhasil disimpan.`
      );
    } catch (error: any) {
      alertActions.error(
        'Gagal memperbarui jadwal',
        getErrorMessage(error, 'Perubahan jadwal gagal disimpan.')
      );
      throw error;
    }
  },

  deleteSchedule: async (mentorId, scheduleId) => {
    const schedule = get().mentorSchedules.find((item) => item.id === scheduleId);
    try {
      await apiClient.learning.schedules.remove(mentorId, scheduleId);
      set((state) => ({
        mentorSchedules: state.mentorSchedules.filter((item) => item.id !== scheduleId),
      }));
      await get().fetchMentorSchedules(mentorId);
      alertActions.success(
        'Jadwal berhasil dihapus',
        `${schedule?.title || schedule?.subject || `Jadwal #${scheduleId}`} telah dihapus.`
      );
    } catch (error: any) {
      alertActions.error(
        'Gagal menghapus jadwal',
        getErrorMessage(error, 'Jadwal mentoring gagal dihapus.')
      );
      throw error;
    }
  },

  fetchCurriculum: async (programId) => {
    try {
      const response = await api.get(`/learning/programs/${programId}/curriculum`);
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  createModule: async (programId, data) => {
    try {
      await api.post(`/learning/programs/${programId}/modules`, data);
      alertActions.success(
        'Modul berhasil ditambahkan',
        `${data.title || 'Modul baru'} berhasil ditambahkan ke kurikulum.`
      );
    } catch (error: any) {
      alertActions.error('Gagal menambahkan modul', getErrorMessage(error, 'Modul gagal dibuat.'));
      throw error;
    }
  },

  updateModule: async (moduleId, data) => {
    try {
      await api.put(`/learning/modules/${moduleId}`, data);
      alertActions.success(
        'Modul berhasil diperbarui',
        `${data.title || `Modul #${moduleId}`} berhasil disimpan.`
      );
    } catch (error: any) {
      alertActions.error('Gagal memperbarui modul', getErrorMessage(error, 'Modul gagal diperbarui.'));
      throw error;
    }
  },

  deleteModule: async (moduleId, moduleTitle) => {
    try {
      await apiClient.learning.curriculum.modules.remove(moduleId, `Mengarsipkan ${moduleTitle || `modul #${moduleId}`} melalui editor kurikulum`);
      alertActions.success(
        'Modul berhasil dihapus',
        `${moduleTitle || `Modul #${moduleId}`} telah dihapus dari kurikulum.`
      );
    } catch (error: any) {
      alertActions.error('Gagal menghapus modul', getErrorMessage(error, 'Modul gagal dihapus.'));
      throw error;
    }
  },

  createLesson: async (moduleId, data) => {
    try {
      await api.post(`/learning/modules/${moduleId}/lessons`, data);
      alertActions.success(
        'Materi berhasil ditambahkan',
        `${data.title || 'Materi baru'} berhasil ditambahkan ke modul.`
      );
    } catch (error: any) {
      alertActions.error('Gagal menambahkan materi', getErrorMessage(error, 'Materi gagal dibuat.'));
      throw error;
    }
  },

  updateLesson: async (lessonId, data) => {
    try {
      await api.put(`/learning/lessons/${lessonId}`, data);
      alertActions.success(
        'Materi berhasil diperbarui',
        `${data.title || `Materi #${lessonId}`} berhasil disimpan.`
      );
    } catch (error: any) {
      alertActions.error('Gagal memperbarui materi', getErrorMessage(error, 'Materi gagal diperbarui.'));
      throw error;
    }
  },

  deleteLesson: async (lessonId, lessonTitle) => {
    try {
      await apiClient.learning.curriculum.lessons.remove(lessonId, `Mengarsipkan ${lessonTitle || `materi #${lessonId}`} melalui editor kurikulum`);
      alertActions.success(
        'Materi berhasil dihapus',
        `${lessonTitle || `Materi #${lessonId}`} telah dihapus dari modul.`
      );
    } catch (error: any) {
      alertActions.error('Gagal menghapus materi', getErrorMessage(error, 'Materi gagal dihapus.'));
      throw error;
    }
  },
}));
