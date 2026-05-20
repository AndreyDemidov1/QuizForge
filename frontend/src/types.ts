export type QuestionType = "SingleChoice" | "MultipleChoice";

export interface TestListItem {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  createdAt: string;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  order: number;
  text: string;
  type: QuestionType;
  options: AnswerOption[];
}

export interface TestDetail {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  questions: Question[];
}

export interface AnswerOptionForQuiz {
  id: string;
  text: string;
}

export interface QuestionForQuiz {
  id: string;
  order: number;
  text: string;
  type: QuestionType;
  options: AnswerOptionForQuiz[];
}

export interface TestForQuiz {
  id: string;
  title: string;
  description: string | null;
  questions: QuestionForQuiz[];
}

export interface QuestionInput {
  text: string;
  type: QuestionType;
  options: { text: string; isCorrect: boolean }[];
}

export interface CreateTestPayload {
  title: string;
  description: string | null;
  questions: QuestionInput[];
}

export interface AttemptResult {
  score: number;
  maxScore: number;
  percentage: number;
  scoreFormatted: string;
  percentageFormatted: string;
}
