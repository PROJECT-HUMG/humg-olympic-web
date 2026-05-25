export type RoadmapType = "PUBLIC" | "TEAM_SPECIFIC";
export type RoadmapStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type StageStatus = "LOCKED" | "UNLOCKED";
export type ResourceType = "VIDEO" | "DOC" | "EXAM" | "CONTEST";

export interface StageResource {
  id?: number;
  title: string;
  url: string;
  type: ResourceType;
  orderIndex: number;
  examId?: number;
  examTitle?: string;
  resourceId?: number;
  resourceTitle?: string;
  embedUrl?: string;
}

export interface RoadmapStage {
  id?: number;
  title: string;
  description?: string;
  orderIndex: number;
  status: StageStatus;
  resources: StageResource[];
}

export interface RoadmapSummary {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  type: RoadmapType;
  status: RoadmapStatus;
  teamId?: number;
  teamName?: string;
  created: string;
  updated: string;
}

export interface RoadmapDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  type: RoadmapType;
  status: RoadmapStatus;
  teamId?: number;
  stages: RoadmapStage[];
  created: string;
  updated: string;
}

export interface CreateRoadmapRequest {
  name: string;
  description?: string;
  iconUrl: string;
  type: RoadmapType;
  teamId?: number;
  stages: RoadmapStage[];
}

export interface UpdateRoadmapRequest extends CreateRoadmapRequest {
  status?: RoadmapStatus;
}

export interface RoadmapFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: RoadmapType;
  teamId?: number;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
