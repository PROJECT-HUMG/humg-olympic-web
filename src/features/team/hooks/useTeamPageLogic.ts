import { useState, useCallback, useMemo } from "react";
import { extractErrorMessage } from "@/utils/errorUtils";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ui/Toast";
import i18n from '@/i18n';
import { MemberRole, CreateTeamPayload, UpdateTeamPayload, AddMemberPayload } from "@/features/team/types/team.types";
import { useTeam } from "./useTeam";

export const useTeamPageLogic = () => {
  const { user } = useAuth();
  const teamHook = useTeam();

  const [modals, setModals] = useState({
    create: false,
    settings: false,
    addMember: null as "LECTURER" | "STUDENT" | null,
    confirmDeleteMember: null as number | null,
    confirmDeleteTeam: false,
  });

  const [loadingState, setLoadingState] = useState({
    isCreating: false,
    isUpdating: false,
    isAddingMember: false,
    isExporting: false,
    isApproving: false,
    isDeletingMember: false,
    isDeletingTeam: false,
  });

  const toggleModal = useCallback((key: keyof typeof modals, value: typeof modals[keyof typeof modals]) => {
    setModals((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canManageActiveTeam = useMemo(() => {
    if (!teamHook.activeTeam || !user) return false;

    // PENDING teams cannot be managed (except for Approval which is separate)
    if (teamHook.activeTeam.status === 'PENDING') return false;

    if (teamHook.isManager) return true;

    const currentUserMember = teamHook.activeTeam.members.find(
      (m) => m.userId === user.id,
    );
    const allowedRoles: MemberRole[] = [
      "HEAD_COACH",
      "DEPUTY_COACH",
      "CAPTAIN",
    ];
    return currentUserMember?.role
      ? allowedRoles.includes(currentUserMember.role)
      : false;
  }, [teamHook.activeTeam, user, teamHook.isManager]);

  const performAction = useCallback(
    async (
      loadingKey: keyof typeof loadingState,
      actionFn: () => Promise<unknown>,
      successMessage?: string,
    ) => {
      setLoadingState((prev) => ({ ...prev, [loadingKey]: true }));
      try {
        await actionFn();
        if (successMessage) showToast(successMessage, "success");
        return true;
      } catch (error: unknown) {
        showToast(extractErrorMessage(error, i18n.t('features:team.error')), "error");
        return false;
      } finally {
        setLoadingState((prev) => ({ ...prev, [loadingKey]: false }));
      }
    },
    [],
  );

  const handlers = {
    handleCreateTeam: async (data: CreateTeamPayload) => {
      const success = await performAction(
        "isCreating",
        async () => {
          return await teamHook.createTeam(data);
        },
        i18n.t('features:team.createTeamSuccess'),
      );

      if (success) toggleModal("create", false);
    },

    handleUpdateTeam: async (data: UpdateTeamPayload) => {
      const success = await performAction(
        "isUpdating",
        async () => {
          return await teamHook.updateTeam(data);
        },
        i18n.t('features:team.updateTeamSuccess'),
      );

      if (success) toggleModal("settings", false);
    },

    handleAddMember: async (data: AddMemberPayload) => {
      const success = await performAction(
        "isAddingMember",
        async () => {
          return await teamHook.addMember(data);
        },
        i18n.t('features:team.addMemberSuccess'),
      );

      if (success) toggleModal("addMember", null);
    },

    handleExport: async () => {
      await performAction("isExporting", teamHook.exportData);
    },

    handleApprove: async () => {
      await performAction(
        "isApproving",
        teamHook.approveTeam,
        i18n.t('features:team.approveSuccess'),
      );
    },

    handleRemoveMemberConfirm: async () => {
      if (!modals.confirmDeleteMember) return;
      const success = await performAction(
        "isDeletingMember",
        async () => {
          await teamHook.removeMember(modals.confirmDeleteMember!);
        },
        i18n.t('features:team.removeMemberSuccess'),
      );

      if (success) toggleModal("confirmDeleteMember", null);
    },
    onRequestDeleteTeam: () => {
      toggleModal("settings", false);
      setTimeout(() => toggleModal("confirmDeleteTeam", true), 200);
    },

    handleDeleteTeamConfirm: async () => {
      if (!teamHook.activeTeam) return;
      const success = await performAction(
        "isDeletingTeam",
        async () => {
          return await teamHook.deleteTeam(teamHook.activeTeam!.id);
        },
        i18n.t('features:team.deleteTeamSuccess'),
      );

      if (success) toggleModal("confirmDeleteTeam", false);
    },
  };

  return {
    ...teamHook,
    user,
    modals,
    toggleModal,
    loadingState,
    canManageActiveTeam,
    handlers,
  };
};
