import { api } from './api';

export interface Question {
  _id?: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  subject: string;
  branch: string;
  year: number;
  questions: Question[];
  createdAt: string;
}

export interface QuizSubmission {
  answers: number[];
}

export interface QuizResult {
  message: string;
  results: {
    questionId: string;
    isCorrect: boolean;
    correctOptionIndex: number;
    selectedOptionIndex: number;
    explanation: string;
  }[];
  finalScore: {
    score: number;
    totalQuestions: number;
    percentage: number;
  };
}

export const quizService = {
  getAllQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  submitQuiz: async (id: string, submission: QuizSubmission): Promise<QuizResult> => {
    const response = await api.post(`/quizzes/${id}/submit`, submission);
    return response.data;
  },
};
