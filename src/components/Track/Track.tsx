'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import styles from './Track.module.css';
import { type TrackProps } from '../../types/track';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { playTrackWithPlaylist } from '@/store/playerSlice';
import { useLikeTrack } from '@/hooks/useLikeTrack';

export const Track = ({ track }: TrackProps) => {
  const {
    trackId = '1',
    title,
    titleSpan,
    author,
    authorId = '1',
    album,
    albumId = '1',
    time,
    genre,
    src,
    isFavorite = false,
  } = track;

  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.player);
  const { toggleLike, isLike, isLoading, errorMsg } = useLikeTrack(track);

  // Проверяем, является ли этот трек текущим
  const isCurrentTrack = useMemo(
    () => state.currentTrack?.trackId === trackId,
    [state.currentTrack?.trackId, trackId],
  );
  const isPlaying = useMemo(
    () => state.isPlaying && isCurrentTrack,
    [state.isPlaying, isCurrentTrack],
  );

  // Мемоизируем данные трека для плеера
  const trackData = useMemo(
    () => ({
      title,
      titleSpan,
      author,
      album,
      time,
      genre,
      trackId,
      authorId,
      albumId,
      src,
      isFavorite,
    }),
    [
      title,
      titleSpan,
      author,
      album,
      time,
      genre,
      trackId,
      authorId,
      albumId,
      src,
      isFavorite,
    ],
  );

  // Обработчик клика по треку для воспроизведения
  const handleTrackClick = useCallback(() => {
    // Проверяем, что у трека есть аудиофайл
    if (src) {
      // Используем текущий плейлист из Redux
      dispatch(
        playTrackWithPlaylist({ track: trackData, playlist: state.playlist }),
      );
    } else {
      alert('Аудиофайл недоступен');
    }
  }, [src, dispatch, trackData, state.playlist]);

  // Обработчик для лайка/дизлайка
  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Предотвращаем клик по треку
      toggleLike();
    },
    [toggleLike],
  );

  // Мемоизируем title для кнопки лайка
  const likeButtonTitle = useMemo(
    () =>
      errorMsg || (isLike ? 'Убрать из избранного' : 'Добавить в избранное'),
    [errorMsg, isLike],
  );

  return (
    <div className={styles.playlistItem} data-genre={genre}>
      <div className={styles.playlistTrack}>
        <div className={styles.trackTitle}>
          <div className={styles.trackTitleImage}>
            {isCurrentTrack ? (
              <div
                className={cn(styles.currentTrackIndicator, {
                  [styles.playing]: isPlaying,
                })}
              />
            ) : (
              <svg className={styles.trackTitleSvg}>
                <use href="/img/icon/sprite.svg#icon-note"></use>
              </svg>
            )}
          </div>
          <div className={styles.trackTitleText}>
            <button
              className={styles.trackTitleLink}
              onClick={handleTrackClick}
              type="button"
            >
              {title}{' '}
              {titleSpan && (
                <span className={styles.trackTitleSpan}>{titleSpan}</span>
              )}
            </button>
          </div>
        </div>
        <div className={styles.trackAuthor}>
          <Link className={styles.trackAuthorLink} href={`/author/${authorId}`}>
            {author}
          </Link>
        </div>
        <div className={styles.trackAlbum}>
          <Link className={styles.trackAlbumLink} href={`/album/${albumId}`}>
            {album}
          </Link>
        </div>
        <div className={styles.trackTime}>
          <button
            className={cn(styles.trackTimeSvg, styles.likeButton, {
              [styles.loading]: isLoading,
            })}
            onClick={handleLikeClick}
            type="button"
            disabled={isLoading}
            title={likeButtonTitle}
          >
            <svg className={styles.trackTimeSvg}>
              <use
                href={`/img/icon/sprite.svg#icon-${isLike ? 'like' : 'dislike'}`}
              ></use>
            </svg>
          </button>
          <span className={styles.trackTimeText}>{time}</span>
        </div>
      </div>
    </div>
  );
};
