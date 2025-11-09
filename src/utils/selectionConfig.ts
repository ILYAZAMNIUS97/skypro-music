import { type SelectionConfigMap } from '@/types/selection';

export const SELECTIONS_CONFIG: SelectionConfigMap = {
  daily: {
    id: 2,
    title: 'Плейлист дня',
    description: 'Ваш ежедневный набор треков для отличного настроения.',
    imageSrc: '/img/playlist01.png',
    imageAlt: 'Обложка подборки «Плейлист дня»',
  },
  dance: {
    id: 3,
    title: '100 танцевальных хитов',
    description: 'Набор энергичных треков, чтобы не оставаться на месте.',
    imageSrc: '/img/playlist02.png',
    imageAlt: 'Обложка подборки «100 танцевальных хитов»',
  },
  indie: {
    id: 4,
    title: 'Инди-заряд',
    description: 'Подборка инди-композиций для вдохновения и релакса.',
    imageSrc: '/img/playlist03.png',
    imageAlt: 'Обложка подборки «Инди-заряд»',
  },
} as const;
