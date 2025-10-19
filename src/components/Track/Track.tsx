'use client';

import Link from 'next/link';
import cn from 'classnames';
import styles from './Track.module.css';
import { type TrackProps } from '../../types/track';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { playTrackWithPlaylist } from '@/store/playerSlice';

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
  } = track;

  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.player);

  // Проверяем, является ли этот трек текущим
  const isCurrentTrack = state.currentTrack?.trackId === trackId;
  const isPlaying = state.isPlaying && isCurrentTrack;

  // Обработчик клика по треку для воспроизведения
  const handleTrackClick = () => {
    // Проверяем, что это трек "Guilt" - единственный с реальным аудиофайлом
    if (title === 'Guilt') {
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
        src: 'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_Epic_Heroic_Conquest.mp3', // Оригинальный URL
      };

      // Создаем плейлист только из этого трека
      const playlist = [trackData];

      // Запускаем воспроизведение с плейлистом
      dispatch(playTrackWithPlaylist({ track: trackData, playlist }));
    } else {
      // Для всех остальных треков показываем alert
      alert('Еще не реализовано');
    }
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
          <svg className={styles.trackTimeSvg}>
            <use href="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.trackTimeText}>{time}</span>
        </div>
      </div>
    </div>
  );
};
