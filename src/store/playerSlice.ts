import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { type Track } from '../types/track';
import { tracksApi, transformApiTrack } from '../utils/api';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRepeat: boolean;
  repeatMode: 'off' | 'one' | 'all'; // Режимы повтора: выключен, один трек, весь плейлист
  isShuffle: boolean;
  playlist: Track[];
  currentTrackIndex: number;
  isLoading: boolean;
  error: string | null;
  pausedTime: number; // Время паузы для сохранения позиции
  // Запоминаем порядок воспроизведения при Shuffle
  shuffleOrder: number[] | null;
  shufflePosition: number; // текущая позиция в shuffleOrder
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isRepeat: false,
  repeatMode: 'off',
  isShuffle: false,
  playlist: [],
  currentTrackIndex: -1,
  isLoading: false,
  error: null,
  pausedTime: 0,
  shuffleOrder: null,
  shufflePosition: -1,
};

// Асинхронные thunk'и для работы с API
export const fetchTracks = createAsyncThunk(
  'player/fetchTracks',
  async (_, { rejectWithValue }) => {
    try {
      const apiTracks = await tracksApi.getAllTracks();
      const transformedTracks = apiTracks
        .map(transformApiTrack)
        .filter((track) => track !== null); // Фильтруем null значения
      return transformedTracks;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка загрузки треков',
      );
    }
  },
);

export const fetchFavoriteTracks = createAsyncThunk(
  'player/fetchFavoriteTracks',
  async (_, { rejectWithValue }) => {
    try {
      const apiTracks = await tracksApi.getFavoriteTracks();
      const transformedTracks = apiTracks
        .map(transformApiTrack)
        .filter((track) => track !== null); // Фильтруем null значения
      return transformedTracks;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка загрузки избранных треков',
      );
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'player/toggleFavorite',
  async (
    { trackId, isFavorite }: { trackId: string; isFavorite: boolean },
    { rejectWithValue },
  ) => {
    try {
      const id = parseInt(trackId);
      if (isFavorite) {
        await tracksApi.removeFromFavorites(id);
      } else {
        await tracksApi.addToFavorites(id);
      }
      return { trackId, isFavorite: !isFavorite };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка изменения избранного',
      );
    }
  },
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (
      state,
      action: PayloadAction<{ track: Track; index: number }>,
    ) => {
      state.currentTrack = action.payload.track;
      state.currentTrackIndex = action.payload.index;
      state.currentTime = 0; // Всегда сбрасываем при смене трека
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    toggleRepeat: (state) => {
      // Циклическое переключение режимов повтора: off -> one -> all -> off
      if (state.repeatMode === 'off') {
        state.repeatMode = 'one';
        state.isRepeat = true;
      } else if (state.repeatMode === 'one') {
        state.repeatMode = 'all';
        state.isRepeat = true;
      } else {
        state.repeatMode = 'off';
        state.isRepeat = false;
      }
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
      if (state.isShuffle) {
        // Включаем shuffle: создаем порядок, фиксируем позицию текущего трека
        const indices = state.playlist.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const currentIndex =
          state.currentTrackIndex > -1 ? state.currentTrackIndex : 0;
        const pos = indices.indexOf(currentIndex);
        if (pos > -1) {
          state.shuffleOrder = indices;
          state.shufflePosition = pos;
        } else {
          state.shuffleOrder = [
            currentIndex,
            ...indices.filter((i) => i !== currentIndex),
          ];
          state.shufflePosition = 0;
        }
      } else {
        // Выключаем shuffle
        state.shuffleOrder = null;
        state.shufflePosition = -1;
      }
    },
    setPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.playlist = action.payload;
      // При смене плейлиста сбрасываем shuffle порядок
      state.shuffleOrder = null;
      state.shufflePosition = -1;
    },
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      let nextIndex = state.currentTrackIndex;
      if (
        state.isShuffle &&
        state.shuffleOrder &&
        state.shuffleOrder.length > 0
      ) {
        // Память порядка при Shuffle
        if (state.shufflePosition < state.shuffleOrder.length - 1) {
          state.shufflePosition += 1;
          nextIndex = state.shuffleOrder[state.shufflePosition];
        } else {
          // В конце — ничего не делаем
          nextIndex = state.currentTrackIndex;
        }
      } else {
        // Обычная последовательность
        nextIndex = state.currentTrackIndex + 1;
        if (nextIndex >= state.playlist.length) {
          // Если включен режим повтора всего плейлиста, переходим к началу
          if (state.repeatMode === 'all') {
            nextIndex = 0;
          } else {
            // В конце — остаемся на текущем треке (не останавливаем воспроизведение насильно)
            nextIndex = state.currentTrackIndex;
          }
        }
      }

      // Проверяем, что индекс валидный и есть фактическое перемещение
      if (
        nextIndex >= 0 &&
        nextIndex < state.playlist.length &&
        nextIndex !== state.currentTrackIndex
      ) {
        state.currentTrack = state.playlist[nextIndex];
        state.currentTrackIndex = nextIndex;
        state.currentTime = 0; // Всегда сбрасываем при смене трека
        state.isPlaying = true; // Автоматически запускаем воспроизведение
      }
    },
    prevTrack: (state) => {
      if (state.playlist.length === 0) return;

      let prevIndex = state.currentTrackIndex;
      if (
        state.isShuffle &&
        state.shuffleOrder &&
        state.shuffleOrder.length > 0
      ) {
        if (state.shufflePosition > 0) {
          state.shufflePosition -= 1;
          prevIndex = state.shuffleOrder[state.shufflePosition];
        } else {
          // В начале — ничего не делаем
          prevIndex = state.currentTrackIndex;
        }
      } else {
        // Обычная последовательность
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) {
          // Если включен режим повтора всего плейлиста, переходим к концу
          if (state.repeatMode === 'all') {
            prevIndex = state.playlist.length - 1;
          } else {
            // В начале — остаемся на первом
            prevIndex = 0;
          }
        }
      }

      // Проверяем, что индекс валидный и есть фактическое перемещение
      if (
        prevIndex >= 0 &&
        prevIndex < state.playlist.length &&
        prevIndex !== state.currentTrackIndex
      ) {
        state.currentTrack = state.playlist[prevIndex];
        state.currentTrackIndex = prevIndex;
        state.currentTime = 0; // Всегда сбрасываем при смене трека
        state.isPlaying = true; // Автоматически запускаем воспроизведение
      }
    },
    playTrack: (state, action: PayloadAction<Track>) => {
      const trackIndex = state.playlist.findIndex(
        (t) => t.trackId === action.payload.trackId,
      );
      state.currentTrack = action.payload;
      state.currentTrackIndex = trackIndex;
      state.isPlaying = true;
      state.currentTime = 0; // Всегда сбрасываем при смене трека
    },
    playTrackWithPlaylist: (
      state,
      action: PayloadAction<{ track: Track; playlist: Track[] }>,
    ) => {
      const { track, playlist } = action.payload;
      const trackIndex = playlist.findIndex((t) => t.trackId === track.trackId);

      state.playlist = playlist;
      state.currentTrack = track;
      state.currentTrackIndex = trackIndex;
      state.isPlaying = true;
      state.currentTime = 0; // Всегда сбрасываем при смене трека
      // Если shuffle включен — пересобираем порядок с учетом текущего трека
      if (state.isShuffle) {
        const indices = playlist.map((_, i) => i);
        // Перемешиваем Фишером-Йетсом
        for (let i = indices.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        // Гарантируем, что текущий трек будет на текущей позиции
        const pos = indices.indexOf(trackIndex);
        if (pos > -1) {
          state.shuffleOrder = indices;
          state.shufflePosition = pos;
        } else {
          state.shuffleOrder = [
            trackIndex,
            ...indices.filter((i) => i !== trackIndex),
          ];
          state.shufflePosition = 0;
        }
      } else {
        state.shuffleOrder = null;
        state.shufflePosition = -1;
      }
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    // Новые экшены для замены useCallback
    playAudio: (state) => {
      state.isPlaying = true;
    },
    pauseAudio: (state) => {
      state.isPlaying = false;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setVolumeLevel: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Новые actions для правильного управления паузой/воспроизведением
    pauseTrack: (state) => {
      state.isPlaying = false;
      state.pausedTime = state.currentTime; // Сохраняем текущую позицию при паузе
    },
    resumeTrack: (state) => {
      state.isPlaying = true;
      // Воспроизводим с сохраненной позиции
      state.currentTime = state.pausedTime;
    },
  },
  extraReducers: (builder) => {
    // Обработка fetchTracks
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlist = action.payload;
        state.error = null;
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Обработка fetchFavoriteTracks
    builder
      .addCase(fetchFavoriteTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlist = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoriteTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Обработка toggleFavorite
    builder
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { trackId, isFavorite } = action.payload;
        // Обновляем статус избранного в плейлисте
        const trackIndex = state.playlist.findIndex(
          (track) => track.trackId === trackId,
        );
        if (trackIndex !== -1) {
          state.playlist[trackIndex].isFavorite = isFavorite;
        }
        // Обновляем статус в текущем треке, если это он
        if (state.currentTrack?.trackId === trackId) {
          state.currentTrack.isFavorite = isFavorite;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleRepeat,
  toggleShuffle,
  setPlaylist,
  nextTrack,
  prevTrack,
  playTrack,
  playTrackWithPlaylist,
  togglePlay,
  playAudio,
  pauseAudio,
  setProgress,
  setVolumeLevel,
  togglePlayPause,
  clearError,
  pauseTrack,
  resumeTrack,
} = playerSlice.actions;
export default playerSlice.reducer;
