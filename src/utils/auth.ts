// Утилиты для работы с аутентификацией

// Функция для сохранения токенов в localStorage
export const saveTokens = (access: string, refresh: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

// Функция для получения access токена из localStorage
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Функция для получения refresh токена из localStorage
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

// Функция для очистки токенов
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Функция для инициализации токенов (для тестирования)
export const initializeTestTokens = (): void => {
  const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxNiIsInVzZXJuYW1lIjoiVXNlcjE3NjEzODc1NzQ4MDciLCJlbWFpbCI6Im11c2ljMTc2MTM4NzU3NDgwN0B0ZXN0LmNvbSIsImlhdCI6MTc2MTM4NzY1OCwiZXhwIjoxNzYxMzg5NDU4fQ.1a24slvSFYHUKAavGSTQ3_OerxLrlz85oVoQbL84N-U';
  const refreshToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxNiIsInVzZXJuYW1lIjoiVXNlcjE3NjEzODc1NzQ4MDciLCJlbWFpbCI6Im11c2ljMTc2MTM4NzU3NDgwN0B0ZXN0LmNvbSIsImlhdCI6MTc2MTM4NzY1OH0.BAgpUq84y8-gTbc6_O8EPYMNfuYu4-DEM4zQLxgfQdY';

  saveTokens(accessToken, refreshToken);
  console.log('Токены инициализированы для тестирования');
};
