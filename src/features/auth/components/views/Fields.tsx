import { useState, type ReactNode, type ElementType, type InputHTMLAttributes, type ChangeEvent, type FormEvent } from 'react';
import { Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';

export const SocialButton = ({
    icon, label, onClick
}: {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors duration-300 group shadow-sm hover:shadow-md"
    >
        <div className="w-5 h-5 group-hover:scale-110 transition-transform">{icon}</div>
        <span>{label}</span>
    </button>
);

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: ElementType;
    error?: string | boolean | null;
}

export const InputField = ({
    type = 'text',
    placeholder,
    icon: Icon,
    value,
    onChange,
    error,
    className,
    ...props
}: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Normalize error: could be boolean (old usage) or string (new usage)
    const hasError = !!error || !!localError;
    const errorMessage = (typeof error === 'string' ? error : null) || localError;

    const handleInvalid = (e: FormEvent<HTMLInputElement>) => {
        e.preventDefault(); // Prevent native tooltip
        setLocalError(e.currentTarget.validationMessage);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalError(null); // Clear local error on change
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="w-full">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className={`h-5 w-5 transition-colors ${hasError ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-humg-blue'}`} />
                </div>
                <input
                    type={inputType}
                    placeholder={placeholder}
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-slate-700 dark:text-white placeholder:text-slate-400 outline-none transition-colors duration-300
              ${hasError
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                            : 'border-slate-200 dark:border-slate-700 focus:border-humg-blue focus:ring-4 focus:ring-humg-blue/10'
                        }
              ${className || ''}
            `}
                    value={value}
                    onChange={handleChange}
                    onInvalid={handleInvalid}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-humg-blue transition-colors cursor-pointer outline-none"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {/* Custom Error Message UI */}
            {errorMessage && (
                <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-xs font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}
        </div>
    );
};

export const SelectField = ({
    placeholder, icon: Icon, value, onChange, options = []
}: {
    placeholder: string;
    icon: ElementType;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options?: { value: string; label: string }[];
}) => {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-humg-blue transition-colors" />
            </div>
            <select
                className={`w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white focus:border-humg-blue focus:ring-4 focus:ring-humg-blue/10 outline-none transition-colors duration-300 appearance-none cursor-pointer ${value === '' ? 'text-slate-400' : ''}`}
                value={value}
                onChange={onChange}
            >
                <option value="" disabled>{placeholder}</option>

                {options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-slate-700 dark:text-slate-200">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <ChevronRight className="h-5 w-5 rotate-90" />
            </div>
        </div>
    );
};