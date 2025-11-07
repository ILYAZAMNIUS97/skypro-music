// API сервис для работы с треками SkyPro Music

export const API_BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

// Интерфейс для ответа API треков
export interface ApiTrack {
  _id: number;
  name: string;
  author: string;
  album?: string;
  release_date: string;
  genre: string[];
  logo?: string;
  track_file?: string;
  duration_in_seconds?: number;
  stared_user?: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

// Интерфейс для ответа API
export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[]; // Для совместимости с другими форматами
}

export interface ApiSelection {
  id: number;
  title: string;
  description?: string;
  items: ApiTrack[];
}

type SelectionItemsRaw = Array<ApiTrack | number | string | null | undefined>;

import { getAccessToken, getRefreshToken, saveTokens } from './auth';

// Функция для обновления access токена
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/user/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      saveTokens(data.access, refreshToken);
      return data.access;
    }
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
  }

  return null;
};

// Функция для создания заголовков с авторизацией
const createAuthHeaders = async (): Promise<HeadersInit> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Проверяем, не истек ли токен (базовая проверка)
  try {
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenPayload.exp && tokenPayload.exp < currentTime) {
      // Токен истек, пытаемся обновить
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
        };
      }
    }
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

const normalizeSelectionResponse = (
  raw: unknown,
  fallbackId: number,
): {
  id: number;
  title: string;
  description?: string;
  items: SelectionItemsRaw;
} => {
  if (Array.isArray(raw)) {
    return {
      id: fallbackId,
      title: `Подборка ${fallbackId}`,
      items: raw as SelectionItemsRaw,
    };
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Некорректный ответ API для подборки');
  }

  let candidate = raw as Record<string, unknown>;

  if (
    'data' in candidate &&
    candidate.data &&
    typeof candidate.data === 'object' &&
    !Array.isArray(candidate.data)
  ) {
    candidate = candidate.data as Record<string, unknown>;
  }

  const idValue = candidate.id ?? candidate._id ?? fallbackId;
  const titleValue =
    candidate.title ?? candidate.name ?? `Подборка ${fallbackId}`;

  const itemsCandidate =
    candidate.items ??
    candidate.tracks ??
    candidate.trackList ??
    candidate.results ??
    candidate.data;

  const id = typeof idValue === 'number' ? idValue : fallbackId;
  const title =
    typeof titleValue === 'string' && titleValue.trim().length > 0
      ? titleValue
      : `Подборка ${id}`;
  const description =
    typeof candidate.description === 'string'
      ? candidate.description
      : undefined;
  const items = Array.isArray(itemsCandidate)
    ? (itemsCandidate as SelectionItemsRaw)
    : [];

  return {
    id,
    title,
    description,
    items,
  };
};

// API функции для работы с треками
export const tracksApi = {
  // Получить все треки
  getAllTracks: async (): Promise<ApiTrack[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/track/all/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        'API Response received, tracks count:',
        data.data?.length || 0,
      );

      // Проверяем формат ответа
      if (Array.isArray(data)) {
        return data;
      } else if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.data && Array.isArray(data.data)) {
        // API возвращает данные в формате {success: true, data: Array}
        return data.data;
      } else {
        console.error('Неожиданный формат ответа API:', data);
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
    } catch (error) {
      console.error('Ошибка получения треков:', error);
      throw error;
    }
  },

  // Получить трек по ID
  getTrackById: async (id: number): Promise<ApiTrack> => {
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/track/${id}/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: ApiTrack }).data;
      }

      return data as ApiTrack;
    } catch (error) {
      console.error(`Ошибка получения трека ${id}:`, error);
      throw error;
    }
  },

  // Получить избранные треки
  getFavoriteTracks: async (): Promise<ApiTrack[]> => {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/catalog/track/favorite/all/`,
        {
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        'Favorite API Response received, tracks count:',
        data.data?.length || 0,
      );

      // Проверяем формат ответа
      if (Array.isArray(data)) {
        return data;
      } else if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.data && Array.isArray(data.data)) {
        // API возвращает данные в формате {success: true, data: Array}
        return data.data;
      } else {
        console.error('Неожиданный формат ответа API для избранных:', data);
        return [];
      }
    } catch (error) {
      console.error('Ошибка получения избранных треков:', error);
      throw error;
    }
  },

  // Получить подборку по ID
  getSelectionById: async (id: number): Promise<ApiSelection> => {
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/selection/${id}/`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const normalized = normalizeSelectionResponse(data, id);

      const tracks: ApiTrack[] = [];
      const idsToFetch: number[] = [];

      normalized.items.forEach((item) => {
        if (item && typeof item === 'object') {
          const candidate = item as Partial<ApiTrack>;
          if (typeof candidate._id === 'number' && candidate.name) {
            tracks.push(candidate as ApiTrack);
            return;
          }
        }

        if (typeof item === 'number' && Number.isFinite(item)) {
          idsToFetch.push(item);
          return;
        }

        if (typeof item === 'string') {
          const parsedId = Number.parseInt(item, 10);
          if (!Number.isNaN(parsedId)) {
            idsToFetch.push(parsedId);
          }
        }
      });

      if (idsToFetch.length > 0) {
        const fetchedTracks = await Promise.all(
          idsToFetch.map(async (trackId) => {
            try {
              return await tracksApi.getTrackById(trackId);
            } catch (fetchError) {
              console.error(`Не удалось получить трек ${trackId}:`, fetchError);
              return null;
            }
          }),
        );

        fetchedTracks.forEach((track) => {
          if (track) {
            tracks.push(track);
          }
        });
      }

      return {
        id: normalized.id,
        title: normalized.title,
        description: normalized.description,
        items: tracks,
      };
    } catch (error) {
      console.error(`Ошибка получения подборки ${id}:`, error);
      throw error;
    }
  },

  // Добавить трек в избранное
  addToFavorites: async (id: number): Promise<void> => {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/catalog/track/${id}/favorite/`,
        {
          method: 'POST',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Ошибка добавления трека ${id} в избранное:`, error);
      throw error;
    }
  },

  // Удалить трек из избранного
  removeFromFavorites: async (id: number): Promise<void> => {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/catalog/track/${id}/favorite/`,
        {
          method: 'DELETE',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Ошибка удаления трека ${id} из избранного:`, error);
      throw error;
    }
  },
};

// Функция для преобразования API трека в формат приложения
export const transformApiTrack = (apiTrack: ApiTrack) => {
  // Проверяем, что у трека есть все необходимые поля
  if (!apiTrack || !apiTrack._id || !apiTrack.name) {
    console.error('Некорректные данные трека:', apiTrack);
    return null;
  }

  // Обрабатываем жанр (может быть массивом)
  const genreString = Array.isArray(apiTrack.genre)
    ? apiTrack.genre.join(', ')
    : apiTrack.genre || 'Неизвестный жанр';

  const transformedTrack = {
    title: apiTrack.name || 'Неизвестный трек',
    author: apiTrack.author || 'Неизвестный исполнитель',
    album: apiTrack.album || 'Неизвестный альбом',
    time: formatDuration(apiTrack.duration_in_seconds || 180), // По умолчанию 3 минуты
    genre: genreString,
    trackId: apiTrack._id.toString(),
    authorId: '1', // API не предоставляет authorId, используем заглушку
    albumId: '1', // API не предоставляет albumId, используем заглушку
    src:
      apiTrack.track_file ||
      'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_Epic_Heroic_Conquest.mp3', // Fallback URL
    isFavorite: apiTrack.stared_user && apiTrack.stared_user.length > 0,
  };

  return transformedTrack;
};

// Функция для форматирования длительности в секундах в формат MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
