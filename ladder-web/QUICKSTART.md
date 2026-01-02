# 🚀 Быстрый старт Ladder

## Установка и запуск за 5 минут

### 1. Установите Poetry

```bash
# macOS/Linux
curl -sSL https://install.python-poetry.org | python3 -

# Windows (PowerShell)
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

### 2. Клонируйте и настройте проект

```bash
git clone https://github.com/OLKHVSKIY/LadderWeb.git
cd LadderWeb/ladder-web
```

### 3. Установите зависимости

```bash
# Backend зависимости
cd backend
poetry config virtualenvs.in-project true
poetry install
cd ..
```

### 4. Настройте .env файл

```bash
# Создайте .env файл в корне ladder-web
cat > .env << EOF
YANDEX_GPT_API_KEY=ваш_api_ключ
YANDEX_GPT_FOLDER_ID=ваш_folder_id
EOF
```

**Как получить ключи:** См. `frontend/YANDEX_GPT_SETUP.md`

### 5. Запустите все сервисы одной командой

**Вариант 1 - Одна команда (рекомендуется):**
```bash
poetry run python run.py
# или просто
./run.py
```

**Вариант 2 - Bash скрипт:**
```bash
./run.sh
```

**Вариант 3 - В отдельных терминалах (для отладки):**

Терминал 1 - Backend API:
```bash
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Терминал 2 - Yandex GPT Proxy:
```bash
poetry run python yandex-gpt-proxy.py
```

Терминал 3 - Frontend:
```bash
poetry run python server.py
```

### 6. Откройте в браузере

- Frontend: http://localhost:3000/public/
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Альтернативный запуск (одной командой)

Можно использовать Makefile:

```bash
make dev  # Покажет команды запуска локально
```

## Проблемы?

- **Ошибка подключения к API**: Проверьте, что Yandex GPT Proxy запущен на порту 8001
- **Ошибка базы данных**: Убедитесь, что PostgreSQL запущен (или используйте SQLite для разработки)
- **Порт занят**: Измените порты в соответствующих файлах
