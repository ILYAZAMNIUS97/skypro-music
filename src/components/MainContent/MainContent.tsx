import { Search } from '../Search/Search';
import { Filter } from '../Filter/Filter';
import { Playlist } from '../Playlist/Playlist';
import styles from './MainContent.module.css';

export const MainContent = () => {
  return (
    <div className={styles.centerblock}>
      <Search />
      <h2 className={styles.centerblockH2}>Треки</h2>
      <Filter />
      <Playlist />
    </div>
  );
};
