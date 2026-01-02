"""
Обработчик команды /start
"""
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes, CommandHandler
from app.database import SessionLocal
from app.config import settings
from app.models.user import User
from app.models.telegram_user import TelegramUser


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка команды /start"""
    user = update.effective_user
    db = SessionLocal()
    
    try:
        # Регистрация или обновление пользователя
        telegram_user = db.query(TelegramUser).filter(
            TelegramUser.telegram_id == user.id
        ).first()

        if not telegram_user:
            telegram_user = TelegramUser(
                telegram_id=user.id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                language_code=user.language_code or "ru",
                is_bot=user.is_bot or False
            )
            db.add(telegram_user)
            db.commit()
            db.refresh(telegram_user)

        if not telegram_user.user_id:
            db_user = User(
                username=f"tg_{user.id}",
                email=None,
                hashed_password=""
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            telegram_user.user_id = db_user.id
            db.commit()

        welcome_message = f"Привет, {user.first_name}! Добро пожаловать в Ladder!"
        if user.id in settings.admin_ids():
            admin_url = settings.ADMIN_PANEL_URL
            separator = "&" if "?" in admin_url else "?"
            admin_url = f"{admin_url}{separator}admin_id={user.id}"
            keyboard = InlineKeyboardMarkup(
                [[InlineKeyboardButton("Админ-панель", url=admin_url)]]
            )
            await update.message.reply_text(welcome_message, reply_markup=keyboard)
        else:
            await update.message.reply_text(welcome_message)
    finally:
        db.close()


handler = CommandHandler("start", start_command)
