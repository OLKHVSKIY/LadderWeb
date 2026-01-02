"""
Admin API endpoints
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.config import settings
from app.models.user import User
from app.models.task import Task
from app.models.telegram_user import TelegramUser
from app.models.suggestion import Suggestion
from app.models.subscription import Subscription


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin(x_admin_id: str = Header(default=None, alias="X-Admin-Id")) -> int:
    if not x_admin_id:
        raise HTTPException(status_code=401, detail="Admin ID required")
    try:
        admin_id = int(x_admin_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid admin ID")

    if admin_id not in settings.admin_ids():
        raise HTTPException(status_code=403, detail="Not an admin")

    return admin_id


@router.get("/data")
def get_admin_data(
    _admin_id: int = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    users = db.query(User).all()
    tasks = db.query(Task).all()
    telegram_users = db.query(TelegramUser).all()
    suggestions = db.query(Suggestion).all()
    subscriptions = db.query(Subscription).all()

    user_items = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
        for user in users
    ]

    task_items = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status.value if hasattr(task.status, "value") else task.status,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at.isoformat() if task.created_at else None,
        }
        for task in tasks
    ]

    telegram_items = [
        {
            "id": tg.id,
            "telegram_id": tg.telegram_id,
            "username": tg.username,
            "first_name": tg.first_name,
            "last_name": tg.last_name,
            "created_at": tg.created_at.isoformat() if tg.created_at else None,
        }
        for tg in telegram_users
    ]

    suggestion_items = [
        {
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "message": item.message,
            "read": item.read,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        }
        for item in suggestions
    ]

    subscription_items = [
        {
            "id": item.id,
            "user_id": item.user_id,
            "plan": item.plan,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "expires_at": item.expires_at.isoformat() if item.expires_at else None,
        }
        for item in subscriptions
    ]

    return {
        "users": user_items,
        "tasks": task_items,
        "telegram_users": telegram_items,
        "suggestions": suggestion_items,
        "subscriptions": subscription_items,
    }
