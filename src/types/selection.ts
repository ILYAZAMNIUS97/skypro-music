export type SelectionSlug = 'daily' | 'dance' | 'indie';

export interface SelectionConfig {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export type SelectionConfigMap = Record<SelectionSlug, SelectionConfig>;

export interface SelectionPageParams {
  slug: SelectionSlug;
}
