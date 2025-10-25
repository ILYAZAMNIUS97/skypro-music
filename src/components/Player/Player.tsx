'use client';

import { useRef, useEffect } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import styles from './Player.module.css';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ProgressBar } from '@/components/ProgressBar';
import {
  setCurrentTime,
  toggleRepeat,
  setDuration,
  playAudio,
  pauseAudio,
  setProgress,
  setVolumeLevel,
} from '@/store/playerSlice';

export const Player = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.player);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Функции для управления плеером
  const play = async () => {
    if (audioRef.current) {
      try {
        console.log(
          'Попытка воспроизведения, readyState:',
          audioRef.current.readyState,
        );
        console.log('Текущий src:', audioRef.current.src);

        // Проверяем, что аудио элемент готов к воспроизведению
        if (audioRef.current.readyState >= 2) {
          // HAVE_CURRENT_DATA
          console.log('Начинаем воспроизведение...');
          await audioRef.current.play();
          dispatch(playAudio());
          console.log('Воспроизведение началось');
        } else {
          console.log(
            'Аудио элемент еще не готов к воспроизведению, readyState:',
            audioRef.current.readyState,
          );
        }
      } catch (error) {
        console.log('Ошибка воспроизведения:', error);
        // Если воспроизведение не удалось, не меняем состояние
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      dispatch(pauseAudio());
    }
  };

  // Обработчики для кнопок управления
  const handlePlayClick = () => {
    // Добавляем небольшую задержку для предотвращения быстрых переключений
    setTimeout(() => {
      if (state.isPlaying) {
        pause();
      } else {
        play();
      }
    }, 50);
  };

  const handlePrevClick = () => {
    alert('Еще не реализовано');
  };

  const handleNextClick = () => {
    alert('Еще не реализовано');
  };

  const handleRepeatClick = () => {
    dispatch(toggleRepeat());
  };

  const handleShuffleClick = () => {
    alert('Еще не реализовано');
  };

  // Обработчик для прогресс-бара
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    dispatch(setProgress(newTime));
  };

  // Обработчик для громкости
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolumeLevel(newVolume));
  };

  // Обработчики событий аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };

    const handleDurationChange = () => {
      dispatch(setDuration(audio.duration || 0));
    };

    const handleEnded = () => {
      if (state.isRepeat) {
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.log('Ошибка при повторном воспроизведении:', error);
        });
      } else {
        // При завершении трека показываем alert, так как у нас только один трек
        alert('Еще не реализовано');
      }
    };

    const handlePlay = () => {
      dispatch(playAudio());
    };

    const handlePause = () => {
      dispatch(pauseAudio());
    };

    const handleError = (error: Event) => {
      console.log('Ошибка аудио элемента:', error);
      dispatch(pauseAudio());
    };

    const handleLoadedData = () => {
      console.log('Аудио данные загружены, готов к воспроизведению');
    };

    const handleCanPlay = () => {
      console.log('Аудио готово к воспроизведению');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [state.isRepeat, dispatch]);

  // Обновляем src аудио элемента при смене трека и автоматически запускаем воспроизведение
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      if (state.currentTrack.src) {
        console.log(
          'Загружаем трек:',
          state.currentTrack.title,
          'URL:',
          state.currentTrack.src,
        );
        audioRef.current.src = state.currentTrack.src;
        // Сбрасываем время воспроизведения при смене трека
        audioRef.current.currentTime = 0;

        // Автоматически запускаем воспроизведение, если трек должен играть
        if (state.isPlaying) {
          // Небольшая задержка для загрузки аудио
          const timer = setTimeout(async () => {
            if (audioRef.current) {
              try {
                if (audioRef.current.readyState >= 2) {
                  await audioRef.current.play();
                  dispatch(playAudio());
                }
              } catch (error) {
                console.log('Ошибка воспроизведения:', error);
              }
            }
          }, 200);

          return () => clearTimeout(timer);
        }
      } else {
        console.log(
          'Трек выбран:',
          state.currentTrack.title,
          'но URL аудиофайла не указан',
        );
      }
    }
  }, [state.currentTrack, state.isPlaying, dispatch]);

  // Обновляем громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

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
          <ProgressBar
            max={state.duration || 0}
            value={state.currentTime}
            step={1}
            onChange={handleProgressChange}
            readOnly={false}
          />
        </div>

        <div className={styles.barPlayerBlock}>
          <div className={styles.barPlayer}>
            {/* Кнопки управления */}
            <div className={styles.playerControls}>
              <button
                className={styles.playerBtnPrev}
                onClick={handlePrevClick}
                disabled={!state.currentTrack}
              >
                <svg className={styles.playerBtnPrevSvg}>
                  <use href="/img/icon/sprite.svg#icon-prev"></use>
                </svg>
              </button>

              <button
                className={cn(styles.playerBtnPlay, styles.btn)}
                onClick={handlePlayClick}
                disabled={!state.currentTrack}
              >
                <svg className={styles.playerBtnPlaySvg}>
                  <use
                    href={`/img/icon/sprite.svg#icon-${state.isPlaying ? 'pause' : 'play'}`}
                  ></use>
                </svg>
              </button>

              <button
                className={styles.playerBtnNext}
                onClick={handleNextClick}
                disabled={!state.currentTrack}
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
                      state.currentTrack
                        ? `/track/${state.currentTrack.trackId || '1'}`
                        : '#'
                    }
                  >
                    {state.currentTrack?.title || 'Выберите трек'}
                  </Link>
                </div>
                <div className={styles.trackPlayAlbum}>
                  <Link
                    className={styles.trackPlayAlbumLink}
                    href={
                      state.currentTrack
                        ? `/author/${state.currentTrack.authorId || '1'}`
                        : '#'
                    }
                  >
                    {state.currentTrack?.author || 'Исполнитель'}
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
      {/* Скрытый аудио элемент */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
    </div>
  );
};
