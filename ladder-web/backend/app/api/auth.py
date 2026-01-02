"""
API endpoints для авторизации
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas.user import User, UserCreate, Token
from app.schemas.telegram import TelegramAuthRequest, TelegramWebAppAuthRequest
from app.services.auth_service import AuthService
from app.utils.security import create_access_token
from app.config import settings
from app.utils.telegram_webapp import validate_init_data
from app.models.telegram_user import TelegramUser
from app.models.user import User as UserModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


@router.post("/register", response_model=User)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Вход в систему"""
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/telegram", response_model=Token)
async def telegram_auth(
    telegram_data: TelegramAuthRequest,
    db: Session = Depends(get_db)
):
    """Авторизация через Telegram"""
    auth_service = AuthService(db)
    user = auth_service.authenticate_telegram_user(telegram_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ошибка авторизации через Telegram"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/telegram-webapp")
async def telegram_webapp_auth(
    payload: TelegramWebAppAuthRequest,
    db: Session = Depends(get_db)
):
    """Авторизация из Telegram WebApp без токена"""
    try:
        data = validate_init_data(payload.init_data, settings.TELEGRAM_BOT_TOKEN)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid init data")

    user_data = data.get("user")
    if not user_data or "id" not in user_data:
        raise HTTPException(status_code=400, detail="User data missing")

    telegram_id = int(user_data["id"])
    telegram_user = db.query(TelegramUser).filter(
        TelegramUser.telegram_id == telegram_id
    ).first()

    if not telegram_user:
        telegram_user = TelegramUser(
            telegram_id=telegram_id,
            username=user_data.get("username"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            language_code=user_data.get("language_code") or "ru",
            is_bot=user_data.get("is_bot") or False
        )
        db.add(telegram_user)
        db.commit()
        db.refresh(telegram_user)

    user = None
    if telegram_user.user_id:
        user = db.query(UserModel).filter(UserModel.id == telegram_user.user_id).first()

    if not user:
        name = " ".join(filter(None, [user_data.get("first_name"), user_data.get("last_name")])).strip()
        user = UserModel(
            username=f"tg_{telegram_id}",
            name=name or None,
            email=None,
            hashed_password=""
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        telegram_user.user_id = user.id
        db.commit()

    if user_data.get("first_name") and not user.name:
        user.name = " ".join(filter(None, [user_data.get("first_name"), user_data.get("last_name")])).strip()
        db.commit()

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "telegram_id": telegram_id
    }


@router.get("/me", response_model=User)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Получить текущего пользователя"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    return user
