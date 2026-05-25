import { type FormEvent, useState, useTransition } from 'react';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InputField } from '../Fields';
import i18n from '@/i18n';

interface GoogleEduVerifyViewProps {
  onSubmit: (eduEmail: string) => Promise<void>;
  onSuccess: () => void;
}

const EDU_SUFFIX = 'student.humg.edu.vn';

export const GoogleEduVerifyView = ({ onSubmit, onSuccess }: GoogleEduVerifyViewProps) => {
  const [eduEmail, setEduEmail] = useState('');
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = eduEmail.trim();
    if (!email) {
      setError(i18n.t('auth:eduVerify.enterEmail'));
      return;
    }
    if (!email.toLowerCase().endsWith(`@${EDU_SUFFIX}`)) {
      setError(i18n.t('auth:eduVerify.invalidSuffix', { suffix: EDU_SUFFIX }));
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit(email);
        setSent(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : i18n.t('auth:eduVerify.sendFailed'));
      }
    });
  };

  if (sent) {
    return (
      <div className="w-full animate-fade-in-up">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {i18n.t('auth:eduVerify.sentTitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
            {i18n.t('auth:eduVerify.sentDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-4 rounded-xl bg-humg-blue hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-humg-blue/20 transform active:scale-[0.98] transition-colors duration-300 flex items-center justify-center gap-2"
        >
          {i18n.t('auth:eduVerify.goHome')}
        </button>
        <p className="text-center text-xs text-slate-400 mt-16">
          © 2026 Olympic HUMG. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          {i18n.t('auth:eduVerify.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
          {i18n.t('auth:eduVerify.subtitle')}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          type="email"
          placeholder={`Email @${EDU_SUFFIX}`}
          icon={Mail}
          value={eduEmail}
          onChange={(e) => setEduEmail(e.target.value)}
          error={!!error}
        />

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg animate-pulse">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-humg-blue hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-humg-blue/20 transform active:scale-[0.98] transition-colors duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <><Loader2 className="animate-spin" size={20} /> {i18n.t('auth:eduVerify.sending')}</> : i18n.t('auth:eduVerify.submitButton')}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-16">
        © 2026 Olympic HUMG. All rights reserved.
      </p>
    </div>
  );
};
