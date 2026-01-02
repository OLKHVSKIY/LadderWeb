// Основной файл приложения
import { initTelegram } from './modules/telegram.js';
import { initTimeBackground } from './components/time-background.js';
import { initHeader } from './components/header.js';
import { initBottomNav } from './components/bottom-nav.js';
import { initQuickAdd } from './components/quick-add.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initTimeBackground();
    initHeader();
    initBottomNav();
    initQuickAdd();
    
    // Инициализация Telegram WebApp (проверка внутри функции)
    initTelegram();
});

