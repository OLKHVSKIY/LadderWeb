"""
Основные клавиатуры бота
"""
from telegram import ReplyKeyboardMarkup, KeyboardButton


def get_main_keyboard():
    """Главная клавиатура"""
    keyboard = [
        [KeyboardButton("📋 Мои задачи"), KeyboardButton("➕ Создать задачу")],
        [KeyboardButton("🤖 AI Декомпозиция"), KeyboardButton("⚙️ Настройки")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)


def get_tasks_keyboard():
    """Клавиатура для задач"""
    keyboard = [
        [KeyboardButton("📝 Список задач"), KeyboardButton("✅ Выполненные")],
        [KeyboardButton("🔙 Назад")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

