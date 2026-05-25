import i18n from '@/i18n';

const t = (key: string) => i18n.t(`features:ai.suggestions.${key}`);

export const getDefaultSuggestions = () => [
  t('default1'),
  t('default2'),
  t('default3'),
  t('default4'),
];

export const getPageSpecificSuggestions = (): Record<string, string[]> => ({
  home: [t('home1'), t('home2'), t('home3'), t('home4')],
  competitions: [t('competitions1'), t('competitions2'), t('competitions3'), t('competitions4')],
  roadmap: [t('roadmap1'), t('roadmap2'), t('roadmap3'), t('roadmap4')],
  resources: [t('resources1'), t('resources2'), t('resources3'), t('resources4')],
  forum: [t('forum1'), t('forum2'), t('forum3')],
  profile: [t('profile1'), t('profile2'), t('profile3')],
});
