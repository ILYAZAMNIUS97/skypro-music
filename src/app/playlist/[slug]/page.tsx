import { notFound } from 'next/navigation';
import { PageTemplate } from '@/components/PageTemplate/PageTemplate';
import { MainContent } from '@/components/MainContent/MainContent';
import { tracksApi, transformApiTrack } from '@/utils/api';
import { SELECTIONS_CONFIG } from '@/utils/selectionConfig';
import {
  type SelectionPageParams,
  type SelectionSlug,
} from '@/types/selection';
import { type Track } from '@/types/track';

export async function generateStaticParams(): Promise<SelectionPageParams[]> {
  return (Object.keys(SELECTIONS_CONFIG) as SelectionSlug[]).map((slug) => ({
    slug,
  }));
}

interface PlaylistPageProps {
  params: SelectionPageParams;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const selectionConfig = SELECTIONS_CONFIG[params.slug];

  if (!selectionConfig) {
    notFound();
  }

  try {
    const selection = await tracksApi.getSelectionById(selectionConfig.id);

    const transformedTracks = selection.items
      .map(transformApiTrack)
      .filter((track): track is Track => track !== null);

    const pageTitle = selection.title ?? selectionConfig.title;

    return (
      <PageTemplate>
        <MainContent
          pageTitle={pageTitle}
          initialTracks={transformedTracks}
          errorMessage={null}
        />
      </PageTemplate>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка при загрузке подборки';

    return (
      <PageTemplate>
        <MainContent
          pageTitle={selectionConfig.title}
          initialTracks={[]}
          errorMessage={`Не удалось загрузить подборку: ${message}`}
        />
      </PageTemplate>
    );
  }
}
