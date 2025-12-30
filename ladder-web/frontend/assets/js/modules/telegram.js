// Модуль интеграции с Telegram WebApp
export function initTelegram() {
    if (!window.Telegram?.WebApp) {
        return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Получение данных пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
        localStorage.setItem('telegram_user', JSON.stringify(user));
    }

    // Настройка темы
    if (tg.colorScheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    return tg;
}

export function getTelegramUser() {
    const userStr = localStorage.getItem('telegram_user');
    return userStr ? JSON.parse(userStr) : null;
}

export function sendTelegramData(data) {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// Обработчик авторизации через Telegram
window.onTelegramAuth = function(user) {
    console.log('Telegram auth:', user);
    // Отправка данных на backend
    fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            window.location.href = '/public/tasks.html';
        }
    })
    .catch(error => {
        console.error('Telegram auth error:', error);
    });
};

