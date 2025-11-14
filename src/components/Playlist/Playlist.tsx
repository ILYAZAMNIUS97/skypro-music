'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Track } from '../Track/Track';
import { PlaylistSkeleton } from '../PlaylistSkeleton';
import styles from './Playlist.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, fetchTracks, setPlaylist } from '@/store/playerSlice';
import { type Track as TrackType } from '@/types/track';

interface PlaylistProps {
  initialTracks?: TrackType[];
  errorMessage?: string | null;
}

/**
 * Сравнивает два массива треков по содержимому
 * Использует trackId для сравнения, если доступен, иначе сравнивает по ключевым полям
 */
function areTracksEqual(
  tracks1: TrackType[] | undefined,
  tracks2: TrackType[] | undefined,
): boolean {
  if (tracks1 === tracks2) return true;
  if (!tracks1 || !tracks2) return false;
  if (tracks1.length !== tracks2.length) return false;

  for (let i = 0; i < tracks1.length; i++) {
    const track1 = tracks1[i];
    const track2 = tracks2[i];

    // Сравнение по trackId, если доступен
    if (track1.trackId && track2.trackId) {
      if (track1.trackId !== track2.trackId) return false;
      continue;
    }

    // Сравнение по ключевым полям, если trackId отсутствует
    if (
      track1.title !== track2.title ||
      track1.author !== track2.author ||
      track1.album !== track2.album ||
      track1.time !== track2.time
    ) {
      return false;
    }
  }

  return true;
}

export const Playlist = ({ initialTracks, errorMessage }: PlaylistProps) => {
  const dispatch = useAppDispatch();
  const { playlist, isLoading, error } = useAppSelector(
    (state) => state.player,
  );
  const previousInitialTracks = useRef<TrackType[] | undefined>(undefined);
  const hasInitialTracksProp = initialTracks !== undefined;

  useEffect(() => {
    if (!hasInitialTracksProp) {
      previousInitialTracks.current = undefined;
      return;
    }

    if (!areTracksEqual(previousInitialTracks.current, initialTracks)) {
      dispatch(clearError());
      dispatch(setPlaylist(initialTracks ?? []));
      previousInitialTracks.current = initialTracks;
    }
  }, [dispatch, hasInitialTracksProp, initialTracks]);

  useEffect(() => {
    if (!hasInitialTracksProp && playlist.length === 0) {
      dispatch(fetchTracks());
    }
  }, [dispatch, hasInitialTracksProp, playlist.length]);

  // Мемоизируем вычисления для отображения
  const displayLoading = useMemo(
    () => !hasInitialTracksProp && isLoading,
    [hasInitialTracksProp, isLoading],
  );
  const displayError = useMemo(
    () => errorMessage ?? (hasInitialTracksProp ? null : error),
    [errorMessage, hasInitialTracksProp, error],
  );
  const tracksToRender = useMemo(
    () => (hasInitialTracksProp ? (initialTracks ?? []) : playlist),
    [hasInitialTracksProp, initialTracks, playlist],
  );

  if (displayLoading) {
    return <PlaylistSkeleton count={10} />;
  }

  if (displayError) {
    return (
      <div className={styles.content}>
        <div className={styles.errorMessage}>
          {displayError}
          {!hasInitialTracksProp && (
            <button
              onClick={() => dispatch(fetchTracks())}
              className={styles.retryButton}
            >
              Повторить
            </button>
          )}
          {hasInitialTracksProp && errorMessage && (
            <button
              onClick={() => {
                // Для страницы избранного нужно перезагрузить данные
                // Это будет обработано родительским компонентом через событие
                window.dispatchEvent(new Event('refetch-favorites'));
              }}
              className={styles.retryButton}
            >
              Повторить
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.contentTitle}>
        <div className={styles.playlistTitleCol01}>Трек</div>
        <div className={styles.playlistTitleCol02}>Исполнитель</div>
        <div className={styles.playlistTitleCol03}>Альбом</div>
        <div className={styles.playlistTitleCol04}>
          <svg className={styles.playlistTitleSvg}>
            <use href="/img/icon/sprite.svg#icon-watch"></use>
          </svg>
        </div>
      </div>
      <div className={styles.contentPlaylist}>
        {tracksToRender.length > 0 ? (
          tracksToRender.map((track, index) => (
            <Track key={track.trackId || index} track={track} />
          ))
        ) : (
          <div className={styles.emptyMessage}>
            Треки не найдены. Попробуйте обновить страницу.
          </div>
        )}
      </div>
    </div>
  );
};
