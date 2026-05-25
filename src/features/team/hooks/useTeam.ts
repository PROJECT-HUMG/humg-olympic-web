import { useState, useEffect, useCallback, useRef } from "react";
import { teamRepository } from "@/features/team/api";
import {
  Team,
  CreateTeamPayload,
  AddMemberPayload,
  UpdateTeamPayload,
  GetTeamsParams,
} from "@/features/team/types/team.types";
import { useAuth } from "@/contexts/AuthContext";

export const useTeam = () => {
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, hasMore: true });

  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const PAGE_SIZE = 20;

  // Ref to read teams without adding it as a reactive dependency
  const teamsRef = useRef(teams);
  teamsRef.current = teams;

  const fetchTeams = useCallback(
    async (page: number, isLoadMore = false) => {
      if (!user) return;
      setIsListLoading(true);
      try {
        const params: GetTeamsParams = {
          userId: user.id,
          page: page,
          size: PAGE_SIZE,
        };

        const response = await teamRepository.getTeams(params);

        if (isLoadMore) {
          setTeams((prev) => [...prev, ...response.data]);
        } else {
          setTeams(response.data);
        }

        setPagination({
          page: page,
          hasMore: response.data.length === PAGE_SIZE,
        });
      } catch (error) {
      } finally {
        setIsListLoading(false);
      }
    },
    [user],
  );

  // Derive activeTeam from teams list
  useEffect(() => {
    if (activeTeamId && teams.length > 0) {
      const found = teams.find((t) => t.id === activeTeamId);
      if (found) {
        setActiveTeam(found);
      }
    } else if (!activeTeamId) {
      setActiveTeam(null);
    }
  }, [activeTeamId, teams]);

  const fetchActiveTeamDetail = useCallback(async (isSilent = false) => {
    if (!activeTeamId) return;
    const activeSlug = teamsRef.current.find(t => t.id === activeTeamId)?.slug;
    if (!activeSlug) return;
    if (!isSilent) setIsDetailLoading(true);
    try {
      const detail = await teamRepository.getTeamBySlug(activeSlug);
      setActiveTeam(detail);
      setTeams(prev => prev.map(t => t.id === detail.id ? detail : t));
    } catch (error) {
    } finally {
      if (!isSilent) setIsDetailLoading(false);
    }
  }, [activeTeamId]);

  // Fetch fresh details when active team changes
  useEffect(() => {
    if (activeTeamId) {
      fetchActiveTeamDetail();
    }
  }, [activeTeamId, fetchActiveTeamDetail]);

  // Initial fetch
  useEffect(() => {
    fetchTeams(0, false);
  }, [fetchTeams]);

  const loadMoreTeams = () => {
    if (!isListLoading && pagination.hasMore) {
      fetchTeams(pagination.page + 1, true);
    }
  };

  const createTeam = async (data: CreateTeamPayload) => {
    const newTeam = await teamRepository.createTeam(data);
    setTeams((prev) => [newTeam, ...prev]);
    setActiveTeamId(newTeam.id);
    return newTeam;
  };

  const updateTeam = async (data: UpdateTeamPayload) => {
    if (!activeTeam) throw new Error("No active team");
    const updatedTeam = await teamRepository.updateTeam(activeTeam.id, data);

    setTeams((prev) =>
      prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)),
    );
    setActiveTeam(updatedTeam);
    return updatedTeam;
  };

  const deleteTeam = async (teamId: number) => {
    await teamRepository.deleteTeam(teamId);

    const newTeams = teams.filter((t) => t.id !== teamId);
    setTeams(newTeams);

    if (activeTeamId === teamId) {
      setActiveTeam(null);
      setActiveTeamId(newTeams.length > 0 ? newTeams[0].id : null);
    }
  };

  const approveTeam = async () => {
    if (!activeTeam) return;
    await teamRepository.approveTeam(activeTeam.id);

    const updatedTeam = { ...activeTeam, status: "ACTIVE" as const };
    setActiveTeam(updatedTeam);
    setTeams((prev) =>
      prev.map((t) => (t.id === activeTeam.id ? updatedTeam : t)),
    );
  };

  const addMember = async (payload: AddMemberPayload) => {
    if (!activeTeam) return;
    await teamRepository.addMember(activeTeam.id, payload);

    await fetchActiveTeamDetail(true); // Silent refresh
  };

  const removeMember = async (userId: number) => {
    if (!activeTeam) return;
    await teamRepository.removeMember(activeTeam.id, userId);

    setActiveTeam((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        members: prev.members.filter((m) => m.userId !== userId),
      };
    });
  };

  const exportData = async () => {
    if (!activeTeam) return;
    const blob = await teamRepository.exportTeamData(activeTeam.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Team_${activeTeam.name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    teams,
    activeTeam,
    activeTeamId,
    setActiveTeamId,
    loadMoreTeams,
    hasMore: pagination.hasMore,
    isListLoading,
    isDetailLoading,

    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    approveTeam,
    exportData,

    isManager: user?.role === "ADMIN" || user?.role === "LECTURER",
  };
};
