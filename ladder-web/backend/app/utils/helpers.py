"""
Вспомогательные функции
"""
from datetime import datetime
from typing import Optional


def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    """Форматирование datetime в строку"""
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def parse_datetime(date_string: str) -> Optional[datetime]:
    """Парсинг строки в datetime"""
    try:
        return datetime.fromisoformat(date_string)
    except:
        return None

