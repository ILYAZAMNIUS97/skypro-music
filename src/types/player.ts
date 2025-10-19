import { type Track } from './track';

export interface PlayerState {
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

export interface PlayerContextType {
  state: PlayerState;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTrack: (track: Track, index?: number) => void;
  playTrack: (track: Track, index?: number) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setPlaylist: (tracks: Track[]) => void;
}
