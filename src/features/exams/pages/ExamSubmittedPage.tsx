import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    CheckCircle2, ArrowRight, Loader2, Upload, X,
    FileImage, FileText, ClockAlert, Clock,
} from 'lucide-react';
import { examAttemptRepository } from '@/features/exams/api';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { ApiError } from '@/lib/api/apiClient';

const COUNTDOWN_SECONDS = 5;
const EVIDENCE_WINDOW_MINUTES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ExamSubmittedPage = () => {
    const { slug, attemptId } = useParams<{ slug: string; attemptId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // State from submit response (passed via navigate state)
    const submitStatus: string = (location.state as any)?.submitStatus ?? 'GRADED';
    const requirePaper: boolean = (location.state as any)?.requirePaperSubmission ?? false;

    const isPending = submitStatus === 'PENDING_GRADING';
    const needsUpload = requirePaper;

    // Countdown (only auto-redirect when no upload needed and GRADED)
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const canAutoRedirect = !isPending && !needsUpload;

    // Evidence upload state
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Evidence deadline countdown (20 minutes from page load)
    const [evidenceSecondsLeft, setEvidenceSecondsLeft] = useState(EVIDENCE_WINDOW_MINUTES * 60);
    const evidenceExpired = evidenceSecondsLeft <= 0;

    const numericAttemptId = attemptId ? Number(attemptId) : null;
    const resultPath = `/exams/${slug}/result/${attemptId}`;

    useEffect(() => {
        if (!canAutoRedirect) return;
        if (countdown <= 0) {
            navigate(resultPath, { replace: true });
            return;
        }
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, canAutoRedirect, navigate, resultPath]);

    // Evidence deadline timer
    useEffect(() => {
        if (!needsUpload || uploadDone || evidenceExpired) return;
        const timer = setInterval(() => {
            setEvidenceSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [needsUpload, uploadDone, evidenceExpired]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid = selected.filter(f => {
            if (!ALLOWED_TYPES.includes(f.type)) {
                showToast(`${f.name}: ${i18n.t('exams:submitted.fileTypeError', { name: '' })}`, 'error');
                return false;
            }
            if (f.size > MAX_FILE_SIZE) {
                showToast(`${f.name}: ${i18n.t('exams:submitted.fileSizeError', { name: '' })}`, 'error');
                return false;
            }
            return true;
        });
        setFiles(prev => [...prev, ...valid]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const handleUpload = async () => {
        if (!numericAttemptId || files.length === 0 || uploading) return;
        if (evidenceExpired) {
            showToast(i18n.t('exams:evidenceExpired'), 'error');
            return;
        }
        setUploading(true);
        try {
            await examAttemptRepository.submitPaperEvidence(numericAttemptId, files);
            showToast(i18n.t('exams:evidenceSuccess'), 'success');
            setUploadDone(true);
        } catch (err: unknown) {
            if (err instanceof ApiError && err.code === 'EVIDENCE_WINDOW_EXPIRED') {
                showToast(i18n.t('exams:evidenceExpired20'), 'error');
                setEvidenceSecondsLeft(0);
            } else {
                const msg = err instanceof ApiError ? err.message : i18n.t('exams:evidenceFailed');
                showToast(msg, 'error');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleFinish = () => {
        navigate(resultPath, { replace: true });
    };

    const isUrgent = evidenceSecondsLeft <= 5 * 60 && evidenceSecondsLeft > 0;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full text-center">

                {/* ── Status Icon ── */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                    {isPending ? (
                        <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <ClockAlert size={40} className="text-purple-600 dark:text-purple-400" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-ping opacity-30" />
                            <div className="relative w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </>
                    )}
                </div>

                {/* ── Title ── */}
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {isPending ? i18n.t('exams:submitted.pendingTitle') : i18n.t('exams:submitted.gradedTitle')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {isPending
                        ? i18n.t('exams:submitted.pendingDesc')
                        : needsUpload && !uploadDone
                            ? i18n.t('exams:submitted.uploadDesc')
                            : i18n.t('exams:submitted.processingDesc')
                    }
                </p>

                {/* ── Evidence Upload Section ── */}
                {needsUpload && !uploadDone && (
                    <div className="text-left mb-6 space-y-3">
                        {/* Evidence deadline countdown */}
                        {!evidenceExpired ? (
                            <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${isUrgent
                                ? 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                                : 'bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                }`}>
                                <Clock size={16} className={isUrgent ? 'animate-pulse' : ''} />
                                <span>{i18n.t('exams:submitted.evidenceTimer', { time: formatCountdown(evidenceSecondsLeft) })}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold">
                                <ClockAlert size={16} />
                                <span>{i18n.t('exams:submitted.evidenceExpiredLabel')}</span>
                            </div>
                        )}

                        {!evidenceExpired && (
                            <>
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                    {i18n.t('exams:submitted.fileSupport')}
                                </p>

                                {/* File list */}
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                {f.type.startsWith('image/') ? <FileImage size={16} className="text-amber-500 shrink-0" /> : <FileText size={16} className="text-amber-500 shrink-0" />}
                                                <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                                                <span className="text-[10px] text-slate-400">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                                                <button onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add file button */}
                                <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Upload size={16} /> {i18n.t('exams:submitted.selectFiles')}
                                </button>

                                {/* Upload button */}
                                {files.length > 0 && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-colors"
                                    >
                                        {uploading
                                            ? <><Loader2 size={16} className="animate-spin" /> {i18n.t('exams:submitted.uploading')}</>
                                            : <><Upload size={16} /> {i18n.t('exams:submitted.submitEvidence', { count: files.length })}</>
                                        }
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Upload success */}
                {uploadDone && (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
                        <CheckCircle2 size={16} /> {i18n.t('exams:submitted.uploadSuccess')}
                    </div>
                )}

                {/* ── Processing indicator (GRADED, no upload needed) ── */}
                {canAutoRedirect && (
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        <span>{i18n.t('exams:submitted.processing')}</span>
                    </div>
                )}

                {/* ── CTA Button ── */}
                {(!needsUpload || uploadDone || evidenceExpired) && (
                    <button
                        onClick={handleFinish}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                    >
                        {isPending ? i18n.t('exams:submitted.viewStatusBtn') : i18n.t('exams:submitted.viewResultBtn')}
                        <ArrowRight size={16} />
                    </button>
                )}

                {/* ── Auto-redirect countdown (GRADED, no upload) ── */}
                {canAutoRedirect && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                        {i18n.t('exams:submitted.autoRedirect', { count: countdown })}
                    </p>
                )}
            </div>
        </div>
    );
};
