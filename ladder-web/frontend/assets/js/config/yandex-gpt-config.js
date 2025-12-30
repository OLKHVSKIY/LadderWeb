// Конфигурация Yandex GPT API
// В браузере используем window.env или значения по умолчанию
const getEnvVar = (name, defaultValue = '') => {
    if (typeof window !== 'undefined' && window.env && window.env[name]) {
        return window.env[name];
    }
    // Пробуем получить из localStorage (для локальной разработки)
    const stored = localStorage.getItem(name);
    if (stored) {
        return stored;
    }
    return defaultValue;
};

export const YANDEX_GPT_CONFIG = {
    // API ключ от Yandex GPT (получить можно в Yandex Cloud Console)
    // Инструкция: https://yandex.cloud/ru/docs/ai-studio/operations/get-api-key
    // Обычно это строка вида: AQVNxxxxxxxxxxxxx
    // Устанавливается через window.env.YANDEX_GPT_API_KEY или localStorage
    API_KEY: getEnvVar('YANDEX_GPT_API_KEY', ''),
    
    // Folder ID в Yandex Cloud
    // Устанавливается через window.env.YANDEX_GPT_FOLDER_ID или localStorage
    FOLDER_ID: getEnvVar('YANDEX_GPT_FOLDER_ID', ''),
    
    // Endpoint для Yandex GPT через API Gateway
    API_GATEWAY_URL: 'https://d5d8m7tvs8ntcons5qr8.hsvi2zuh.apigw.yandexcloud.net',
    
    // Прямой endpoint для Yandex GPT (если не используете API Gateway)
    BASE_URL: 'https://llm.api.cloud.yandex.net',
    
    // Модели Yandex GPT
    MODELS: [
        'yandexgpt-lite',
        'yandexgpt',
        'yandexgpt-pro'
    ]
};

// Функция для получения URL API Yandex GPT
export function getYandexGptApiUrl(modelName = 'yandexgpt-lite', useGateway = true) {
    // Используем API Gateway для обхода CORS
    if (useGateway && YANDEX_GPT_CONFIG.API_GATEWAY_URL) {
        // Пробуем OpenAI-совместимый формат
        return `${YANDEX_GPT_CONFIG.API_GATEWAY_URL}/v1/chat/completions`;
    } else {
        // Прямой API (будет заблокирован CORS в браузере)
        return `${YANDEX_GPT_CONFIG.BASE_URL}/foundationModels/v1/completion`;
    }
}

