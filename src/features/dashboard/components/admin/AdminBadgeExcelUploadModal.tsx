import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import i18n from '@/i18n';

import { useBadgeRequests } from '@/features/badges/hooks/useBadgeRequests';
import { BulkGrantBadgeResult } from '@/features/badges/types/userBadge.types';

interface AdminBadgeExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AdminBadgeExcelUploadModal = ({
    isOpen,
    onClose,
    onSuccess,
}: AdminBadgeExcelUploadModalProps) => {
    const { bulkGrantBadges, isSubmitting } = useBadgeRequests();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [badgeType, setBadgeType] = useState<'SCHOOL' | 'NATIONAL'>('SCHOOL');
    const [result, setResult] = useState<BulkGrantBadgeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setSelectedFile(null);
        setBadgeType('SCHOOL');
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetState();
            onClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setError(i18n.t('dashboard:admin.excelUpload.invalidFile'));
                return;
            }
            setSelectedFile(file);
            setError(null);
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError(i18n.t('dashboard:admin.excelUpload.selectFile'));
            return;
        }

        setError(null);
        const uploadResult = await bulkGrantBadges(selectedFile, badgeType);

        if (uploadResult) {
            setResult(uploadResult);
            if (uploadResult.failedCount === 0 && onSuccess) {
                onSuccess();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div
                className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {i18n.t('dashboard:admin.excelUpload.title')}
                        </h3>
                    </div>
                    {!isSubmitting && (
                        <button
                            onClick={handleClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Badge Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('dashboard:admin.excelUpload.badgeTypeLabel')}
                        </label>
                        <div className="flex gap-3">
                            {(['SCHOOL', 'NATIONAL'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setBadgeType(type)}
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${badgeType === type
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                        }`}
                                >
                                    {type === 'SCHOOL' ? i18n.t('dashboard:admin.excelUpload.badgeTypeSchool') : i18n.t('dashboard:admin.excelUpload.badgeTypeNational')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {i18n.t('dashboard:admin.excelUpload.fileLabel')}
                        </label>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx,.xls"
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <FileSpreadsheet size={24} className="text-emerald-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                {!isSubmitting && (
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setResult(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="p-1 hover:bg-red-100 rounded text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                            >
                                <Upload size={32} className="text-slate-400" />
                                <span className="text-sm font-medium text-slate-500">
                                    {i18n.t('dashboard:admin.excelUpload.clickToSelect')}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {i18n.t('dashboard:admin.excelUpload.fileFormats')}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Excel Format Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            {i18n.t('dashboard:admin.excelUpload.formatTitle')}
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col1')}</strong> {i18n.t('dashboard:admin.excelUpload.col1Desc')}</li>
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col2')}</strong> {i18n.t('dashboard:admin.excelUpload.col2Desc')}</li>
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col3')}</strong> {i18n.t('dashboard:admin.excelUpload.col3Desc')}</li>
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col4')}</strong> {i18n.t('dashboard:admin.excelUpload.col4Desc')}</li>
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col5')}</strong> {i18n.t('dashboard:admin.excelUpload.col5Desc')}</li>
                            <li>• <strong>{i18n.t('dashboard:admin.excelUpload.col6')}</strong> {i18n.t('dashboard:admin.excelUpload.col6Desc')}</li>
                        </ul>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-xl border ${result.failedCount === 0
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={18} className={result.failedCount === 0 ? 'text-emerald-500' : 'text-amber-500'} />
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {i18n.t('dashboard:admin.excelUpload.resultTitle')}
                                </span>
                            </div>
                            <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                                <p>{i18n.t('dashboard:admin.excelUpload.totalRows')} <strong>{result.totalRows}</strong></p>
                                <p className="text-emerald-600">{i18n.t('dashboard:admin.excelUpload.successCount')} <strong>{result.successCount}</strong></p>
                                {result.failedCount > 0 && (
                                    <p className="text-red-600">{i18n.t('dashboard:admin.excelUpload.failedCount')} <strong>{result.failedCount}</strong></p>
                                )}
                            </div>
                            {result.errors.length > 0 && (
                                <div className="mt-3 max-h-32 overflow-y-auto">
                                    <p className="text-xs font-semibold text-red-600 mb-1">{i18n.t('dashboard:admin.excelUpload.errors')}</p>
                                    <ul className="text-xs text-red-500 space-y-0.5">
                                        {result.errors.map((err, idx) => (
                                            <li key={idx}>• {err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {result ? i18n.t('dashboard:admin.close') : i18n.t('dashboard:admin.cancel')}
                    </button>
                    {!result && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedFile}
                            className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {i18n.t('dashboard:admin.processing')}
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    {i18n.t('dashboard:admin.excelUpload.upload')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};
