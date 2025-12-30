"""
Обработчики команд для задач
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler, MessageHandler, filters
from app.services.task_service import TaskService
from app.database import SessionLocal


async def tasks_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка команды /tasks"""
    db = SessionLocal()
    try:
        # Получение задач пользователя
        # В реальном приложении нужно получить user_id из токена
        task_service = TaskService(db)
        # tasks = task_service.get_user_tasks(user_id)
        await update.message.reply_text("Список задач будет здесь")
    finally:
        db.close()


async def create_task_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка создания задачи"""
    await update.message.reply_text("Для создания задачи используйте /create <название>")


handler = CommandHandler("tasks", tasks_command)
create_handler = CommandHandler("create", create_task_handler)

