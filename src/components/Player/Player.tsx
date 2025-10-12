'use client';

import { useCallback } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import styles from './Player.module.css';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAppSelector } from '@/store/hooks';

export const Player = () => {
  const { state, togglePlay, setCurrentTime, setVolume, toggleRepeat } =
    usePlayer();

  // Получаем состояние из Redux
  const reduxPlayerState = useAppSelector((state) => state.player);

  // Обработчики для кнопок управления
  const handlePlayClick = useCallback(() => {
    // Добавляем небольшую задержку для предотвращения быстрых переключений
    setTimeout(() => {
      togglePlay();
    }, 50);
  }, [togglePlay]);

  const handlePrevClick = useCallback(() => {
    alert('Еще не реализовано');
  }, []);

  const handleNextClick = useCallback(() => {
    alert('Еще не реализовано');
  }, []);

  const handleRepeatClick = useCallback(() => {
    toggleRepeat();
  }, [toggleRepeat]);

  const handleShuffleClick = useCallback(() => {
    alert('Еще не реализовано');
  }, []);

  // Обработчик для прогресс-бара
  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      setCurrentTime(newTime);
    },
    [setCurrentTime],
  );

  // Обработчик для громкости
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    [setVolume],
  );

  // Форматирование времени (пока не используется, но может пригодиться)
  // const formatTime = useCallback((seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = Math.floor(seconds % 60);
  //   return `${mins}:${secs.toString().padStart(2, '0')}`;
  // }, []);

  // Вычисляем прогресс в процентах (пока не используется, но может пригодиться)
  // const progressPercent = useMemo(() => {
  //   if (state.duration === 0) return 0;
  //   return (state.currentTime / state.duration) * 100;
  // }, [state.currentTime, state.duration]);

  return (
    <div className={styles.bar}>
      <div className={styles.barContent}>
        {/* Прогресс-бар */}
        <div className={styles.barPlayerProgress}>
          <input
            type="range"
            min="0"
            max={state.duration || 0}
            value={state.currentTime}
            onChange={handleProgressChange}
            className={styles.progressBar}
          />
        </div>

        <div className={styles.barPlayerBlock}>
          <div className={styles.barPlayer}>
            {/* Кнопки управления */}
            <div className={styles.playerControls}>
              <button
                className={styles.playerBtnPrev}
                onClick={handlePrevClick}
                disabled={!reduxPlayerState.currentTrack}
              >
                <svg className={styles.playerBtnPrevSvg}>
                  <use href="/img/icon/sprite.svg#icon-prev"></use>
                </svg>
              </button>

              <button
                className={cn(styles.playerBtnPlay, styles.btn)}
                onClick={handlePlayClick}
                disabled={!reduxPlayerState.currentTrack}
              >
                <svg className={styles.playerBtnPlaySvg}>
                  <use
                    href={`/img/icon/sprite.svg#icon-${reduxPlayerState.isPlaying ? 'pause' : 'play'}`}
                  ></use>
                </svg>
              </button>

              <button
                className={styles.playerBtnNext}
                onClick={handleNextClick}
                disabled={!reduxPlayerState.currentTrack}
              >
                <svg className={styles.playerBtnNextSvg}>
                  <use href="/img/icon/sprite.svg#icon-next"></use>
                </svg>
              </button>

              <button
                className={cn(styles.playerBtnRepeat, styles.btnIcon, {
                  [styles.active]: state.isRepeat,
                })}
                onClick={handleRepeatClick}
              >
                <svg className={styles.playerBtnRepeatSvg}>
                  <use href="/img/icon/sprite.svg#icon-repeat"></use>
                </svg>
              </button>

              <button
                className={cn(styles.playerBtnShuffle, styles.btnIcon, {
                  [styles.active]: state.isShuffle,
                })}
                onClick={handleShuffleClick}
              >
                <svg className={styles.playerBtnShuffleSvg}>
                  <use href="/img/icon/sprite.svg#icon-shuffle"></use>
                </svg>
              </button>
            </div>

            {/* Информация о треке */}
            <div className={styles.playerTrackPlay}>
              <div className={styles.trackPlayContain}>
                <div className={styles.trackPlayImage}>
                  <svg className={styles.trackPlaySvg}>
                    <use href="/img/icon/sprite.svg#icon-note"></use>
                  </svg>
                </div>
                <div className={styles.trackPlayAuthor}>
                  <Link
                    className={styles.trackPlayAuthorLink}
                    href={
                      reduxPlayerState.currentTrack
                        ? `/track/${reduxPlayerState.currentTrack.trackId || '1'}`
                        : '#'
                    }
                  >
                    {reduxPlayerState.currentTrack?.title || 'Выберите трек'}
                  </Link>
                </div>
                <div className={styles.trackPlayAlbum}>
                  <Link
                    className={styles.trackPlayAlbumLink}
                    href={
                      reduxPlayerState.currentTrack
                        ? `/author/${reduxPlayerState.currentTrack.authorId || '1'}`
                        : '#'
                    }
                  >
                    {reduxPlayerState.currentTrack?.author || 'Исполнитель'}
                  </Link>
                </div>
              </div>

              <div className={styles.trackPlayDislike}>
                <button className={cn(styles.playerBtnShuffle, styles.btnIcon)}>
                  <svg className={styles.trackPlayLikeSvg}>
                    <use href="/img/icon/sprite.svg#icon-like"></use>
                  </svg>
                </button>
                <button className={cn(styles.trackPlayDislike, styles.btnIcon)}>
                  <svg className={styles.trackPlayDislikeSvg}>
                    <use href="/img/icon/sprite.svg#icon-dislike"></use>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Управление громкостью */}
          <div className={styles.barVolumeBlock}>
            <div className={styles.volumeContent}>
              <div className={styles.volumeImage}>
                <svg className={styles.volumeSvg}>
                  <use href="/img/icon/sprite.svg#icon-volume"></use>
                </svg>
              </div>
              <div className={cn(styles.volumeProgress, styles.btn)}>
                <input
                  className={cn(styles.volumeProgressLine, styles.btn)}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
