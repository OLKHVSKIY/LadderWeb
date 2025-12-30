"""
Сервис работы с задачами
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_tasks(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
        """Получить задачи пользователя"""
        return self.db.query(Task).filter(
            Task.user_id == user_id
        ).offset(skip).limit(limit).all()

    def get_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """Получить задачу по ID"""
        return self.db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user_id
        ).first()

    def create_task(self, task_data: TaskCreate, user_id: int) -> Task:
        """Создать задачу"""
        db_task = Task(
            **task_data.dict(),
            user_id=user_id
        )
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def update_task(self, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
        """Обновить задачу"""
        task = self.get_task(task_id, user_id)
        if not task:
            return None
        
        update_data = task_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, user_id: int) -> bool:
        """Удалить задачу"""
        task = self.get_task(task_id, user_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        return True

