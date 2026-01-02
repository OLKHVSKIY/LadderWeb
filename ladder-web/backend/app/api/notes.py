"""
API endpoints для заметок
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user_id
from app.models.note import Note
from app.schemas.notes import NotesResponse, NotesUpdate

router = APIRouter()


@router.get("", response_model=NotesResponse)
async def get_notes(
    workspace_id: str = "personal",
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        Note.user_id == user_id,
        Note.workspace_id == workspace_id
    ).first()
    return NotesResponse(
        workspace_id=workspace_id,
        stickers=note.stickers if note else []
    )


@router.put("", response_model=NotesResponse)
async def update_notes(
    payload: NotesUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        Note.user_id == user_id,
        Note.workspace_id == payload.workspace_id
    ).first()

    if not note:
        note = Note(
            user_id=user_id,
            workspace_id=payload.workspace_id,
            stickers=payload.stickers
        )
        db.add(note)
    else:
        note.stickers = payload.stickers

    db.commit()
    db.refresh(note)

    return NotesResponse(
        workspace_id=payload.workspace_id,
        stickers=note.stickers or []
    )
