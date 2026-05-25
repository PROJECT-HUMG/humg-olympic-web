import { createContext, useContext, useState, useEffect, useRef, type ReactNode, useCallback, useMemo } from 'react';
import { User, AuthResponse, BadgeItem } from '@/features/auth/types/auth.types';
import { authRepository } from '@/features/auth/api';
import { suppressAutoLogout } from '@/lib/api/apiClient';

export type GoogleLoginResult =
  | { success: true }
  | { needsCompletion: true; tempToken: string; requiredFields: { universityId: boolean; facultyId: boolean; className: boolean }; primaryUniversityId?: number }
  | { needsEduVerification: true; accessToken?: string };

export type GoogleCompleteResult =
  | { success: true }
  | { needsEduVerification: true; accessToken?: string };

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<GoogleLoginResult>;
  completeGoogleSignup: (data: { tempToken: string; universityId: number; facultyId?: number; className?: string }) => Promise<GoogleCompleteResult>;
  requestEduVerify: (eduEmail: string, accessToken?: string) => Promise<void>;
  setUser?: (user: User | null) => void;
  setUserFromAuthResponse: (auth: AuthResponse) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEGREE_TO_PREFIX: Record<string, string> = {
  BACHELOR: 'CN.', ENGINEER: 'KS.', MASTER: 'ThS.', DOCTOR: 'TS.',
  DOCTOR_OF_SCIENCE: 'TSKH.', ASSOCIATE_PROFESSOR: 'PGS.', PROFESSOR: 'GS.',
};

function buildFullNameWithDegree(role: string, degree: string | null | undefined, fullName: string): string {
  if ((role === 'LECTURER' || role === 'ADMIN') && degree) {
    const prefix = DEGREE_TO_PREFIX[degree] ?? degree;
    return `${prefix} ${fullName}`.trim();
  }
  return fullName;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAccessToken(storedToken);
          setUser(parsedUser);

          try {
            suppressAutoLogout(true);
            const profileData = await authRepository.getProfile(parsedUser.id);
            let selectedBadges = parsedUser.badges || [];
            if (parsedUser.role?.startsWith('STUDENT') || parsedUser.role === 'ADMIN') {
              selectedBadges = profileData.badges.filter((b: BadgeItem) => b.isSelected && b.isEarned);
            }
            const updatedUser = {
              ...parsedUser,
              fullName: profileData.fullName || parsedUser.fullName,
              avatarUrl: profileData.avatarUrl || parsedUser.avatarUrl,
              badges: selectedBadges,
              xpPoints: profileData.xpPoints
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (e) {
          } finally {
            suppressAutoLogout(false);
          }
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setUserFromAuthResponse = async (auth: AuthResponse) => {
    setAccessToken(auth.accessToken);
    localStorage.setItem('accessToken', auth.accessToken);

    // Decode userId from JWT payload (user_id claim)
    const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));
    const userId = Number(payload.user_id);

    try {
      suppressAutoLogout(true);
      const profileData = await authRepository.getProfile(userId);
      const fullNameWithDegree = buildFullNameWithDegree(
        profileData.role as string,
        profileData.degree,
        profileData.fullName
      );
      let selectedBadges: BadgeItem[] = [];
      if (profileData.role?.startsWith('STUDENT') || profileData.role === 'ADMIN') {
        selectedBadges = profileData.badges.filter((b) => b.isSelected && b.isEarned);
      }
      const userEntity: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: fullNameWithDegree,
        displayName: fullNameWithDegree,
        avatarUrl: profileData.avatarUrl,
        role: profileData.role,
        degree: profileData.degree,
        universityName: profileData.universityName,
        faculty: profileData.facultyName ?? undefined,
        className: profileData.className,
        phone: profileData.phone,
        badges: selectedBadges,
        xpPoints: profileData.xpPoints,
      };
      setUser(userEntity);
      localStorage.setItem('user', JSON.stringify(userEntity));
    } catch (e) {
      // Profile fetch failed, clear auth state
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      throw new Error('Không thể tải thông tin người dùng.');
    } finally {
      suppressAutoLogout(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authRepository.login({ email, password });
      await setUserFromAuthResponse(response);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<GoogleLoginResult> => {
    const res = await authRepository.googleLogin(idToken);
    if (res.needsEduVerification === true) {
      const token = res.authResponse?.accessToken;
      return { needsEduVerification: true, accessToken: token };
    }

    if (res.authResponse) {
      setIsLoading(true);
      try {
        await setUserFromAuthResponse(res.authResponse);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    }
    if (res.needsCompletion && res.tempToken) {
      return {
        needsCompletion: true,
        tempToken: res.tempToken,
        requiredFields: res.requiredFields ?? { universityId: true, facultyId: false, className: false },
        primaryUniversityId: res.primaryUniversityId,
      };
    }
    throw new Error('Phản hồi đăng nhập Google không hợp lệ.');
  };

  const completeGoogleSignup = async (data: { tempToken: string; universityId: number; facultyId?: number; className?: string }): Promise<GoogleCompleteResult> => {
    const res = await authRepository.googleComplete(data);
    if (res.needsEduVerification === true) {
      const token = res.authResponse?.accessToken;
      return { needsEduVerification: true, accessToken: token };
    }

    if (res.authResponse) {
      setIsLoading(true);
      try {
        await setUserFromAuthResponse(res.authResponse);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    }

    throw new Error('Hoàn tất đăng ký thất bại (Invalid response format).');
  };

  const requestEduVerify = async (eduEmail: string, accessToken?: string) => {
    const token = accessToken || localStorage.getItem('accessToken');
    if (!token) throw new Error('Chưa đăng nhập.');
    await authRepository.requestEduVerify({ universityEmail: eduEmail }, token);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authRepository.logout();
    } catch (e) {
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  };

  const refreshUserProfile = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    try {
      const profileData = await authRepository.getProfile(currentUser.id);
      let newBadges = currentUser.badges || [];
      if (currentUser.role?.startsWith('STUDENT') || currentUser.role === 'ADMIN') {
        newBadges = profileData.badges.filter((b: BadgeItem) => b.isSelected && b.isEarned);
      }
      const updatedUser = {
        ...currentUser,
        fullName: profileData.fullName || currentUser.fullName,
        avatarUrl: profileData.avatarUrl || currentUser.avatarUrl,
        badges: newBadges,
        xpPoints: profileData.xpPoints
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('profile:updated'));
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = () => {
      refreshUserProfile().catch(console.error);
    };
    window.addEventListener('auth:token_refreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('auth:token_refreshed', handleTokenRefreshed);
    };
  }, [refreshUserProfile]);

  const value = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    loginWithGoogle,
    completeGoogleSignup,
    requestEduVerify,
    setUser,
    setUserFromAuthResponse,
    refreshUserProfile
  }), [user, accessToken, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
