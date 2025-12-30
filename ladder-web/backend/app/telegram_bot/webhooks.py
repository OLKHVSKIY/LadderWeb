"""
Обработчик webhooks для Telegram
"""
from fastapi import APIRouter, Request
from app.services.telegram_service import TelegramService
from app.database import SessionLocal

router = APIRouter()


@router.post("/webhook")
async def telegram_webhook(request: Request):
    """Webhook для получения обновлений от Telegram"""
    db = SessionLocal()
    try:
        telegram_service = TelegramService(db)
        update = await request.json()
        await telegram_service.handle_update(update)
        return {"ok": True}
    finally:
        db.close()

