# Ladder - Веб Таскер для Telegram

Веб-приложение для управления задачами с интеграцией Telegram бота и AI декомпозицией задач.

## 🚀 Возможности

- ✅ Управление задачами (создание, редактирование, удаление)
- 🤖 AI декомпозиция задач на подзадачи
- 📱 Интеграция с Telegram ботом
- 🌓 Темная и светлая темы
- 📅 Календарь задач
- 🔔 Уведомления о задачах
- 👤 Авторизация через Telegram или стандартный вход

## 📁 Структура проекта

```
ladder-web/
├── frontend/          # HTML/JS/CSS фронтенд
├── backend/           # Python FastAPI бэкенд
├── shared/            # Общий код
├── docker/            # Docker конфигурации
└── docker-compose.yml # Docker Compose
```

## 🛠️ Установка

### Требования

- Python 3.10+
- PostgreSQL 15+
- Redis (опционально)
- Node.js (для фронтенда, опционально)

### Быстрый старт с Docker

```bash
# Клонировать репозиторий
git clone <repository-url>
cd ladder-web

# Создать .env файл
cp backend/.env.example backend/.env
# Отредактировать backend/.env с вашими настройками

# Запустить все сервисы
docker-compose up -d

# Применить миграции
docker-compose exec backend alembic upgrade head
```

### Локальная установка

#### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Создать .env файл
cp .env.example .env
# Отредактировать .env

# Применить миграции
alembic upgrade head

# Запустить сервер
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Простой HTTP сервер (для разработки)
python -m http.server 8080 --directory public

# Или использовать любой другой статический сервер
```

## 🔧 Конфигурация

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ladder_db
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
OPENAI_API_KEY=your-openai-api-key
```

### Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Добавьте токен в `.env` файл
4. Настройте webhook (опционально)

## 📚 API Документация

После запуска backend, API документация доступна по адресу:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 Тестирование

```bash
cd backend
pytest
```

## 🚢 Развертывание

### Production с Gunicorn

```bash
gunicorn app.main:app --config gunicorn.conf.py
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Миграции БД

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "description"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License

## 👥 Авторы

- Ваше имя

## 🙏 Благодарности

- FastAPI
- SQLAlchemy
- Telegram Bot API
- OpenAI API

# WebLadder

# LadderWeb
