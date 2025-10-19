import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Track } from '../types/track';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track | null>) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    playTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
  },
});

export const { setCurrentTrack, setIsPlaying, togglePlay, playTrack } =
  playerSlice.actions;
export default playerSlice.reducer;
