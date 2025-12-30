"""
API endpoints для пользователей
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import User
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


@router.get("/me", response_model=User)
async def get_current_user_profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Получить профиль текущего пользователя"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

