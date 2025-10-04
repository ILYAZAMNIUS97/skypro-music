'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Filter.module.css';
import { ArtistDialog } from './ArtistDialog';
import { YearDialog } from './YearDialog';
import { GenreDialog } from './GenreDialog';

export const Filter = () => {
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isGenreDialogOpen, setIsGenreDialogOpen] = useState(false);

  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const filterRef = useRef<HTMLDivElement>(null);

  // Закрываем все диалоги при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsArtistDialogOpen(false);
        setIsYearDialogOpen(false);
        setIsGenreDialogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleArtistClick = () => {
    // Закрываем другие диалоги
    setIsYearDialogOpen(false);
    setIsGenreDialogOpen(false);
    // Переключаем текущий диалог
    setIsArtistDialogOpen(!isArtistDialogOpen);
  };

  const handleYearClick = () => {
    // Закрываем другие диалоги
    setIsArtistDialogOpen(false);
    setIsGenreDialogOpen(false);
    // Переключаем текущий диалог
    setIsYearDialogOpen(!isYearDialogOpen);
  };

  const handleGenreClick = () => {
    // Закрываем другие диалоги
    setIsArtistDialogOpen(false);
    setIsYearDialogOpen(false);
    // Переключаем текущий диалог
    setIsGenreDialogOpen(!isGenreDialogOpen);
  };

  const handleSelectArtist = (artist: string) => {
    setSelectedArtist(artist);
    console.log('Выбран исполнитель:', artist);
    // Здесь можно добавить логику фильтрации
  };

  const handleSelectYear = (yearOption: string) => {
    setSelectedYear(yearOption);
    console.log('Выбрана сортировка по году:', yearOption);
    // Здесь можно добавить логику сортировки
  };

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    console.log('Выбран жанр:', genre);
    // Здесь можно добавить логику фильтрации
  };

  return (
    <>
      <div ref={filterRef} className={styles.filter}>
        <div className={styles.filterTitle}>Искать по:</div>
        <div className={styles.filterButtonContainer}>
          <button className={styles.filterButton} onClick={handleArtistClick}>
            исполнителю
          </button>
          {isArtistDialogOpen && (
            <ArtistDialog
              isOpen={isArtistDialogOpen}
              onClose={() => setIsArtistDialogOpen(false)}
              onSelectArtist={handleSelectArtist}
              selectedArtist={selectedArtist}
            />
          )}
        </div>
        <div className={styles.filterButtonContainer}>
          <button className={styles.filterButton} onClick={handleYearClick}>
            году выпуска
          </button>
          {isYearDialogOpen && (
            <YearDialog
              isOpen={isYearDialogOpen}
              onClose={() => setIsYearDialogOpen(false)}
              onSelectYear={handleSelectYear}
              selectedYear={selectedYear}
            />
          )}
        </div>
        <div className={styles.filterButtonContainer}>
          <button className={styles.filterButton} onClick={handleGenreClick}>
            жанру
          </button>
          {isGenreDialogOpen && (
            <GenreDialog
              isOpen={isGenreDialogOpen}
              onClose={() => setIsGenreDialogOpen(false)}
              onSelectGenre={handleSelectGenre}
              selectedGenre={selectedGenre}
            />
          )}
        </div>
      </div>
    </>
  );
};
