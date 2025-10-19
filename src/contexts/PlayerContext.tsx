'use client';

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { type Track } from '../types/track';
import { type PlayerState, type PlayerContextType } from '../types/player';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCurrentTrack as setReduxCurrentTrack,
  setIsPlaying as setReduxIsPlaying,
  playTrack as reduxPlayTrack,
} from '@/store/playerSlice';

// Начальное состояние плеера
const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isRepeat: false,
  isShuffle: false,
  playlist: [],
  currentTrackIndex: -1,
};

// Типы действий для reducer
type PlayerAction =
  | { type: 'SET_CURRENT_TRACK'; payload: { track: Track; index: number } }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_PLAYLIST'; payload: Track[] }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' };

// Reducer для управления состоянием плеера
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload.track,
        currentTrackIndex: action.payload.index,
        currentTime: 0,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload)),
      };

    case 'TOGGLE_REPEAT':
      return {
        ...state,
        isRepeat: !state.isRepeat,
      };

    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffle: !state.isShuffle,
      };

    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
      };

    case 'NEXT_TRACK':
      if (state.playlist.length === 0) return state;

      let nextIndex = state.currentTrackIndex + 1;
      if (nextIndex >= state.playlist.length) {
        nextIndex = state.isRepeat ? 0 : state.currentTrackIndex;
      }

      return {
        ...state,
        currentTrack: state.playlist[nextIndex],
        currentTrackIndex: nextIndex,
        currentTime: 0,
      };

    case 'PREV_TRACK':
      if (state.playlist.length === 0) return state;

      let prevIndex = state.currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.isRepeat ? state.playlist.length - 1 : 0;
      }

      return {
        ...state,
        currentTrack: state.playlist[prevIndex],
        currentTrackIndex: prevIndex,
        currentTime: 0,
      };

    default:
      return state;
  }
}

// Создаем контекст
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Провайдер контекста
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Redux hooks
  const reduxDispatch = useAppDispatch();
  const reduxPlayerState = useAppSelector((state) => state.player);

  // Функции для управления плеером
  const play = useCallback(async () => {
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
          dispatch({ type: 'SET_PLAYING', payload: true });
          // Синхронизируем с Redux
          reduxDispatch(setReduxIsPlaying(true));
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
  }, [reduxDispatch]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
      // Синхронизируем с Redux
      reduxDispatch(setReduxIsPlaying(false));
    }
  }, [reduxDispatch]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const nextTrack = () => {
    if (state.playlist.length === 0) {
      alert('Еще не реализовано');
      return;
    }

    const nextIndex = state.currentTrackIndex + 1;
    if (nextIndex >= state.playlist.length) {
      alert('Еще не реализовано');
      return;
    }

    const nextTrackData = state.playlist[nextIndex];
    playTrack(nextTrackData, nextIndex);
  };

  const prevTrack = () => {
    dispatch({ type: 'PREV_TRACK' });
  };

  const setCurrentTrack = useCallback(
    (track: Track, index?: number) => {
      const trackIndex =
        index !== undefined
          ? index
          : state.playlist.findIndex((t) => t.trackId === track.trackId);
      dispatch({
        type: 'SET_CURRENT_TRACK',
        payload: { track, index: trackIndex },
      });
      // Синхронизируем с Redux
      reduxDispatch(setReduxCurrentTrack(track));
    },
    [state.playlist, reduxDispatch],
  );

  const playTrack = useCallback(
    (track: Track, index?: number) => {
      const trackIndex =
        index !== undefined
          ? index
          : state.playlist.findIndex((t) => t.trackId === track.trackId);
      dispatch({
        type: 'SET_CURRENT_TRACK',
        payload: { track, index: trackIndex },
      });
      // Синхронизируем с Redux и запускаем воспроизведение
      reduxDispatch(reduxPlayTrack(track));
      // Автоматически запускаем воспроизведение
      setTimeout(() => {
        play();
      }, 100);
    },
    [state.playlist, reduxDispatch, play],
  );

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const setCurrentTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const setPlaylist = useCallback((tracks: Track[]) => {
    dispatch({ type: 'SET_PLAYLIST', payload: tracks });
  }, []);

  // Обработчики событий аудио элемента
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
    };

    const handleEnded = () => {
      if (state.isRepeat) {
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.log('Ошибка при повторном воспроизведении:', error);
        });
      } else {
        // При завершении трека показываем alert
        alert('Еще не реализовано');
      }
    };

    const handlePlay = () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
    };

    const handlePause = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    const handleError = (error: Event) => {
      console.log('Ошибка аудио элемента:', error);
      dispatch({ type: 'SET_PLAYING', payload: false });
      reduxDispatch(setReduxIsPlaying(false));
    };

    const handleLoadedData = () => {
      console.log('Аудио данные загружены, готов к воспроизведению');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [state.isRepeat]);

  // Обновляем src аудио элемента при смене трека
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
      } else {
        console.log(
          'Трек выбран:',
          state.currentTrack.title,
          'но URL аудиофайла не указан',
        );
      }
    }
  }, [state.currentTrack]);

  // Обновляем громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  const contextValue: PlayerContextType = {
    state,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    setCurrentTrack,
    playTrack,
    setVolume,
    setCurrentTime,
    toggleRepeat,
    toggleShuffle,
    setPlaylist,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {/* Скрытый аудио элемент */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
    </PlayerContext.Provider>
  );
}

// Хук для использования контекста плеера
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
