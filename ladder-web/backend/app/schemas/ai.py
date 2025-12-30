"""
Pydantic схемы для AI
"""
from pydantic import BaseModel
from typing import List, Optional


class Subtask(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"


class AIDecomposeRequest(BaseModel):
    description: str


class AIDecomposeResponse(BaseModel):
    subtasks: List[Subtask]
    original_description: str

