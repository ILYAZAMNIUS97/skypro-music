import { type Track } from '../types/track';

/**
 * Извлекает уникальных авторов из массива треков
 * @param tracks - массив треков
 * @returns массив уникальных авторов
 */
export function getUniqueAuthors(tracks: Track[]): string[] {
  return Array.from(new Set(tracks.map((track) => track.author)));
}

/**
 * Извлекает уникальные жанры из массива треков
 * @param tracks - массив треков
 * @returns массив уникальных жанров
 */
export function getUniqueGenres(tracks: Track[]): string[] {
  return Array.from(new Set(tracks.map((track) => track.genre)));
}
