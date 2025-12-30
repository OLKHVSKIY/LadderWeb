"""
Клавиатуры для работы с задачами
"""
from telegram import InlineKeyboardMarkup, InlineKeyboardButton


def get_task_actions_keyboard(task_id: int):
    """Клавиатура действий с задачей"""
    keyboard = [
        [
            InlineKeyboardButton("✅ Выполнить", callback_data=f"complete_{task_id}"),
            InlineKeyboardButton("❌ Удалить", callback_data=f"delete_{task_id}")
        ],
        [InlineKeyboardButton("✏️ Редактировать", callback_data=f"edit_{task_id}")]
    ]
    return InlineKeyboardMarkup(keyboard)

