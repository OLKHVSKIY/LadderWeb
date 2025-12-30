#!/bin/bash
# Скрипт для запуска всех сервисов Ladder

echo "🚀 Запуск Ladder..."

# Проверяем наличие Poetry
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry не установлен. Установите его:"
    echo "curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Проверяем наличие .env
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создайте файл .env с ключами Yandex GPT:"
    echo "YANDEX_GPT_API_KEY=ваш_ключ"
    echo "YANDEX_GPT_FOLDER_ID=ваш_folder_id"
    exit 1
fi

# Устанавливаем зависимости backend, если нужно
if [ ! -d "backend/.venv" ]; then
    echo "📦 Установка зависимостей backend..."
    cd backend
    poetry install
    cd ..
fi

echo "✅ Все готово!"
echo ""
echo "Запустите все сервисы одной командой:"
echo ""
echo "  poetry run python run.py"
echo "  или"
echo "  ./run.py"
echo "  или"
echo "  ./run.sh"
echo ""
echo "Все сервисы запустятся в одном терминале:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend: http://localhost:3000/public/"
echo "  - Yandex GPT Proxy: http://localhost:8001"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

