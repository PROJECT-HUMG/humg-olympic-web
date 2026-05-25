import { useState, useEffect, useTransition, type FormEvent } from 'react';
import { School, BookOpen, Users, Loader2, AlertCircle } from 'lucide-react';
import { universityRepository } from '@/features/university/api/ApiUniversityRepository';
import { AsyncSearchableSelect } from '@/components/ui/AsyncSearchableSelect';
import i18n from '@/i18n';

interface GoogleCompleteViewProps {
  tempToken: string;
  primaryUniversityId?: number;
  onSubmit: (data: { tempToken: string; universityId: number; facultyId?: number; className?: string }) => Promise<void>;
  onBack: () => void;
}

export const GoogleCompleteView = ({
  tempToken,
  primaryUniversityId,
  onSubmit,
  onBack,
}: GoogleCompleteViewProps) => {
  const [universityId, setUniversityId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [className, setClassName] = useState('');
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPrimary = primaryUniversityId != null && universityId === String(primaryUniversityId);

  useEffect(() => {
    if (!isPrimary) {
      setFacultyId('');
      setClassName('');
    }
  }, [isPrimary]);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const uid = parseInt(universityId, 10);
    if (!universityId || isNaN(uid)) {
      setError(i18n.t('auth:googleComplete.selectUniversity'));
      return;
    }
    if (isPrimary) {
      if (!facultyId || !className.trim()) {
        setError(i18n.t('auth:googleComplete.humgRequired'));
        return;
      }
    }
    startTransition(async () => {
      try {
        await onSubmit({
          tempToken,
          universityId: uid,
          facultyId: isPrimary && facultyId ? parseInt(facultyId, 10) : undefined,
          className: isPrimary && className.trim() ? className.trim() : undefined,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : i18n.t('auth:googleComplete.genericError'));
      }
    });
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          {i18n.t('auth:googleComplete.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
          {i18n.t('auth:googleComplete.subtitle')}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <AsyncSearchableSelect
          loadOptions={loadUniversities}
          value={universityId}
          onChange={setUniversityId}
          placeholder={i18n.t('auth:googleComplete.universityPlaceholder')}
          pageSize={10}
          icon={School}
        />

        {isPrimary && (
          <>
            <AsyncSearchableSelect
              loadOptions={loadFaculties}
              value={facultyId}
              onChange={setFacultyId}
              placeholder={i18n.t('auth:googleComplete.facultyPlaceholder')}
              pageSize={10}
              icon={BookOpen}
            />

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={i18n.t('auth:googleComplete.classPlaceholder')}
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isLoading) {
                      const event = { preventDefault: () => { } } as React.FormEvent;
                      handleSubmit(event);
                    }
                  }
                }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white placeholder:text-slate-400 focus:border-humg-blue focus:ring-4 focus:ring-humg-blue/10 outline-none"
              />
            </div>
          </>
        )}

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
          {isLoading ? <><Loader2 className="animate-spin" size={20} />{i18n.t('auth:googleComplete.processing')}</> : i18n.t('auth:googleComplete.continue')}
        </button>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-humg-blue dark:hover:text-blue-400 transition-colors mx-auto font-medium"
          >
            {i18n.t('auth:googleComplete.backToLogin')}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-slate-400 mt-16">
        © 2026 Olympic HUMG. All rights reserved.
      </p>
    </div>
  );
};
