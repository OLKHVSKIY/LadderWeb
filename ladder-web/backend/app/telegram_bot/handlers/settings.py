"""
Обработчики команд настроек
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler


async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка команды /settings"""
    await update.message.reply_text("Настройки бота")


handler = CommandHandler("settings", settings_command)

