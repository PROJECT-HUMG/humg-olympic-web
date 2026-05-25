import { useState, useEffect, useActionState } from 'react';
import { authRepository } from '@/features/auth/api';
import { toast } from '@/components/ui/Toast';
import { AuthValidation } from '@/utils/validation';
import { extractErrorMessage } from '@/utils/errorUtils';
import i18n from '@/i18n';

export interface RegisterState {
    error?: string | null;
    success?: boolean;
    validationErrors?: Record<string, string>;
}

export const useRegisterForm = (onSuccess: (email: string) => void) => {
    // UI State for dynamic fields (University/Faculty logic)
    const [universityId, setUniversityId] = useState<string>('');
    const [primaryUniversityId, setPrimaryUniversityId] = useState<number | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await authRepository.getAuthConfig();
                setPrimaryUniversityId(config.primaryUniversityId);
            } catch (e) {
                console.error('Failed to load auth config:', e);
            }
        };
        fetchConfig();
    }, []);

    const isPrimaryUniversity = primaryUniversityId !== null &&
        universityId === String(primaryUniversityId);

    // Action implementation
    const registerAction = async (prevState: RegisterState | null, formData: FormData): Promise<RegisterState> => {
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const agreed = formData.get('agreed') === 'on'; // Checkbox

        // For controlled/complex fields that might not be in formData if not standard inputs or if we want to be sure
        // AsyncSearchableSelect usually uses hidden input or we rely on the Select's name if it supports it.
        // Assuming AsyncSearchableSelect renders a hidden input with name="universityId" or we need to ensure it does.
        // If not, we might need to append state to formData? behavior varies.
        // SAFEST approach for custom components: append them if missing or rely on state if we trust it.
        // Let's grab universityId from the form data if the component supports name, OR fall back to state.
        const formUniversityId = (formData.get('universityId') as string) || universityId;
        const facultyId = formData.get('facultyId') as string;
        const className = formData.get('className') as string;

        // Validation
        if (!fullName || !email || !formUniversityId || !password) {
            const err = i18n.t('auth:register.missingRequired');
            return { error: err };
        }

        if (isPrimaryUniversity) {
            if (!facultyId || !className) {
                return { error: i18n.t('auth:register.missingFacultyClass') };
            }
            if (!AuthValidation.isHumgEmail(email)) {
                return { error: i18n.t('auth:register.invalidHumgEmail') };
            }
        } else {
            if (!AuthValidation.isValidEmail(email)) {
                return { error: i18n.t('auth:register.invalidEmail') };
            }
        }

        if (!AuthValidation.isValidPassword(password)) {
            return { error: i18n.t('auth:register.passwordTooShort') };
        }

        if (!AuthValidation.doPasswordsMatch(password, confirmPassword)) {
            return { error: i18n.t('auth:register.passwordMismatch') };
        }

        if (!agreed) {
            return { error: i18n.t('auth:register.agreeRequired') };
        }

        try {
            if (isPrimaryUniversity) {
                await authRepository.registerInternal({
                    fullName,
                    email,
                    password,
                    className,
                    facultyId: parseInt(facultyId),
                    role: 'STUDENT_INTERNAL'
                });
            } else {
                await authRepository.registerExternal({
                    fullName,
                    email,
                    password,
                    universityId: parseInt(formUniversityId),
                    role: 'STUDENT_EXTERNAL'
                });
            }

            onSuccess(email);
            return { success: true, error: null };
        } catch (err: unknown) {
            const message = extractErrorMessage(err, i18n.t('auth:register.failed'));
            toast.error(message);
            return { error: message, success: false };
        }
    };

    const [state, formAction, isPending] = useActionState(registerAction, null);

    return {
        universityId,
        setUniversityId,
        primaryUniversityId,
        isPrimaryUniversity,
        state,
        formAction,
        isPending,
    };
};
