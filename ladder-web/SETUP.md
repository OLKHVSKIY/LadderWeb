# Настройка проекта Ladder

## Быстрый старт

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/OLKHVSKIY/Ladder.git
   cd Ladder
   ```

2. **Создайте файл `.env`**
   ```bash
   cp .env.example .env
   ```

3. **Настройте Yandex GPT API ключи в `.env`**
   ```env
   YANDEX_GPT_API_KEY=ваш_api_ключ
   YANDEX_GPT_FOLDER_ID=ваш_folder_id
   ```
   
   Инструкция по получению ключей: см. `frontend/YANDEX_GPT_SETUP.md`

4. **Запустите проект**
   ```bash
   # Установите зависимости
   cd backend
   poetry install

   # Запустите бэкенд
   poetry run uvicorn app.main:app --reload

   # В другом терминале запустите прокси
   cd ..
   poetry run python yandex-gpt-proxy.py

   # В третьем терминале запустите фронтенд
   poetry run python server.py
   ```

## Структура проекта

- `backend/` - FastAPI бэкенд
- `frontend/` - Frontend приложение
- `.env` - Переменные окружения (не коммитится в git)
- `.env.example` - Шаблон для `.env` файла

## Безопасность

- ✅ Файл `.env` добавлен в `.gitignore` и не попадет в git
- ✅ API ключи используются только на сервере
- ✅ Фронтенд использует бэкенд прокси, ключи не передаются в браузер

## Переменные окружения

Все секретные данные хранятся в файле `.env`:

- `YANDEX_GPT_API_KEY` - API ключ Yandex GPT
- `YANDEX_GPT_FOLDER_ID` - Folder ID в Yandex Cloud

## Разработка

При разработке убедитесь, что:
1. Файл `.env` существует и содержит правильные ключи
2. Бэкенд прокси запущен (`poetry run python yandex-gpt-proxy.py`)
3. Фронтенд сервер запущен (`poetry run python server.py`)
