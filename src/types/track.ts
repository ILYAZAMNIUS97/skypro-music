export interface Track {
  title: string;
  titleSpan?: string;
  author: string;
  album: string;
  time: string;
  genre: string;
  trackId?: string;
  authorId?: string;
  albumId?: string;
  src?: string; // URL аудиофайла
}

export interface TrackProps {
  track: Track;
}
