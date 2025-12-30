"""
Сервис Telegram бота
"""
from sqlalchemy.orm import Session
from app.models.telegram_user import TelegramUser
from app.models.user import User
from app.models.task import Task
from app.services.auth_service import AuthService


class TelegramService:
    def __init__(self, db: Session):
        self.db = db

    async def handle_update(self, update: dict):
        """Обработка обновления от Telegram"""
        if "message" in update:
            await self.handle_message(update["message"])
        elif "callback_query" in update:
            await self.handle_callback_query(update["callback_query"])

    async def handle_message(self, message: dict):
        """Обработка сообщения"""
        text = message.get("text", "")
        chat_id = message["chat"]["id"]
        
        if text.startswith("/start"):
            await self.handle_start_command(chat_id, message.get("from"))
        elif text.startswith("/tasks"):
            await self.handle_tasks_command(chat_id)
        elif text.startswith("/create"):
            await self.handle_create_command(chat_id, text)

    async def handle_start_command(self, chat_id: int, user_data: dict):
        """Обработка команды /start"""
        # Регистрация или обновление пользователя Telegram
        telegram_user = self.db.query(TelegramUser).filter(
            TelegramUser.telegram_id == user_data["id"]
        ).first()
        
        if not telegram_user:
            telegram_user = TelegramUser(
                telegram_id=user_data["id"],
                username=user_data.get("username"),
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name")
            )
            self.db.add(telegram_user)
            self.db.commit()
        
        # Здесь должна быть отправка сообщения через Telegram Bot API
        # await self.send_message(chat_id, "Добро пожаловать в Ladder!")

    async def handle_tasks_command(self, chat_id: int):
        """Обработка команды /tasks"""
        # Получение задач пользователя и отправка
        pass

    async def handle_callback_query(self, callback_query: dict):
        """Обработка callback query"""
        pass

