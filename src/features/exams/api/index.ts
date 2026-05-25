import { ApiExamRepository } from './ApiExamRepository';
import { ApiExamAttemptRepository } from './ApiExamAttemptRepository';

export const examRepository = new ApiExamRepository();
export const examAttemptRepository = new ApiExamAttemptRepository();
export type { ExamRepository } from './ExamRepository';
export type { ExamAttemptRepository } from './ExamAttemptRepository';
