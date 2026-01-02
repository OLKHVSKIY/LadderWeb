// Модуль интеграции с Telegram WebApp
export function initTelegram() {
    // Проверка для локального тестирования через URL параметр ?telegram=1
    const urlParams = new URLSearchParams(window.location.search);
    const isTelegramTest = urlParams.get('telegram') === '1';
    
    if (!window.Telegram?.WebApp && !isTelegramTest) {
        return;
    }

    // Добавляем класс для определения Telegram Mini App (для стилей)
    document.body.classList.add('telegram-webapp');

    // Если это реальный Telegram WebApp
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Получение данных пользователя
        const user = tg.initDataUnsafe?.user;
        if (user) {
            localStorage.setItem('telegram_user', JSON.stringify(user));
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            if (fullName && !localStorage.getItem('user_name')) {
                localStorage.setItem('user_name', fullName);
            }
        }

        // Регистрация пользователя в БД через initData
        registerWebAppUser(tg.initData);

        // Настройка темы
        if (tg.colorScheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        return tg;
    }
    
    // Для локального тестирования просто возвращаем объект-заглушку
    if (isTelegramTest) {
        console.log('🧪 Режим тестирования Telegram Mini App активирован (добавьте ?telegram=1 в URL)');
        return null;
    }
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

async function registerWebAppUser(initData) {
    if (!initData) return;
    if (localStorage.getItem('user_id')) return;

    try {
        const response = await fetch('/api/auth/telegram-webapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ init_data: initData }),
        });
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data?.user_id) {
            localStorage.setItem('user_id', String(data.user_id));
        }
        if (data?.name && !localStorage.getItem('user_name')) {
            localStorage.setItem('user_name', data.name);
        }
        if (data?.email && !localStorage.getItem('user_email')) {
            localStorage.setItem('user_email', data.email);
        }
    } catch (error) {
        console.warn('WebApp registration failed:', error);
    }
}
