'use client';

import { useEffect } from 'react';
import { initializeTestTokens } from '@/utils/auth';

export const TokenInitializer = () => {
  useEffect(() => {
    // Инициализируем токены для тестирования
    initializeTestTokens();
  }, []);

  return null; // Этот компонент не рендерит ничего
};
