#!/bin/bash
# Полная инициализация проекта Ladder

set -e

echo "🚀 Инициализация проекта Ladder..."
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker для продолжения."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose для продолжения."
    exit 1
fi

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

# Запуск PostgreSQL и Redis
echo ""
echo "🐳 Запуск PostgreSQL и Redis..."
docker-compose up -d postgres redis

# Ожидание готовности PostgreSQL
echo ""
echo "⏳ Ожидание готовности PostgreSQL..."
sleep 10

# Проверка подключения
echo ""
echo "🔍 Проверка подключения к PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U ladder_user > /dev/null 2>&1; then
        echo "✅ PostgreSQL готов!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL не отвечает после 30 попыток"
        exit 1
    fi
    sleep 1
done

# Установка зависимостей backend (если нужно)
if [ -d "backend" ]; then
    echo ""
    echo "📦 Проверка зависимостей backend..."
    
    if command -v poetry &> /dev/null; then
        cd backend
        if [ ! -d ".venv" ] && [ -f "pyproject.toml" ]; then
            echo "📥 Установка зависимостей через Poetry..."
            poetry install
        fi
        cd ..
    fi
fi

# Применение миграций
echo ""
echo "🗄️  Настройка базы данных..."

if [ -d "backend/migrations" ]; then
    # Проверка наличия миграций
    if [ -d "backend/migrations/versions" ] && [ "$(ls -A backend/migrations/versions 2>/dev/null)" ]; then
        echo "🔄 Применение существующих миграций..."
        docker-compose exec -T backend alembic upgrade head 2>/dev/null || {
            echo "⚠️  Не удалось применить миграции через Docker. Попробуем локально..."
            cd backend
            if command -v poetry &> /dev/null; then
                poetry run alembic upgrade head || echo "⚠️  Требуется ручное применение миграций"
            else
                alembic upgrade head || echo "⚠️  Требуется ручное применение миграций"
            fi
            cd ..
        }
    else
        echo "📝 Создание начальной миграции..."
        cd backend
        if command -v poetry &> /dev/null; then
            poetry run alembic revision --autogenerate -m "Initial migration" || echo "⚠️  Не удалось создать миграцию"
            poetry run alembic upgrade head || echo "⚠️  Не удалось применить миграцию"
        else
            alembic revision --autogenerate -m "Initial migration" || echo "⚠️  Не удалось создать миграцию"
            alembic upgrade head || echo "⚠️  Не удалось применить миграцию"
        fi
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
echo "2. Запустите проект:"
echo "   docker-compose up -d          # Все сервисы"
echo "   или"
echo "   docker-compose up -d postgres redis  # Только БД"
echo "   cd backend && poetry run uvicorn app.main:app --reload  # Backend локально"
echo ""
echo "📚 Документация:"
echo "   - START.md - Команды для запуска"
echo "   - SETUP_DATABASE.md - Настройка БД"
echo ""

