'use client';

import { useEffect, useRef } from 'react';
import { Track } from '../Track/Track';
import styles from './Playlist.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, fetchTracks, setPlaylist } from '@/store/playerSlice';
import { type Track as TrackType } from '@/types/track';

interface PlaylistProps {
  initialTracks?: TrackType[];
  errorMessage?: string | null;
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

    if (previousInitialTracks.current !== initialTracks) {
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

  const displayLoading = !hasInitialTracksProp && isLoading;
  const displayError = errorMessage ?? (hasInitialTracksProp ? null : error);
  const tracksToRender = hasInitialTracksProp
    ? (initialTracks ?? [])
    : playlist;

  if (displayLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.loadingMessage}>Загрузка треков...</div>
      </div>
    );
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
