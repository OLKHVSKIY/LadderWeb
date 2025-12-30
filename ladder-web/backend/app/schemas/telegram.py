"""
Pydantic схемы для Telegram
"""
from pydantic import BaseModel
from typing import Optional


class TelegramAuthRequest(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None
    auth_date: int
    hash: str

