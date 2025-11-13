'use client';

import { useEffect } from 'react';
import { MainContent } from '@/components/MainContent/MainContent';
import { PageTemplate } from '@/components/PageTemplate/PageTemplate';
import { useAppDispatch } from '@/store/hooks';
import { fetchTracks, setPlaylist } from '@/store/playerSlice';

export default function Home() {
  const dispatch = useAppDispatch();

  // Загрузка треков при монтировании компонента
  useEffect(() => {
    // Очищаем плейлист и загружаем все треки
    dispatch(setPlaylist([]));
    dispatch(fetchTracks());
  }, [dispatch]);

  return (
    <PageTemplate>
      <MainContent />
    </PageTemplate>
  );
}
