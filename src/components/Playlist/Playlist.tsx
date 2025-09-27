import { Track } from '../Track/Track';
import styles from './Playlist.module.css';

const tracks = [
  {
    title: 'Guilt',
    titleSpan: '',
    author: 'Nero',
    album: 'Welcome Reality',
    time: '4:44',
  },
  {
    title: 'Elektro',
    titleSpan: '',
    author: 'Dynoro, Outwork, Mr. Gee',
    album: 'Elektro',
    time: '2:22',
  },
  {
    title: "I'm Fire",
    titleSpan: '',
    author: 'Ali Bakgor',
    album: "I'm Fire",
    time: '2:22',
  },
  {
    title: 'Non Stop',
    titleSpan: '(Remix)',
    author: 'Стоункат, Psychopath',
    album: 'Non Stop',
    time: '4:12',
  },
  {
    title: 'Run Run',
    titleSpan: '(feat. AR/CO)',
    author: 'Jaded, Will Clarke, AR/CO',
    album: 'Run Run',
    time: '2:54',
  },
];

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
          />
        ))}
      </div>
    </div>
  );
};
