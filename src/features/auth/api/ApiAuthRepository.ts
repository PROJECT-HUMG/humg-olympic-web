import { AuthRepository } from './AuthRepository';
import {
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiResponse,
    UserProfileResponse,
    UpdateProfileRequest,
    ApiErrorResponse,
    BadgeItem,
    PublicConfigResponse,
    GoogleLoginResponse,
    GoogleCompleteRequest,
    GoogleCompleteResponse,
    RequestEduVerifyRequest
} from '../types/auth.types';
import { RegisterExternalRequest, RegisterInternalRequest, RegisterResponse } from '../types/auth.types';
import { api, authenticatedFetch } from '@/lib/api/apiClient';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import { getErrorMessage } from '@/lib/api/errorMapping';
import i18n from '@/i18n';

export class ApiAuthRepository implements AuthRepository {

    async getAuthConfig(): Promise<PublicConfigResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/config`, { credentials: 'include' });
        if (!response.ok) throw new Error(i18n.t('auth:api.configLoadFailed'));
        return response.json();
    }

    async googleLogin(idToken: string): Promise<GoogleLoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-Info': navigator.userAgent,
            },
            credentials: 'include',
            body: JSON.stringify({ idToken }),
        });
        if (!response.ok) {
            const err: ApiErrorResponse = await response.json().catch(() => ({}));
            throw new Error(getErrorMessage(err.code, i18n.t('auth:api.googleLoginFailed')));
        }

        const needsEduVerification = response.headers.get('X-Needs-Edu-Verification') === 'true';
        const body = await response.json();

        return { ...body, needsEduVerification };
    }

    async googleComplete(data: GoogleCompleteRequest): Promise<GoogleCompleteResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/google/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-Info': navigator.userAgent,
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err: ApiErrorResponse = await response.json().catch(() => ({}));
            throw new Error(getErrorMessage(err.code, i18n.t('auth:api.completeSignupFailed')));
        }

        const needsEduVerification = response.headers.get('X-Needs-Edu-Verification') === 'true';

        const text = await response.text();
        const body = text ? JSON.parse(text) : {};

        // If accessToken exists, wrap it in authResponse
        if (body.accessToken) {
            return {
                authResponse: { accessToken: body.accessToken },
                needsEduVerification
            };
        }

        return { ...body, needsEduVerification };
    }

    async requestEduVerify(data: RequestEduVerifyRequest, accessToken: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/auth/google/university-email/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err: ApiErrorResponse = await response.json().catch(() => ({}));
            throw new Error(getErrorMessage(err.code, i18n.t('auth:api.eduVerifySendFailed')));
        }
    }

    async verifyEdu(token: string): Promise<ApiResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/google/university-email/confirm?token=${encodeURIComponent(token)}`, { credentials: 'include' });
        if (!response.ok) {
            const err: ApiErrorResponse = await response.json().catch(() => ({}));
            throw new Error(getErrorMessage(err.code, i18n.t('auth:api.eduVerifyFailed')));
        }
        return response.json().catch(() => ({}));
    }

    async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-Info': navigator.userAgent,
            },
            body: JSON.stringify(request),
            credentials: 'include'
        });

        if (!response.ok) {
            let errorData: ApiErrorResponse;
            try {
                errorData = await response.json();
            } catch {
                throw new Error(i18n.t('auth:api.connectionError', { status: response.status }));
            }
            switch (errorData.code) {
                case 'BAD_CREDENTIALS':
                    throw new Error(i18n.t('auth:api.badCredentials'));
                case 'EMAIL_NOT_VERIFIED':
                    throw new Error(i18n.t('auth:api.emailNotVerified'));
                case 'ACCOUNT_LOCKED':
                    throw new Error(i18n.t('auth:api.accountLocked'));
                default:
                    throw new Error(i18n.t('auth:api.loginFailed'));
            }
        }

        const data = await response.json();
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }

        return data;
    }

    async registerInternal(data: RegisterInternalRequest): Promise<RegisterResponse> {
        return api.post<RegisterResponse>('/auth/register', data);
    }

    async registerExternal(data: RegisterExternalRequest): Promise<RegisterResponse> {
        return api.post<RegisterResponse>('/auth/register', data);
    }

    async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
        return api.post<ApiResponse>('/auth/forgot-password', data);
    }

    async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
        return api.post<ApiResponse>('/auth/reset-password', data);
    }

    async verifyAccount(token: string): Promise<ApiResponse> {
        return api.get<ApiResponse>(`/auth/email/verify?token=${token}`);
    }

    async resendVerification(email: string): Promise<ApiResponse> {
        return api.post<ApiResponse>('/auth/email/resend-verify', { email });
    }

    async getProfile(id: number): Promise<UserProfileResponse> {
        return api.get<UserProfileResponse>(`/users/${id}/profile`);
    }

    async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
        return api.put<UserProfileResponse>('/users/profile', data);
    }

    async toggleBadge(badgeId: number): Promise<void> {
        return api.post<void>(`/users/profile/badges/${badgeId}/toggle`, {});
    }

    async refreshToken(): Promise<{ accessToken: string }> {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error('SESSION_EXPIRED');
        }

        return await response.json();
    }

    async logout(): Promise<void> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return await api.post('/auth/logout', {});
    }

    async getAllBadges(): Promise<BadgeItem[]> {
        return api.get<BadgeItem[]>('/badges');
    }

    async updateAvatar(file: File, userId?: number): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        if (userId) {
            formData.append('userId', userId.toString());
        }

        const response = await authenticatedFetch(`${API_BASE_URL}/users/avatar`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(i18n.t('auth:api.uploadAvatarFailed'));
        }

        return await response.text();
    }

    async updateBackground(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await authenticatedFetch(`${API_BASE_URL}/users/background`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(i18n.t('auth:api.uploadAvatarFailed'));
        }

        return await response.text();
    }
}