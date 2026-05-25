import type { AuthorResponse } from '@/features/resources/types/resources.types';

export type CompetitionStatus = "UPCOMING" | "ONGOING" | "ENDED";
export type CompetitionType = "ONLINE" | "OFFLINE";

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  color?: string;
}

export interface TimelineEvent {
  id?: number;
  title: string;
  eventTime: string;
  description?: string;
  isCompleted?: boolean;
}

export interface Prize {
  id?: number;
  rankName: string;
  prizeValue: string;
  quantity: number;
  iconUrl?: string;
}

export interface CompetitionSummary {
  id: number;
  slug: string;
  title: string;
  subjectName: string;
  subjectCode?: string;
  subjectColor: string;
  type: CompetitionType;
  status: CompetitionStatus;
  startTime: string;
  location: string;
  imageUrl?: string;
  currentParticipants: number;
  maxParticipants: number;
  isFeatured: boolean;
  isRegistered: boolean;
  author?: AuthorResponse | null;
  created?: string; // dd/MM/yyyy
  /** Short description from API (list/featured may include) */
  summary?: string;
  /** Optional long description from API */
  description?: string;
}

export interface CompetitionDetail extends CompetitionSummary {
  endTime?: string;
  registrationDeadline?: string;
  summary: string;
  content?: string;
  rules?: string;
  isRegistered: boolean;
  timeline: TimelineEvent[];
  prizes: Prize[];
  examId?: number;     // Linked exam from Question Bank (optional)
  examTitle?: string;  // Populated by API
}

export interface CompetitionQueryParams {
  subjectId?: number | string;
  search?: string;
  status?: CompetitionStatus;
  page?: number;
  limit?: number;
}

export interface CreateCompetitionRequest {
  title: string;
  subjectId: number;
  type: CompetitionType;
  startTime: string;
  endTime?: string;
  location: string;
  registrationDeadline?: string;
  summary: string;
  content?: string;
  rules?: string;
  maxParticipants?: number;
  timeline?: Omit<TimelineEvent, "id" | "isCompleted">[];
  prizes?: Omit<Prize, "id">[];
  isFeatured?: boolean;
  examId?: number;     // Optional: link an exam from the Question Bank
}

/** Payload for PUT /competitions/:id (same shape as create). */
export interface CompetitionUpdateRequest extends CreateCompetitionRequest { }

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
}
