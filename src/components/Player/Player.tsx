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
  toggleShuffle,
  setDuration,
  playAudio,
  pauseAudio,
  setProgress,
  setVolumeLevel,
  fetchTracks,
  toggleFavorite,
  nextTrack,
  prevTrack,
} from '@/store/playerSlice';

export const Player = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.player);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Загружаем треки при монтировании компонента
  useEffect(() => {
    if (state.playlist.length === 0) {
      dispatch(fetchTracks());
    }
  }, [dispatch, state.playlist.length]);

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
    dispatch(prevTrack());
  };

  const handleNextClick = () => {
    dispatch(nextTrack());
  };

  const handleRepeatClick = () => {
    console.log('Переключаем режим повтора. Текущий режим:', state.repeatMode);
    dispatch(toggleRepeat());
    // Добавляем небольшую задержку для проверки обновления состояния
    setTimeout(() => {
      console.log('Новый режим повтора после переключения:', state.repeatMode);
    }, 100);
  };

  const handleShuffleClick = () => {
    dispatch(toggleShuffle());
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

  // Обработчики для лайка/дизлайка
  const handleLikeClick = () => {
    if (state.currentTrack?.trackId) {
      dispatch(
        toggleFavorite({
          trackId: state.currentTrack.trackId,
          isFavorite: state.currentTrack.isFavorite || false,
        }),
      );
    }
  };

  const handleDislikeClick = () => {
    if (state.currentTrack?.trackId) {
      dispatch(
        toggleFavorite({
          trackId: state.currentTrack.trackId,
          isFavorite: state.currentTrack.isFavorite || false,
        }),
      );
    }
  };

  // Обработчики событий аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));

      // Логируем приближение к концу трека для отладки
      if (state.duration > 0 && audio.currentTime > state.duration - 1) {
        console.log('🎵 Приближаемся к концу трека:', {
          currentTime: audio.currentTime,
          duration: state.duration,
          remaining: state.duration - audio.currentTime,
        });
      }

      // Альтернативный механизм повтора через отслеживание времени
      if (state.repeatMode === 'one' && state.duration > 0) {
        // Проверяем, достигли ли мы конца трека (с небольшой погрешностью)
        if (audio.currentTime >= state.duration - 0.1) {
          console.log('🎵 Достигли конца трека, перезапускаем...');
          audio.currentTime = 0;
          dispatch(setCurrentTime(0));
          dispatch(playAudio());

          // Небольшая задержка для корректной работы
          setTimeout(() => {
            if (audio) {
              audio.play().catch((error) => {
                console.log('Ошибка при повторном воспроизведении:', error);
              });
            }
          }, 100);
        }
      } else if (state.repeatMode === 'all' && state.duration > 0) {
        // Проверяем, достигли ли мы конца трека для режима повтора всего плейлиста
        if (audio.currentTime >= state.duration - 0.1) {
          console.log('🎵 Достигли конца трека, переходим к следующему...');
          dispatch(nextTrack());
        }
      }
    };

    const handleDurationChange = () => {
      console.log('🎵 Длительность трека установлена:', audio.duration);
      dispatch(setDuration(audio.duration || 0));
    };

    const handleEnded = () => {
      console.log(
        '🎵 Событие ended сработало! Режим повтора:',
        state.repeatMode,
      );
      console.log('🎵 Текущий трек:', state.currentTrack?.title);
      console.log('🎵 Длительность трека:', state.duration);

      // Проверяем, что есть треки в плейлисте
      if (state.playlist.length === 0) {
        console.log('Плейлист пуст, воспроизведение остановлено');
        return;
      }

      if (state.repeatMode === 'one') {
        // Повторяем текущий трек
        console.log('Повторяем текущий трек:', state.currentTrack?.title);
        audio.currentTime = 0;
        dispatch(setCurrentTime(0)); // Обновляем состояние Redux
        dispatch(playAudio()); // Обновляем состояние воспроизведения

        // Небольшая задержка для корректной работы
        setTimeout(() => {
          if (audio) {
            console.log(
              'Пытаемся запустить воспроизведение, readyState:',
              audio.readyState,
            );

            // Проверяем готовность аудио элемента
            if (audio.readyState >= 2) {
              // HAVE_CURRENT_DATA
              audio
                .play()
                .then(() => {
                  console.log('Воспроизведение успешно запущено');
                })
                .catch((error) => {
                  console.log('Ошибка при повторном воспроизведении:', error);
                });
            } else {
              console.log('Аудио элемент не готов к воспроизведению, ждем...');
              // Ждем готовности аудио элемента
              const checkReady = () => {
                if (audio.readyState >= 2) {
                  audio
                    .play()
                    .then(() => {
                      console.log(
                        'Воспроизведение успешно запущено после ожидания',
                      );
                    })
                    .catch((error) => {
                      console.log(
                        'Ошибка при повторном воспроизведении:',
                        error,
                      );
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
      console.log('🎵 Аудио элемент начал воспроизведение');
      dispatch(playAudio());
    };

    const handlePause = () => {
      console.log('🎵 Аудио элемент приостановлен');
      dispatch(pauseAudio());
    };

    const handleError = (error: Event) => {
      console.log('🎵 Ошибка аудио элемента:', error);
      dispatch(pauseAudio());
    };

    const handleLoadedData = () => {
      console.log('🎵 Аудио данные загружены, готов к воспроизведению');
    };

    const handleCanPlay = () => {
      console.log('🎵 Аудио готово к воспроизведению');
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

  // Обновляем src аудио элемента при смене трека и автоматически запускаем воспроизведение
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      if (state.currentTrack.src) {
        console.log(
          'Загружаем трек:',
          state.currentTrack.title,
          'URL:',
          state.currentTrack.src,
          'Режим повтора:',
          state.repeatMode,
          'Состояние воспроизведения:',
          state.isPlaying,
        );
        audioRef.current.src = state.currentTrack.src;
        // Сбрасываем время воспроизведения при смене трека
        audioRef.current.currentTime = 0;

        // Автоматически запускаем воспроизведение, если трек должен играть
        if (state.isPlaying) {
          // Функция для ожидания готовности аудио элемента
          const waitForAudioReady = async () => {
            if (!audioRef.current) return;

            // Если аудио уже готово, запускаем воспроизведение
            if (audioRef.current.readyState >= 2) {
              try {
                await audioRef.current.play();
                dispatch(playAudio());
                console.log('🎵 Автоматическое воспроизведение запущено');
              } catch (error) {
                console.log('Ошибка воспроизведения:', error);
              }
              return;
            }

            // Если аудио еще не готово, ждем события canplay
            const handleCanPlay = async () => {
              if (audioRef.current) {
                try {
                  await audioRef.current.play();
                  dispatch(playAudio());
                  console.log(
                    '🎵 Автоматическое воспроизведение запущено после ожидания',
                  );
                } catch (error) {
                  console.log('Ошибка воспроизведения:', error);
                }
                audioRef.current.removeEventListener('canplay', handleCanPlay);
              }
            };

            audioRef.current.addEventListener('canplay', handleCanPlay);

            // Fallback: если через 3 секунды аудио все еще не готово, пробуем запустить
            setTimeout(() => {
              if (audioRef.current && audioRef.current.readyState >= 1) {
                try {
                  audioRef.current.play();
                  dispatch(playAudio());
                  console.log(
                    '🎵 Автоматическое воспроизведение запущено (fallback)',
                  );
                } catch (error) {
                  console.log('Ошибка воспроизведения (fallback):', error);
                }
              }
            }, 3000);
          };

          // Небольшая задержка для загрузки аудио
          setTimeout(waitForAudioReady, 200);
        }
      } else {
        console.log(
          'Трек выбран:',
          state.currentTrack.title,
          'но URL аудиофайла не указан',
        );
      }
    }
  }, [state.currentTrack, state.isPlaying, state.repeatMode, dispatch]);

  // Обновляем громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Отслеживаем изменения состояния плеера для отладки
  useEffect(() => {
    console.log('🎵 Состояние плеера изменилось:', {
      isPlaying: state.isPlaying,
      repeatMode: state.repeatMode,
      currentTrack: state.currentTrack?.title,
      currentTime: state.currentTime,
      duration: state.duration,
    });

    // Принудительная проверка для режима повтора одного трека
    if (
      state.repeatMode === 'one' &&
      state.duration > 0 &&
      state.currentTime >= state.duration - 0.1
    ) {
      console.log(
        '🎵 Принудительная проверка: достигли конца трека, перезапускаем...',
      );
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        dispatch(setCurrentTime(0));
        dispatch(playAudio());

        // Небольшая задержка для корректной работы
        setTimeout(() => {
          if (audio) {
            audio.play().catch((error) => {
              console.log('Ошибка при повторном воспроизведении:', error);
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
      console.log(
        '🎵 Принудительная проверка: достигли конца трека для режима повтора всего плейлиста',
      );
      dispatch(nextTrack());
    }
  }, [
    state.isPlaying,
    state.repeatMode,
    state.currentTrack?.title,
    state.currentTime,
    state.duration,
    dispatch,
  ]);

  // Отслеживаем готовность аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => {
        console.log(
          '🎵 Аудио элемент готов к воспроизведению, readyState:',
          audio.readyState,
        );
      };

      const handleLoadedData = () => {
        console.log('🎵 Аудио данные загружены, readyState:', audio.readyState);
      };

      const handleEnded = () => {
        console.log('🎵 Событие ended сработало в дополнительном обработчике!');
      };

      const handleTimeUpdate = () => {
        // Логируем приближение к концу трека
        if (audio.duration > 0 && audio.currentTime > audio.duration - 0.5) {
          console.log('🎵 Очень близко к концу трека:', {
            currentTime: audio.currentTime,
            duration: audio.duration,
            remaining: audio.duration - audio.currentTime,
          });
        }

        // Дополнительная проверка для режима повтора одного трека
        if (
          state.repeatMode === 'one' &&
          audio.duration > 0 &&
          audio.currentTime >= audio.duration - 0.1
        ) {
          console.log(
            '🎵 Дополнительная проверка в timeupdate: достигли конца трека',
          );
        }

        // Дополнительная проверка для режима повтора всего плейлиста
        if (
          state.repeatMode === 'all' &&
          audio.duration > 0 &&
          audio.currentTime >= audio.duration - 0.1
        ) {
          console.log(
            '🎵 Дополнительная проверка в timeupdate: достигли конца трека для режима повтора всего плейлиста',
          );
        }
      };

      const handlePause = () => {
        console.log(
          '🎵 Аудио элемент приостановлен в дополнительном обработчике',
        );
      };

      const handlePlay = () => {
        console.log(
          '🎵 Аудио элемент начал воспроизведение в дополнительном обработчике',
        );
      };

      const handleError = (error: Event) => {
        console.log(
          '🎵 Ошибка аудио элемента в дополнительном обработчике:',
          error,
        );
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

  // Показываем индикатор загрузки
  if (state.isLoading) {
    return (
      <div className={styles.bar}>
        <div className={styles.barContent}>
          <div className={styles.loadingMessage}>Загрузка треков...</div>
        </div>
      </div>
    );
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
                title={
                  state.repeatMode === 'off'
                    ? 'Повтор выключен'
                    : state.repeatMode === 'one'
                      ? 'Повтор одного трека'
                      : 'Повтор всего плейлиста'
                }
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
                  className={cn(styles.playerBtnShuffle, styles.btnIcon, {
                    [styles.active]: state.currentTrack?.isFavorite,
                  })}
                  onClick={handleLikeClick}
                  disabled={!state.currentTrack}
                >
                  <svg className={styles.trackPlayLikeSvg}>
                    <use href="/img/icon/sprite.svg#icon-like"></use>
                  </svg>
                </button>
                <button
                  className={cn(styles.trackPlayDislike, styles.btnIcon)}
                  onClick={handleDislikeClick}
                  disabled={!state.currentTrack}
                >
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
