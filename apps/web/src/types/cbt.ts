export interface Question {
  id: number;
  question_id: number;
  type: 'mcq' | 'single';
  stem: string;
  options: Record<string, string>;
  user_answer: string | null;
  flagged: boolean;
}

export interface ExamSession {
  session_id: number;
  attempt_id: number;
  restored: boolean;
}

export interface ExamResult {
  attempt_id: number;
  package_id: number;
  package_name: string;
  score_total: number;
  submitted_at: string;
}

export interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: number, answer: string) => void;
  toggleFlag: (questionId: number) => void;
  reset: () => void;
}
