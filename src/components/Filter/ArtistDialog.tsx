import { type FC } from 'react';
import classNames from 'classnames';
import styles from './ArtistDialog.module.css';
import { type Track } from '../../types/track';
import { getUniqueAuthors } from '../../utils/filterUtils';

interface ArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artist: string) => void;
  selectedArtist?: string;
  tracks: Track[];
}

export const ArtistDialog: FC<ArtistDialogProps> = ({
  isOpen,
  onClose,
  onSelectArtist,
  selectedArtist,
  tracks,
}) => {
  if (!isOpen) return null;

  const handleArtistClick = (artist: string) => {
    onSelectArtist(artist);
    onClose();
  };

  // Получаем уникальных авторов из треков
  const uniqueAuthors = getUniqueAuthors(tracks);

  return (
    <div className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.artistList}>
          {uniqueAuthors.map((artist) => (
            <button
              key={artist}
              className={classNames(styles.artistItem, {
                [styles.selected]: selectedArtist === artist,
              })}
              onClick={() => handleArtistClick(artist)}
            >
              {artist}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
