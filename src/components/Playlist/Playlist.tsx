'use client';

import { useEffect } from 'react';
import { Track } from '../Track/Track';
import styles from './Playlist.module.css';
import { tracks } from '../../data/tracks';
import { usePlayer } from '@/contexts/PlayerContext';

export const Playlist = () => {
  const { setPlaylist } = usePlayer();

  // Инициализируем плейлист при загрузке компонента
  useEffect(() => {
    setPlaylist(tracks);
  }, [setPlaylist]);

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
        {tracks.map((track, index) => (
          <Track
            key={index}
            track={{
              ...track,
              trackId: index.toString(),
              authorId: index.toString(),
              albumId: index.toString(),
            }}
          />
        ))}
      </div>
    </div>
  );
};
