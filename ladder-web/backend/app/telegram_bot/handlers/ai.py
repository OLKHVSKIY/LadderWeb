"""
Обработчики AI команд
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler
from app.services.ai_service import AIService


async def ai_decompose_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка команды /ai_decompose"""
    if not context.args:
        await update.message.reply_text("Использование: /ai_decompose <описание задачи>")
        return
    
    description = " ".join(context.args)
    ai_service = AIService()
    result = await ai_service.decompose_task(description)
    
    response = "Подзадачи:\n"
    for i, subtask in enumerate(result.subtasks, 1):
        response += f"{i}. {subtask.title}\n"
    
    await update.message.reply_text(response)


handler = CommandHandler("ai_decompose", ai_decompose_command)

