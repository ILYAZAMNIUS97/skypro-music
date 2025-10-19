'use client';

import Link from 'next/link';
import cn from 'classnames';
import styles from './Track.module.css';
import { type TrackProps } from '../../types/track';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAppSelector } from '@/store/hooks';

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
  const { playTrack, setPlaylist, state } = usePlayer();

  // Получаем состояние из Redux
  const reduxPlayerState = useAppSelector((state) => state.player);

  // Проверяем, является ли этот трек текущим
  const isCurrentTrack = reduxPlayerState.currentTrack?.trackId === trackId;
  const isPlaying = reduxPlayerState.isPlaying && isCurrentTrack;

  // Обработчик клика по треку для воспроизведения
  const handleTrackClick = () => {
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
      src: 'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_Epic_Heroic_Conquest.mp3', // Добавляем URL аудиофайла
    };

    // Если плейлист пустой, создаем его из текущего трека
    if (state.playlist.length === 0) {
      setPlaylist([trackData]);
    }

    // Запускаем воспроизведение трека
    playTrack(trackData);
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
