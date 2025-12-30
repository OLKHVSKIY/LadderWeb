// Основной файл приложения
import { initTelegram } from './modules/telegram.js';
import { initTimeBackground } from './components/time-background.js';
import { initHeader } from './components/header.js';
import { initBottomNav } from './components/bottom-nav.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initTimeBackground();
    initHeader();
    initBottomNav();
    
    // Инициализация Telegram WebApp если доступно
    if (window.Telegram?.WebApp) {
        initTelegram();
    }
});

