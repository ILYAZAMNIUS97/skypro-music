// API сервис для работы с треками SkyPro Music

import { type Track } from '@/types/track';

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
import { authApi } from './authApi';
import type { AppDispatch } from '@/store/store';
import { updateTokens } from '@/store/authSlice';

// Функция для обновления access токена
const refreshAccessToken = async (): Promise<string | null> => {
  // На сервере не обновляем токены
  if (typeof window === 'undefined') {
    return null;
  }

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
  } catch {
    // Ошибка обновления токена
  }

  return null;
};

// Функция для создания заголовков с авторизацией
const createAuthHeaders = async (): Promise<HeadersInit> => {
  // На сервере не используем токены из localStorage
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }

  const accessToken = getAccessToken();

  if (!accessToken) {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Проверяем, не истек ли токен (базовая проверка)
  try {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      // Некорректный формат токена
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // Используем Buffer на сервере, atob в браузере
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let decoded: string;

    if (typeof window !== 'undefined' && typeof atob !== 'undefined') {
      decoded = atob(base64);
    } else if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(base64, 'base64').toString('utf-8');
    } else {
      // Если нет ни atob, ни Buffer, просто используем токен как есть
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
    }

    const tokenPayload = JSON.parse(decoded);
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
  } catch {
    // Ошибка проверки токена, используем токен как есть
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

      // Проверяем формат ответа
      if (Array.isArray(data)) {
        return data;
      } else if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.data && Array.isArray(data.data)) {
        // API возвращает данные в формате {success: true, data: Array}
        return data.data;
      } else {
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
    } catch (error) {
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
      throw error;
    }
  },

  // Получить избранные треки
  getFavoriteTracks: async (): Promise<ApiTrack[]> => {
    let headers = await createAuthHeaders();
    let response = await fetch(`${API_BASE_URL}/catalog/track/favorite/all/`, {
      headers,
    });

    // Если получили 401, пытаемся обновить токен и повторить запрос
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            headers = await createAuthHeaders();
            response = await fetch(
              `${API_BASE_URL}/catalog/track/favorite/all/`,
              {
                headers,
              },
            );
          }
        } catch {
          throw new Error('Не удалось обновить токен доступа');
        }
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Проверяем формат ответа
    if (Array.isArray(data)) {
      return data;
    } else if (data.results && Array.isArray(data.results)) {
      return data.results;
    } else if (data.data && Array.isArray(data.data)) {
      // API возвращает данные в формате {success: true, data: Array}
      return data.data;
    } else {
      return [];
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
            } catch {
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
      throw error;
    }
  },

  // Добавить трек в избранное
  addToFavorites: async (id: number): Promise<void> => {
    let headers = await createAuthHeaders();
    let response = await fetch(
      `${API_BASE_URL}/catalog/track/${id}/favorite/`,
      {
        method: 'POST',
        headers,
      },
    );

    // Если получили 401, пытаемся обновить токен и повторить запрос
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            headers = await createAuthHeaders();
            response = await fetch(
              `${API_BASE_URL}/catalog/track/${id}/favorite/`,
              {
                method: 'POST',
                headers,
              },
            );
          }
        } catch {
          throw new Error('Не удалось обновить токен доступа');
        }
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Удалить трек из избранного
  removeFromFavorites: async (id: number): Promise<void> => {
    let headers = await createAuthHeaders();
    let response = await fetch(
      `${API_BASE_URL}/catalog/track/${id}/favorite/`,
      {
        method: 'DELETE',
        headers,
      },
    );

    // Если получили 401, пытаемся обновить токен и повторить запрос
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            headers = await createAuthHeaders();
            response = await fetch(
              `${API_BASE_URL}/catalog/track/${id}/favorite/`,
              {
                method: 'DELETE',
                headers,
              },
            );
          }
        } catch {
          throw new Error('Не удалось обновить токен доступа');
        }
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Функция для обработки обновления токенов при 401 ошибке
export const withReauth = async <T>(
  apiCall: (token: string | null) => Promise<T>,
  refreshToken: string | null,
  dispatch: AppDispatch,
): Promise<T> => {
  try {
    // Первая попытка с текущим токеном
    const accessToken = getAccessToken();
    return await apiCall(accessToken);
  } catch (error: unknown) {
    // Проверяем, является ли ошибка 401 (Unauthorized)
    // Для fetch API ошибки могут быть в разных форматах
    let is401 = false;
    let errorResponse: Response | null = null;

    if (error instanceof Response) {
      errorResponse = error;
      is401 = error.status === 401;
    } else if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: Response }).response instanceof Response
    ) {
      errorResponse = (error as { response: Response }).response;
      is401 = errorResponse.status === 401;
    }

    if (is401 && errorResponse) {
      // Пытаемся обновить токен
      if (!refreshToken) {
        throw new Error('Нет refresh токена для обновления');
      }

      try {
        const { access: newAccessToken } =
          await authApi.refreshTokens(refreshToken);
        const currentRefreshToken = getRefreshToken();
        if (currentRefreshToken) {
          saveTokens(newAccessToken, currentRefreshToken);
          // Обновляем токены в Redux через action
          dispatch(
            updateTokens({
              access: newAccessToken,
              refresh: currentRefreshToken,
            }),
          );
        }
        // Повторяем запрос с новым токеном
        return await apiCall(newAccessToken);
      } catch (refreshError) {
        // Если обновление токена не удалось, пробрасываем ошибку
        throw refreshError;
      }
    }
    // Если это не 401 ошибка, пробрасываем её дальше
    throw error;
  }
};

// Обертки для API лайков с поддержкой withReauth
export const addLike = async (
  accessToken: string | null,
  trackId: string,
): Promise<void> => {
  if (!accessToken) {
    throw new Error('Нет токена доступа');
  }

  const id = parseInt(trackId, 10);
  if (isNaN(id)) {
    throw new Error('Некорректный ID трека');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(
    `${API_BASE_URL}/catalog/track/${id}/favorite/`,
    {
      method: 'POST',
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
    // Добавляем response для обработки в withReauth
    (error as unknown as { response: Response }).response = response;
    throw error;
  }
};

export const removeLike = async (
  accessToken: string | null,
  trackId: string,
): Promise<void> => {
  if (!accessToken) {
    throw new Error('Нет токена доступа');
  }

  const id = parseInt(trackId, 10);
  if (isNaN(id)) {
    throw new Error('Некорректный ID трека');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(
    `${API_BASE_URL}/catalog/track/${id}/favorite/`,
    {
      method: 'DELETE',
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
    // Добавляем response для обработки в withReauth
    (error as unknown as { response: Response }).response = response;
    throw error;
  }
};

// Функция для преобразования API трека в формат приложения
export const transformApiTrack = (apiTrack: ApiTrack): Track | null => {
  // Проверяем, что у трека есть все необходимые поля
  if (!apiTrack || !apiTrack._id || !apiTrack.name) {
    return null;
  }

  // Обрабатываем жанр (может быть массивом)
  const genreString = Array.isArray(apiTrack.genre)
    ? apiTrack.genre.join(', ')
    : apiTrack.genre || 'Неизвестный жанр';

  const transformedTrack: Track = {
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
