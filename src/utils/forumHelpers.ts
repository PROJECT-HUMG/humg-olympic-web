import { UserRole } from "@/features/auth/types/auth.types";
import { MemberRole } from "@/features/team/types/team.types";

export function canEditDelete(
  userId: number | undefined,
  authorId: number,
  userRole: UserRole | MemberRole,
): boolean {
  if (!userId || !userRole) return false;
  return userId === authorId || userRole === "ADMIN";
}
