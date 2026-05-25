
import { FileText, FileImage, FileCode, File, Presentation, LucideIcon } from 'lucide-react';

interface FileConfig {
    color: string;
    icon: LucideIcon;
    bg: string;
    accent: string;
    label: string;
}

const FILE_CONFIG: Record<string, FileConfig> = {
    PDF: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', accent: 'from-red-500 to-rose-500', icon: FileText, label: 'PDF' },
    DOCX: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', accent: 'from-blue-500 to-indigo-500', icon: FileText, label: 'DOCX' },
    DOC: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', accent: 'from-blue-500 to-indigo-500', icon: FileText, label: 'DOC' },
    PPTX: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', accent: 'from-orange-500 to-amber-500', icon: Presentation, label: 'PPTX' },
    PPT: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', accent: 'from-orange-500 to-amber-500', icon: Presentation, label: 'PPT' },
    XLSX: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', accent: 'from-emerald-500 to-green-500', icon: FileCode, label: 'XLSX' },
    XLS: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', accent: 'from-emerald-500 to-green-500', icon: FileCode, label: 'XLS' },
    ZIP: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', accent: 'from-amber-500 to-yellow-500', icon: FileCode, label: 'ZIP' },
    RAR: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', accent: 'from-amber-500 to-yellow-500', icon: FileCode, label: 'RAR' },
    PNG: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', accent: 'from-violet-500 to-purple-500', icon: FileImage, label: 'PNG' },
    JPG: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', accent: 'from-violet-500 to-purple-500', icon: FileImage, label: 'JPG' },
    JPEG: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', accent: 'from-violet-500 to-purple-500', icon: FileImage, label: 'JPEG' },
    DEFAULT: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', accent: 'from-slate-500 to-slate-600', icon: File, label: 'FILE' },
};

export const getFileConfig = (type: string): FileConfig => {
    return FILE_CONFIG[type?.toUpperCase()] || FILE_CONFIG.DEFAULT;
};

export const FileIcon = ({ type, className = "w-12 h-12", size = 24 }: { type: string; className?: string; size?: number }) => {
    const config = getFileConfig(type);
    const Icon = config.icon;

    return (
        <div className={`${className} rounded-xl ${config.bg} ${config.color} flex items-center justify-center relative overflow-hidden`}>
            <Icon size={size} className="relative z-10" />
        </div>
    );
};

/** A smaller badge-style file type indicator */
export const FileTypeBadge = ({ type }: { type: string }) => {
    const config = getFileConfig(type);
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
            {config.label}
        </span>
    );
};
