"""
Сервис авторизации
"""
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.models.user import User
from app.models.telegram_user import TelegramUser
from app.schemas.user import UserCreate
from app.schemas.telegram import TelegramAuthRequest
from app.utils.security import verify_password, get_password_hash, decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """Создать нового пользователя"""
        # Проверка существования пользователя
        existing_user = self.db.query(User).filter(
            User.username == user_data.username
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует"
            )
        
        # Создание пользователя
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate_user(self, username: str, password: str) -> User | None:
        """Аутентификация пользователя"""
        user = self.db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def authenticate_telegram_user(self, telegram_data: TelegramAuthRequest) -> User | None:
        """Аутентификация через Telegram"""
        # Проверка данных Telegram
        telegram_user = self.db.query(TelegramUser).filter(
            TelegramUser.telegram_id == telegram_data.id
        ).first()
        
        if telegram_user and telegram_user.user_id:
            return self.db.query(User).filter(User.id == telegram_user.user_id).first()
        
        # Создание нового пользователя если не существует
        if not telegram_user:
            telegram_user = TelegramUser(
                telegram_id=telegram_data.id,
                username=telegram_data.username,
                first_name=telegram_data.first_name,
                last_name=telegram_data.last_name,
                language_code=telegram_data.language_code or "ru"
            )
            self.db.add(telegram_user)
            self.db.commit()
        
        # Создание пользователя приложения
        user = User(
            username=f"tg_{telegram_data.id}",
            email=None,
            hashed_password=""  # Telegram auth не требует пароля
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Связывание Telegram пользователя с пользователем приложения
        telegram_user.user_id = user.id
        self.db.commit()
        
        return user

    def get_current_user(self, token: str) -> User:
        """Получить текущего пользователя по токену"""
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный токен"
            )
        user = self.db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден"
            )
        return user

