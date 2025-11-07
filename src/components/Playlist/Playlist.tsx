'use client';

import { useEffect } from 'react';
import { Track } from '../Track/Track';
import styles from './Playlist.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTracks } from '@/store/playerSlice';

export const Playlist = () => {
  const dispatch = useAppDispatch();
  const { playlist, isLoading, error } = useAppSelector(
    (state) => state.player,
  );

  // Загружаем треки при монтировании компонента
  useEffect(() => {
    if (playlist.length === 0) {
      dispatch(fetchTracks());
    }
  }, [dispatch, playlist.length]);

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.loadingMessage}>Загрузка треков...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.errorMessage}>
          Ошибка: {error}
          <button
            onClick={() => dispatch(fetchTracks())}
            className={styles.retryButton}
          >
            Повторить
          </button>
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
        {playlist.length > 0 ? (
          playlist.map((track, index) => (
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
