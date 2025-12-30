"""
Сервис уведомлений
"""
from sqlalchemy.orm import Session
from app.models.task import Task
from datetime import datetime, timedelta


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_upcoming_tasks(self, hours: int = 24) -> list[Task]:
        """Получить задачи, которые скоро должны быть выполнены"""
        now = datetime.utcnow()
        deadline = now + timedelta(hours=hours)
        
        tasks = self.db.query(Task).filter(
            Task.completed == False,
            Task.due_date.isnot(None),
            Task.due_date <= deadline,
            Task.due_date >= now
        ).all()
        
        return tasks

    async def send_task_reminder(self, task: Task):
        """Отправить напоминание о задаче"""
        # Интеграция с Telegram Bot API для отправки уведомлений
        pass

