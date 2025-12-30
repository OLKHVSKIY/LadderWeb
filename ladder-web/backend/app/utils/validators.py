"""
Валидаторы
"""
from typing import Optional


def validate_email(email: str) -> bool:
    """Валидация email"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_username(username: str) -> bool:
    """Валидация имени пользователя"""
    if len(username) < 3 or len(username) > 20:
        return False
    import re
    pattern = r'^[a-zA-Z0-9_]+$'
    return bool(re.match(pattern, username))

