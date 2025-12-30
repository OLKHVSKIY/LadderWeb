"""
Тесты сервисов
"""
import pytest
from app.services.task_service import TaskService
from app.database import SessionLocal


def test_task_service():
    db = SessionLocal()
    try:
        task_service = TaskService(db)
        # Тесты будут здесь
        assert task_service is not None
    finally:
        db.close()

