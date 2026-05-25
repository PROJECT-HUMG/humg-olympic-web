import { useState, useTransition } from 'react';
import { sanitizeHtml } from '@/utils/sanitize';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Clock, Share2,
    CheckCircle2, Loader2, AlertTriangle,
    Award, FileText, List, Zap, Trophy, Laptop,
    Info, MonitorPlay, User, Star, Pencil, Trash2, GraduationCap, UserPlus,
    Eye
} from 'lucide-react';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useCompetitionDetail } from '@/features/competitions/hooks/useCompetitionDetail';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/utils/errorUtils';
import { VerifiedBadge } from '@/features/badges/components/VerifiedBadge';
import { useUserPreview } from '@/hooks/useUserPreview';
import { resourceAuthorToPreviewAuthor } from '@/utils/resourceHelpers';
import { TimelineEvent, Prize } from '@/features/competitions/types/competition.types';
import type { Author } from '@/features/forum/types/forum.types';
import { SubjectBadge, StatusBadge } from '@/features/competitions/components/CompetitionBadges';
import { CompetitionDetailSkeleton } from '../components/CompetitionDetailSkeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import EditCompetitionModal from '@/features/dashboard/components/EditCompetitionModal';
import { UserPreviewCard } from '@/features/profile/components/UserPreviewCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ShareButton } from '@/components/ui/ShareButton';

// ─── Timeline Item (Modern) ───────────────────────────────────────────
const TimelineItem = ({ event, isLast }: { event: TimelineEvent; isLast: boolean }) => {
    const dateDisplay = event.eventTime
        ? format(new Date(event.eventTime), 'HH:mm - dd/MM/yyyy', { locale: vi })
        : i18n.t('features:competitions.detail.notUpdated');

    return (
        <div className="flex gap-5 relative group">
            {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-[-10px] w-[2px] bg-gradient-to-b from-blue-200 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-900/50 group-hover:from-blue-400 transition-colors duration-300"></div>
            )}

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-slate-900 transition-transform duration-300 group-hover:scale-110 ${event.isCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                }`}>
                {event.isCompleted ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
            </div>

            <div className="pb-8 pt-1.5">
                <p className="text-[11px] md:text-xs font-bold text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock size={12} /> {dateDisplay}
                </p>
                <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{event.description}</p>
            </div>
        </div>
    );
};

// ─── Prize Card (Metallic Bento) ───────────────────────────────────────────
const PrizeCard = ({ prize, index }: { prize: Prize; index: number }) => {
    const getRankStyle = (rank: string) => {
        const lower = rank.toLowerCase();
        if (lower.includes('nhất') || lower.includes('first') || lower.includes('gold') || lower.includes('1st')) return { bg: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/20', border: 'border-yellow-200 dark:border-yellow-700/50', text: 'text-yellow-700 dark:text-yellow-400', icon: 'text-yellow-500', shadow: 'shadow-[0_4px_15px_rgba(234,179,8,0.15)]' };
        if (lower.includes('nhì') || lower.includes('second') || lower.includes('silver') || lower.includes('2nd')) return { bg: 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/50', border: 'border-slate-200 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', icon: 'text-slate-400', shadow: 'shadow-sm' };
        if (lower.includes('ba') || lower.includes('third') || lower.includes('bronze') || lower.includes('3rd')) return { bg: 'bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20', border: 'border-orange-200 dark:border-orange-800/50', text: 'text-orange-800 dark:text-orange-400', icon: 'text-orange-500', shadow: 'shadow-[0_4px_15px_rgba(249,115,22,0.1)]' };
        return { bg: 'bg-white dark:bg-slate-800/50', border: 'border-blue-100 dark:border-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-400', shadow: 'shadow-sm' };
    };

    const s = getRankStyle(prize.rankName);

    return (
        <div
            className={`p-5 rounded-2xl border flex items-center gap-4 transition-transform hover:-translate-y-1 ${s.bg} ${s.border} ${s.shadow} backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5 duration-300 fill-mode-both`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className={`w-14 h-14 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-sm flex items-center justify-center shrink-0 ${s.icon}`}>
                <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`font-black text-lg mb-0.5 ${s.text}`}>{prize.rankName}</h4>
                <p className="text-slate-900 dark:text-white font-bold text-base">{prize.prizeValue}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {i18n.t('features:competitions.detail.prizeQuantity', { count: prize.quantity })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const CompetitionDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { competition, loading, error, register, isRegistering, isSettingFeatured, setFeatured, updateCompetition, deleteCompetition } = useCompetitionDetail(slug || null);

    const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'prizes' | 'teams'>('info');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const isAdmin = user?.role === 'ADMIN';

    const {
        isVisible: showPreview, position: previewPosition, previewItem,
        handleHoverStart, handleHoverEnd, handlePreviewMouseEnter, handlePreviewMouseLeave,
    } = useUserPreview<Author>();

    const handleRegister = async () => {
        if (!competition) return;
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const result = await register();
        showToast(result.message, result.success ? "success" : "error");
    };

    const handleBack = () => navigate('/competitions');

    const handleToggleFeatured = async () => {
        if (!competition) return;
        try {
            await setFeatured(competition.id, !competition.isFeatured);
            showToast(competition.isFeatured ? i18n.t('features:competitions.removedFeatured') : i18n.t('features:competitions.setFeatured'), 'success');
        } catch (err: unknown) {
            showToast(extractErrorMessage(err, i18n.t('features:competitions.actionFailed')), 'error');
        }
    };

    const handleConfirmDelete = () => {
        if (!competition) return;
        startDeleteTransition(async () => {
            try {
                await deleteCompetition();
                showToast(i18n.t('features:competitions.deleteSuccess'), 'success');
                setIsDeleteOpen(false);
                navigate('/competitions');
            } catch (err: unknown) {
                showToast(extractErrorMessage(err, i18n.t('features:competitions.deleteFailed')), 'error');
            }
        });
    };

    const formatDateVN = (dateStr?: string) => {
        if (!dateStr) return i18n.t('features:competitions.detail.notUpdated');
        return format(new Date(dateStr), 'HH:mm - dd/MM/yyyy', { locale: vi });
    };

    if (loading) return (
        <div className="min-h-screen pt-24 pb-24">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">
                    <CompetitionDetailSkeleton />
                </div>
            </div>
        </div>
    );

    if (error || !competition) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1c]">
            <div className="text-center p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl max-w-md w-full">
                <AlertTriangle size={56} className="mx-auto text-rose-500 mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{error || i18n.t('features:competitions.detail.notFound')}</h3>
                <p className="text-slate-500 mb-6">{i18n.t('features:competitions.detail.notFoundDesc')}</p>
                <button onClick={handleBack} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                    {i18n.t('features:competitions.detail.backToList')}
                </button>
            </div>
        </div>
    );

    const isEnded = competition.status === 'ENDED';
    const isOnline = competition.type === 'ONLINE';

    return (
        <div className="min-h-screen pt-24 pb-24 transition-colors duration-300 font-sans relative">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                <Breadcrumb currentLabel={competition.title} />
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 lg:p-8 backdrop-blur-xl">

                    {/* ─── Top Bar Actions ─── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="group flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-sm w-fit"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">{i18n.t('features:competitions.detail.backToList')}</span>
                            <span className="sm:hidden">{i18n.t('features:competitions.detail.back')}</span>
                        </button>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <ShareButton title={competition.title} variant="full" />

                            {isAdmin && (
                                <>
                                    <button
                                        onClick={handleToggleFeatured}
                                        disabled={isSettingFeatured}
                                        className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${competition.isFeatured
                                            ? 'bg-amber-100/80 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                            : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700'
                                            } disabled:opacity-70`}
                                    >
                                        {isSettingFeatured ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Star size={16} className={competition.isFeatured ? 'fill-current' : ''} />}
                                        <span className="truncate">{isSettingFeatured ? i18n.t('features:competitions.detail.processing') : competition.isFeatured ? i18n.t('features:competitions.detail.featured') : i18n.t('features:competitions.detail.setFeatured')}</span>
                                    </button>
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className="flex-1 md:flex-none flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-bold"
                                    >
                                        <Pencil size={16} /> <span className="truncate">{i18n.t('features:competitions.detail.edit')}</span>
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteOpen(true)}
                                        className="flex-1 md:flex-none flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 transition-colors text-sm font-bold"
                                    >
                                        <Trash2 size={16} /> <span className="truncate">{i18n.t('features:competitions.detail.delete')}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── Hero Banner (Glassmorphism) ─── */}
                    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/60 dark:border-slate-700/50 mb-8 min-h-[300px] md:min-h-[340px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl transition-colors duration-500">
                        {/* Glowing ambient background from image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-20 dark:opacity-30 scale-110 pointer-events-none saturate-200"
                            style={{ backgroundImage: `url(${competition.imageUrl || '/placeholder-comp.png'})` }}
                            aria-hidden
                        />

                        <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 p-6 lg:p-8">
                            {/* Cover Image */}
                            <div className="w-full md:w-[45%] lg:min-w-[400px] max-w-[500px] aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 shrink-0 bg-slate-100 dark:bg-slate-800 relative group">
                                <img
                                    src={competition.imageUrl || '/placeholder-comp.png'}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={competition.title}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x500?text=Event'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Banner Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between gap-5">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                                        <StatusBadge status={competition.status} />
                                        <SubjectBadge name={competition.subjectName} />
                                    </div>
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 leading-tight mb-3">
                                        {competition.title}
                                    </h1>
                                    {competition.summary && (
                                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 font-medium">
                                            {competition.summary}
                                        </p>
                                    )}

                                    {/* Bento Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                <Calendar size={18} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{i18n.t('features:competitions.detail.timeLabel')}</p>
                                                <p className="text-slate-900 dark:text-white font-bold">{formatDateVN(competition.startTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                {isOnline ? <Laptop size={18} className="text-indigo-500" /> : <MapPin size={18} className="text-amber-500" />}
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{isOnline ? i18n.t('features:competitions.detail.formatLabel') : i18n.t('features:competitions.detail.locationLabel')}</p>
                                                {/^https?:\/\//i.test(competition.location) ? (
                                                    <a href={competition.location} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold truncate block hover:underline" title={competition.location}>
                                                        {i18n.t('features:competitions.detail.onlineLink')}
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-900 dark:text-white font-bold truncate block" title={competition.location}>{competition.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Author Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{i18n.t('features:competitions.detail.postedBy')}</span>
                                        {competition.author ? (
                                            <Link
                                                to={`/profile/${competition.author.id}`}
                                                onMouseEnter={(e) => handleHoverStart(resourceAuthorToPreviewAuthor(competition.author!), e)}
                                                onMouseLeave={handleHoverEnd}
                                                className="flex items-center gap-2 group/author hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 py-1 -ml-2 rounded-xl transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                                                    {competition.author.avatar ? (
                                                        <img src={competition.author.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><User size={14} /></div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover/author:text-blue-600 transition-colors">{competition.author.name}</span>
                                                    {competition.author.role && <VerifiedBadge role={competition.author.role} size={14} />}
                                                </div>
                                            </Link>
                                        ) : (
                                            <span className="font-bold text-slate-800 dark:text-slate-200">HUMG Admin</span>
                                        )}
                                    </div>

                                    {/* Desktop CTA */}
                                    <div className="hidden md:block shrink-0">
                                        {competition.isRegistered ? (
                                            <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm shadow-sm">
                                                <CheckCircle2 size={18} strokeWidth={2.5} /> {i18n.t('features:competitions.detail.registered')}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleRegister}
                                                disabled={isEnded || isRegistering}
                                                className={`px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-lg flex items-center gap-2 transition-colors duration-300 hover:-translate-y-0.5 active:translate-y-0 ${isEnded
                                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]'
                                                    }`}
                                            >
                                                {isRegistering ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                                {isRegistering ? i18n.t('features:competitions.detail.registering') : i18n.t('features:competitions.detail.registerNow')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Segmented Tabs ─── */}
                    <div className="mb-8 flex justify-start">
                        <div className="bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-1.5 flex overflow-x-auto scrollbar-hide gap-1 shadow-inner max-w-full w-full sm:w-auto">
                            {[
                                { id: 'info', label: i18n.t('features:competitions.detail.tabIntro'), icon: Info },
                                { id: 'rules', label: i18n.t('features:competitions.detail.tabRules'), icon: FileText },
                                { id: 'prizes', label: i18n.t('features:competitions.detail.tabPrizes'), icon: Award },
                                { id: 'teams', label: i18n.t('features:competitions.detail.tabTeams'), icon: List, hidden: competition.currentParticipants === 0 },
                            ].map((tab) => !tab.hidden && (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap flex-1 sm:flex-none ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── Main Grid Layout ─── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* Left: Content Area */}
                        <div className="xl:col-span-8 min-h-[400px]">
                            <div
                                key={activeTab}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                            >
                                {activeTab === 'info' && (
                                    <div className="space-y-6 md:space-y-8">
                                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.5rem] p-6 md:p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                                            <div
                                                className="prose dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-2xl prose-img:shadow-md dark:[&_span]:!text-slate-300 dark:[&_p]:!text-slate-300 dark:[&_li]:!text-slate-300 dark:[&_h1]:!text-white dark:[&_h2]:!text-white dark:[&_h3]:!text-white dark:[&_h4]:!text-white"
                                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(competition.content || competition.summary || competition.description || i18n.t('features:competitions.detail.contentUpdating')) }}
                                            />
                                        </div>

                                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.5rem] p-6 md:p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                                                    <Zap size={20} strokeWidth={2.5} />
                                                </div>
                                                {i18n.t('features:competitions.detail.timeline')}
                                            </h3>
                                            <div className="pl-2">
                                                {competition.timeline && competition.timeline.length > 0 ? (
                                                    competition.timeline.map((event, idx) => (
                                                        <TimelineItem
                                                            key={event.id || idx}
                                                            event={event}
                                                            isLast={idx === competition.timeline!.length - 1}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                        <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                                        <p className="text-slate-500 font-medium">{i18n.t('features:competitions.detail.timelineEmpty')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'rules' && (
                                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.5rem] p-6 md:p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                                                <FileText size={20} strokeWidth={2.5} />
                                            </div>
                                            {i18n.t('features:competitions.detail.rulesTitle')}
                                        </h3>
                                        <div
                                            className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 prose-headings:font-bold prose-ul:marker:text-blue-500 dark:[&_span]:!text-slate-300 dark:[&_p]:!text-slate-300 dark:[&_li]:!text-slate-300 dark:[&_h1]:!text-white dark:[&_h2]:!text-white dark:[&_h3]:!text-white dark:[&_h4]:!text-white"
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(competition.rules || i18n.t('features:competitions.detail.rulesEmpty')) }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'prizes' && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {competition.prizes && competition.prizes.length > 0 ? (
                                            competition.prizes.map((prize, idx) => (
                                                <PrizeCard key={idx} prize={prize} index={idx} />
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-700">
                                                <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">{i18n.t('features:competitions.detail.prizesSettingUp')}</p>
                                                <p className="text-sm text-slate-500">{i18n.t('features:competitions.detail.prizesComingSoon')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Sidebar Panel */}
                        <div className="xl:col-span-4 space-y-6">

                            {/* Registration Stats Bento */}
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.5rem] p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-sm xl:sticky xl:top-24">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5 text-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Info size={16} strokeWidth={2.5} />
                                    </div>
                                    {i18n.t('features:competitions.detail.registrationInfo')}
                                </h4>

                                <div className="space-y-6 mb-6">
                                    {/* Deadline */}
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-2.5">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{i18n.t('features:competitions.detail.deadline')}</span>
                                            <span className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md">{formatDateVN(competition.registrationDeadline)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            {/* Fake timeline progress for visual only */}
                                            <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 w-3/4 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Participants */}
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-2.5">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{i18n.t('features:competitions.detail.enrolled')}</span>
                                            <span className="font-black text-slate-900 dark:text-white text-base">
                                                {competition.currentParticipants} <span className="text-slate-400 text-sm font-medium">/ {competition.maxParticipants || '∞'}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner relative">
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-[width] duration-1000 ease-out"
                                                style={{ width: `${Math.min(((competition.currentParticipants || 0) / (competition.maxParticipants || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-relaxed flex gap-3">
                                        <MonitorPlay size={20} className="shrink-0 text-blue-500 mt-0.5" />
                                        <span>{i18n.t('features:competitions.detail.prepareReminder')}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Exam Direct Link Card */}
                            {competition.examId && (
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] p-1 relative overflow-hidden shadow-lg shadow-indigo-500/20 xl:sticky xl:top-[380px]">
                                    {/* Animated background elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />

                                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 h-full relative z-10">
                                        <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2.5 text-lg">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <GraduationCap size={18} strokeWidth={2.5} />
                                            </div>
                                            {i18n.t('features:competitions.detail.examRoom')}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium line-clamp-2">
                                            {competition.examTitle || i18n.t('features:competitions.detail.examTitle', { id: competition.examId })}
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => navigate(`/exams/${competition.examId}?competitionId=${competition.id}`)}
                                                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                                            >
                                                <GraduationCap size={18} className="group-hover:scale-110 transition-transform" /> {i18n.t('features:competitions.detail.enterExam')}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/exams/${competition.examId}/preview`)}
                                                className="w-full py-3 rounded-xl font-bold text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye size={16} /> {i18n.t('features:competitions.detail.viewStructure')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover preview modal instance */}
                    {previewItem && (
                        <UserPreviewCard
                            author={previewItem}
                            isVisible={showPreview}
                            position={previewPosition}
                            onMouseEnter={handlePreviewMouseEnter}
                            onMouseLeave={handlePreviewMouseLeave}
                        />
                    )}
                </div>{/* end panel */}
            </div>

            {/* ─── Mobile Sticky Bottom Action Bar ─── */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 z-40 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">{i18n.t('features:competitions.detail.deadlineShort')}</p>
                    <p className="text-sm font-bold text-rose-500">{format(new Date(competition.registrationDeadline || ''), 'dd/MM/yyyy')}</p>
                </div>
                {competition.isRegistered ? (
                    <button className="px-5 py-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default">
                        <CheckCircle2 size={18} /> {i18n.t('features:competitions.detail.participated')}
                    </button>
                ) : (
                    <button
                        onClick={handleRegister}
                        disabled={isEnded || isRegistering}
                        className={`px-8 py-3.5 rounded-xl font-extrabold text-sm text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${isEnded ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_4px_15px_rgba(79,70,229,0.3)]'
                            }`}
                    >
                        {isRegistering ? <Loader2 className="animate-spin" size={18} /> : i18n.t('features:competitions.detail.registerExam')}
                    </button>
                )}
            </div>

            {/* Hidden Modals */}
            <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} title={i18n.t('features:competitions.detail.deleteTitle')} message={i18n.t('features:competitions.detail.deleteMsg', { title: competition?.title })} confirmText={i18n.t('features:competitions.detail.deleteConfirm')} variant="danger" />
            <EditCompetitionModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} competition={competition} onSuccess={() => { }} onUpdate={updateCompetition} />
        </div>
    );
};