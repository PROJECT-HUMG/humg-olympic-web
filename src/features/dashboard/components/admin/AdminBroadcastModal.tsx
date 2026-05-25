import { useState, useTransition } from 'react';
import { Megaphone, Send, Mail, Loader2, AlertCircle } from 'lucide-react';
import { ModalShell } from './ModalShell';
import i18n from '@/i18n';

interface AdminBroadcastModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; message: string; sendEmail: boolean }) => Promise<void>;
}

export const AdminBroadcastModal = ({ isOpen, onClose, onSubmit }: AdminBroadcastModalProps) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sendEmail, setSendEmail] = useState(false);
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

    const validate = () => {
        const errs: { title?: string; message?: string } = {};
        if (!title.trim()) errs.title = i18n.t('dashboard:admin.broadcast.titleRequired');
        else if (title.length > 200) errs.title = i18n.t('dashboard:admin.broadcast.titleMaxLength');
        if (!message.trim()) errs.message = i18n.t('dashboard:admin.broadcast.messageRequired');
        else if (message.length > 1000) errs.message = i18n.t('dashboard:admin.broadcast.messageMaxLength');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        startSubmitTransition(async () => {
            await onSubmit({ title: title.trim(), message: message.trim(), sendEmail });
            setTitle('');
            setMessage('');
            setSendEmail(false);
            setErrors({});
            onClose();
        });
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setTitle('');
        setMessage('');
        setSendEmail(false);
        setErrors({});
        onClose();
    };

    return (
        <ModalShell isOpen={isOpen} title={i18n.t('dashboard:admin.broadcast.title')} onClose={handleClose}>
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <Megaphone size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    {i18n.t('dashboard:admin.broadcast.infoBanner').split('<1>')[0]}<span className="font-bold">{i18n.t('dashboard:admin.broadcast.infoBanner').match(/<1>(.*?)<\/1>/)?.[1]}</span>{i18n.t('dashboard:admin.broadcast.infoBanner').split('</1>')[1]}
                    Notification type: <code className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-800/50 font-mono">SYSTEM</code>
                </p>
            </div>

            {/* Title */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {i18n.t('dashboard:admin.broadcast.titleLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
                    placeholder={i18n.t('dashboard:admin.broadcast.titlePlaceholder')}
                    maxLength={200}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors
                        bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${errors.title ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
                <div className="flex justify-between mt-1.5">
                    {errors.title ? (
                        <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.title}</span>
                    ) : <span />}
                    <span className={`text-[10px] ${title.length > 180 ? 'text-amber-500' : 'text-slate-400'}`}>{title.length}/200</span>
                </div>
            </div>

            {/* Message */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {i18n.t('dashboard:admin.broadcast.messageLabel')} <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(p => ({ ...p, message: undefined })); }}
                    placeholder={i18n.t('dashboard:admin.broadcast.messagePlaceholder')}
                    rows={5}
                    maxLength={1000}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors resize-none
                        bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${errors.message ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
                <div className="flex justify-between mt-1.5">
                    {errors.message ? (
                        <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.message}</span>
                    ) : <span />}
                    <span className={`text-[10px] ${message.length > 900 ? 'text-amber-500' : 'text-slate-400'}`}>{message.length}/1000</span>
                </div>
            </div>

            {/* Send Email Toggle */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none">
                <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{i18n.t('dashboard:admin.broadcast.sendEmail')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 ml-6">
                        {i18n.t('dashboard:admin.broadcast.sendEmailDesc')}
                    </p>
                </div>
            </label>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
                {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> {i18n.t('dashboard:admin.broadcast.sending')}</>
                ) : (
                    <><Send size={16} /> {i18n.t('dashboard:admin.broadcast.send')}</>
                )}
            </button>
        </ModalShell>
    );
};
