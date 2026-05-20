# QuizForge — Система управления тестами

Полнофункциональное приложение для создания, редактирования, удаления и прохождения тестов с автоматическим подсчётом баллов.

**Стек:** ASP.NET Core 8 + EF Core (SQLite) · React + Vite · Tauri (десктоп)

## Архитектура бэкенда

```
Controllers → Services → Repositories → EF Core (SQLite)
```

- **Repository** — базовый `IGenericRepository<T>` и специализированный `ITestRepository`
- **Services** — `TestService` (CRUD, валидация), `GradingService` (подсчёт баллов)
- **DTO** — сущности БД не отдаются наружу
- **SOLID** — разделение ответственности, зависимости через интерфейсы (Scoped)

## Запуск (разработка)

### Требования

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) и npm
- Для десктопа: [Rust](https://www.rust-lang.org/tools/install) и [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### 1. Бэкенд

```bash
cd backend/TestManager.Api
dotnet run
```

API: `http://localhost:5180`  
Эндпоинты: `GET/POST /api/tests`, `GET/PUT/DELETE /api/tests/{id}`, `GET /api/tests/{id}/quiz`, `POST /api/tests/{id}/submit`

### 2. Фронтенд (браузер)

```bash
cd frontend
npm install
npm run dev
```

Откройте `http://localhost:1420`

### 3. Десктоп (Tauri)

В одном терминале — бэкенд (`dotnet run`), в другом:

```bash
cd frontend
npm install
npm run tauri dev
```

> При первом запуске Tauri может потребовать иконки. Сгенерируйте их: `npm run tauri icon path/to/icon.png`

## Подсчёт баллов

| Тип | Правило |
|-----|---------|
| **SingleChoice** | 1 балл, если выбран единственный правильный ответ; иначе 0 |
| **MultipleChoice** | Вес одного правильного = `1 / (число правильных)`; балл = (верно отмеченные × вес) − (неверно отмеченные × вес), минимум 0 |

Максимум баллов = количество вопросов. Результат: `8.33 / 10` и `83.3%`.

## Git-правила (по ТЗ)

1. Не коммитить напрямую в `main`
2. Работать в ветках `feature/*`, сливать через Pull Request
3. Перед дедлайном убедиться, что всё слито в `main`

```bash
git checkout -b feature/initial-implementation
# ... коммиты ...
git push -u origin feature/initial-implementation
# создать PR в main через GitHub
```

## Структура проекта

```
TestManager.sln
backend/TestManager.Api/     # ASP.NET Core API
frontend/                    # React + Vite
frontend/src-tauri/          # Tauri (десктоп)
```

## Дизайн

Интерфейс **QuizForge** намеренно отличается от референсных скриншотов:

- тёмная тема с фиолетовыми акцентами (не бело-серая с бирюзовым);
- боковая навигация вместо верхней панели;
- список тестов вместо сетки карточек;
- пошаговое прохождение (wizard) с прогресс-баром;
- radio/checkbox у вариантов ответа.
