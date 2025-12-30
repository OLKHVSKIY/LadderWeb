"""
Тесты моделей
"""
import pytest
from app.models.user import User
from app.models.task import Task


def test_user_model():
    user = User(
        username="test_user",
        email="test@example.com",
        hashed_password="hashed_password"
    )
    assert user.username == "test_user"
    assert user.email == "test@example.com"


def test_task_model():
    task = Task(
        title="Test Task",
        description="Test Description",
        user_id=1
    )
    assert task.title == "Test Task"
    assert task.completed == False

