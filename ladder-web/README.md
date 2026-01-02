# Ladder - Веб Таскер для Telegram

Веб-приложение для управления задачами с интеграцией Telegram бота и AI декомпозицией задач.

## ⚡ Быстрый запуск

```bash
# 1. Установите Poetry
curl -sSL https://install.python-poetry.org | python3 -

# 2. Клонируйте проект
git clone https://github.com/OLKHVSKIY/LadderWeb.git
cd LadderWeb/ladder-web

# 3. Установите зависимости
cd backend && poetry install && cd ..

# 4. Создайте .env файл
echo "YANDEX_GPT_API_KEY=ваш_ключ" > .env
echo "YANDEX_GPT_FOLDER_ID=ваш_folder_id" >> .env

# 5. Запустите все сервисы одной командой:
poetry run python run.py
# или
./run.py
# или
./run.sh

# Все сервисы запустятся в одном терминале:
# - Backend API: http://localhost:8000
# - Frontend: http://localhost:3000/public/
# - Yandex GPT Proxy: http://localhost:8001
#
# Для остановки нажмите Ctrl+C - все сервисы остановятся автоматически
```

📖 **Подробная инструкция:** См. [QUICKSTART.md](QUICKSTART.md)

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
```

## 🛠️ Установка

### Требования

- Python 3.10+
- Poetry (для управления зависимостями)
- PostgreSQL 15+ (опционально, для полного функционала)
- Redis (опционально)

### Быстрый старт с Poetry

```bash
# 1. Клонировать репозиторий
git clone https://github.com/OLKHVSKIY/LadderWeb.git
cd LadderWeb/ladder-web

# 2. Установить Poetry (если еще не установлен)
# macOS/Linux:
curl -sSL https://install.python-poetry.org | python3 -
# Windows:
# (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

# 3. Установить зависимости backend
cd backend
poetry install

# 4. Создать файл .env в корне ladder-web
cd ..
cp .env.example .env  # или создайте вручную
# Добавьте в .env:
# YANDEX_GPT_API_KEY=ваш_ключ
# YANDEX_GPT_FOLDER_ID=ваш_folder_id

# 5. Запустить все сервисы
# В первом терминале - Backend API:
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Во втором терминале - Yandex GPT Proxy:
cd ..
poetry run python yandex-gpt-proxy.py

# В третьем терминале - Frontend сервер:
poetry run python server.py
```

**Или используйте готовые команды:**

```bash
# Backend API
cd backend
poetry run start

# Frontend (из корня ladder-web)
poetry run python server.py

# Yandex GPT Proxy (из корня ladder-web)
poetry run python yandex-gpt-proxy.py
```

### Локальная установка (с Poetry - рекомендуется)

```bash
# 1. Установить Poetry (если еще не установлен)
curl -sSL https://install.python-poetry.org | python3 -

# 2. Установить зависимости
cd backend
poetry install

# 3. Создать .env файл в корне ladder-web
cd ..
cp .env.example .env
# Отредактировать .env и добавить ключи Yandex GPT

# 4. Запустить сервисы (в разных терминалах):

# Backend API:
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Yandex GPT Proxy (из корня ladder-web):
poetry run python yandex-gpt-proxy.py

# Frontend (из корня ladder-web):
poetry run python server.py
```

**Или используйте готовый скрипт:**
```bash
./start.sh  # Покажет инструкции по запуску
```

### Локальная установка (без Poetry)

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
# Простой HTTP сервер (для разработки)
python server.py
# Или
python server.py  # Запускает на порту 3000
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
