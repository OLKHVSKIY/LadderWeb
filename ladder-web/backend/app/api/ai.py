"""
API endpoints для AI
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.schemas.ai import AIDecomposeRequest, AIDecomposeResponse
from app.services.ai_service import AIService
from app.config import settings
import httpx

router = APIRouter()


@router.post("/decompose", response_model=AIDecomposeResponse)
async def decompose_task(
    request: AIDecomposeRequest,
    db: Session = Depends(get_db)
):
    """Разложить задачу на подзадачи с помощью AI"""
    ai_service = AIService()
    result = await ai_service.decompose_task(request.description)
    return result


# Схемы для Yandex GPT API
class YandexGPTMessage(BaseModel):
    role: str
    text: Optional[str] = None
    content: Optional[str] = None


class YandexGPTRequest(BaseModel):
    model: Optional[str] = "yandexgpt-lite"
    messages: List[YandexGPTMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2000


@router.post("/yandex-gpt/chat")
async def yandex_gpt_chat(request: YandexGPTRequest):
    """Прокси для Yandex GPT API (обход CORS)"""
    try:
        # Формируем запрос к Yandex GPT API
        yandex_url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        
        # Преобразуем сообщения в формат Yandex GPT
        yandex_messages = []
        for msg in request.messages:
            # Используем text или content в зависимости от того, что есть
            text = msg.text or msg.content or ""
            yandex_messages.append({
                "role": msg.role,
                "text": text
            })
        
        yandex_request_body = {
            "modelUri": f"gpt://{settings.YANDEX_GPT_FOLDER_ID}/{request.model}",
            "completionOptions": {
                "stream": False,
                "temperature": request.temperature,
                "maxTokens": request.max_tokens
            },
            "messages": yandex_messages
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {settings.YANDEX_GPT_API_KEY}"
        }
        
        # Отправляем запрос к Yandex GPT API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                yandex_url,
                json=yandex_request_body,
                headers=headers
            )
            
            if response.status_code != 200:
                error_text = response.text
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Yandex GPT API error: {error_text}"
                )
            
            data = response.json()
            
            # Парсим ответ от Yandex GPT
            if data.get("result") and data["result"].get("alternatives"):
                message_text = data["result"]["alternatives"][0]["message"]["text"]
            elif data.get("alternatives") and data["alternatives"][0].get("message"):
                message_text = data["alternatives"][0]["message"]["text"]
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Unexpected response format from Yandex GPT API"
                )
            
            # Возвращаем ответ в формате OpenAI-совместимом
            return {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": message_text
                    }
                }]
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

