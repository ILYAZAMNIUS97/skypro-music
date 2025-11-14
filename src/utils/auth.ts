// Утилиты для работы с аутентификацией

import { type User } from '@/types/user';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'authUser';

const isBrowser = () => typeof window !== 'undefined';

// Функция для сохранения токенов в localStorage
export const saveTokens = (access: string, refresh: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

// Функция для получения access токена из localStorage
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Функция для получения refresh токена из localStorage
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Функция для очистки токенов
export const clearTokens = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveUserToStorage = (user: User): void => {
  if (!isBrowser()) return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const getUserFromStorage = (): User | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed || typeof parsed.id !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearUserFromStorage = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(USER_DATA_KEY);
};
