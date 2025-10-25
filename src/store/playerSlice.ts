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
      console.error('Ошибка при изменении избранного:', error);
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
      state.currentTime = 0;
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
    },
    setPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.playlist = action.payload;
    },
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      let nextIndex;
      if (state.isShuffle) {
        // Случайный трек при включенном перемешивании
        nextIndex = Math.floor(Math.random() * state.playlist.length);
        // Если случайно выбрали тот же трек, берем следующий
        if (
          nextIndex === state.currentTrackIndex &&
          state.playlist.length > 1
        ) {
          nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
        }
      } else {
        // Обычная последовательность
        nextIndex = state.currentTrackIndex + 1;
        if (nextIndex >= state.playlist.length) {
          // Если включен режим повтора всего плейлиста, переходим к началу
          if (state.repeatMode === 'all') {
            nextIndex = 0;
          } else {
            // Если плейлист закончился и повтор выключен, останавливаемся на последнем треке
            nextIndex = state.currentTrackIndex;
            state.isPlaying = false;
          }
        }
      }

      // Проверяем, что индекс валидный
      if (nextIndex >= 0 && nextIndex < state.playlist.length) {
        state.currentTrack = state.playlist[nextIndex];
        state.currentTrackIndex = nextIndex;
        state.currentTime = 0;
        state.isPlaying = true; // Автоматически запускаем воспроизведение
      }
    },
    prevTrack: (state) => {
      if (state.playlist.length === 0) return;

      let prevIndex;
      if (state.isShuffle) {
        // Случайный трек при включенном перемешивании
        prevIndex = Math.floor(Math.random() * state.playlist.length);
        // Если случайно выбрали тот же трек, берем предыдущий
        if (
          prevIndex === state.currentTrackIndex &&
          state.playlist.length > 1
        ) {
          prevIndex =
            state.currentTrackIndex === 0
              ? state.playlist.length - 1
              : state.currentTrackIndex - 1;
        }
      } else {
        // Обычная последовательность
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) {
          // Если включен режим повтора всего плейлиста, переходим к концу
          if (state.repeatMode === 'all') {
            prevIndex = state.playlist.length - 1;
          } else {
            // Если плейлист закончился и повтор выключен, останавливаемся на первом треке
            prevIndex = 0;
          }
        }
      }

      // Проверяем, что индекс валидный
      if (prevIndex >= 0 && prevIndex < state.playlist.length) {
        state.currentTrack = state.playlist[prevIndex];
        state.currentTrackIndex = prevIndex;
        state.currentTime = 0;
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
      state.currentTime = 0;
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
      state.currentTime = 0;
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
} = playerSlice.actions;
export default playerSlice.reducer;
