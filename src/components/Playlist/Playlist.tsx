import { Track } from '../Track/Track';
import styles from './Playlist.module.css';
import { tracks } from '../../data/tracks';

export const Playlist = () => {
  return (
    <div className={styles.content}>
      <div className={styles.contentTitle}>
        <div className={styles.playlistTitleCol01}>Трек</div>
        <div className={styles.playlistTitleCol02}>Исполнитель</div>
        <div className={styles.playlistTitleCol03}>Альбом</div>
        <div className={styles.playlistTitleCol04}>
          <svg className={styles.playlistTitleSvg}>
            <use href="/img/icon/sprite.svg#icon-watch"></use>
          </svg>
        </div>
      </div>
      <div className={styles.contentPlaylist}>
        {tracks.map((track, index) => (
          <Track
            key={index}
            title={track.title}
            titleSpan={track.titleSpan}
            author={track.author}
            album={track.album}
            time={track.time}
            genre={track.genre}
          />
        ))}
      </div>
    </div>
  );
};
