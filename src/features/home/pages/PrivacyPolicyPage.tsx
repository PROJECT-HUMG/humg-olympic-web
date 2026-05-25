import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import i18n from '@/i18n';

export const PrivacyPolicyPage = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            <div className="max-w-3xl mx-auto px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-humg-blue dark:hover:text-blue-400 mb-8 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> {i18n.t('static:backToHome')}
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                    {/* ── Header ── */}
                    <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.title')}</h1>
                        <p className="text-sm text-slate-500">{i18n.t('static:privacy.effectiveDate')}</p>
                    </div>

                    {/* ── Intro ── */}
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-10">
                        {i18n.t('static:privacy.intro')}
                    </p>

                    {/* ── Main Content ── */}
                    <div className="space-y-10 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.s1Title')}</h2>
                            <p className="mb-3">{i18n.t('static:privacy.s1Intro')}</p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s1Item1') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s1Item2') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s1Item3') }} />
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.s2Title')}</h2>
                            <p className="mb-3">{i18n.t('static:privacy.s2Intro')}</p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li>{i18n.t('static:privacy.s2Item1')}</li>
                                <li>{i18n.t('static:privacy.s2Item2')}</li>
                                <li>{i18n.t('static:privacy.s2Item3')}</li>
                                <li>{i18n.t('static:privacy.s2Item4')}</li>
                            </ul>

                            <p className="mt-4 font-semibold text-slate-900 dark:text-white">{i18n.t('static:privacy.s2AuthTitle')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li>{i18n.t('static:privacy.s2AuthItem1')}</li>
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s2AuthItem2') }} />
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.s3Title')}</h2>
                            <p className="mb-3">{i18n.t('static:privacy.s3Intro')}</p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li>{i18n.t('static:privacy.s3Item1')}</li>
                                <li>{i18n.t('static:privacy.s3Item2')}</li>
                                <li>{i18n.t('static:privacy.s3Item3')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.s4Title')}</h2>
                            <ul className="list-disc pl-5 space-y-3">
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s4Item1') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s4Item2') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s4Item3') }} />
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:privacy.s5Title')}</h2>
                            <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: i18n.t('static:privacy.s5Content') }} />
                        </section>
                    </div>

                    {/* ── Footer ── */}
                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            {i18n.t('static:privacy.footer')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                            {i18n.t('static:contactLabel')}
                            <a href="mailto:support-olympic@humg.edu.vn" className="inline-flex items-center gap-1.5 text-humg-blue dark:text-blue-400 hover:text-blue-600 hover:underline font-medium transition-colors">
                                <Mail size={16} /> support-olympic@humg.edu.vn
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
