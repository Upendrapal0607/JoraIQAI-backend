export type Role = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  totalQuestions?: number;
  totalAssigned?: number;
  totalCompleted?: number;
  averageAccuracy?: number;
  questions?: Question[];
}

export interface QuizAssignment {
  assignmentId: string;
  quizId: string;
  quizTitle: string;
  quizDescription?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  totalQuestions: number;
  assignedAt: string;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string;
  attempt?: QuizAttempt | null;
}

export interface QuizAttempt {
  id: string;
  assignmentId?: string;
  quizId?: string;
  quizTitle?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  accuracy: number;
  submittedAt: string;
  breakdown?: QuestionBreakdown[];
}

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  options: {
    id: string;
    text: string;
    isCorrect?: boolean;
    isSelected: boolean;
  }[];
  selectedOptionId: string | null;
  selectedOptionText: string;
  correctOptionId: string | null;
  correctOptionText: string | null;
  isCorrect: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  submittedAt: string;
  isCurrentUser: boolean;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  description?: string;
  createdAt: string;
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
  averageAccuracy: number;
  studentPerformance: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    assignedAt: string;
    status: 'PENDING' | 'COMPLETED';
    completedAt?: string;
    attempt: {
      id: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      accuracy: number;
      submittedAt: string;
    } | null;
  }[];
  questionAnalytics: {
    questionId: string;
    questionText: string;
    order: number;
    totalAttempts: number;
    correctCount: number;
    accuracy: number;
  }[];
}
