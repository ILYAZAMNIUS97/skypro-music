'use client';

import { type FC } from 'react';
import styles from './PlayerSkeleton.module.css';

export const PlayerSkeleton: FC = () => {
  return (
    <div className={styles.bar}>
      <div className={styles.barContent}>
        {/* Прогресс-бар скелетон */}
        <div className={styles.barPlayerProgress}>
          <div className={styles.skeletonProgressBar} />
        </div>

        {/* Время трека скелетон */}
        <div className={styles.timeContainer}>
          <div className={styles.skeletonTime} />
          <div className={styles.skeletonTime} />
        </div>

        <div className={styles.barPlayerBlock}>
          <div className={styles.barPlayer}>
            {/* Кнопки управления скелетон */}
            <div className={styles.playerControls}>
              <div className={styles.skeletonButton} />
              <div
                className={styles.skeletonButton}
                style={{ width: '22px', height: '20px' }}
              />
              <div className={styles.skeletonButton} />
              <div className={styles.skeletonButton} />
              <div className={styles.skeletonButton} />
            </div>

            {/* Информация о треке скелетон */}
            <div className={styles.playerTrackPlay}>
              <div className={styles.trackPlayContain}>
                <div className={styles.trackPlayImage}>
                  <div className={styles.skeletonBox} />
                </div>
                <div className={styles.trackPlayAuthor}>
                  <div
                    className={styles.skeletonLine}
                    style={{ width: '120px' }}
                  />
                </div>
                <div className={styles.trackPlayAlbum}>
                  <div
                    className={styles.skeletonLine}
                    style={{ width: '100px' }}
                  />
                </div>
              </div>
              <div className={styles.trackPlayDislike}>
                <div
                  className={styles.skeletonButton}
                  style={{ width: '14px', height: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Управление громкостью скелетон */}
          <div className={styles.barVolumeBlock}>
            <div className={styles.volumeContent}>
              <div className={styles.volumeImage}>
                <div
                  className={styles.skeletonBox}
                  style={{ width: '13px', height: '18px' }}
                />
              </div>
              <div className={styles.volumeProgress}>
                <div
                  className={styles.skeletonProgressBar}
                  style={{ height: '2px', width: '109px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
