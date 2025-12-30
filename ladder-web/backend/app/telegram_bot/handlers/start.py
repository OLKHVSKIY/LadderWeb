"""
Обработчик команды /start
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler
from app.services.auth_service import AuthService
from app.database import SessionLocal


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка команды /start"""
    user = update.effective_user
    db = SessionLocal()
    
    try:
        auth_service = AuthService(db)
        # Регистрация или обновление пользователя
        welcome_message = f"Привет, {user.first_name}! Добро пожаловать в Ladder!"
        await update.message.reply_text(welcome_message)
    finally:
        db.close()


handler = CommandHandler("start", start_command)

