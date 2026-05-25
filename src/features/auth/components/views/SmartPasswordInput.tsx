import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { InputFieldProps } from './Fields';
import i18n from '@/i18n';

interface Requirement {
    id: string;
    label: string;
    regex: RegExp;
}

const REQUIREMENTS: Requirement[] = [
    { id: 'length', label: i18n.t('auth:password.minLength'), regex: /.{8,}/ },
];

export const SmartPasswordInput = ({
    className,
    onChange,
    value,
    defaultValue,
    error,
    ...props
}: InputFieldProps) => {
    const [inputValue, setInputValue] = useState<string>((value as string) || (defaultValue as string) || '');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Sync with external value if controlled
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value as string);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (onChange) onChange(e);
    };

    // Calculate strength
    const passedRequirements = REQUIREMENTS.filter(req => req.regex.test(inputValue));
    const strengthScore = passedRequirements.length;

    // 0-1: Weak (Red), 2-3: Medium (Yellow), 4-5: Strong (Green)
    const getStrengthColor = () => {
        if (strengthScore < 1) return 'bg-red-500';
        //if (strengthScore <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (strengthScore === 0) return i18n.t('auth:password.notEntered');
        //if (strengthScore <= 1) return 'Yếu';
        //if (strengthScore <= 3) return 'Trung bình';
        return i18n.t('auth:password.strong');
    };

    const isPasswordVisible = showPassword;
    const inputType = isPasswordVisible ? 'text' : 'password';

    // Validation UI Logic from InputField
    const [localError, setLocalError] = useState<string | null>(null);
    const hasError = !!error || !!localError;
    const errorMessage = (typeof error === 'string' ? error : null) || localError;

    const handleInvalid = (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        setLocalError(e.currentTarget.validationMessage);
    };

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalError(null);
        handleChange(e);
    };

    return (
        <div className="w-full relative">
            <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className={`h-5 w-5 transition-colors ${hasError ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-humg-blue'}`} />
                </div>
                <input
                    type={inputType}
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-slate-700 dark:text-white placeholder:text-slate-400 outline-none transition-colors duration-300
                        ${hasError
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                            : 'border-slate-200 dark:border-slate-700 focus:border-humg-blue focus:ring-4 focus:ring-humg-blue/10'
                        }
                        ${className || ''}
                    `}
                    value={inputValue}
                    onChange={handleLocalChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onInvalid={handleInvalid}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-humg-blue transition-colors cursor-pointer outline-none"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-xs font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Smart Strength Meter & Requirements - Show when focused or has value */}
            {(isFocused || inputValue.length > 0) && !errorMessage && (
                <div className="mt-3 overflow-hidden transition-colors duration-500 ease-in-out">
                    {/* Strength Bar */}
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{i18n.t('auth:password.strengthLabel')} {getStrengthLabel()}</span>
                        <span className="text-xs text-slate-400">{strengthScore}/{REQUIREMENTS.length} {i18n.t('auth:password.criteria')}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                            className={`h-full transition-colors duration-500 ease-out ${getStrengthColor()}`}
                            style={{ width: `${(strengthScore / REQUIREMENTS.length) * 100}%` }}
                        />
                    </div>

                    {/* Requirements List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {REQUIREMENTS.map((req) => {
                            const isMet = req.regex.test(inputValue);
                            return (
                                <div
                                    key={req.id}
                                    className={`flex items-center gap-2 text-xs transition-colors duration-300 ${isMet ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}
                                >
                                    {isMet ? <Check size={12} className="shrink-0" /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                                    <span>{req.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
