"""
Сервис AI интеграции
"""
from openai import AsyncOpenAI
from app.config import settings
from app.schemas.ai import AIDecomposeResponse, Subtask


class AIService:
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def decompose_task(self, description: str) -> AIDecomposeResponse:
        """Разложить задачу на подзадачи с помощью OpenAI"""
        if not self.client:
            # Fallback: простая декомпозиция без AI
            return self._simple_decompose(description)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Ты помощник для декомпозиции задач. Разложи задачу на подзадачи. Верни только список подзадач в формате JSON."
                    },
                    {
                        "role": "user",
                        "content": f"Разложи эту задачу на подзадачи: {description}"
                    }
                ],
                temperature=0.7
            )
            
            # Парсинг ответа (упрощенная версия)
            # В реальном приложении нужна более сложная обработка
            content = response.choices[0].message.content
            subtasks = self._parse_ai_response(content)
            
            return AIDecomposeResponse(
                subtasks=subtasks,
                original_description=description
            )
        except Exception as e:
            print(f"AI Service Error: {e}")
            return self._simple_decompose(description)

    def _parse_ai_response(self, content: str) -> list[Subtask]:
        """Парсинг ответа от AI"""
        # Упрощенная версия - в реальном приложении нужен более сложный парсинг
        import json
        try:
            data = json.loads(content)
            if isinstance(data, list):
                return [Subtask(**item) for item in data]
        except:
            pass
        
        # Fallback
        return self._simple_decompose(content).subtasks

    def _simple_decompose(self, description: str) -> AIDecomposeResponse:
        """Простая декомпозиция без AI"""
        # Разбиваем по предложениям или ключевым словам
        sentences = description.split('.')
        subtasks = []
        
        for i, sentence in enumerate(sentences, 1):
            sentence = sentence.strip()
            if sentence and len(sentence) > 5:
                subtasks.append(Subtask(
                    title=f"Подзадача {i}",
                    description=sentence,
                    priority="medium"
                ))
        
        if not subtasks:
            subtasks.append(Subtask(
                title="Выполнить задачу",
                description=description,
                priority="medium"
            ))
        
        return AIDecomposeResponse(
            subtasks=subtasks,
            original_description=description
        )

