"""
Pydantic схемы для заметок
"""
from pydantic import BaseModel
from typing import Any, List


class NotesResponse(BaseModel):
    workspace_id: str
    stickers: List[Any]


class NotesUpdate(BaseModel):
    workspace_id: str
    stickers: List[Any]
