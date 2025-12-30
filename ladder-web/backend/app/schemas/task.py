"""
Pydantic схемы для задачи
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 1  # 1, 2, или 3
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None  # Для периода
    end_date: Optional[datetime] = None  # Для периода


class TaskCreate(TaskBase):
    project_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None  # 1, 2, или 3
    status: Optional[TaskStatus] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_id: Optional[int] = None


class Task(TaskBase):
    id: int
    status: TaskStatus
    completed: bool
    user_id: int
    project_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

