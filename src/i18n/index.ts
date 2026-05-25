import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viErrors from './vi/errors.json';
import enErrors from './en/errors.json';
import viCommon from './vi/common.json';
import enCommon from './en/common.json';
import viAuth from './vi/auth.json';
import enAuth from './en/auth.json';
import viSettings from './vi/settings.json';
import enSettings from './en/settings.json';
import viForum from './vi/forum.json';
import enForum from './en/forum.json';
import viNews from './vi/news.json';
import enNews from './en/news.json';
import viDashboard from './vi/dashboard.json';
import enDashboard from './en/dashboard.json';
import viFeatures from './vi/features.json';
import enFeatures from './en/features.json';
import viExams from './vi/exams.json';
import enExams from './en/exams.json';
import viResources from './vi/resources.json';
import enResources from './en/resources.json';
import viProfile from './vi/profile.json';
import enProfile from './en/profile.json';
import viRoadmap from './vi/roadmap.json';
import enRoadmap from './en/roadmap.json';
import viRanking from './vi/ranking.json';
import enRanking from './en/ranking.json';
import viStatic from './vi/static.json';
import enStatic from './en/static.json';

const STORAGE_KEY = 'app_language';

const savedLanguage = localStorage.getItem(STORAGE_KEY) || 'vi';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            vi: { errors: viErrors, common: viCommon, auth: viAuth, settings: viSettings, forum: viForum, news: viNews, dashboard: viDashboard, features: viFeatures, exams: viExams, resources: viResources, profile: viProfile, roadmap: viRoadmap, ranking: viRanking, static: viStatic },
            en: { errors: enErrors, common: enCommon, auth: enAuth, settings: enSettings, forum: enForum, news: enNews, dashboard: enDashboard, features: enFeatures, exams: enExams, resources: enResources, profile: enProfile, roadmap: enRoadmap, ranking: enRanking, static: enStatic },
        },
        lng: savedLanguage,
        fallbackLng: 'vi',
        defaultNS: 'common',
        ns: ['common', 'errors', 'auth', 'settings', 'forum', 'news', 'dashboard', 'features', 'exams', 'resources', 'profile', 'roadmap', 'ranking', 'static'],
        interpolation: { escapeValue: false },
    });

export default i18n;
