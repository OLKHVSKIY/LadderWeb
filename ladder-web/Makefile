.PHONY: help install dev test clean

help:
	@echo "Доступные команды:"
	@echo "  make install    - Установить зависимости"
	@echo "  make dev        - Показать команды запуска локально"
	@echo "  make test       - Запустить тесты"
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
	@echo "Запуск локально (3 терминала):"
	@echo "1) cd backend && poetry run uvicorn app.main:app --reload"
	@echo "2) cd .. && poetry run python yandex-gpt-proxy.py"
	@echo "3) cd .. && poetry run python server.py"

test:
	cd backend && pytest

clean:
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -r {} +
