"""
API endpoints для задач
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.services.task_service import TaskService
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user_id(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Получить ID текущего пользователя"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    return user.id


@router.get("", response_model=List[Task])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Получить список задач пользователя"""
    task_service = TaskService(db)
    tasks = task_service.get_user_tasks(user_id, skip=skip, limit=limit)
    return tasks


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Получить задачу по ID"""
    task_service = TaskService(db)
    task = task_service.get_task(task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task


@router.post("", response_model=Task)
async def create_task(
    task_data: TaskCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Создать новую задачу"""
    task_service = TaskService(db)
    task = task_service.create_task(task_data, user_id)
    return task


@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Обновить задачу"""
    task_service = TaskService(db)
    task = task_service.update_task(task_id, task_data, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Удалить задачу"""
    task_service = TaskService(db)
    success = task_service.delete_task(task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return {"message": "Задача удалена"}

