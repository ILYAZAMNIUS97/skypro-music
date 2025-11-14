'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import styles from './Filter.module.css';
import { ArtistDialog } from './ArtistDialog';
import { YearDialog } from './YearDialog';
import { GenreDialog } from './GenreDialog';
import { tracks } from '../../data/tracks';

export const Filter = () => {
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isGenreDialogOpen, setIsGenreDialogOpen] = useState(false);

  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const filterRef = useRef<HTMLDivElement>(null);

  // Закрываем все диалоги при клике вне компонента
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target as Node)
    ) {
      setIsArtistDialogOpen(false);
      setIsYearDialogOpen(false);
      setIsGenreDialogOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleArtistClick = useCallback(() => {
    // Закрываем другие диалоги
    setIsYearDialogOpen(false);
    setIsGenreDialogOpen(false);
    // Переключаем текущий диалог
    setIsArtistDialogOpen((prev) => !prev);
  }, []);

  const handleYearClick = useCallback(() => {
    // Закрываем другие диалоги
    setIsArtistDialogOpen(false);
    setIsGenreDialogOpen(false);
    // Переключаем текущий диалог
    setIsYearDialogOpen((prev) => !prev);
  }, []);

  const handleGenreClick = useCallback(() => {
    // Закрываем другие диалоги
    setIsArtistDialogOpen(false);
    setIsYearDialogOpen(false);
    // Переключаем текущий диалог
    setIsGenreDialogOpen((prev) => !prev);
  }, []);

  const handleSelectArtist = useCallback((artist: string) => {
    setSelectedArtist(artist);
    // Здесь можно добавить логику фильтрации
  }, []);

  const handleSelectYear = useCallback((yearOption: string) => {
    setSelectedYear(yearOption);
    // Здесь можно добавить логику сортировки
  }, []);

  const handleSelectGenre = useCallback((genre: string) => {
    setSelectedGenre(genre);
    // Здесь можно добавить логику фильтрации
  }, []);

  // Мемоизируем колбэки для закрытия диалогов
  const handleCloseArtistDialog = useCallback(() => {
    setIsArtistDialogOpen(false);
  }, []);

  const handleCloseYearDialog = useCallback(() => {
    setIsYearDialogOpen(false);
  }, []);

  const handleCloseGenreDialog = useCallback(() => {
    setIsGenreDialogOpen(false);
  }, []);

  return (
    <>
      <div ref={filterRef} className={styles.filter}>
        <div className={styles.filterTitle}>Искать по:</div>
        <div className={styles.filterButtonContainer}>
          <button
            className={classNames(styles.filterButton, {
              [styles.active]: isArtistDialogOpen,
            })}
            onClick={handleArtistClick}
          >
            исполнителю
          </button>
          {isArtistDialogOpen && (
            <ArtistDialog
              isOpen={isArtistDialogOpen}
              onClose={handleCloseArtistDialog}
              onSelectArtist={handleSelectArtist}
              selectedArtist={selectedArtist}
              tracks={tracks}
            />
          )}
        </div>
        <div className={styles.filterButtonContainer}>
          <button
            className={classNames(styles.filterButton, {
              [styles.active]: isYearDialogOpen,
            })}
            onClick={handleYearClick}
          >
            году выпуска
          </button>
          {isYearDialogOpen && (
            <YearDialog
              isOpen={isYearDialogOpen}
              onClose={handleCloseYearDialog}
              onSelectYear={handleSelectYear}
              selectedYear={selectedYear}
            />
          )}
        </div>
        <div className={styles.filterButtonContainer}>
          <button
            className={classNames(styles.filterButton, {
              [styles.active]: isGenreDialogOpen,
            })}
            onClick={handleGenreClick}
          >
            жанру
          </button>
          {isGenreDialogOpen && (
            <GenreDialog
              isOpen={isGenreDialogOpen}
              onClose={handleCloseGenreDialog}
              onSelectGenre={handleSelectGenre}
              selectedGenre={selectedGenre}
              tracks={tracks}
            />
          )}
        </div>
      </div>
    </>
  );
};
