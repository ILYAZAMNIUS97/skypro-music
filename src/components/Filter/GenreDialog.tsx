import { type FC, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import styles from './GenreDialog.module.css';
import { type Track } from '../../types/track';
import { getUniqueGenres } from '../../utils/filterUtils';

interface GenreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGenre: (genre: string) => void;
  selectedGenre?: string;
  tracks: Track[];
}

export const GenreDialog: FC<GenreDialogProps> = ({
  isOpen,
  onClose,
  onSelectGenre,
  selectedGenre,
  tracks,
}) => {
  // Получаем уникальные жанры из треков
  const uniqueGenres = useMemo(() => getUniqueGenres(tracks), [tracks]);

  const handleGenreClick = useCallback(
    (genre: string) => {
      onSelectGenre(genre);
      onClose();
    },
    [onSelectGenre, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.genreList}>
          {uniqueGenres.map((genre) => (
            <button
              key={genre}
              className={classNames(styles.genreItem, {
                [styles.selected]: selectedGenre === genre,
              })}
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
