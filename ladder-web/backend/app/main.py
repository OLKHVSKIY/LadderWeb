"""
Основной файл приложения FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.api import auth, tasks, ai, telegram, users
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ladder API",
    description="Веб таскер для Telegram бота",
    version="1.0.0"
)

# Создание таблиц БД (опционально, если база данных доступна)
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ База данных подключена и таблицы созданы")
    except Exception as e:
        logger.warning(f"⚠️  Не удалось подключиться к базе данных: {e}")
        logger.warning("Сервер будет работать без базы данных (только frontend и AI функции)")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(telegram.router, prefix="/api/telegram", tags=["telegram"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# Статические файлы (опционально, если директория существует)
import os
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    return {"message": "Ladder API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

