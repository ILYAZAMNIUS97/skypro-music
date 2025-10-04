import { type FC } from 'react';
import classNames from 'classnames';
import styles from './ArtistDialog.module.css';

interface ArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artist: string) => void;
  selectedArtist?: string;
}

const ARTISTS = [
  'Michael Jackson',
  'The Beatles',
  'Queen',
  'Led Zeppelin',
  'Pink Floyd',
  'AC/DC',
  'Metallica',
  'Nirvana',
  'Radiohead',
  'Coldplay',
  'U2',
  'Red Hot Chili Peppers',
  'Foo Fighters',
  'Green Day',
  'Linkin Park',
  'Eminem',
  'Kanye West',
  'Drake',
  'Taylor Swift',
  'Ariana Grande',
  'Billie Eilish',
  'Ed Sheeran',
  'Bruno Mars',
  'Justin Bieber',
  'Rihanna',
  'Beyoncé',
  'Adele',
  'Lady Gaga',
  'Katy Perry',
  'Dua Lipa',
];

export const ArtistDialog: FC<ArtistDialogProps> = ({
  isOpen,
  onClose,
  onSelectArtist,
  selectedArtist,
}) => {
  if (!isOpen) return null;

  const handleArtistClick = (artist: string) => {
    onSelectArtist(artist);
    onClose();
  };

  return (
    <div className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.artistList}>
          {ARTISTS.map((artist) => (
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
