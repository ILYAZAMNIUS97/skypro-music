'use client';
import { useEffect } from 'react';

/**
 * Глобально очищает консоль и отключает информационные логи в браузере,
 * оставляя только ошибки (console.error).
 */
export default function ConsoleSilencer() {
  useEffect(() => {
    // Очищаем консоль при монтировании
    if (typeof window !== 'undefined' && typeof console !== 'undefined') {
      try {
        // Некоторые браузеры могут блокировать clear в проде – игнорируем
        // возможные ошибки при очистке
        // eslint-disable-next-line no-console
        console.clear();
      } catch {}

      // Сохраняем original error
      const originalError = console.error.bind(console);

      // Глушим все не-ошибочные методы
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      console.log = noop;
      console.info = noop;
      console.debug = noop;
      console.warn = noop;

      // Оставляем ошибки нетронутыми
      console.error = originalError;
    }
  }, []);

  return null;
}


