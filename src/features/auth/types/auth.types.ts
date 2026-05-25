import { MemberRole } from "@/features/team/types/team.types";

export type UserRole =
  | "STUDENT_INTERNAL"
  | "STUDENT_EXTERNAL"
  | "LECTURER"
  | "ADMIN";

export interface User {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole | MemberRole;
  degree?: string | null;
  universityName?: string;
  faculty?: string;
  className?: string | null;
  phone?: string | null;
  badges?: BadgeItem[];
  xpPoints?: number;
}

export interface RegisterInternalRequest {
  fullName: string;
  email: string;
  password: string;
  className: string;
  facultyId: number;
  role: "STUDENT_INTERNAL";
}

export interface RegisterExternalRequest {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  role: "STUDENT_EXTERNAL";
}

export interface RegisterResponse {
  message: string;
}

export interface BadgeItem {
  id: number;
  name: string;
  description: string;
  type: "NATIONAL" | "SCHOOL" | "STREAK" | "LEARNING" | "TEAM";
  subject:
  | "MATH"
  | "PHYSICS"
  | "CHEMISTRY"
  | "ENGLISH"
  | "IT"
  | "ART"
  | "GENERAL"
  | "ALGEBRA"
  | "CALCULUS";
  level: number;
  isEarned: boolean;
  isSelected: boolean;
  iconUrl?: string | null;
}

export interface UserProfileResponse extends User {
  phone: string;
  bio: string;
  xpPoints: number;
  ranking: number;
  badges: BadgeItem[];
  joinedAt?: string;
  createdAt?: string;
  backgroundUrl?: string | null;
  facultyName?: string | null;
  privacySettings?: {
    showEmail: boolean;
    showPhone: boolean;
    showUniversity: boolean;
    showClass: boolean;
    showExamHistory: boolean;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
}

export interface ApiResponse {
  success: boolean | null;
  message: string | null;
}

export type AuthView =
  | "login"
  | "register"
  | "forgot_password"
  | "check_email"
  | "forgot_password"
  | "check_email"
  | "google_complete"
  | "google_edu"
  | "google_callback";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterExternalFormData {
  universityId: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

export interface RegisterInternalFormData {
  fullName: string;
  email: string;
  className: string;
  facultyId: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

export interface FacultyOption {
  value: string;
  label: string;
}


export interface PublicConfigResponse {
  primaryUniversityId: number | null;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface GoogleLoginResponse {
  refreshCookie?: string;
  authResponse?: AuthResponse;
  needsCompletion?: boolean;
  tempToken?: string;
  requiredFields?: { universityId: boolean; facultyId: boolean; className: boolean };
  primaryUniversityId?: number;
  needsEduVerification?: boolean;
}

export interface GoogleCompleteRequest {
  tempToken: string;
  universityId: number;
  facultyId?: number;
  className?: string;
}

export interface GoogleCompleteResponse {
  refreshCookie?: string;
  authResponse?: AuthResponse;
  needsEduVerification?: boolean | null;
}

export interface RequestEduVerifyRequest {
  universityEmail: string;
}
