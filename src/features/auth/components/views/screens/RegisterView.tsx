import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, CheckSquare, Square, Loader2, AlertCircle, School, BookOpen, Users } from 'lucide-react';
import { InputField } from '../Fields';
import { SmartPasswordInput } from '../SmartPasswordInput';
import { AsyncSearchableSelect } from '@/components/ui/AsyncSearchableSelect';
import { universityRepository } from '@/features/university/api/ApiUniversityRepository';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import i18n from '@/i18n';

interface RegisterViewProps {
    onSuccess: (email: string) => void;
    onGoLogin: () => void;
}

export const RegisterView = ({ onSuccess, onGoLogin }: RegisterViewProps) => {
    const {
        universityId,
        setUniversityId,
        isPrimaryUniversity,
        state,
        formAction,
        isPending,
    } = useRegisterForm(onSuccess);

    // Local UI state for fields that need controlled behavior for the UI component (AsyncSelect, Checkbox)
    // but will use hidden inputs for FormData submission.
    const [facultyId, setFacultyId] = useState('');
    const [agreed, setAgreed] = useState(false);

    const loadUniversities = async (search: string, page: number, limit: number) => {
        const { data, total } = await universityRepository.getUniversitiesPaged(search, page, limit);
        return {
            data: data.map(u => ({ id: u.id, name: u.name })),
            total
        };
    };

    const loadFaculties = async (search: string, page: number, limit: number) => {
        const { data, total } = await universityRepository.getFacultiesPaged(search, page, limit);
        return {
            data: data.map(f => ({ id: f.value, name: f.label })),
            total
        };
    };

    // Reset faculty when not primary university
    useEffect(() => {
        if (!isPrimaryUniversity) {
            setFacultyId('');
        }
    }, [isPrimaryUniversity]);

    // Validation error helper
    const error = state?.error;

    return (
        <div className="w-full animate-fade-in-up">
            <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {i18n.t('auth:register.title')}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-base">
                    {i18n.t('auth:register.subtitle')}
                </p>
            </div>

            <form className="space-y-4" action={formAction}>
                {/* Hidden inputs for non-standard fields */}
                <input type="hidden" name="universityId" value={universityId} />
                <input type="hidden" name="facultyId" value={facultyId} />
                <input type="hidden" name="agreed" value={agreed ? 'on' : ''} />

                {/* University Selection */}
                <AsyncSearchableSelect
                    loadOptions={loadUniversities}
                    value={universityId}
                    onChange={setUniversityId}
                    placeholder={i18n.t('auth:register.universityPlaceholder')}
                    pageSize={10}
                    icon={School}
                    error={error && !universityId ? i18n.t('auth:register.universityRequired') : undefined}
                />

                {/* Conditional Fields for Primary University (HUMG) */}
                {isPrimaryUniversity && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AsyncSearchableSelect
                            loadOptions={loadFaculties}
                            value={facultyId}
                            onChange={setFacultyId}
                            placeholder={i18n.t('auth:register.facultyPlaceholder')}
                            pageSize={10}
                            icon={BookOpen}
                        />
                        <InputField
                            name="className"
                            type="text"
                            placeholder={i18n.t('auth:register.classPlaceholder')}
                            icon={Users}
                        // Uncontrolled
                        />
                    </div>
                )}

                <InputField
                    name="fullName"
                    type="text"
                    placeholder={i18n.t('auth:register.fullNamePlaceholder')}
                    icon={User}
                    error={!!error && !state?.success} // Simplified error showing default border if general error
                />

                <InputField
                    name="email"
                    type="email"
                    placeholder={isPrimaryUniversity ? i18n.t('auth:register.emailInternal') : i18n.t('auth:register.emailExternal')}
                    icon={Mail}
                    error={!!error}
                />

                <SmartPasswordInput
                    name="password"
                    placeholder={i18n.t('auth:register.passwordPlaceholder')}
                    icon={Lock}
                    error={!!error}
                />

                <InputField
                    name="confirmPassword"
                    type="password"
                    placeholder={i18n.t('auth:register.confirmPasswordPlaceholder')}
                    icon={Lock}
                    error={!!error}
                />

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg animate-pulse border border-red-100 dark:border-red-900/20">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="flex items-start gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setAgreed(!agreed)}
                        className={`mt-0.5 flex-shrink-0 transition-colors ${agreed ? 'text-humg-blue' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                        {agreed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        {i18n.t('auth:register.agreeTerms')} <Link to="/terms" target="_blank" className="font-bold text-humg-blue hover:underline">{i18n.t('auth:register.termsLink')}</Link>.
                    </p>
                </div>

                <button
                    disabled={isPending}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-humg-blue hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-humg-blue/20 transform active:scale-[0.98] hover:-translate-y-0.5 transition-colors duration-300 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {i18n.t('auth:register.processing')}
                        </>
                    ) : (
                        i18n.t('auth:register.submitButton')
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
                {i18n.t('auth:register.hasAccount')}{' '}
                <button
                    onClick={onGoLogin}
                    className="text-humg-blue dark:text-blue-400 font-bold hover:underline"
                >
                    {i18n.t('auth:register.loginHere')}
                </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-12">
                © 2026 Olympic HUMG. All rights reserved.
            </p>
        </div>
    );
};
