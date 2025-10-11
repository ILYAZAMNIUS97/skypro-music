import Link from 'next/link';
import styles from './Track.module.css';

interface TrackProps {
  title: string;
  titleSpan?: string;
  author: string;
  album: string;
  time: string;
  genre: string;
  trackId?: string;
  authorId?: string;
  albumId?: string;
}

export const Track = ({
  title,
  titleSpan,
  author,
  album,
  time,
  genre,
  trackId = '1',
  authorId = '1',
  albumId = '1',
}: TrackProps) => {
  return (
    <div className={styles.playlistItem} data-genre={genre}>
      <div className={styles.playlistTrack}>
        <div className={styles.trackTitle}>
          <div className={styles.trackTitleImage}>
            <svg className={styles.trackTitleSvg}>
              <use href="/img/icon/sprite.svg#icon-note"></use>
            </svg>
          </div>
          <div className={styles.trackTitleText}>
            <Link className={styles.trackTitleLink} href={`/track/${trackId}`}>
              {title}{' '}
              {titleSpan && (
                <span className={styles.trackTitleSpan}>{titleSpan}</span>
              )}
            </Link>
          </div>
        </div>
        <div className={styles.trackAuthor}>
          <Link className={styles.trackAuthorLink} href={`/author/${authorId}`}>
            {author}
          </Link>
        </div>
        <div className={styles.trackAlbum}>
          <Link className={styles.trackAlbumLink} href={`/album/${albumId}`}>
            {album}
          </Link>
        </div>
        <div className={styles.trackTime}>
          <svg className={styles.trackTimeSvg}>
            <use href="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.trackTimeText}>{time}</span>
        </div>
      </div>
    </div>
  );
};
