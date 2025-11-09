import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Track } from '@/types/track';

interface TracksState {
  favoriteTracks: Track[];
}

const initialState: TracksState = {
  favoriteTracks: [],
};

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
});

export const {
  addLikedTracks,
  removeLikedTracks,
  setFavoriteTracks,
  clearFavoriteTracks,
} = tracksSlice.actions;

export default tracksSlice.reducer;
