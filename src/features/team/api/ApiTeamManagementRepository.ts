import { api } from "@/lib/api/apiClient";
import { API_BASE_URL } from "@/lib/api/apiConfig";
import {
  Team,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMemberPayload,
  PagedResponse,
  GetTeamsParams,
} from "@/features/team/types/team.types";
import { TeamManagementRepository } from "./TeamManagementRepository";
export class ApiTeamManagementRepository implements TeamManagementRepository {
  async deleteTeam(id: number | string): Promise<void> {
    return await api.delete(`${this.RESOURCE_URL}/${id}`);
  }

  private readonly RESOURCE_URL = "/teams";

  async getTeams(params: GetTeamsParams): Promise<PagedResponse<Team>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    return api.get<PagedResponse<Team>>(
      `${this.RESOURCE_URL}?${queryParams.toString()}`,
    );
  }

  async getTeamBySlug(slug: string): Promise<Team> {
    return api.get<Team>(`${this.RESOURCE_URL}/${slug}`);
  }

  async createTeam(data: CreateTeamPayload): Promise<Team> {
    return api.post<Team>(this.RESOURCE_URL, data);
  }

  async updateTeam(
    id: number | string,
    data: UpdateTeamPayload,
  ): Promise<Team> {
    return api.put<Team>(`${this.RESOURCE_URL}/${id}`, data);
  }

  async approveTeam(id: number | string): Promise<void> {
    return api.put(`${this.RESOURCE_URL}/${id}/approve`, {});
  }

  async addMember(
    teamId: number | string,
    payload: AddMemberPayload,
  ): Promise<void> {
    return api.post(`${this.RESOURCE_URL}/${teamId}/members`, payload);
  }

  async removeMember(
    teamId: number | string,
    userId: number | string,
  ): Promise<void> {
    return api.delete(`${this.RESOURCE_URL}/${teamId}/members/${userId}`);
  }

  async exportTeamData(teamId: number | string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${this.RESOURCE_URL}/${teamId}/export`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  }
}
