'use client';

import { type FC } from 'react';
import styles from './TrackSkeleton.module.css';

export const TrackSkeleton: FC = () => {
  return (
    <div className={styles.playlistItem}>
      <div className={styles.playlistTrack}>
        <div className={styles.trackTitle}>
          <div className={styles.trackTitleImage}>
            <div className={styles.skeletonBox} />
          </div>
          <div className={styles.trackTitleText}>
            <div className={styles.skeletonLine} style={{ width: '200px' }} />
          </div>
        </div>
        <div className={styles.trackAuthor}>
          <div className={styles.skeletonLine} style={{ width: '150px' }} />
        </div>
        <div className={styles.trackAlbum}>
          <div className={styles.skeletonLine} style={{ width: '120px' }} />
        </div>
        <div className={styles.trackTime}>
          <div
            className={styles.skeletonBox}
            style={{ width: '14px', height: '12px', marginRight: '17px' }}
          />
          <div className={styles.skeletonLine} style={{ width: '30px' }} />
        </div>
      </div>
    </div>
  );
};
