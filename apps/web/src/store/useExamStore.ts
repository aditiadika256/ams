import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@/types/cbt';

interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  timeLeft: number; // in seconds
  
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionAnswerId: number, answer: string) => void;
  toggleFlag: (questionAnswerId: number) => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      questions: [],
      currentQuestionIndex: 0,
      timeLeft: 0,

      setQuestions: (questions) => set({ questions }),
      
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      setAnswer: (id, answer) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, user_answer: answer } : q
          ),
        })),
        
      toggleFlag: (id) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, flagged: !q.flagged } : q
          ),
        })),

      setTimeLeft: (time) => set({ timeLeft: time }),
      
      decrementTime: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
      
      reset: () => set({ questions: [], currentQuestionIndex: 0, timeLeft: 0 }),
    }),
    {
      name: 'exam-storage',
    }
  )
);
