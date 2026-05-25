import { useEffect, useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AsyncSearchableSelect } from '@/components/ui/AsyncSearchableSelect';
import { AdminCreateUserRequest, AdminUpdateUserRequest } from '@/features/admin/types/admin.types';
import { ModalShell, FormField, inputBaseClass, inputErrorClass, inputNormalClass, inputDisabledClass } from './ModalShell';
import i18n from '@/i18n';

interface University { id: number; name: string; }
interface Faculty { id: number; name: string; }

interface AdminUserModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    onClose: () => void;
    onCreate: (payload: AdminCreateUserRequest) => Promise<void>;
    onUpdate: (userId: number, payload: AdminUpdateUserRequest) => Promise<void>;
    isSubmitting: boolean;
    loadUniversities: (search: string, page: number, limit: number) => Promise<{ data: University[]; total: number }>;
    loadFaculties: (search: string, page: number, limit: number) => Promise<{ data: Faculty[]; total: number }>;
    initialUserId?: number;
    initialValues?: Partial<AdminUpdateUserRequest>;
    initialUniversity?: University | null;
    initialFaculty?: Faculty | null;
}

type UserRole = 'LECTURER' | 'STUDENT_INTERNAL' | 'STUDENT_EXTERNAL' | 'ADMIN';

const getDegreeOptions = () => [
    { value: 'BACHELOR', label: i18n.t('dashboard:admin.user.degreeBachelor') },
    { value: 'ENGINEER', label: i18n.t('dashboard:admin.user.degreeEngineer') },
    { value: 'MASTER', label: i18n.t('dashboard:admin.user.degreeMaster') },
    { value: 'DOCTOR', label: i18n.t('dashboard:admin.user.degreeDoctor') },
    { value: 'DOCTOR_OF_SCIENCE', label: i18n.t('dashboard:admin.user.degreeDoctorOfScience') },
    { value: 'ASSOCIATE_PROFESSOR', label: i18n.t('dashboard:admin.user.degreeAssocProf') },
    { value: 'PROFESSOR', label: i18n.t('dashboard:admin.user.degreeProf') },
];

export const AdminUserModal = ({
    isOpen, mode, onClose, onCreate, onUpdate, isSubmitting,
    loadUniversities, loadFaculties, initialUserId, initialValues,
    initialUniversity = null, initialFaculty = null
}: AdminUserModalProps) => {
    const [userId, setUserId] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('STUDENT_INTERNAL');
    const [degree, setDegree] = useState('');
    const [universityId, setUniversityId] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [className, setClassName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setUserId(initialUserId ? String(initialUserId) : '');
        setFullName(initialValues?.fullName || '');
        setRole((initialValues?.role as UserRole) || 'STUDENT_INTERNAL');
        setDegree(initialValues?.degree || '');
        setUniversityId(initialValues?.universityId ? String(initialValues.universityId) : '');
        setFacultyId(initialValues?.facultyId ? String(initialValues.facultyId) : '');
        setClassName(initialValues?.className || '');
        setPhone(initialValues?.phone || '');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setErrors({});
    }, [isOpen, initialUserId, initialValues]);

    const fieldConfig = useMemo(() => {
        switch (role) {
            case 'LECTURER':
                return { showDegree: true, showUniversity: false, showFaculty: false, showClass: false, requiredFields: ['fullName', 'email', 'password'] };
            case 'STUDENT_INTERNAL':
                return { showDegree: false, showUniversity: false, showFaculty: true, showClass: true, requiredFields: ['fullName', 'email', 'password', 'facultyId', 'className'] };
            case 'STUDENT_EXTERNAL':
                return { showDegree: false, showUniversity: true, showFaculty: false, showClass: false, requiredFields: ['fullName', 'email', 'password', 'universityId'] };
            case 'ADMIN':
                return { showDegree: true, showUniversity: false, showFaculty: true, showClass: true, requiredFields: ['fullName', 'email', 'password'] };
            default:
                return { showDegree: false, showUniversity: true, showFaculty: true, showClass: true, requiredFields: ['fullName', 'email', 'password'] };
        }
    }, [role]);

    const isRequired = (field: string) => {
        if (mode === 'update' && (field === 'email' || field === 'password')) return false;
        return fieldConfig.requiredFields.includes(field);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = i18n.t('dashboard:admin.user.fullNameRequired');
        if (mode === 'create') {
            if (!email.trim()) newErrors.email = i18n.t('dashboard:admin.user.emailRequired');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = i18n.t('dashboard:admin.user.emailInvalid');
            if (!password) newErrors.password = i18n.t('dashboard:admin.user.passwordRequired');
            else if (password.length < 6) newErrors.password = i18n.t('dashboard:admin.user.passwordMinLength');
        }
        if (role === 'STUDENT_INTERNAL') {
            if (!facultyId) newErrors.facultyId = i18n.t('dashboard:admin.user.facultyRequired');
            if (!className.trim()) newErrors.className = i18n.t('dashboard:admin.user.classRequired');
        }
        if (role === 'STUDENT_EXTERNAL') {
            if (!universityId) newErrors.universityId = i18n.t('dashboard:admin.user.universityRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (mode === 'create') {
            await onCreate({
                fullName, email, role,
                degree: fieldConfig.showDegree ? (degree || null) : null,
                universityId: fieldConfig.showUniversity && universityId ? Number(universityId) : null,
                facultyId: fieldConfig.showFaculty && facultyId ? Number(facultyId) : null,
                className: fieldConfig.showClass ? (className || null) : null,
                phone: phone || null, password,
            });
        } else {
            await onUpdate(Number(userId), {
                fullName: fullName || undefined, role,
                degree: fieldConfig.showDegree ? (degree || null) : null,
                universityId: fieldConfig.showUniversity && universityId ? Number(universityId) : null,
                facultyId: fieldConfig.showFaculty && facultyId ? Number(facultyId) : null,
                className: fieldConfig.showClass ? (className || null) : null,
                phone: phone || null,
            });
        }
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={mode === 'create' ? i18n.t('dashboard:admin.user.titleCreate') : i18n.t('dashboard:admin.user.titleUpdate')} onClose={onClose}>
            {mode === 'update' && (
                <FormField label="User ID">
                    <input type="number" className={`${inputBaseClass} ${inputDisabledClass}`} placeholder="User ID" value={userId} disabled readOnly />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.user.fullName')} required error={errors.fullName}>
                <input type="text" className={`${inputBaseClass} ${errors.fullName ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.user.fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </FormField>
            {mode === 'create' && (
                <FormField label="Email" required error={errors.email}>
                    <input type="email" className={`${inputBaseClass} ${errors.email ? inputErrorClass : inputNormalClass}`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.user.role')} required>
                <select className={`${inputBaseClass} ${inputNormalClass}`} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                    <option value="STUDENT_INTERNAL">{i18n.t('dashboard:admin.user.roleStudentInternal')}</option>
                    <option value="STUDENT_EXTERNAL">{i18n.t('dashboard:admin.user.roleStudentExternal')}</option>
                    <option value="LECTURER">{i18n.t('dashboard:admin.user.roleLecturer')}</option>
                    <option value="ADMIN">{i18n.t('dashboard:admin.user.roleAdmin')}</option>
                </select>
            </FormField>
            {fieldConfig.showDegree && (
                <FormField label={i18n.t('dashboard:admin.user.degree')}>
                    <select className={`${inputBaseClass} ${inputNormalClass}`} value={degree} onChange={(e) => setDegree(e.target.value)}>
                        <option value="">{i18n.t('dashboard:admin.user.degreeSelect')}</option>
                        {getDegreeOptions().map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </FormField>
            )}
            {(fieldConfig.showUniversity || fieldConfig.showFaculty) && (
                <div className={`grid gap-3 ${fieldConfig.showUniversity && fieldConfig.showFaculty ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {fieldConfig.showUniversity && (
                        <FormField label={i18n.t('dashboard:admin.user.university')} required={isRequired('universityId')} error={errors.universityId}>
                            <AsyncSearchableSelect loadOptions={loadUniversities} value={universityId} onChange={setUniversityId} placeholder={i18n.t('dashboard:admin.user.universityPlaceholder')} error={errors.universityId} pageSize={20} debounceMs={500} initialSelectedOption={initialUniversity} />
                        </FormField>
                    )}
                    {fieldConfig.showFaculty && (
                        <FormField label={i18n.t('dashboard:admin.user.faculty')} required={isRequired('facultyId')} error={errors.facultyId}>
                            <AsyncSearchableSelect loadOptions={loadFaculties} value={facultyId} onChange={setFacultyId} placeholder={i18n.t('dashboard:admin.user.facultyPlaceholder')} error={errors.facultyId} pageSize={20} debounceMs={500} initialSelectedOption={initialFaculty} />
                        </FormField>
                    )}
                </div>
            )}
            {fieldConfig.showClass && (
                <FormField label={i18n.t('dashboard:admin.user.class')} required={isRequired('className')} error={errors.className}>
                    <input type="text" className={`${inputBaseClass} ${errors.className ? inputErrorClass : inputNormalClass}`} placeholder={i18n.t('dashboard:admin.user.classPlaceholder')} value={className} onChange={(e) => setClassName(e.target.value)} />
                </FormField>
            )}
            <FormField label={i18n.t('dashboard:admin.user.phone')}>
                <input type="text" className={`${inputBaseClass} ${inputNormalClass}`} placeholder={i18n.t('dashboard:admin.user.phonePlaceholder')} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            {mode === 'create' && (
                <FormField label={i18n.t('dashboard:admin.user.password')} required error={errors.password}>
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} className={`${inputBaseClass} ${errors.password ? inputErrorClass : inputNormalClass} pr-12`} placeholder={i18n.t('dashboard:admin.user.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </FormField>
            )}
            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? i18n.t('dashboard:admin.saving') : i18n.t('dashboard:admin.user.save')}
            </button>
        </ModalShell>
    );
};
