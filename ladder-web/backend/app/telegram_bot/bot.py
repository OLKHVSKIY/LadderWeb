"""
Основной файл Telegram бота
"""
from telegram import Bot
from app.config import settings
from app.telegram_bot.handlers import start, tasks, ai, settings as settings_handler


class LadderBot:
    def __init__(self):
        self.bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        self.setup_handlers()

    def setup_handlers(self):
        """Настройка обработчиков команд"""
        # Обработчики будут зарегистрированы через декораторы
        pass

    def start_polling(self):
        """Запуск бота в режиме polling"""
        from telegram.ext import Application
        
        application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
        
        # Регистрация обработчиков
        application.add_handler(start.handler)
        application.add_handler(tasks.handler)
        application.add_handler(ai.handler)
        application.add_handler(settings_handler.handler)
        
        application.run_polling()

    async def set_webhook(self):
        """Установка webhook"""
        await self.bot.set_webhook(url=settings.TELEGRAM_WEBHOOK_URL)


if __name__ == "__main__":
    bot = LadderBot()
    bot.start_polling()
