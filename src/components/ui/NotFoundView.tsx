import { useNavigate } from 'react-router-dom';
import { Map, ArrowLeft, Home } from 'lucide-react';
import i18n from '@/i18n';

interface NotFoundViewProps {
    pageName?: string;
    onHomeClick?: () => void;
}

export const NotFoundView = ({ pageName, onHomeClick }: NotFoundViewProps) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (onHomeClick) {
            onHomeClick();
        } else {
            navigate('/');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans">
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 px-8 py-14 sm:px-14 max-w-lg w-full mx-auto">
                <div className="text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative group">
                        <Map size={48} className="text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                    </div>

                    <p className="text-8xl md:text-9xl font-black text-humg-blue/20 dark:text-blue-400/15 leading-none mb-4 select-none">
                        404
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
                        {i18n.t('common:notFound.title')}
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-base leading-relaxed">
                        {i18n.t('common:notFound.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={handleGoBack}
                            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            {i18n.t('common:notFound.goBack')}
                        </button>

                        <button
                            onClick={handleGoHome}
                            className="px-6 py-3 bg-humg-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-[background-color,box-shadow] shadow-lg shadow-humg-blue/25 hover:shadow-humg-blue/40 flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            {i18n.t('common:notFound.goHome')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};