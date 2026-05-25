
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';
import { Logo } from '../ui/Logo';
import i18n from '@/i18n';

export const Footer = () => {
    return (
        <footer className="relative bg-white dark:bg-humg-dark-surface border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">

            {/* ── Campus Banner ── */}
            <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
                <img
                    src="/assets/campus-banner.jpg"
                    alt={i18n.t('common:footer.campusAlt')}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
                {/* Color tint to match branding */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855]/30 via-[#002855]/10 to-white dark:to-humg-dark-surface" />
                {/* Bottom fade into footer bg */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white via-white/80 dark:from-humg-dark-surface dark:via-humg-dark-surface/80 to-transparent" />
            </div>

            <div className="container mx-auto px-4 md:px-6 pt-10 pb-20 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
                    {/* Brand & Socials (Col 1 - Span 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Logo className="h-10" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {i18n.t('common:footer.description')}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.facebook.com/61586595247041" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-[transform,background-color,color] transform hover:scale-110">
                                <ExternalLink size={20} />
                            </a>
                            <a href="mailto: support-olympic@humg.edu.vn" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-[transform,background-color,color] transform hover:scale-110">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links (Col 2) */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">{i18n.t('common:footer.links')}</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link to="/" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:breadcrumb.home')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/about-us" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:footer.aboutUs')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/news" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:footer.newsEvents')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/competitions" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:breadcrumb.competitions')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/rankings" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:breadcrumb.rankings')}
                                </Link>
                            </li>
                        </ul>
                    </div>


                    {/* Resources (Col 3 - Span 2) */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">{i18n.t('common:footer.resourcesTitle')}</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link to="/exams" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:breadcrumb.exams')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/resources" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:footer.library')}
                                </Link>
                            </li>
                            <li>
                                <a href="https://zalo.me/g/gsymgv565" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:footer.zalo')} <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>
                                <Link to="/forum" className="inline-block hover:text-humg-blue dark:hover:text-blue-400 transition-[transform,color] hover:translate-x-1">
                                    {i18n.t('common:breadcrumb.forum')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact (Col 4 - Span 4) */}
                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">{i18n.t('common:footer.contactHelp')}</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="shrink-0 text-slate-400 mt-0.5" />
                                <span>{i18n.t('common:footer.address')}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="shrink-0 text-slate-400" />
                                <a href="mailto: support-olympic@humg.edu.vn" className="hover:text-humg-blue transition-colors"> support-olympic@humg.edu.vn</a>
                            </li>
                            <li className="pt-4 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 -mx-4 px-4 py-4 rounded-xl mt-4 border dark:border-blue-800/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
                                <p className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-humg-blue dark:bg-blue-400 animate-pulse" />
                                    {i18n.t('common:footer.onlineSupport')}
                                </p>
                                <div className="flex flex-col gap-2 relative z-10">
                                    <a href="https://www.facebook.com/61586595247041" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-humg-blue dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                        <ExternalLink size={16} /> {i18n.t('common:footer.contactAdmin')}
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-500">
                    <p className="flex items-center gap-1.5 font-medium">
                        © 2026 Olympic HUMG.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-humg-blue dark:hover:text-blue-400 transition-colors">{i18n.t('common:footer.privacy')}</Link>
                        <Link to="/terms" className="hover:text-humg-blue dark:hover:text-blue-400 transition-colors">{i18n.t('common:footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
