import { useState } from 'react';
import { ModalShell } from './ModalShell';
import i18n from '@/i18n';

interface AdminBulkUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    selectedCount: number;
}

export const AdminBulkUpdateModal = ({ isOpen, onClose, onSubmit, isSubmitting, selectedCount }: AdminBulkUpdateModalProps) => {
    const [payload, setPayload] = useState('{"name":""}');

    return (
        <ModalShell isOpen={isOpen} title={i18n.t('dashboard:admin.bulkUpdate.title')} onClose={onClose}>
            <div className="text-xs text-slate-500">{i18n.t('dashboard:admin.bulkUpdate.selectedCount', { count: selectedCount })}</div>
            <textarea
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                placeholder={i18n.t('dashboard:admin.bulkUpdate.placeholder')}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
            />
            <button
                disabled={isSubmitting}
                onClick={async () => {
                    const data = JSON.parse(payload || '{}');
                    await onSubmit(data);
                    onClose();
                }}
                className="w-full py-3.5 bg-humg-blue text-white font-bold rounded-xl shadow-lg shadow-humg-blue/20 hover:bg-blue-700 disabled:opacity-60"
            >
                {isSubmitting ? i18n.t('dashboard:admin.bulkUpdate.updating') : i18n.t('dashboard:admin.bulkUpdate.submit')}
            </button>
        </ModalShell>
    );
};
