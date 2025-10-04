import { type FC } from 'react';
import classNames from 'classnames';
import styles from './GenreDialog.module.css';

interface GenreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGenre: (genre: string) => void;
  selectedGenre?: string;
}

const GENRES = ['Рок', 'Хип-Хоп', 'Поп-музыка', 'Техно', 'Инди'];

export const GenreDialog: FC<GenreDialogProps> = ({
  isOpen,
  onClose,
  onSelectGenre,
  selectedGenre,
}) => {
  if (!isOpen) return null;

  const handleGenreClick = (genre: string) => {
    onSelectGenre(genre);
    onClose();
  };

  return (
    <div className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.genreList}>
          {GENRES.map((genre) => (
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
