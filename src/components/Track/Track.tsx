'use client';

import Link from 'next/link';
import cn from 'classnames';
import styles from './Track.module.css';
import { type TrackProps } from '../../types/track';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { playTrackWithPlaylist, toggleFavorite } from '@/store/playerSlice';

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

  // Проверяем, является ли этот трек текущим
  const isCurrentTrack = state.currentTrack?.trackId === trackId;
  const isPlaying = state.isPlaying && isCurrentTrack;

  // Обработчик клика по треку для воспроизведения
  const handleTrackClick = () => {
    // Проверяем, что у трека есть аудиофайл
    if (src) {
      // Создаем объект трека для плеера
      const trackData = {
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
      };

      // Используем текущий плейлист из Redux
      dispatch(
        playTrackWithPlaylist({ track: trackData, playlist: state.playlist }),
      );
    } else {
      alert('Аудиофайл недоступен');
    }
  };

  // Обработчик для лайка/дизлайка
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем клик по треку
    dispatch(
      toggleFavorite({
        trackId,
        isFavorite,
      }),
    );
  };

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
            className={cn(styles.trackTimeSvg, {
              [styles.active]: isFavorite,
            })}
            onClick={handleLikeClick}
            type="button"
          >
            <svg className={styles.trackTimeSvg}>
              <use href="/img/icon/sprite.svg#icon-like"></use>
            </svg>
          </button>
          <span className={styles.trackTimeText}>{time}</span>
        </div>
      </div>
    </div>
  );
};
