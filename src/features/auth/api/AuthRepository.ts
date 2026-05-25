import {
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiResponse,
    UserProfileResponse,
    UpdateProfileRequest,
    BadgeItem, RegisterExternalRequest, RegisterInternalRequest, RegisterResponse,
    PublicConfigResponse,
    GoogleLoginResponse,
    GoogleCompleteRequest,
    GoogleCompleteResponse,
    RequestEduVerifyRequest
} from '../types/auth.types';

export interface AuthRepository {
    getAuthConfig(): Promise<PublicConfigResponse>;

    login(request: LoginRequest): Promise<LoginResponse>;

    googleLogin(idToken: string): Promise<GoogleLoginResponse>;

    googleComplete(data: GoogleCompleteRequest): Promise<GoogleCompleteResponse>;

    requestEduVerify(data: RequestEduVerifyRequest, accessToken: string): Promise<void>;

    verifyEdu(token: string): Promise<ApiResponse>;

    registerInternal(data: RegisterInternalRequest): Promise<RegisterResponse>;

    registerExternal(data: RegisterExternalRequest): Promise<RegisterResponse>;

    forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse>;

    resetPassword(data: ResetPasswordRequest): Promise<ApiResponse>;

    verifyAccount(token: string): Promise<ApiResponse>;

    resendVerification(email: string): Promise<ApiResponse>;

    getProfile(id: number): Promise<UserProfileResponse>;

    updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse>;

    toggleBadge(badgeId: number): Promise<void>;

    refreshToken(): Promise<{ accessToken: string }>;

    logout(): Promise<void>;

    getAllBadges(): Promise<BadgeItem[]>;

    updateAvatar(file: File, userId?: number): Promise<string>;

    updateBackground(file: File): Promise<string>;
}