"""
Общие зависимости для API
"""
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from app.database import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.models.telegram_user import TelegramUser
import time

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def _unique_username(db: Session, base: str) -> str:
    candidate = base
    suffix = 1
    while db.query(User).filter(User.username == candidate).first():
        candidate = f"{base}_{suffix}"
        suffix += 1
    return candidate


def _get_or_create_user(
    db: Session,
    telegram_id: Optional[int],
    name: Optional[str],
    email: Optional[str],
) -> User:
    if telegram_id:
        telegram_user = db.query(TelegramUser).filter(
            TelegramUser.telegram_id == telegram_id
        ).first()
        if telegram_user and telegram_user.user_id:
            user = db.query(User).filter(User.id == telegram_user.user_id).first()
            if user:
                return user

    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user and name:
        user = db.query(User).filter(User.username == name).first()

    if not user:
        base_username = name or (email.split("@")[0] if email else f"web_{int(time.time())}")
        username = _unique_username(db, base_username)
        user = User(
            username=username,
            name=name,
            email=email,
            hashed_password=""
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if telegram_id:
        telegram_user = db.query(TelegramUser).filter(
            TelegramUser.telegram_id == telegram_id
        ).first()
        if not telegram_user:
            telegram_user = TelegramUser(
                telegram_id=telegram_id,
                username=None,
                first_name=name,
                last_name=None,
                language_code="ru",
                is_bot=False,
                user_id=user.id
            )
            db.add(telegram_user)
            db.commit()
        elif not telegram_user.user_id:
            telegram_user.user_id = user.id
            db.commit()

    return user


def get_current_user_id(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    x_user_email: Optional[str] = Header(default=None, alias="X-User-Email"),
    x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"),
    x_telegram_id: Optional[str] = Header(default=None, alias="X-Telegram-Id"),
    db: Session = Depends(get_db),
) -> int:
    if token:
        auth_service = AuthService(db)
        user = auth_service.get_current_user(token)
        return user.id

    if x_user_id:
        try:
            return int(x_user_id)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid user id")

    telegram_id = None
    if x_telegram_id:
        try:
            telegram_id = int(x_telegram_id)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid telegram id")

    if telegram_id or x_user_email or x_user_name:
        user = _get_or_create_user(db, telegram_id, x_user_name, x_user_email)
        return user.id

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
