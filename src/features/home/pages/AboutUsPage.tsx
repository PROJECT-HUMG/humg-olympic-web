import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import i18n from '@/i18n';

/* ── Team Data ── */
const getTeam = () => [
    {
        name: "TS. Lê Bích Phượng",
        role: i18n.t('static:about.member1Role'),
        description: i18n.t('static:about.member1Desc'),
        email: "lebichphuong@humg.edu.vn",
    },
    {
        name: "Hoàng Long",
        role: i18n.t('static:about.member2Role'),
        description: i18n.t('static:about.member2Desc'),
        email: "nghlong3004@gmail.com",
    },
    {
        name: "Phạm Phượng",
        role: i18n.t('static:about.member3Role'),
        description: i18n.t('static:about.member3Desc'),
        email: "pp2042004@gmail.com",
    },
];

/* ── Page ── */
export const AboutUsPage = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const team = getTeam();

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300 font-sans relative overflow-hidden">
            <div className="max-w-3xl mx-auto px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-humg-blue dark:hover:text-blue-400 mb-8 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> {i18n.t('static:backToHome')}
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                    {/* ── Header ── */}
                    <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">{i18n.t('static:about.title')}</h1>
                        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                            {i18n.t('static:about.subtitle')}
                        </p>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="space-y-10 text-slate-700 dark:text-slate-300 text-base leading-relaxed">

                        {/* ── What ── */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:about.whatTitle')}</h2>
                            <p>{i18n.t('static:about.whatContent')}</p>
                        </section>

                        {/* ── Why ── */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:about.whyTitle')}</h2>
                            <p className="mb-3">{i18n.t('static:about.whyContent1')}</p>
                            <p>{i18n.t('static:about.whyContent2')}</p>
                        </section>

                        {/* ── Commitments ── */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{i18n.t('static:about.commitTitle')}</h2>
                            <ul className="list-disc pl-5 space-y-3">
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:about.commitItem1') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:about.commitItem2') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:about.commitItem3') }} />
                                <li dangerouslySetInnerHTML={{ __html: i18n.t('static:about.commitItem4') }} />
                            </ul>
                        </section>

                        {/* ── Team ── */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">{i18n.t('static:about.teamTitle')}</h2>
                            <div className="space-y-5">
                                {team.map((member) => (
                                    <div
                                        key={member.email}
                                        className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                    >
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{member.name}</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{member.role}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{member.description}</p>
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 mt-3 text-sm text-humg-blue dark:text-blue-400 hover:underline">
                                                <Mail size={14} /> {member.email}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ── Footer ── */}
                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            {i18n.t('static:about.footer')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                            {i18n.t('static:about.contactLabel')}
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

export default AboutUsPage;
