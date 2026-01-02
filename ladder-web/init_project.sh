#!/bin/bash
# Полная инициализация проекта Ladder

set -e

echo "🚀 Инициализация проекта Ladder..."
echo ""

# Создание .env файла
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Файл .env создан из .env.example"
        echo "⚠️  Не забудьте отредактировать .env и добавить необходимые API ключи!"
    else
        echo "⚠️  Файл .env.example не найден. Создайте .env вручную."
    fi
fi

# Установка зависимостей backend (если нужно)
if [ -d "backend" ]; then
    echo ""
    echo "📦 Проверка зависимостей backend..."
    
    if command -v poetry &> /dev/null; then
        poetry config virtualenvs.in-project true
        cd backend
        if [ ! -d ".venv" ] && [ -f "pyproject.toml" ]; then
            echo "📥 Установка зависимостей через Poetry..."
            poetry install
        fi
        cd ..
    else
        echo "❌ Poetry не найден. Установите Poetry и повторите."
        exit 1
    fi
fi

# Применение миграций
echo ""
echo "🗄️  Настройка базы данных..."

if [ -d "backend/migrations" ]; then
    # Проверка наличия миграций
    if [ -d "backend/migrations/versions" ] && [ "$(ls -A backend/migrations/versions 2>/dev/null)" ]; then
        echo "🔄 Применение существующих миграций..."
        cd backend
        poetry run alembic upgrade head || echo "⚠️  Требуется ручное применение миграций"
        cd ..
    else
        echo "📝 Создание начальной миграции..."
        cd backend
        poetry run alembic revision --autogenerate -m "Initial migration" || echo "⚠️  Не удалось создать миграцию"
        poetry run alembic upgrade head || echo "⚠️  Не удалось применить миграцию"
        cd ..
    fi
else
    echo "⚠️  Директория migrations не найдена. Пропускаем миграции."
fi

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Отредактируйте .env файл и добавьте необходимые API ключи"
echo "2. Запустите проект (в отдельных терминалах):"
echo "   cd backend && poetry run uvicorn app.main:app --reload"
echo "   cd .. && poetry run python yandex-gpt-proxy.py"
echo "   cd .. && poetry run python server.py"
echo ""
echo "📚 Документация:"
echo "   - START.md - Команды для запуска"
echo "   - SETUP_DATABASE.md - Настройка БД"
echo ""
