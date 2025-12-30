.PHONY: help install dev test build deploy clean

help:
	@echo "Доступные команды:"
	@echo "  make install    - Установить зависимости"
	@echo "  make dev        - Запустить в режиме разработки"
	@echo "  make test       - Запустить тесты"
	@echo "  make build      - Собрать проект"
	@echo "  make deploy     - Развернуть проект"
	@echo "  make clean      - Очистить временные файлы"

install:
	@echo "Установка зависимостей через Poetry..."
	cd backend && poetry install
	@echo "✅ Зависимости установлены!"

install-pip:
	cd backend && pip install -r requirements.txt
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm install

dev:
	docker-compose up -d
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Nginx: http://localhost"

dev-local:
	@echo "Запуск локально (требует 3 терминала):"
	@echo "Терминал 1: cd backend && poetry run uvicorn app.main:app --reload"
	@echo "Терминал 2: poetry run python yandex-gpt-proxy.py"
	@echo "Терминал 3: poetry run python server.py"

test:
	cd backend && pytest

build:
	docker-compose build

deploy:
	docker-compose up -d --build

clean:
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	docker-compose down -v

