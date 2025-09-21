# Использование алиасов путей

В этом проекте настроены следующие алиасы:

- `@/*` - корневая папка src
- `@/components/*` - компоненты
- `@/pages/*` - страницы (app router)
- `@/hooks/*` - кастомные хуки
- `@/utils/*` - утилиты
- `@/styles/*` - стили
- `@/types/*` - типы TypeScript
- `@/lib/*` - библиотеки
- `@/assets/*` - статические ресурсы (public)

## Примеры использования:

```tsx
// Вместо относительных путей
import Header from '../../../components/Header/Header';
import { formatDate } from '../../../utils/dateUtils';

// Используйте алиасы
import Header from '@/components/Header/Header';
import { formatDate } from '@/utils/dateUtils';
```
