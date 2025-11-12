import { View as ViewModel } from './types';

// FIX: Defined and exported the View enum to resolve a circular dependency.
export enum View {
  Assistant = 'assistant',
  Dashboard = 'dashboard',
  Library = 'library',
  Leaderboard = 'leaderboard',
  Pomodoro = 'pomodoro',
  Analytics = 'analytics',
  Profile = 'profile',
  Analyzer = 'analyzer', // New view for Assignment Analyzer
  Chat = 'chat',
  Quiz = 'quiz',
  Flashcards = 'flashcards',
}

export enum Subject {
  ResearchMethodology = 'Research Methodology and IPR',
  DataStructures = 'Data Structures and Applications',
  DiscreteMath = 'Discrete Mathematical Structures',
}

export type SourceType = 'pdf' | 'text' | 'youtube';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  content: string;
  summary: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  metadata?: {
    subjectCategory: string;
    subjectName: string;
  }
}

export interface Conversation {
  id:string;
  messages: ChatMessage[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface UserAnswer extends QuizQuestion {
  userAnswer: string;

  isCorrect: boolean;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface UserProgress {
  points: number;
  pomodoroSessions: number;
  quizzesTaken: number;
  quizScores: { subject: string; score: number; date: Date }[];
}

// New User type to handle multiple accounts
export interface User {
  id: string;
  name: string;
  email: string;
  progress: UserProgress;
  sources: Source[];
}