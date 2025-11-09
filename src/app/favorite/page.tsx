'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/PageTemplate/PageTemplate';
import { MainContent } from '@/components/MainContent/MainContent';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFavoriteTracks } from '@/store/tracksSlice';

export default function FavoritePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { favoriteTracks, isLoading, error } = useAppSelector(
    (state) => state.tracks,
  );

  // Проверка авторизации и редирект, если не авторизован
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  // Загрузка избранных треков при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavoriteTracks());
    }
  }, [dispatch, isAuthenticated]);

  // Если пользователь не авторизован, не показываем контент
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTemplate>
      <MainContent
        pageTitle="Мой плейлист"
        initialTracks={isLoading ? undefined : favoriteTracks}
        errorMessage={error}
      />
    </PageTemplate>
  );
}
