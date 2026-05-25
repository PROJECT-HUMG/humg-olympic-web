
import { Hero } from './Hero';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';

import { RankingSection } from './RankingSection';
import { FAQSection } from './FAQSection';
import { LandingAmbientBackground } from './LandingAmbientBackground';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import i18n from '@/i18n';


export const GuestHomeView = () => {
    return (
        <div className="min-h-screen pb-20 transition-colors duration-300 font-sans relative overflow-hidden">

            <div className="relative z-0">
                <Hero />
            </div>

            {/* ── Shared ambient blobs for all sections below Hero ── */}
            <div className="relative z-10">
                <LandingAmbientBackground />

                <ErrorBoundary fallbackTitle={i18n.t('features:landing.guestView.errorRanking')}>
                    <RankingSection />
                </ErrorBoundary>

                <ErrorBoundary fallbackTitle={i18n.t('features:landing.guestView.errorFeatures')}>
                    <FeaturesSection />
                </ErrorBoundary>

                <ErrorBoundary fallbackTitle={i18n.t('features:landing.guestView.errorStats')}>
                    <StatsSection />
                </ErrorBoundary>

                <ErrorBoundary fallbackTitle={i18n.t('features:landing.guestView.errorFaq')}>
                    <FAQSection />
                </ErrorBoundary>
            </div>

        </div>
    );
};