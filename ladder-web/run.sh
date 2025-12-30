#!/bin/bash
# Скрипт для запуска всех сервисов Ladder в одном терминале

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск всех сервисов Ladder...${NC}"

# Проверяем наличие Poetry
if ! command -v poetry &> /dev/null; then
    echo -e "${RED}❌ Poetry не установлен. Установите его:${NC}"
    echo "curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Проверяем наличие .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден!${NC}"
    echo "Создайте файл .env с ключами Yandex GPT:"
    echo "YANDEX_GPT_API_KEY=ваш_ключ"
    echo "YANDEX_GPT_FOLDER_ID=ваш_folder_id"
    exit 1
fi

# Переходим в директорию проекта
cd "$(dirname "$0")"

# Устанавливаем зависимости backend, если нужно
if [ ! -d "backend/.venv" ] && [ ! -d "$(poetry env info --path 2>/dev/null)" ]; then
    echo -e "${YELLOW}📦 Установка зависимостей backend...${NC}"
    cd backend
    poetry install --no-root
    cd ..
fi

# Функция для очистки при выходе
cleanup() {
    echo -e "\n${YELLOW}⏹️  Остановка всех сервисов...${NC}"
    kill $BACKEND_PID $PROXY_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $PROXY_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Все сервисы остановлены${NC}"
    exit 0
}

# Перехватываем сигналы для корректного завершения
trap cleanup SIGINT SIGTERM

# Создаем директорию для логов, если её нет
mkdir -p logs

echo -e "${GREEN}📡 Запуск Backend API на порту 8000...${NC}"
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}🤖 Запуск Yandex GPT Proxy на порту 8001...${NC}"
poetry run python yandex-gpt-proxy.py > logs/proxy.log 2>&1 &
PROXY_PID=$!

echo -e "${GREEN}🌐 Запуск Frontend на порту 3000...${NC}"
poetry run python server.py > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Ждем немного, чтобы сервисы запустились
sleep 3

# Проверяем, что сервисы запущены
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend API запущен (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend API не запустился. Проверьте logs/backend.log${NC}"
fi

if ps -p $PROXY_PID > /dev/null; then
    echo -e "${GREEN}✅ Yandex GPT Proxy запущен (PID: $PROXY_PID)${NC}"
else
    echo -e "${RED}❌ Yandex GPT Proxy не запустился. Проверьте logs/proxy.log${NC}"
fi

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend не запустился. Проверьте logs/frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Все сервисы запущены!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📱 Frontend:     ${GREEN}http://localhost:3000/public/${NC}"
echo -e "🔧 Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "📚 API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo -e "🤖 GPT Proxy:    ${GREEN}http://localhost:8001${NC}"
echo ""
echo -e "${YELLOW}Логи сохраняются в директории logs/${NC}"
echo -e "${YELLOW}Нажмите Ctrl+C для остановки всех сервисов${NC}"
echo ""

# Ждем завершения всех процессов
wait $BACKEND_PID $PROXY_PID $FRONTEND_PID

