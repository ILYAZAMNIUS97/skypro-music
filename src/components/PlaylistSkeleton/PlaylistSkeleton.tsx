'use client';

import { type FC } from 'react';
import { TrackSkeleton } from '../TrackSkeleton';
import styles from './PlaylistSkeleton.module.css';

interface PlaylistSkeletonProps {
  count?: number;
}

export const PlaylistSkeleton: FC<PlaylistSkeletonProps> = ({ count = 10 }) => {
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
        {Array.from({ length: count }).map((_, index) => (
          <TrackSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
