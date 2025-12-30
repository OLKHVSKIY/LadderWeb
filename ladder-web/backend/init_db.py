#!/usr/bin/env python3
"""
Скрипт для инициализации базы данных
Создает таблицы и применяет миграции
"""
import sys
import os
from pathlib import Path

# Добавляем корневую директорию в путь
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import engine, Base
from app.models import User, Task, Project, TelegramUser
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Создает все таблицы в базе данных"""
    try:
        logger.info("🔄 Создание таблиц в базе данных...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Таблицы успешно созданы!")
        return True
    except Exception as e:
        logger.error(f"❌ Ошибка при создании таблиц: {e}")
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

