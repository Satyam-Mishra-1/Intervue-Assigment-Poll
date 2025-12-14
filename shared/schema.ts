import { z } from "zod";

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  teacherId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  createdAt: Date;
  isActive: boolean;
  endTime: Date | null;
}

export interface Student {
  id: string;
  name: string;
  joinedAt: Date;
  isOnline: boolean;
  socketId: string | null;
}

export interface Response {
  id: string;
  questionId: string;
  studentId: string;
  studentName: string;
  selectedOption: number;
  answeredAt: Date;
}

export interface PollResults {
  questionId: string;
  questionText: string;
  options: string[];
  votes: number[];
  totalVotes: number;
  responses: { studentName: string; selectedOption: number }[];
}

export interface PastSession {
  id: string;
  teacherId: string;
  title: string;
  startedAt: Date;
  endedAt: Date;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
    results: PollResults;
  }[];
}

export const createPollSchema = z.object({
  title: z.string().min(1, "Poll title is required"),
});

export const createQuestionSchema = z.object({
  pollId: z.string(),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
  correctAnswer: z.number().min(0),
  timeLimit: z.number().min(10).max(300).default(60),
});

export const joinStudentSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.number().min(0),
});

export type CreatePoll = z.infer<typeof createPollSchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type JoinStudent = z.infer<typeof joinStudentSchema>;
export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
