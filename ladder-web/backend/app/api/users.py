"""
API endpoints для пользователей
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import User
from app.api.deps import get_current_user_id
from app.models.user import User as UserModel

router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_profile(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Получить профиль текущего пользователя"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user
