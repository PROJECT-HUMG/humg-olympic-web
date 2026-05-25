import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Share2, Link2, ExternalLink } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

interface ShareButtonProps {
    url?: string;
    title?: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export const ShareButton = ({ url, title, className = '', variant = 'icon' }: ShareButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const updatePosition = useCallback(() => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        const dropW = 208; // w-52 = 13rem = 208px
        const spaceBelow = window.innerHeight - r.bottom;
        const openAbove = spaceBelow < 180;

        setDropPos({
            top: openAbove ? r.top - 8 : r.bottom + 8,
            left: Math.min(r.right - dropW, window.innerWidth - dropW - 12),
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        updatePosition();
        const handleOutside = (e: MouseEvent) => {
            if (
                btnRef.current?.contains(e.target as Node) ||
                dropRef.current?.contains(e.target as Node)
            ) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        window.addEventListener('scroll', () => setIsOpen(false), { once: true });
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen, updatePosition]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast(i18n.t('common:linkCopied'), 'success');
        } catch {
            showToast(i18n.t('common:linkCopyFailed'), 'error');
        }
        setIsOpen(false);
    };

    const handleFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const handleNativeShare = async () => {
        try {
            await navigator.share({ title: shareTitle, url: shareUrl });
        } catch { /* user cancelled */ }
        setIsOpen(false);
    };

    const supportsNativeShare = typeof navigator.share === 'function';

    const dropdown = isOpen && dropPos ? ReactDOM.createPortal(
        <div
            ref={dropRef}
            style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, zIndex: 9999 }}
            className="w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <Link2 size={16} className="text-slate-400" /> {i18n.t('common:share.copyLink')}
            </button>
            <button
                onClick={handleFacebook}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <ExternalLink size={16} className="text-blue-600" /> {i18n.t('common:share.facebook')}
            </button>
            {supportsNativeShare && (
                <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700"
                >
                    <ExternalLink size={16} className="text-emerald-500" /> {i18n.t('common:share.other')}
                </button>
            )}
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                ref={btnRef}
                onClick={() => setIsOpen(!isOpen)}
                className={variant === 'full'
                    ? `flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-bold ${className}`
                    : `p-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 transition-colors ${className}`
                }
                title={i18n.t('common:share.title')}
            >
                <Share2 size={18} />
                {variant === 'full' && <span>{i18n.t('common:share.title')}</span>}
            </button>
            {dropdown}
        </>
    );
};
