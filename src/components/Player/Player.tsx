'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import styles from './Player.module.css';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ProgressBar } from '@/components/ProgressBar';
import { PlayerSkeleton } from '@/components/PlayerSkeleton';
import {
  toggleRepeat,
  toggleShuffle,
  setDuration,
  setVolumeLevel,
  fetchTracks,
  nextTrack,
  prevTrack,
  pauseAudio,
  playAudio,
} from '@/store/playerSlice';
import { useLikeTrack } from '@/hooks/useLikeTrack';

export const Player = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.player);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [previousTrackId, setPreviousTrackId] = useState<string | null>(null);

  // Загружаем треки при монтировании компонента
  useEffect(() => {
    if (state.playlist.length === 0) {
      dispatch(fetchTracks());
    }
  }, [dispatch, state.playlist.length]);

  // Функции для управления плеером
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        // Проверяем, что аудио элемент готов к воспроизведению
        if (audioRef.current.readyState >= 2) {
          // HAVE_CURRENT_DATA
          await audioRef.current.play();
          dispatch(playAudio()); // Используем простой action для воспроизведения
        }
      } catch {
        // Если воспроизведение не удалось, не меняем состояние
      }
    }
  }, [dispatch]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      dispatch(pauseAudio()); // Используем простой action для паузы
    }
  }, [dispatch]);

  // Обработчики для кнопок управления
  const handlePlayClick = useCallback(() => {
    // Добавляем небольшую задержку для предотвращения быстрых переключений
    setTimeout(() => {
      if (state.isPlaying) {
        pause();
      } else {
        play();
      }
    }, 50);
  }, [state.isPlaying, pause, play]);

  const handlePrevClick = useCallback(() => {
    dispatch(prevTrack());
  }, [dispatch]);

  const handleNextClick = useCallback(() => {
    dispatch(nextTrack());
  }, [dispatch]);

  const handleRepeatClick = useCallback(() => {
    dispatch(toggleRepeat());
  }, [dispatch]);

  const handleShuffleClick = useCallback(() => {
    dispatch(toggleShuffle());
  }, [dispatch]);

  // Обработчик для прогресс-бара
  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [],
  );

  // Обработчик для громкости
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      dispatch(setVolumeLevel(newVolume));
    },
    [dispatch],
  );

  // Хук для работы с лайками
  const { toggleLike, isLike, isLoading, errorMsg } = useLikeTrack(
    state.currentTrack,
  );

  // Обработчики для лайка/дизлайка
  const handleLikeClick = useCallback(() => {
    toggleLike();
  }, [toggleLike]);

  // Определяем иконку лайка в зависимости от авторизации
  const likeIcon = useMemo(() => {
    // Если не авторизован - зачеркнутое сердце
    if (!isAuthenticated) {
      return 'dislike';
    }
    // Если авторизован - обычное сердце (не зачеркнутое)
    return 'like';
  }, [isAuthenticated]);

  // Обработчики событий аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Альтернативный механизм повтора через отслеживание времени
      if (state.repeatMode === 'one' && state.duration > 0) {
        // Проверяем, достигли ли мы конца трека (с небольшой погрешностью)
        if (audio.currentTime >= state.duration - 0.1) {
          audio.currentTime = 0;
          setCurrentTime(0); // Сбрасываем только при повторе трека
          dispatch(playAudio());

          // Небольшая задержка для корректной работы
          setTimeout(() => {
            if (audio) {
              audio.play().catch(() => {
                // Игнорируем ошибки воспроизведения
              });
            }
          }, 100);
        }
      } else if (state.repeatMode === 'all' && state.duration > 0) {
        // Проверяем, достигли ли мы конца трека для режима повтора всего плейлиста
        if (audio.currentTime >= state.duration - 0.1) {
          dispatch(nextTrack());
        }
      }
    };

    const handleDurationChange = () => {
      dispatch(setDuration(audio.duration || 0));
    };

    const handleEnded = () => {
      // Проверяем, что есть треки в плейлисте
      if (state.playlist.length === 0) {
        return;
      }

      if (state.repeatMode === 'one') {
        // Повторяем текущий трек
        audio.currentTime = 0;
        setCurrentTime(0); // Сбрасываем только при повторе трека
        dispatch(playAudio()); // Обновляем состояние воспроизведения

        // Небольшая задержка для корректной работы
        setTimeout(() => {
          if (audio) {
            // Проверяем готовность аудио элемента
            if (audio.readyState >= 2) {
              // HAVE_CURRENT_DATA
              audio.play().catch(() => {
                // Игнорируем ошибки воспроизведения
              });
            } else {
              // Ждем готовности аудио элемента
              const checkReady = () => {
                if (audio.readyState >= 2) {
                  audio.play().catch(() => {
                    // Игнорируем ошибки воспроизведения
                  });
                } else {
                  setTimeout(checkReady, 50);
                }
              };
              checkReady();
            }
          }
        }, 100);
      } else if (state.repeatMode === 'all') {
        // Переходим к следующему треку (логика повтора плейлиста в nextTrack)
        dispatch(nextTrack());
      } else {
        // Обычное поведение - переходим к следующему треку
        dispatch(nextTrack());
      }
    };

    const handlePlay = () => {
      dispatch(playAudio());
    };

    const handlePause = () => {
      dispatch(pauseAudio());
    };

    const handleError = () => {
      dispatch(pauseAudio());
    };

    const handleLoadedData = () => {
      // Аудио данные загружены
    };

    const handleCanPlay = () => {
      // Аудио готово к воспроизведению
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
  }, [
    state.repeatMode,
    state.playlist.length,
    state.currentTrack?.title,
    state.duration,
    dispatch,
  ]);

  // Обновляем src аудио элемента при смене трека
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      if (state.currentTrack.src) {
        const isNewTrack = previousTrackId !== state.currentTrack.trackId;

        audioRef.current.src = state.currentTrack.src;

        // Сбрасываем позицию только при смене на новый трек
        if (isNewTrack) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }

        // Обновляем предыдущий трек
        setPreviousTrackId(state.currentTrack.trackId || null);

        // Автоматически запускаем воспроизведение при смене трека
        // Небольшая задержка для загрузки аудио
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              // Игнорируем ошибки автоматического воспроизведения
            });
          }
        }, 100);
      }
    }
  }, [state.currentTrack, previousTrackId]);

  // Управляем воспроизведением/паузой
  useEffect(() => {
    if (audioRef.current) {
      if (state.isPlaying) {
        audioRef.current.play().catch(() => {
          // Игнорируем ошибки воспроизведения
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [state.isPlaying]);

  // Обновляем громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Отслеживаем изменения состояния плеера для отладки
  useEffect(() => {
    // Принудительная проверка для режима повтора одного трека
    if (
      state.repeatMode === 'one' &&
      state.duration > 0 &&
      state.currentTime >= state.duration - 0.1
    ) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        setCurrentTime(0); // Сбрасываем только при повторе трека
        dispatch(playAudio());

        // Небольшая задержка для корректной работы
        setTimeout(() => {
          if (audio) {
            audio.play().catch(() => {
              // Игнорируем ошибки воспроизведения
            });
          }
        }, 100);
      }
    }

    // Принудительная проверка для режима повтора всего плейлиста
    if (
      state.repeatMode === 'all' &&
      state.duration > 0 &&
      state.currentTime >= state.duration - 0.1
    ) {
      dispatch(nextTrack());
    }
  }, [state.repeatMode, state.currentTime, state.duration, dispatch]);

  // Отслеживаем готовность аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => {
        // Аудио элемент готов к воспроизведению
      };

      const handleLoadedData = () => {
        // Аудио данные загружены
      };

      const handleEnded = () => {
        // Событие ended сработало
      };

      const handleTimeUpdate = () => {
        // Дополнительная проверка для режима повтора одного трека
        if (
          state.repeatMode === 'one' &&
          audio.duration > 0 &&
          audio.currentTime >= audio.duration - 0.1
        ) {
          // Достигли конца трека
        }

        // Дополнительная проверка для режима повтора всего плейлиста
        if (
          state.repeatMode === 'all' &&
          audio.duration > 0 &&
          audio.currentTime >= audio.duration - 0.1
        ) {
          // Достигли конца трека для режима повтора всего плейлиста
        }
      };

      const handlePause = () => {
        // Аудио элемент приостановлен
      };

      const handlePlay = () => {
        // Аудио элемент начал воспроизведение
      };

      const handleError = () => {
        // Ошибка аудио элемента
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [state.currentTrack, state.repeatMode]);

  // Форматирование времени
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Мемоизируем отформатированное время
  const formattedCurrentTime = useMemo(
    () => formatTime(currentTime),
    [currentTime, formatTime],
  );
  const formattedDuration = useMemo(
    () => formatTime(state.duration || 0),
    [state.duration, formatTime],
  );

  // Мемоизируем title для кнопки повтора
  const repeatButtonTitle = useMemo(
    () =>
      state.repeatMode === 'off'
        ? 'Повтор выключен'
        : state.repeatMode === 'one'
          ? 'Повтор одного трека'
          : 'Повтор всего плейлиста',
    [state.repeatMode],
  );

  // Показываем индикатор загрузки
  if (state.isLoading) {
    return <PlayerSkeleton />;
  }

  // Показываем ошибку, если есть
  if (state.error) {
    return (
      <div className={styles.bar}>
        <div className={styles.barContent}>
          <div className={styles.errorMessage}>
            Ошибка: {state.error}
            <button
              onClick={() => dispatch(fetchTracks())}
              className={styles.retryButton}
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <div className={styles.barContent}>
        {/* Прогресс-бар */}
        <div className={styles.barPlayerProgress}>
          <ProgressBar
            max={state.duration || 0}
            value={currentTime}
            step={1}
            onChange={handleProgressChange}
            readOnly={false}
          />
        </div>

        {/* Время трека */}
        <div className={styles.timeContainer}>
          <span className={styles.currentTime}>{formattedCurrentTime}</span>
          <span className={styles.totalTime}>{formattedDuration}</span>
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
                title={repeatButtonTitle}
              >
                <svg className={styles.playerBtnRepeatSvg}>
                  <use href="/img/icon/sprite.svg#icon-repeat"></use>
                </svg>
                {/* Индикатор режима повтора */}
                {state.repeatMode === 'one' && (
                  <span className={styles.repeatIndicator}>1</span>
                )}
                {state.repeatMode === 'all' && (
                  <span className={styles.repeatIndicator}>∞</span>
                )}
              </button>

              <button
                className={cn(styles.playerBtnShuffle, styles.btnIcon, {
                  [styles.active]: state.isShuffle,
                })}
                onClick={handleShuffleClick}
                title="Перемешивание треков"
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
                <button
                  className={cn(
                    styles.playerBtnShuffle,
                    styles.btnIcon,
                    styles.likeButton,
                    {
                      [styles.loading]: isLoading,
                      [styles.liked]: isAuthenticated && isLike,
                    },
                  )}
                  onClick={handleLikeClick}
                  disabled={!state.currentTrack || isLoading}
                  title={
                    errorMsg ||
                    (isLike ? 'Убрать из избранного' : 'Добавить в избранное')
                  }
                >
                  <svg className={styles.trackPlayLikeSvg}>
                    <use href={`/img/icon/sprite.svg#icon-${likeIcon}`}></use>
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
