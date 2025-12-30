"""
API endpoints для Telegram webhooks
"""
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.telegram_service import TelegramService

router = APIRouter()


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Webhook для получения обновлений от Telegram"""
    telegram_service = TelegramService(db)
    update = await request.json()
    await telegram_service.handle_update(update)
    return {"ok": True}

