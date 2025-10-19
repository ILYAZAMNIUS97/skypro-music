import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Track } from '../types/track';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRepeat: boolean;
  isShuffle: boolean;
  playlist: Track[];
  currentTrackIndex: number;
}

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
      state.isRepeat = !state.isRepeat;
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
    },
    setPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.playlist = action.payload;
    },
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      let nextIndex = state.currentTrackIndex + 1;
      if (nextIndex >= state.playlist.length) {
        nextIndex = state.isRepeat ? 0 : state.currentTrackIndex;
      }

      state.currentTrack = state.playlist[nextIndex];
      state.currentTrackIndex = nextIndex;
      state.currentTime = 0;
    },
    prevTrack: (state) => {
      if (state.playlist.length === 0) return;

      let prevIndex = state.currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.isRepeat ? state.playlist.length - 1 : 0;
      }

      state.currentTrack = state.playlist[prevIndex];
      state.currentTrackIndex = prevIndex;
      state.currentTime = 0;
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
} = playerSlice.actions;
export default playerSlice.reducer;
