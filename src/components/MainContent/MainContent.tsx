import { Search } from '../Search/Search';
import { Filter } from '../Filter/Filter';
import { Playlist } from '../Playlist/Playlist';
import styles from './MainContent.module.css';
import { type Track } from '@/types/track';

interface MainContentProps {
  pageTitle?: string;
  initialTracks?: Track[];
  errorMessage?: string | null;
}

export const MainContent = ({
  pageTitle = 'Треки',
  initialTracks,
  errorMessage,
}: MainContentProps) => {
  return (
    <div className={styles.centerblock}>
      <Search />
      <h2 className={styles.centerblockH2}>{pageTitle}</h2>
      <Filter />
      <Playlist initialTracks={initialTracks} errorMessage={errorMessage} />
    </div>
  );
};
