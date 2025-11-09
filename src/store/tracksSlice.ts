import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { type Track } from '@/types/track';
import { tracksApi, transformApiTrack } from '@/utils/api';

interface TracksState {
  favoriteTracks: Track[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TracksState = {
  favoriteTracks: [],
  isLoading: false,
  error: null,
};

// Thunk для загрузки избранных треков с сервера
export const fetchFavoriteTracks = createAsyncThunk(
  'tracks/fetchFavoriteTracks',
  async (_, { rejectWithValue }) => {
    try {
      const apiTracks = await tracksApi.getFavoriteTracks();
      const transformedTracks = apiTracks
        .map(transformApiTrack)
        .filter((track): track is Track => track !== null);
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

export const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    addLikedTracks: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      // Проверяем, нет ли уже этого трека в избранном
      if (!state.favoriteTracks.some((t) => t.trackId === track.trackId)) {
        state.favoriteTracks.push(track);
      }
    },
    removeLikedTracks: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      state.favoriteTracks = state.favoriteTracks.filter(
        (t) => t.trackId !== track.trackId,
      );
    },
    setFavoriteTracks: (state, action: PayloadAction<Track[]>) => {
      state.favoriteTracks = action.payload;
    },
    clearFavoriteTracks: (state) => {
      state.favoriteTracks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoriteTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteTracks = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoriteTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Ошибка загрузки избранных треков';
      });
  },
});

export const {
  addLikedTracks,
  removeLikedTracks,
  setFavoriteTracks,
  clearFavoriteTracks,
} = tracksSlice.actions;

export default tracksSlice.reducer;
