// Импортируем конфигурацию Yandex GPT API
import { YANDEX_GPT_CONFIG, getYandexGptApiUrl } from '../config/yandex-gpt-config.js';
import { createTask } from '../modules/tasks.js';
import { initI18n } from '../modules/i18n.js';

// API ключи не нужны на фронтенде - используется бэкенд прокси
// Ключи хранятся в .env файле и используются только на сервере
const YANDEX_MODELS = YANDEX_GPT_CONFIG.MODELS;

// Состояние создания задачи (для клиентской логики)
let taskCreationState = null;

// Инициализация страницы чата
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - initializing chat page');
    try {
        initChatPage();
    } catch (error) {
        console.error('Error initializing chat page:', error);
    }
});

function initChatPage() {
    console.log('initChatPage called');
    
    // Инициализация i18n
    try {
        initI18n();
    } catch (error) {
        console.error('Error initializing i18n:', error);
    }
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    // Проверяем наличие элементов
    if (!chatInput) {
        console.error('chat-input element not found');
        // Пробуем еще раз через небольшую задержку
        setTimeout(() => {
            const retryInput = document.getElementById('chat-input');
            if (retryInput) {
                console.log('chat-input found on retry');
                initChatPage();
            }
        }, 100);
        return;
    }
    if (!sendBtn) {
        console.error('chat-send-btn element not found');
        setTimeout(() => {
            const retryBtn = document.getElementById('chat-send-btn');
            if (retryBtn) {
                console.log('chat-send-btn found on retry');
                initChatPage();
            }
        }, 100);
        return;
    }
    if (!chatMessages) {
        console.error('chat-messages element not found');
        setTimeout(() => {
            const retryMessages = document.getElementById('chat-messages');
            if (retryMessages) {
                console.log('chat-messages found on retry');
                initChatPage();
            }
        }, 100);
        return;
    }
    
    console.log('Chat page initialized successfully', {
        chatInput: !!chatInput,
        sendBtn: !!sendBtn,
        chatMessages: !!chatMessages
    });
    
    // API ключи хранятся на сервере в .env файле
    // Фронтенд использует бэкенд прокси на localhost:8001
    
    // Инициализация сайдбара
    setupSidebar();
    
    // Кнопка настроек
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/public/settings.html';
        });
    }
    
    // Кнопка GPT меню
    setupAiMenu();
    
    // Навигация теперь работает через обычные ссылки в HTML, JavaScript не нужен
    // setupNavigation();
    
    // Загрузка истории чата
    loadChatHistory();
    
    // Автоматическое изменение высоты textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
    });
    
    // Прокрутка чата вниз при фокусе на поле ввода (когда появляется клавиатура)
    function setupChatScrollOnFocus() {
        const chatContainer = chatMessages;
        if (!chatContainer) return;
        
        const handleFocus = () => {
            // Прокручиваем контейнер чата вниз (к последним сообщениям) плавно
            setTimeout(() => {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
            
            // Дополнительная прокрутка после открытия клавиатуры
            setTimeout(() => {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 300);
        };
        
        chatInput.addEventListener('focus', handleFocus);
        chatInput.addEventListener('touchstart', handleFocus);
        
        // Для мобильных устройств также обрабатываем событие при клике
        if ('ontouchstart' in window) {
            chatInput.addEventListener('click', handleFocus);
        }
    }
    
    setupChatScrollOnFocus();
    
    // Отправка сообщения по Enter (Shift+Enter для новой строки)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter key pressed, calling sendMessage');
            if (typeof sendMessage === 'function') {
                sendMessage();
            } else {
                console.error('sendMessage is not a function!', typeof sendMessage);
            }
        }
    });
    
    // Отправка по клику на кнопку
    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Send button clicked');
        if (typeof sendMessage === 'function') {
            sendMessage();
        } else {
            console.error('sendMessage is not a function!', typeof sendMessage);
        }
    });
    
    // Функция отправки сообщения
    async function sendMessage() {
        console.log('sendMessage called');
        const message = chatInput.value.trim();
        console.log('Message:', message);
        
        if (!message) {
            console.log('Message is empty');
            return;
        }
        
        if (sendBtn.disabled) {
            console.log('Send button is disabled');
            return;
        }
        
        console.log('Processing message...');
        
        // Проверяем, является ли это запросом на создание задачи или заметки
        const lowerMessage = message.toLowerCase();
        const hasActionWord = lowerMessage.includes('создай') || 
                             lowerMessage.includes('сделай') || 
                             lowerMessage.includes('напиши') || 
                             lowerMessage.includes('добавь');
        const hasTaskWord = lowerMessage.includes('задач');
        const hasNoteWord = lowerMessage.includes('заметк') && !lowerMessage.includes('задач');
        const isTaskCreationRequest = hasActionWord && hasTaskWord;
        const isNoteCreationRequest = hasActionWord && hasNoteWord;
        
        console.log('Checking task creation request:', { 
            message, 
            lowerMessage, 
            hasActionWord, 
            hasTaskWord, 
            isTaskCreationRequest 
        });
        
        // Если это запрос на создание задачи, проверяем историю ДО сохранения сообщения
        let shouldIntercept = false;
        if (isTaskCreationRequest) {
            const chatHistoryBefore = JSON.parse(localStorage.getItem('chat_history') || '[]');
            console.log('Chat history before:', chatHistoryBefore);
            
            const hasDescriptionQuestion = chatHistoryBefore.some(msg => 
                msg.role === 'assistant' && 
                (msg.text.toLowerCase().includes('будет ли описание') || 
                 msg.text.toLowerCase().includes('описание у задачи') ||
                 msg.text.toLowerCase().includes('будет ли описание у'))
            );
            const hasPriorityQuestion = chatHistoryBefore.some(msg => 
                msg.role === 'assistant' && 
                msg.text.toLowerCase().includes('приоритет')
            );
            
            console.log('Has description question:', hasDescriptionQuestion);
            console.log('Has priority question:', hasPriorityQuestion);
            
            // Если нет ни вопроса про описание, ни вопроса про приоритет - это первое сообщение
            if (!hasDescriptionQuestion && !hasPriorityQuestion) {
                shouldIntercept = true;
                console.log('Should intercept: TRUE - это первое сообщение о создании задачи');
            } else {
                console.log('Should intercept: FALSE - уже был диалог');
            }
        } else {
            console.log('Not a task creation request');
        }
        
        // Обрабатываем создание заметки (просто текст, без даты и приоритета)
        if (isNoteCreationRequest) {
            // Извлекаем текст заметки из сообщения
            let noteText = '';
            const noteMatch = message.match(/(?:создай|сделай|напиши|добавь)\s+заметку\s+(.+)/i);
            if (noteMatch) {
                noteText = noteMatch[1].trim();
            } else {
                // Если не нашли паттерн, берем все после "заметку"
                const simpleMatch = message.split(/заметку/i);
                if (simpleMatch.length > 1) {
                    noteText = simpleMatch.slice(1).join(' ').trim();
                }
            }
            
            if (noteText) {
                // Добавляем сообщение пользователя
                addMessage('user', message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
                
                // Создаем заметку
                await createNoteFromChat(noteText);
                sendBtn.disabled = false;
                chatInput.focus();
                return;
            }
        }
        
        // Добавляем сообщение пользователя
        addMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Если нужно перехватить, делаем это сразу и ВЫХОДИМ из функции
        if (shouldIntercept) {
            console.log('🚨 ПЕРЕХВАТЫВАЕМ создание задачи - задаем вопрос про описание');
            
            // Извлекаем дату из сообщения (поддерживаем и конкретные даты, и относительные)
            let dateText = null;
            
            // Сначала пробуем найти относительные даты (завтра, сегодня и т.д.)
            const relativeDateMatch = message.match(/\b(завтра|сегодня|послезавтра|вчера|позавчера|tomorrow|today)\b/i);
            if (relativeDateMatch) {
                dateText = relativeDateMatch[1].toLowerCase();
            } else {
                // Ищем конкретную дату с числом и месяцем
                const dateMatch = message.match(/(\d{1,2})\s*(декабря|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября)/i);
                if (dateMatch) {
                    const day = parseInt(dateMatch[1]);
                    const monthName = dateMatch[2];
                    dateText = `${day} ${monthName}`;
                }
            }
            
            // Извлекаем название задачи
            let title = '';
            
            // Паттерн для "создай задачу на завтра Сделать уведомление"
            // Сначала убираем дату, потом извлекаем название
            let messageWithoutDate = message;
            
            // Убираем относительные даты
            messageWithoutDate = messageWithoutDate.replace(/\b(на\s+)?(завтра|сегодня|послезавтра|вчера|позавчера)\b/gi, '').trim();
            
            // Убираем конкретные даты
            messageWithoutDate = messageWithoutDate.replace(/\bна\s+\d{1,2}\s+(декабря|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября)\b/gi, '').trim();
            
            // Теперь извлекаем название после "создай задачу" или "сделай задачу" и т.д.
            const titleMatch = messageWithoutDate.match(/(?:создай|сделай|напиши|добавь)\s+(?:задачу|заметку)\s*[:\-]?\s*(.+)/i);
            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim();
                // Убираем возможные остатки "на" в начале
                title = title.replace(/^на\s+/i, '').trim();
            } else {
                // Если не нашли через паттерн, берем всё после команды
                const fallbackMatch = message.match(/(?:создай|сделай|напиши|добавь)\s+(?:задачу|заметку)\s+(?:на\s+)?[^:]+?\s+(.+)/i);
                if (fallbackMatch && fallbackMatch[1]) {
                    title = fallbackMatch[1].trim();
                }
            }
            
            console.log('Extracted title:', title);
            
            // Инициализируем состояние создания задачи
            taskCreationState = {
                step: 'description', // Следующий шаг - вопрос про описание
                date: dateText,
                title: title,
                description: null,
                priority: null
            };
            
            console.log('Task creation state initialized:', taskCreationState);
            
            addMessage('assistant', 'Будет ли описание у задачи?');
            sendBtn.disabled = false;
            chatInput.focus();
            return; // ВАЖНО: выходим из функции, не отправляя запрос к AI
        }
        
        // Обрабатываем ответы пользователя в процессе создания задачи
        // ВАЖНО: проверяем taskCreationState ПЕРЕД отправкой к AI
        // Сохраняем сообщение пользователя, но не отправляем к AI если обрабатываем состояние
        if (taskCreationState) {
            const lower = message.toLowerCase().trim();
            console.log('Processing task creation state, step:', taskCreationState.step, 'message:', message);
            
            // Добавляем сообщение пользователя в чат
            addMessage('user', message);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            
            // Если ожидаем ответ на вопрос про описание
            if (taskCreationState.step === 'description') {
                // Нормализуем сообщение: убираем лишние пробелы и приводим к нижнему регистру
                const normalizedMessage = lower.trim().replace(/\s+/g, ' ');
                
                // Проверяем отрицательные ответы (учитываем разные варианты с запятыми и без)
                const negativePatterns = [
                    /^нет\s*$/i,
                    /^нет\s*[,.]?\s*(не\s+)?(будет|нужно|требуется)/i,
                    /^не\s+(будет|нужно|требуется)/i,
                    /^не\s*нужно/i,  // "не нужно" - основной паттерн
                    /^не\s*требуется/i,
                    /^без\s+описания/i,
                    /^описания\s+не\s+будет/i,
                    /нет[,\s]+не\s+нужно/i,
                    /нет[,\s]+не\s+требуется/i,
                    /\b(не\s+нужно|не\s+требуется)\b/i  // ищем "не нужно" в любом месте
                ];
                
                // Проверяем положительные ответы
                const positivePatterns = [
                    /^да\s*$/i,
                    /^да\s+будет/i,
                    /^будет\s*$/i,
                    /^нужно\s*$/i,
                    /^требуется\s*$/i,
                    /^да[,\s]+(будет|нужно|требуется)/i
                ];
                
                const isNegative = negativePatterns.some(pattern => pattern.test(normalizedMessage));
                const isPositive = positivePatterns.some(pattern => pattern.test(normalizedMessage));
                
                console.log('Checking answer for description question:', {
                    originalMessage: message,
                    normalizedMessage: normalizedMessage,
                    isNegative,
                    isPositive,
                    matchedNegative: negativePatterns.find(p => p.test(normalizedMessage))?.toString(),
                    matchedPositive: positivePatterns.find(p => p.test(normalizedMessage))?.toString()
                });
                
                if (isNegative) {
                    // Описание не нужно - создаем задачу сразу с приоритетом 1 (по умолчанию)
                    taskCreationState.description = '';
                    taskCreationState.priority = 1; // Используем приоритет по умолчанию
                    console.log('Negative answer - creating task immediately without description');
                    
                    // Создаем задачу сразу
                    if (taskCreationState.date && taskCreationState.title) {
                        try {
                            await createTaskFromChat(
                                taskCreationState.date,
                                taskCreationState.title,
                                '', // Без описания
                                1   // Приоритет по умолчанию
                            );
                            taskCreationState = null; // Сбрасываем состояние
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        } catch (error) {
                            console.error('Error creating task:', error);
                            addMessage('assistant', `Ошибка при создании задачи: ${error.message}`, true);
                            taskCreationState = null;
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        }
                    } else {
                        console.error('Missing date or title in taskCreationState:', taskCreationState);
                        addMessage('assistant', 'Ошибка: не удалось создать задачу. Недостаточно данных.', true);
                        taskCreationState = null;
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return;
                    }
                } else if (isPositive) {
                    // Описание нужно - переходим к шагу получения текста описания
                    taskCreationState.step = 'description_text';
                    console.log('Positive answer - asking for description text');
                    addMessage('assistant', 'Что вы хотите добавить в описание?');
                    sendBtn.disabled = false;
                    chatInput.focus();
                    return;
                } else {
                    // Не распознан как явный да/нет - считаем, что пользователь сразу указал описание
                    // Создаем задачу сразу с этим описанием
                    console.log('Answer not recognized as yes/no, treating as description:', message);
                    
                    if (taskCreationState.date && taskCreationState.title) {
                        try {
                            await createTaskFromChat(
                                taskCreationState.date,
                                taskCreationState.title,
                                message.trim(), // Используем сообщение как описание
                                1   // Приоритет по умолчанию
                            );
                            taskCreationState = null;
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        } catch (error) {
                            console.error('Error creating task:', error);
                            addMessage('assistant', `Ошибка при создании задачи: ${error.message}`, true);
                            taskCreationState = null;
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        }
                    }
                }
            }
            
            // Если ожидаем текст описания
            if (taskCreationState.step === 'description_text') {
                taskCreationState.description = message.trim();
                console.log('Description received:', taskCreationState.description);
                console.log('Task state after description:', taskCreationState);
                
                // После получения описания сразу создаем задачу с приоритетом 1 (по умолчанию)
                console.log('Creating task with description and default priority');
                
                if (taskCreationState.date && taskCreationState.title) {
                    try {
                        await createTaskFromChat(
                            taskCreationState.date,
                            taskCreationState.title,
                            taskCreationState.description,
                            1   // Приоритет по умолчанию
                        );
                        taskCreationState = null; // Сбрасываем состояние
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return;
                    } catch (error) {
                        console.error('Error creating task:', error);
                        addMessage('assistant', `Ошибка при создании задачи: ${error.message}`, true);
                        taskCreationState = null;
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return;
                    }
                } else {
                    console.error('Missing date or title in taskCreationState:', taskCreationState);
                    addMessage('assistant', 'Ошибка: не удалось создать задачу. Недостаточно данных.', true);
                    taskCreationState = null;
                    sendBtn.disabled = false;
                    chatInput.focus();
                    return;
                }
            }
            
            // Шаг приоритета больше не используется - задачи создаются сразу с приоритетом 1
            // Этот блок оставлен на случай, если код все еще пытается обработать этот шаг
            if (taskCreationState.step === 'priority') {
                const priorityMatch = message.match(/([123])/);
                if (priorityMatch) {
                    taskCreationState.priority = parseInt(priorityMatch[1]);
                    console.log('Priority received:', taskCreationState.priority);
                    console.log('Full task state before creation:', JSON.stringify(taskCreationState, null, 2));
                    
                    // Создаем задачу
                    if (taskCreationState.date && taskCreationState.title) {
                        console.log('Creating task with data:', {
                            date: taskCreationState.date,
                            title: taskCreationState.title,
                            description: taskCreationState.description || '',
                            priority: taskCreationState.priority
                        });
                        try {
                            await createTaskFromChat(
                                taskCreationState.date,
                                taskCreationState.title,
                                taskCreationState.description || '',
                                taskCreationState.priority
                            );
                            console.log('Task created successfully, resetting state');
                            taskCreationState = null; // Сбрасываем состояние
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        } catch (error) {
                            console.error('Error creating task:', error);
                            addMessage('assistant', `Ошибка при создании задачи: ${error.message}`, true);
                            taskCreationState = null;
                            sendBtn.disabled = false;
                            chatInput.focus();
                            return;
                        }
                    } else {
                        console.error('Missing date or title in taskCreationState:', taskCreationState);
                        addMessage('assistant', 'Ошибка: не удалось создать задачу. Недостаточно данных.', true);
                        taskCreationState = null;
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return;
                    }
                } else {
                    // Пользователь не ответил на вопрос про приоритет правильно
                    console.log('Invalid priority response:', message);
                    addMessage('assistant', 'Пожалуйста, укажите приоритет: 1, 2 или 3?', true);
                    sendBtn.disabled = false;
                    chatInput.focus();
                    return;
                }
            }
            
            // Если мы дошли сюда, значит шаг не был обработан - это ошибка
            // НО мы всё равно не должны отправлять сообщение к AI
            console.error('Unexpected task creation step or unhandled state:', taskCreationState);
            console.error('Current step:', taskCreationState?.step);
            console.error('Message:', message);
            addMessage('assistant', 'Ошибка: не удалось обработать ответ. Пожалуйста, начните создание задачи заново.', true);
            taskCreationState = null; // Сбрасываем состояние
            sendBtn.disabled = false;
            chatInput.focus();
            return; // ВАЖНО: не отправляем сообщение к AI
        }
        
        // Показываем индикатор загрузки
        const loadingId = addLoadingMessage();
        
        // Отключаем кнопку отправки
        sendBtn.disabled = true;
        
        try {
            // API ключи хранятся на сервере в .env файле
            // Фронтенд использует бэкенд прокси на localhost:8001
            
            // Получаем контекст (задачи и заметки)
            const context = await getContext(message);
            
            // Получаем историю сообщений из localStorage
            // Исключаем текущее сообщение, так как оно еще не сохранено
            const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
            
            // Формируем массив сообщений для API
            const messages = [
                {
                    role: 'system',
                    content: context
                }
            ];
            
            // Добавляем историю диалога (последние 10 сообщений для контекста)
            const recentHistory = chatHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.text
                });
            });
            
            // Добавляем текущее сообщение пользователя (оно еще не в истории)
            messages.push({
                role: 'user',
                content: message
            });
            
            console.log('Sending messages to API:', messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' })));
            
            // Отправляем запрос к Yandex GPT (пробуем разные модели)
            let response;
            let lastError;
            let success = false;
            
            // Используем прокси через бэкенд для обхода CORS
            // Пробуем модели по очереди
            for (const model of YANDEX_MODELS) {
                try {
                    // Используем простой прокси-сервер (порт 8001) или бэкенд (порт 8000)
                    // Простой прокси запускается через: python yandex-gpt-proxy.py
                    const apiUrl = 'http://localhost:8001/api/ai/yandex-gpt/chat';
                    
                    const requestBody = {
                        model: model,
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 2000
                    };
                    
                    const headers = {
                        'Content-Type': 'application/json'
                    };
                    
                    response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                    
                    if (response.ok) {
                        success = true;
                        break; // Успешно, выходим из цикла
                    } else {
                        const errorText = await response.text();
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            errorData = { error: errorText };
                        }
                        lastError = { status: response.status, data: errorData, model };
                        console.log(`Модель ${model} недоступна (${response.status}), пробуем следующую...`);
                    }
                } catch (err) {
                    lastError = { error: err, model };
                    console.log(`Ошибка с моделью ${model}:`, err);
                }
            }
            
            if (!success || !response || !response.ok) {
                const errorMsg = lastError?.data?.error?.message || lastError?.data?.message || lastError?.error?.message || 'Не удалось подключиться к API';
                console.error('API Error Details:', lastError);
                throw new Error(`HTTP error! status: ${lastError?.status || 'unknown'}. ${errorMsg}`);
            }
            
            const data = await response.json();
            let assistantMessage = '';
            
            // Парсим ответ от Yandex GPT API
            // Пробуем OpenAI-совместимый формат (API Gateway)
            if (data.choices && data.choices[0] && data.choices[0].message) {
                assistantMessage = data.choices[0].message.content;
            } 
            // Пробуем формат Yandex GPT API
            else if (data.result && data.result.alternatives && data.result.alternatives[0]) {
                assistantMessage = data.result.alternatives[0].message.text;
            } 
            // Альтернативный формат ответа
            else if (data.alternatives && data.alternatives[0] && data.alternatives[0].message) {
                assistantMessage = data.alternatives[0].message.text;
            } else {
                console.error('Unexpected Yandex GPT API response:', data);
                throw new Error('Неверный формат ответа от Yandex GPT API');
            }
            
            // Удаляем индикатор загрузки
            removeLoadingMessage(loadingId);

            // Проверяем, пытается ли AI создать задачу без прохождения всех шагов
            const lowerMessage = message.toLowerCase();
            const isTaskCreationRequest = (lowerMessage.includes('создай') || lowerMessage.includes('сделай') || lowerMessage.includes('напиши') || lowerMessage.includes('добавь')) && 
                                         (lowerMessage.includes('задач') || lowerMessage.includes('заметк'));
            
            // Если это запрос на создание задачи и AI пытается создать задачу
            if (isTaskCreationRequest && assistantMessage.includes('CREATE_TASK:')) {
                // Получаем историю ДО сохранения текущего сообщения (оно еще не сохранено)
                const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
                
                // Проверяем, был ли задан вопрос про описание в истории
                const hasDescriptionQuestion = chatHistory.some(msg => 
                    msg.role === 'assistant' && 
                    (msg.text.toLowerCase().includes('будет ли описание') || 
                     msg.text.toLowerCase().includes('описание у задачи') ||
                     msg.text.toLowerCase().includes('будет ли описание у'))
                );
                
                // Проверяем, был ли задан вопрос про приоритет
                const hasPriorityQuestion = chatHistory.some(msg => 
                    msg.role === 'assistant' && 
                    msg.text.toLowerCase().includes('приоритет')
                );
                
                // Если не было вопроса про описание И не было вопроса про приоритет - значит это первое сообщение
                if (!hasDescriptionQuestion && !hasPriorityQuestion) {
                    // AI пытается создать задачу без вопроса про описание - перехватываем
                    console.log('AI пытается создать задачу без вопроса про описание, перехватываем');
                    console.log('Chat history:', chatHistory);
                    addMessage('assistant', 'Будет ли описание у задачи?');
                    sendBtn.disabled = false;
                    chatInput.focus();
                    return;
                }
            }

            // Проверяем, нужно ли выполнить действие (создать задачу и т.д.)
            console.log('=== Checking for actions in message ===');
            console.log('Assistant message:', assistantMessage.substring(0, 500));
            const actionResult = await handleAction(message, assistantMessage);
            console.log('Action result:', actionResult);
            
            // Если задача была создана через команду, не показываем ответ нейросети
            if (actionResult) {
                console.log('✅ Action completed successfully, not showing AI message');
                sendBtn.disabled = false;
                chatInput.focus();
                return;
            }
            
            // ВАЖНО: Если AI НЕ отправил команду CREATE_TASK или CREATE_NOTE, но ответил сообщением о создании,
            // пытаемся извлечь информацию из ответа и создать задачу/заметку вручную
            
            // Проверка для задач
            const isTaskCreationResponse = assistantMessage.includes('✅ Задача создана') || 
                                          assistantMessage.includes('Задача создана') ||
                                          assistantMessage.includes('задача создана');
            
            if (isTaskCreationResponse && !assistantMessage.includes('CREATE_TASK:')) {
                console.log('⚠️ AI responded with task creation message but NO CREATE_TASK command!');
                console.log('Attempting to extract task info from message...');
                
                // Пытаемся извлечь информацию из сообщения пользователя
                const userMessageLower = message.toLowerCase();
                const taskMatch = userMessageLower.match(/(?:создай|сделай|напиши|добавь)\s+(?:задачу)\s+(?:на\s+)?(.+?)\s*[-–]\s*(.+)/i);
                
                if (taskMatch) {
                    const datePart = taskMatch[1].trim();
                    const titlePart = taskMatch[2].trim();
                    
                    console.log('Extracted from user message:', { datePart, titlePart });
                    
                    try {
                        // Пытаемся создать задачу из сообщения пользователя
                        await createTaskFromChat(datePart, titlePart, '', 1);
                        console.log('✅ Task created from user message extraction');
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return; // Не показываем сообщение AI, так как мы уже создали задачу
                    } catch (error) {
                        console.error('Failed to create task from extracted info:', error);
                        // Продолжаем - покажем сообщение AI
                    }
                }
            }
            
            // Проверка для заметок
            const isNoteCreationResponse = assistantMessage.includes('✅ Заметка создана') || 
                                          assistantMessage.includes('Заметка создана') ||
                                          assistantMessage.includes('заметка создана');
            
            if (isNoteCreationResponse && !assistantMessage.includes('CREATE_NOTE:')) {
                console.log('⚠️ AI responded with note creation message but NO CREATE_NOTE command!');
                console.log('Attempting to extract note info from message...');
                
                // Пытаемся извлечь информацию из сообщения пользователя
                const userMessageLower = message.toLowerCase();
                const noteMatch = userMessageLower.match(/(?:создай|сделай|напиши|добавь)\s+заметку\s+(.+)/i);
                
                if (noteMatch) {
                    const noteText = noteMatch[1].trim();
                    console.log('Extracted note text from user message:', noteText);
                    
                    try {
                        // Пытаемся создать заметку из сообщения пользователя
                        await createNoteFromChat(noteText);
                        console.log('✅ Note created from user message extraction');
                        sendBtn.disabled = false;
                        chatInput.focus();
                        return; // Не показываем сообщение AI, так как мы уже создали заметку
                    } catch (error) {
                        console.error('Failed to create note from extracted info:', error);
                        // Продолжаем - покажем сообщение AI
                    }
                }
            }
            
            // Убираем технические команды из ответа для пользователя
            // Если команда CREATE_TASK была обработана, не показываем её
            if (!assistantMessage.includes('CREATE_TASK:') && !assistantMessage.includes('CREATE_NOTE:')) {
                // Обычное сообщение без команд
                addMessage('assistant', assistantMessage, true); // Используем эффект печатания
            } else {
                // Если есть команда, но она не была обработана (возможно ошибка парсинга)
                // Показываем только текст без команды
                const cleanMessage = assistantMessage
                    .replace(/CREATE_TASK:[^:\n\r]+:[^:\n\r]+:[^:\n\r]*:[^:\n\r]+/g, '')
                    .replace(/CREATE_NOTE:[^\n\r]+/g, '')
                    .trim();
                if (cleanMessage) {
                    addMessage('assistant', cleanMessage, true); // Используем эффект печатания
                } else {
                    // Если команда была, но текст пустой - значит команда не обработалась
                    console.error('Command found but not processed:', assistantMessage);
                    addMessage('assistant', 'Произошла ошибка при обработке команды. Попробуйте еще раз.', true);
                }
            }
            
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            removeLoadingMessage(loadingId);
            addMessage('assistant', `Извините, произошла ошибка: ${error.message}. Попробуйте еще раз.`, true); // Используем эффект печатания
        } finally {
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }
    
    // Делаем функцию доступной глобально для отладки
    window.sendMessage = sendMessage;
    
    // Добавление сообщения в чат
    function addMessage(role, text, useTypewriter = false) {
        // Скрываем пустое состояние при добавлении первого сообщения
        hideEmptyState();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        // Проверяем наличие аватара пользователя
        const userAvatar = localStorage.getItem('user_avatar');
        if (role === 'user' && userAvatar) {
            avatar.style.background = 'transparent';
            avatar.style.padding = '0';
            const avatarImg = document.createElement('img');
            avatarImg.src = userAvatar;
            avatarImg.style.width = '100%';
            avatarImg.style.height = '100%';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatar.appendChild(avatarImg);
        } else {
            avatar.textContent = role === 'user' ? 'Я' : 'AI';
        }
        
        const content = document.createElement('div');
        content.className = 'chat-message-content';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Для сообщений от ассистента используем эффект печатания
        if (role === 'assistant' && useTypewriter) {
            typewriterEffect(content, text, () => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
                // Сохраняем в историю после завершения печатания
                saveChatMessage(role, text);
            });
        } else {
            // Для обычных сообщений просто устанавливаем текст
            content.textContent = text;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // Сохраняем в историю
            saveChatMessage(role, text);
        }
        
        return messageDiv;
    }
    
    // Эффект печатающегося текста
    function typewriterEffect(element, text, onComplete) {
        element.textContent = '';
        let index = 0;
        const speed = 20; // Скорость печатания (миллисекунды между символами)
        
        function type() {
            if (index < text.length) {
                // Добавляем следующий символ
                element.textContent += text.charAt(index);
                index++;
                
                // Прокручиваем вниз во время печатания
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Продолжаем печатать
                setTimeout(type, speed);
            } else {
                // Печатание завершено
                if (onComplete) {
                    onComplete();
                }
            }
        }
        
        // Начинаем печатать
        type();
    }
    
    // Добавление индикатора загрузки
    function addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant';
        messageDiv.id = 'loading-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.textContent = 'AI';
        
        const content = document.createElement('div');
        content.className = 'chat-message-content loading';
        
        const dots = document.createElement('div');
        dots.className = 'chat-loading-dots';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'chat-loading-dot';
            dots.appendChild(dot);
        }
        content.appendChild(dots);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return 'loading-message';
    }
    
    // Удаление индикатора загрузки
    function removeLoadingMessage(id) {
        const loadingMsg = document.getElementById(id);
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }
    
    // Функция для парсинга относительных дат
    function parseRelativeDate(dateStr) {
        const lower = dateStr.toLowerCase().trim();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('parseRelativeDate called with:', dateStr, 'lower:', lower);
        
        // Используем более точное совпадение - проверяем как точное совпадение, так и слово целиком
        // ВАЖНО: более длинные ключи должны идти первыми, чтобы избежать ложных срабатываний
        const dateMap = [
            ['послезавтра', 2],
            ['day after tomorrow', 2],
            ['позавчера', -2],
            ['day before yesterday', -2],
            ['через месяц', 30],
            ['через неделю', 7],
            ['через 3 дня', 3],
            ['через 2 дня', 2],
            ['через день', 1],
            ['сегодня', 0],
            ['today', 0],
            ['завтра', 1],
            ['tomorrow', 1],
            ['вчера', -1],
            ['yesterday', -1]
        ];
        
        // Сначала проверяем точное совпадение
        for (const [key, days] of dateMap) {
            if (lower === key) {
                const result = new Date(today);
                result.setDate(result.getDate() + days);
                console.log('parseRelativeDate: exact match found for', key, 'result:', result, 'day:', result.getDate(), 'month:', result.getMonth() + 1);
                return result;
            }
        }
        
        // Затем проверяем как слово (с границами слов), более длинные ключи первыми
        for (const [key, days] of dateMap) {
            // Проверяем как точное совпадение или как отдельное слово
            const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lower)) {
                const result = new Date(today);
                result.setDate(result.getDate() + days);
                console.log('parseRelativeDate: word match found for', key, 'result:', result, 'day:', result.getDate(), 'month:', result.getMonth() + 1);
                return result;
            }
        }
        
        // Парсинг конкретных дат типа "4 января", "15 марта"
        const monthNames = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
            'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11,
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        
        for (const [monthName, monthIndex] of Object.entries(monthNames)) {
            const regex = new RegExp(`(\\d{1,2})\\s+${monthName}(?:\\s+(\\d{4}))?`, 'i');
            const match = lower.match(regex);
            if (match) {
                const day = parseInt(match[1]);
                const year = match[2] ? parseInt(match[2]) : today.getFullYear();
                const result = new Date(year, monthIndex, day);
                result.setHours(0, 0, 0, 0);
                return result;
            }
        }
        
        return null;
    }
    
    // Функция для поиска задач по ключевым словам
    function searchTasksByKeywords(tasks, keywords) {
        const lowerKeywords = keywords.toLowerCase().split(/\s+/);
        return tasks.filter(task => {
            const searchText = `${task.title} ${task.description || ''}`.toLowerCase();
            return lowerKeywords.some(keyword => searchText.includes(keyword));
        });
    }
    
    // Получение контекста (задачи и заметки)
    async function getContext(userMessage = '') {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const stickers = JSON.parse(localStorage.getItem('notes_stickers') || '[]');
        
        // Получаем текущую дату и неделю
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Понедельник
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setDate(weekStart.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        // Фильтруем задачи текущей недели
        const thisWeekTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate >= weekStart && taskDate <= weekEnd;
        });
        
        const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
        
        // Фильтруем задачи прошлой недели
        const lastWeekTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate >= lastWeekStart && taskDate <= lastWeekEnd;
        });
        
        const lastWeekCompleted = lastWeekTasks.filter(t => t.completed).length;
        
        // Получаем текущий месяц
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Фильтруем задачи текущего месяца
        const thisMonthTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate >= monthStart && taskDate <= monthEnd;
        });
        
        const thisMonthCompleted = thisMonthTasks.filter(t => t.completed).length;
        
        // Получаем прошлый месяц
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        lastMonthStart.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        
        // Фильтруем задачи прошлого месяца
        const lastMonthTasks = tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate >= lastMonthStart && taskDate <= lastMonthEnd;
        });
        
        const lastMonthCompleted = lastMonthTasks.filter(t => t.completed).length;
        
        // Получаем текущую дату для проверки
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const todayISO = today.toISOString().split('T')[0];
        
        // Фильтруем задачи на сегодня
        const todayTasks = tasks.filter(task => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                return taskDate === todayISO;
            }
            if (task.start_date && task.end_date) {
                const startDate = new Date(task.start_date).toISOString().split('T')[0];
                const endDate = new Date(task.end_date).toISOString().split('T')[0];
                return todayISO >= startDate && todayISO <= endDate;
            }
            return false;
        });
        
        const todayCompleted = todayTasks.filter(t => t.completed).length;
        
        // Вычисляем задачи на завтра, вчера, послезавтра
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowISO = tomorrow.toISOString().split('T')[0];
        const tomorrowTasks = tasks.filter(task => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                return taskDate === tomorrowISO;
            }
            return false;
        });
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];
        const yesterdayTasks = tasks.filter(task => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                return taskDate === yesterdayISO;
            }
            return false;
        });
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowISO = dayAfterTomorrow.toISOString().split('T')[0];
        const dayAfterTomorrowTasks = tasks.filter(task => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                return taskDate === dayAfterTomorrowISO;
            }
            return false;
        });
        
        // Парсим дату из сообщения пользователя, если есть
        let requestedDate = null;
        let requestedDateTasks = [];
        if (userMessage) {
            requestedDate = parseRelativeDate(userMessage);
            if (requestedDate) {
                const requestedDateISO = requestedDate.toISOString().split('T')[0];
                requestedDateTasks = tasks.filter(task => {
                    if (task.due_date) {
                        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                        return taskDate === requestedDateISO;
                    }
                    return false;
                });
            }
        }
        
        // Поиск задач по ключевым словам из сообщения
        let foundTasksByKeywords = [];
        if (userMessage) {
            // Извлекаем ключевые слова (исключаем служебные слова)
            const stopWords = ['сколько', 'у', 'меня', 'задач', 'на', 'когда', 'мне', 'нужно', 'должен', 'должна', 'какие', 'какая', 'какое', 'есть', 'быть', 'сегодня', 'завтра', 'вчера', 'послезавтра', 'позавчера'];
            const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
            if (words.length > 0) {
                foundTasksByKeywords = searchTasksByKeywords(tasks, words.join(' '));
            }
        }
        
        // Получаем текущий язык интерфейса
        const currentLang = localStorage.getItem('language') || 'ru';
        const languageInstructions = {
            'ru': `Ты - умный и дружелюбный ассистент. ВСЕГДА отвечай ТОЛЬКО на русском языке.

ТВОИ ОСНОВНЫЕ ВОЗМОЖНОСТИ:
1. Отвечать на любые вопросы: образовательные, поучительные, общие вопросы, помощь с информацией
2. Помогать с управлением задачами и заметками (создание, анализ, статистика)
3. Давать советы и рекомендации
4. Объяснять сложные темы простым языком

ОГРАНИЧЕНИЯ:
- НЕ обсуждай политику, политические темы, политические партии и политических деятелей
- НЕ используй нецензурную лексику, мат, оскорбления
- НЕ давай медицинские диагнозы или рекомендации по лечению (только общую информацию)
- Будь вежливым, дружелюбным и профессиональным

КОГДА ПОЛЬЗОВАТЕЛЬ ПРОСИТ СОЗДАТЬ ЗАДАЧУ ИЛИ ЗАМЕТКУ - используй специальные команды (см. ниже).
КОГДА ПОЛЬЗОВАТЕЛЬ ЗАДАЕТ ОБЩИЙ ВОПРОС - отвечай на него полно и полезно, как обычный AI-ассистент.`,
            'en': `You are a smart and friendly assistant. ALWAYS respond ONLY in English.

YOUR MAIN CAPABILITIES:
1. Answer any questions: educational, instructive, general questions, help with information
2. Help with task and note management (creation, analysis, statistics)
3. Give advice and recommendations
4. Explain complex topics in simple language

RESTRICTIONS:
- DO NOT discuss politics, political topics, political parties, or political figures
- DO NOT use profanity, swear words, or offensive language
- DO NOT provide medical diagnoses or treatment recommendations (only general information)
- Be polite, friendly, and professional

WHEN USER ASKS TO CREATE A TASK OR NOTE - use special commands (see below).
WHEN USER ASKS A GENERAL QUESTION - answer it fully and helpfully, like a regular AI assistant.`,
            'es': `Eres un asistente inteligente y amigable. SIEMPRE responde SOLO en español.

TUS CAPACIDADES PRINCIPALES:
1. Responder cualquier pregunta: educativas, instructivas, preguntas generales, ayuda con información
2. Ayudar con la gestión de tareas y notas (creación, análisis, estadísticas)
3. Dar consejos y recomendaciones
4. Explicar temas complejos en lenguaje simple

RESTRICCIONES:
- NO discutas política, temas políticos, partidos políticos o figuras políticas
- NO uses lenguaje soez, palabrotas o lenguaje ofensivo
- NO proporciones diagnósticos médicos o recomendaciones de tratamiento (solo información general)
- Sé educado, amigable y profesional

CUANDO EL USUARIO PIDE CREAR UNA TAREA O NOTA - usa comandos especiales (ver abajo).
CUANDO EL USUARIO HACE UNA PREGUNTA GENERAL - respóndela completamente y de manera útil, como un asistente de IA regular.`
        };
        const baseInstruction = languageInstructions[currentLang] || languageInstructions['ru'];
        
        // Формируем контекст для нейросети
        let context = `${baseInstruction}

ВАЖНО: "ЗАДАЧА" и "ЗАМЕТКА" - это РАЗНЫЕ вещи!

ЗАДАЧА:
- Привязана к конкретной дате
- Имеет название, описание (опционально) и приоритет (1, 2 или 3)
- Формат создания: CREATE_TASK:дата:название:описание:приоритет

ЗАМЕТКА:
- Это просто стикер с текстом
- НЕ имеет даты, описания и приоритета
- Формат создания: CREATE_NOTE:текст заметки
- Пример: если пользователь говорит "создай заметку подарить маме подарок", создай заметку с текстом "подарить маме подарок"

СТРОГИЙ АЛГОРИТМ СОЗДАНИЯ ЗАДАЧИ (ВЫПОЛНЯЙ СТРОГО ПО ПОРЯДКУ, НЕ ПРОПУСКАЙ ШАГИ!):

ШАГ 1: Пользователь пишет "создай/сделай/напиши задачу на [дата] - [название]"
  - Если пользователь просит создать "ЗАМЕТКУ" (без даты) - это заметка, создай её сразу командой CREATE_NOTE:текст
  - Если пользователь просит создать "ЗАДАЧУ" (с датой) - извлеки дату и название из сообщения
  - ОБЯЗАТЕЛЬНО задай ТОЛЬКО ОДИН вопрос: "Будет ли описание у задачи?"
  - ЗАПРЕЩЕНО создавать задачу на этом шаге!
  - ЗАПРЕЩЕНО задавать другие вопросы!
  - ЗАПРЕЩЕНО пропускать этот вопрос!

ШАГ 2: Пользователь отвечает про описание
  - Если ответ отрицательный (нет, не будет, без описания, не нужно, не требуется и т.д.) → СРАЗУ переходи к ШАГУ 3 (спроси про приоритет)
  - Если ответ положительный (да, будет, нужно, требуется и т.д.) → СРАЗУ спроси "Что вы хотите добавить в описание?" и дождись ответа пользователя с описанием, затем переходи к ШАГУ 3
  - КРИТИЧЕСКИ ВАЖНО: Если в истории диалога пользователь УЖЕ ответил "да" или "будет" на вопрос про описание, НЕ спрашивай снова "Будет ли описание?"! Сразу спроси "Что вы хотите добавить в описание?"

ШАГ 3: Спроси про приоритет
  - Задай вопрос: "Какой приоритет у задачи? 1, 2 или 3?"
  - Дождись ответа пользователя
  - ЗАПРЕЩЕНО создавать задачу до получения ответа!

ШАГ 4: Создай задачу
  - После получения приоритета (1, 2 или 3) СРАЗУ создай задачу командой: CREATE_TASK:дата:название:описание:приоритет
  - Если приоритет не указан, используй 1
  - Если описание не было (пользователь сказал "нет"), используй формат: CREATE_TASK:дата:название::приоритет (два двоеточия подряд между названием и приоритетом)
  - ВАЖНО: Формат команды строгий! Если описание пустое, используй два двоеточия подряд (::), например: CREATE_TASK:30 декабря:запустить бота::1

КРИТИЧЕСКИ ВАЖНО:
- ВСЕГДА начинай с вопроса "Будет ли описание у задачи?" - НИКОГДА не пропускай этот шаг!
- Задавай ТОЛЬКО ОДИН вопрос за раз и дожидайся ответа
- НИКОГДА не задавай несколько вопросов сразу!
- НИКОГДА не создавай задачу сразу после первого сообщения пользователя!
- НИКОГДА не повторяй один и тот же вопрос!
- ДАТА: Если год не указан, используй текущий год (${new Date().getFullYear()})
- ДАТА: НЕЛЬЗЯ создавать задачи в прошлом! Сегодня: ${todayStr}. Если пользователь указал дату в прошлом, скажи: "Нельзя создавать задачи в прошлом. Укажите дату сегодня или в будущем."
- Приоритет должен быть ЧИСЛОМ: 1, 2 или 3
- Формат CREATE_TASK: дата:название:описание:приоритет
- Если описание ЕСТЬ: CREATE_TASK:30 декабря:запустить бота:описание задачи:1
- Если описание ПУСТОЕ (пользователь сказал "нет"): CREATE_TASK:30 декабря:запустить бота::1 (ОБЯЗАТЕЛЬНО два двоеточия подряд :: между названием и приоритетом!)
- КРИТИЧЕСКИ ВАЖНО: Если описание пустое, НЕ используй формат с тремя частями! ВСЕГДА используй формат с четырьмя частями и двумя двоеточиями подряд для пустого описания!

ТВОИ ОСНОВНЫЕ ЗАДАЧИ:
1. Отвечать на ЛЮБЫЕ вопросы пользователя: образовательные, поучительные, общие вопросы, помощь с информацией - отвечай полно и полезно!
2. Анализировать задачи и статистику. Отвечай подробно и дружелюбно.
3. Отвечать на вопросы о задачах и заметках.
4. Давать советы и рекомендации по различным темам.
5. Объяснять сложные темы простым языком.

ВАЖНО: Если пользователь задает общий вопрос (не про создание задачи/заметки), просто отвечай на него как обычный AI-ассистент! Не пытайся создавать задачи или заметки, если пользователь этого не просит.

СТАТИСТИКА ЗАДАЧ:
- Сегодня (${todayStr}): ${todayTasks.length} задач (выполнено: ${todayCompleted})
- Текущая неделя: ${thisWeekTasks.length} задач (выполнено: ${thisWeekCompleted})
- Прошлая неделя: ${lastWeekTasks.length} задач (выполнено: ${lastWeekCompleted})
- Текущий месяц: ${thisMonthTasks.length} задач (выполнено: ${thisMonthCompleted})
- Прошлый месяц: ${lastMonthTasks.length} задач (выполнено: ${lastMonthCompleted})

ВАЖНО: Когда пользователь спрашивает про "сегодня" или "на сегодня", используй статистику СЕГОДНЯ (${todayTasks.length} задач на ${todayStr})!
Когда пользователь спрашивает про "завтра" или "на завтра", используй статистику ЗАВТРА (${tomorrowTasks.length} задач)!
Когда пользователь спрашивает про "вчера" или "вчера было", используй статистику ВЧЕРА (${yesterdayTasks.length} задач)!
Когда пользователь спрашивает про "послезавтра" или "после завтра", используй статистику ПОСЛЕЗАВТРА (${dayAfterTomorrowTasks.length} задач)!
Когда пользователь спрашивает про "месяц" или "в этом месяце", используй статистику ТЕКУЩЕГО МЕСЯЦА (${thisMonthTasks.length} задач), а не недели!
Когда пользователь спрашивает про "неделю" или "на этой неделе", используй статистику ТЕКУЩЕЙ НЕДЕЛИ (${thisWeekTasks.length} задач).

ПОИСК ЗАДАЧ:
- Если пользователь спрашивает "когда мне нужно [что-то]" или "когда [что-то]", ИЩИ задачи по ключевым словам из запроса
- Например: "когда мне нужно в кино" → найди все задачи, содержащие слово "кино" в названии или описании, и укажи их даты
- Если пользователь спрашивает про конкретную дату (например, "4 января", "15 марта"), используй задачи на эту дату
- Если пользователь спрашивает про относительную дату ("завтра", "вчера", "послезавтра"), используй соответствующие задачи

Статистика:
- Всего задач: ${tasks.length}
- Выполнено задач: ${tasks.filter(t => t.completed).length}
- Задач на сегодня: ${todayTasks.length}
- Выполнено на сегодня: ${todayCompleted}
- Задач на этой неделе: ${thisWeekTasks.length}
- Выполнено на этой неделе: ${thisWeekCompleted}
- Выполнено на прошлой неделе: ${lastWeekCompleted}
- Разница: ${thisWeekCompleted - lastWeekCompleted}

Задачи на сегодня (${todayStr}):\n`;
        
        if (todayTasks.length > 0) {
            todayTasks.forEach((task, index) => {
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        } else {
            context += 'Нет задач на сегодня\n';
        }
        
        const tomorrowStr = tomorrow.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        context += `\nЗадачи на завтра (${tomorrowStr}):\n`;
        if (tomorrowTasks.length > 0) {
            tomorrowTasks.forEach((task, index) => {
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        } else {
            context += 'Нет задач на завтра\n';
        }
        
        const yesterdayStr = yesterday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        context += `\nЗадачи на вчера (${yesterdayStr}):\n`;
        if (yesterdayTasks.length > 0) {
            yesterdayTasks.forEach((task, index) => {
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        } else {
            context += 'Нет задач на вчера\n';
        }
        
        const dayAfterTomorrowStr = dayAfterTomorrow.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        context += `\nЗадачи на послезавтра (${dayAfterTomorrowStr}):\n`;
        if (dayAfterTomorrowTasks.length > 0) {
            dayAfterTomorrowTasks.forEach((task, index) => {
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        } else {
            context += 'Нет задач на послезавтра\n';
        }
        
        // Если пользователь спросил про конкретную дату, добавляем задачи на эту дату
        if (requestedDate && requestedDateTasks.length > 0) {
            const requestedDateStr = requestedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            context += `\nЗадачи на ${requestedDateStr}:\n`;
            requestedDateTasks.forEach((task, index) => {
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        }
        
        // Если найдены задачи по ключевым словам, добавляем их
        if (foundTasksByKeywords.length > 0) {
            context += `\nНайденные задачи по запросу "${userMessage}":\n`;
            foundTasksByKeywords.forEach((task, index) => {
                const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : 'не указана';
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Дата: ${dueDate}, Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        }
        
        context += `\nВсе задачи пользователя:\n`;
        
        if (tasks.length > 0) {
            tasks.forEach((task, index) => {
                const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : 'не указана';
                context += `${index + 1}. ${task.title}${task.description ? ' - ' + task.description : ''} (Дата: ${dueDate}, Выполнено: ${task.completed ? 'да' : 'нет'})\n`;
            });
        } else {
            context += 'Нет задач\n';
        }
        
        context += '\nТекущие заметки:\n';
        if (stickers.length > 0) {
            stickers.forEach((sticker, index) => {
                // Проверяем, что content существует и является строкой
                const stickerContent = sticker.content || '';
                const content = String(stickerContent).replace(/<[^>]*>/g, '').substring(0, 100);
                const contentLength = String(stickerContent).length;
                context += `${index + 1}. ${content}${contentLength > 100 ? '...' : ''}\n`;
            });
        } else {
            context += 'Нет заметок\n';
        }
        
        const importantNotes = {
            'ru': `\nВАЖНО - СОЗДАНИЕ ЗАДАЧ И ЗАМЕТОК (используй ТОЛЬКО когда пользователь явно просит создать задачу или заметку):
- Если пользователь просит создать ЗАДАЧУ (с датой), веди диалог с уточнениями. После получения всех данных используй формат CREATE_TASK:дата:название:описание:приоритет
- Если пользователь просит создать ЗАМЕТКУ (без даты), создай её сразу командой CREATE_NOTE:текст заметки (без вопросов про описание и приоритет!)
- КРИТИЧЕСКИ ВАЖНО для дат: Если пользователь говорит "завтра", "сегодня", "послезавтра", "вчера" - используй ЭТИ СЛОВА БУКВАЛЬНО в CREATE_TASK, НЕ преобразуй их в конкретные даты! Система сама правильно распарсит относительные даты.
- Если пользователь указал конкретную дату типа "2 января", используй её как есть: "2 января" (без года, система сама подставит текущий год)
- Текущий год: ${new Date().getFullYear()}. Если пользователь указал дату без года (например, "28 декабря"), всегда используй текущий год (${new Date().getFullYear()})
- Формат даты в CREATE_TASK: для относительных дат используй "завтра", "сегодня", "послезавтра". Для конкретных дат используй "28 декабря" или "28 декабря 2025" если указан год

ПОМНИ: Если пользователь задает общий вопрос (не про создание задачи/заметки), просто отвечай на него полно и полезно!`,
            'en': `\nIMPORTANT - CREATING TASKS AND NOTES (use ONLY when user explicitly asks to create a task or note):
- If user asks to create a TASK (with date), have a dialogue with clarifications. After getting all data, use format CREATE_TASK:date:title:description:priority
- If user asks to create a NOTE (without date), create it immediately with command CREATE_NOTE:note text (without questions about description and priority!)
- Current year: ${new Date().getFullYear()}. If user specified date without year (e.g., "December 28"), always use current year (${new Date().getFullYear()})
- Date format in CREATE_TASK should be clear (e.g., "December 28" or "December 28, 2025"), but if year is not specified, system automatically uses current year

REMEMBER: If user asks a general question (not about creating task/note), just answer it fully and helpfully!`,
            'es': `\nIMPORTANTE - CREAR TAREAS Y NOTAS (usa SOLO cuando el usuario explícitamente pide crear una tarea o nota):
- Si el usuario pide crear una TAREA (con fecha), mantén un diálogo con aclaraciones. Después de obtener todos los datos, usa el formato CREATE_TASK:fecha:título:descripción:prioridad
- Si el usuario pide crear una NOTA (sin fecha), créala inmediatamente con el comando CREATE_NOTE:texto de la nota (¡sin preguntas sobre descripción y prioridad!)
- Año actual: ${new Date().getFullYear()}. Si el usuario especificó fecha sin año (ej., "28 de diciembre"), siempre usa el año actual (${new Date().getFullYear()})
- El formato de fecha en CREATE_TASK debe ser claro (ej., "28 de diciembre" o "28 de diciembre de 2025"), pero si el año no se especifica, el sistema usa automáticamente el año actual

RECUERDA: ¡Si el usuario hace una pregunta general (no sobre crear tarea/nota), simplemente respóndela completamente y de manera útil!`
        };
        
        context += importantNotes[currentLang] || importantNotes['ru'];
        
        return context;
    }
    
    // Обработка действий (создание задачи и т.д.)
    async function handleAction(userMessage, assistantMessage) {
        console.log('handleAction called with assistantMessage:', assistantMessage.substring(0, 200));
        
        // Проверяем, нужно ли создать заметку
        if (assistantMessage.includes('CREATE_NOTE:')) {
            const match = assistantMessage.match(/CREATE_NOTE:(.+?)(?:\n|$)/);
            if (match) {
                const noteText = match[1].trim();
                console.log('Creating note:', noteText);
                await createNoteFromChat(noteText);
                return true;
            }
        }
        
        // Проверяем, нужно ли создать задачу
        if (assistantMessage.includes('CREATE_TASK:')) {
            console.log('=== CREATE_TASK COMMAND FOUND ===');
            console.log('Full message:', assistantMessage);
            
            // Ищем команду CREATE_TASK в тексте
            const commandMatch = assistantMessage.match(/CREATE_TASK:([^\n\r]+)/);
            if (!commandMatch) {
                console.error('CREATE_TASK command found but cannot extract data');
                return false;
            }
            
            const commandData = commandMatch[1];
            console.log('Command data:', commandData);
            
            // Парсим команду - разделяем по двоеточиям
            // Формат: дата:название:описание:приоритет
            // Или: дата:название::приоритет (пустое описание)
            const parts = [];
            let currentPart = '';
            let emptyDescription = false;
            
            for (let i = 0; i < commandData.length; i++) {
                if (commandData[i] === ':' && commandData[i + 1] === ':') {
                    // Два двоеточия подряд = пустое описание
                    parts.push(currentPart.trim());
                    parts.push(''); // Пустое описание
                    currentPart = '';
                    i++; // Пропускаем второе двоеточие
                    emptyDescription = true;
                } else if (commandData[i] === ':' && !emptyDescription) {
                    parts.push(currentPart.trim());
                    currentPart = '';
                } else {
                    currentPart += commandData[i];
                }
            }
            if (currentPart) {
                parts.push(currentPart.trim());
            }
            
            console.log('Parsed parts:', parts, 'Length:', parts.length);
            
            if (parts.length < 3) {
                console.error('Not enough parts in CREATE_TASK command. Expected at least 3, got:', parts.length);
                addMessage('assistant', '❌ Ошибка: неправильный формат команды CREATE_TASK', true);
                return false;
            }
            
            // Извлекаем данные
            const date = parts[0] || '';
            const title = parts[1] || '';
            let description = '';
            let priority = 1;
            
            if (parts.length === 3) {
                // Формат: дата:название:приоритет (без описания)
                priority = parseInt(parts[2]) || 1;
            } else if (parts.length === 4) {
                // Формат: дата:название:описание:приоритет
                description = parts[2] || '';
                priority = parseInt(parts[3]) || 1;
            } else {
                // Если частей больше 4, объединяем средние части как описание
                description = parts.slice(2, -1).join(':').trim();
                priority = parseInt(parts[parts.length - 1]) || 1;
            }
            
            // Валидация
            if (!date || !title) {
                console.error('Missing required fields:', { date, title });
                addMessage('assistant', '❌ Ошибка: не указаны дата или название задачи', true);
                return false;
            }
            
            if (priority < 1 || priority > 3) {
                priority = 1;
            }
            
            console.log('Final parsed data:', { date, title, description, priority });
            
            try {
                console.log('Calling createTaskFromChat...');
                await createTaskFromChat(date, title, description, priority);
                console.log('✅ Task created successfully via CREATE_TASK command');
                return true;
            } catch (error) {
                console.error('❌ ERROR creating task:', error);
                console.error('Error stack:', error.stack);
                addMessage('assistant', `❌ Ошибка при создании задачи: ${error.message}`, true);
                return false;
            }
        }
        
        return false;
    }
    
    // Парсинг даты из текста
    function parseDate(dateText) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        
        // Пытаемся распарсить дату
        const dateMatch = dateText.match(/(\d{1,2})\s*(декабря|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября)(?:\s+(\d{4}))?/i);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const month = monthNames.findIndex(m => m.toLowerCase() === dateMatch[2].toLowerCase());
            if (month !== -1) {
                // Если указан год, используем его
                let year = currentYear;
                if (dateMatch[3]) {
                    year = parseInt(dateMatch[3]);
                } else {
                    // Если год не указан, определяем его умно:
                    // Если месяц уже прошел в этом году, значит имеется в виду следующий год
                    // Если месяц еще не наступил, значит имеется в виду этот год
                    const parsedDate = new Date(currentYear, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Если дата в прошлом (уже прошла в этом году), значит имеется в виду следующий год
                    if (parsedDate < today) {
                        year = currentYear + 1;
                    }
                }
                return new Date(year, month, day);
            }
        }
        
        return null;
    }
    
    // Создание заметки из чата - УПРОЩЕННАЯ И НАДЕЖНАЯ ВЕРСИЯ
    async function createNoteFromChat(text) {
        console.log('=== createNoteFromChat START ===');
        console.log('Note text:', text);
        
        if (!text || !text.trim()) {
            console.error('Note text is empty');
            addMessage('assistant', '❌ Ошибка: текст заметки не может быть пустым', true);
            return;
        }
        
        const noteText = text.trim();
        
        try {
            // 1. Получаем существующие стикеры
            console.log('Getting existing stickers...');
            let stickersJson = localStorage.getItem('notes_stickers');
            let stickers = [];
            
            if (stickersJson) {
                try {
                    stickers = JSON.parse(stickersJson);
                    if (!Array.isArray(stickers)) {
                        console.warn('notes_stickers is not an array, resetting...');
                        stickers = [];
                    }
                } catch (parseError) {
                    console.error('Error parsing notes_stickers:', parseError);
                    stickers = [];
                }
            }
            
            console.log('Current stickers count:', stickers.length);
            
            // 2. Создаем новый стикер
            const stickerId = Date.now();
            const sticker = {
                id: stickerId,
                type: 'note', // Добавляем тип для совместимости с notes-page
                content: noteText,
                color: '#FFEB3B', // Желтый по умолчанию
                height: 200,
                locked: false,
                position: {
                    x: Math.random() * 300 + 20,
                    y: Math.random() * 400 + 100
                }
            };
            
            console.log('Created sticker object:', sticker);
            
            // 3. Добавляем стикер в массив
            stickers.push(sticker);
            console.log('Stickers array after push:', stickers.length);
            
            // 4. Сохраняем в localStorage И в текущий workspace
            console.log('Saving to localStorage and workspace...');
            try {
                // Сохраняем в localStorage для обратной совместимости
                localStorage.setItem('notes_stickers', JSON.stringify(stickers));
                console.log('Saved to localStorage');
                
                // Также сохраняем в текущий workspace (важно для отображения на странице notes)
                try {
                    const workspacesJson = localStorage.getItem('workspaces');
                    if (workspacesJson) {
                        const workspaces = JSON.parse(workspacesJson);
                        const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
                        const workspace = currentWorkspaceId 
                            ? workspaces.find(w => w.id === currentWorkspaceId)
                            : workspaces.find(w => w.isPersonal) || workspaces[0];
                        
                        if (workspace) {
                            workspace.stickers = stickers;
                            localStorage.setItem('workspaces', JSON.stringify(workspaces));
                            console.log('✅ Saved to workspace:', workspace.name || workspace.id);
                        } else {
                            console.warn('Workspace not found, but continuing...');
                        }
                    } else {
                        console.warn('No workspaces found, but continuing...');
                    }
                } catch (workspaceError) {
                    console.error('Error saving to workspace (non-critical):', workspaceError);
                    // Не прерываем выполнение, так как основное сохранение в localStorage уже выполнено
                }
            } catch (saveError) {
                console.error('Error saving to localStorage:', saveError);
                throw new Error('Не удалось сохранить заметку в localStorage');
            }
            
            // 5. ПРОВЕРКА СОХРАНЕНИЯ - ДВОЙНАЯ ПРОВЕРКА
            console.log('Verifying note was saved...');
            let verifyJson = localStorage.getItem('notes_stickers');
            if (!verifyJson) {
                console.error('localStorage notes_stickers is empty after save!');
                // Попытка сохранить еще раз
                try {
                    localStorage.setItem('notes_stickers', JSON.stringify(stickers));
                    verifyJson = localStorage.getItem('notes_stickers');
                } catch (retryError) {
                    console.error('Retry save also failed:', retryError);
                }
            }
            
            if (!verifyJson) {
                throw new Error('Критическая ошибка: невозможно сохранить в localStorage');
            }
            
            let verifyStickers = [];
            try {
                verifyStickers = JSON.parse(verifyJson);
            } catch (parseError) {
                console.error('Error parsing verifyJson:', parseError);
                throw new Error('Ошибка при проверке сохранения заметки');
            }
            
            console.log('Verification: total stickers in storage:', verifyStickers.length);
            
            const verifySticker = verifyStickers.find(s => s.id === stickerId);
            if (!verifySticker) {
                console.error('Note not found in storage! Trying to save one more time...');
                // Последняя попытка
                verifyStickers.push(sticker);
                localStorage.setItem('notes_stickers', JSON.stringify(verifyStickers));
                
                // Также обновляем workspace при повторной попытке
                try {
                    const workspacesJson = localStorage.getItem('workspaces');
                    if (workspacesJson) {
                        const workspaces = JSON.parse(workspacesJson);
                        const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
                        const workspace = currentWorkspaceId 
                            ? workspaces.find(w => w.id === currentWorkspaceId)
                            : workspaces.find(w => w.isPersonal) || workspaces[0];
                        if (workspace) {
                            workspace.stickers = verifyStickers;
                            localStorage.setItem('workspaces', JSON.stringify(workspaces));
                            console.log('✅ Updated workspace on retry');
                        }
                    }
                } catch (wsError) {
                    console.error('Error updating workspace on retry:', wsError);
                }
                
                // Финальная проверка
                const finalCheck = JSON.parse(localStorage.getItem('notes_stickers') || '[]');
                const finalFound = finalCheck.find(s => s.id === stickerId);
                if (!finalFound) {
                    console.error('CRITICAL: Note still not saved after second attempt!');
                    console.error('Created sticker:', sticker);
                    console.error('All stickers:', finalCheck);
                    throw new Error('Критическая ошибка: заметка не может быть сохранена в localStorage');
                }
                console.log('✅ Note saved on second attempt:', finalFound);
            } else {
                console.log('✅ Note verified in storage:', verifySticker);
            }
            
            // 6. ОТОБРАЖЕНИЕ СООБЩЕНИЯ
            addMessage('assistant', `✅ Заметка создана: "${noteText}"`, true);
            
            // 7. ОБНОВЛЕНИЕ UI (если мы на странице заметок)
            if (window.location.pathname.includes('notes.html')) {
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            }
            
            console.log('=== createNoteFromChat SUCCESS ===');
            
        } catch (error) {
            console.error('=== createNoteFromChat ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Note text was:', noteText);
            
            addMessage('assistant', `❌ Ошибка при создании заметки: ${error.message}`, true);
        }
    }
    
    // Создание задачи из чата - УПРОЩЕННАЯ И НАДЕЖНАЯ ВЕРСИЯ
    async function createTaskFromChat(dateText, title, description, priority) {
        console.log('=== createTaskFromChat START ===');
        console.log('Input:', { dateText, title, description, priority });
        
        try {
            // 1. Очистка названия
            let cleanTitle = (title || '').trim();
            if (!cleanTitle) {
                throw new Error('Название задачи не может быть пустым');
            }
            
            // Убираем даты из названия
            cleanTitle = cleanTitle.replace(/^на\s+\d{1,2}\s+[а-яё]+\s*[:\-]\s*/i, '').trim();
            cleanTitle = cleanTitle.replace(/\b(на\s+)?(завтра|сегодня|послезавтра|вчера|позавчера)\b/gi, '').trim();
            cleanTitle = cleanTitle.replace(/\bна\s+\d{1,2}\s+(декабря|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября)\b/gi, '').trim();
            
            // Убираем двоеточие и текст после него
            const colonIndex = cleanTitle.indexOf(':');
            if (colonIndex > 0) {
                cleanTitle = cleanTitle.substring(0, colonIndex).trim();
            }
            
            console.log('Cleaned title:', cleanTitle);
            
            // 2. Парсинг даты
            if (!dateText || !dateText.trim()) {
                throw new Error('Дата не указана');
            }
            
            let date = null;
            
            // Сначала пробуем относительную дату
            const relativeDate = parseRelativeDate(dateText.trim());
            if (relativeDate) {
                date = relativeDate;
                console.log('Parsed as relative date:', date);
            } else {
                // Пробуем конкретную дату
                date = parseDate(dateText.trim());
                if (date) {
                    console.log('Parsed as specific date:', date);
                }
            }
            
            if (!date || isNaN(date.getTime())) {
                throw new Error(`Не удалось распознать дату: "${dateText}"`);
            }
            
            // 3. Форматирование даты
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            console.log('Formatted date:', formattedDate);
            
            // 4. Проверка даты (не в прошлом)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDate = new Date(year, month - 1, day);
            taskDate.setHours(0, 0, 0, 0);
            
            if (taskDate < today) {
                throw new Error(`Нельзя создавать задачи в прошлом. Указанная дата: ${taskDate.toLocaleDateString('ru-RU')}, сегодня: ${today.toLocaleDateString('ru-RU')}`);
            }
            
            // 5. Очистка описания
            let cleanDescription = (description || '').trim();
            const negativePatterns = [
                /^нет\s*$/i,
                /^нет\s+не\s+будет/i,
                /^не\s+будет/i,
                /^без\s+описания/i,
                /^описания\s+не\s+будет/i,
                /^не\s+нужно/i,
                /^не\s+требуется/i
            ];
            
            if (cleanDescription && negativePatterns.some(p => p.test(cleanDescription))) {
                cleanDescription = '';
            }
            
            // 6. Валидация приоритета
            const finalPriority = Math.max(1, Math.min(3, parseInt(priority) || 1));
            
            // 7. Подготовка данных задачи
            const taskData = {
                title: cleanTitle,
                description: cleanDescription,
                priority: finalPriority,
                due_date: formattedDate,
                completed: false
            };
            
            console.log('Task data to save:', taskData);
            
            // 8. СОЗДАНИЕ ЗАДАЧИ - КРИТИЧЕСКИЙ МОМЕНТ
            console.log('Calling createTask module function...');
            let newTask;
            try {
                newTask = await createTask(taskData);
                console.log('createTask returned:', newTask);
            } catch (error) {
                console.error('createTask module failed, trying direct localStorage save:', error);
                // Если модуль не работает, сохраняем напрямую
                const tasksJson = localStorage.getItem('tasks');
                const tasks = tasksJson ? JSON.parse(tasksJson) : [];
                const taskId = Date.now();
                newTask = {
                    id: taskId,
                    ...taskData,
                    created_at: new Date().toISOString(),
                };
                tasks.push(newTask);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                console.log('Task saved directly to localStorage:', newTask);
            }
            
            if (!newTask || !newTask.id) {
                throw new Error('Не удалось создать задачу с ID');
            }
            
            // 9. ПРОВЕРКА СОХРАНЕНИЯ - ДВОЙНАЯ ПРОВЕРКА
            console.log('Verifying task was saved...');
            let savedTasksJson = localStorage.getItem('tasks');
            if (!savedTasksJson) {
                // Пытаемся сохранить еще раз
                console.warn('localStorage tasks is empty, trying to save again...');
                const tasks = [newTask];
                localStorage.setItem('tasks', JSON.stringify(tasks));
                savedTasksJson = localStorage.getItem('tasks');
            }
            
            if (!savedTasksJson) {
                throw new Error('НЕВОЗМОЖНО сохранить в localStorage! Проверьте настройки браузера.');
            }
            
            const savedTasks = JSON.parse(savedTasksJson);
            console.log('Total tasks in storage:', savedTasks.length);
            console.log('All tasks:', savedTasks);
            
            const foundTask = savedTasks.find(t => t.id === newTask.id);
            if (!foundTask) {
                console.error('Task not found in storage! Trying to save one more time...');
                // Последняя попытка - добавляем задачу вручную
                savedTasks.push(newTask);
                localStorage.setItem('tasks', JSON.stringify(savedTasks));
                
                // Проверяем еще раз
                const finalCheck = JSON.parse(localStorage.getItem('tasks') || '[]');
                const finalFound = finalCheck.find(t => t.id === newTask.id);
                if (!finalFound) {
                    console.error('CRITICAL: Task still not saved after manual attempt!');
                    console.error('Created task:', newTask);
                    console.error('All tasks:', finalCheck);
                    throw new Error('Критическая ошибка: задача не может быть сохранена в localStorage');
                }
                console.log('✅ Task saved on second attempt:', finalFound);
            } else {
                console.log('✅ Task verified in storage:', foundTask);
            }
            
            // 10. ОТОБРАЖЕНИЕ СООБЩЕНИЯ
            const displayDate = new Date(year, month - 1, day);
            const dateStr = displayDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const descriptionText = cleanDescription ? `\n📝 Описание: ${cleanDescription}` : '';
            addMessage('assistant', `✅ Задача создана на ${dateStr}: "${cleanTitle}"${descriptionText}\n🎯 Приоритет: ${finalPriority}`, true);
            
            // 11. ОБНОВЛЕНИЕ UI
            if (window.greetingPanel && typeof window.greetingPanel.updateStats === 'function') {
                window.greetingPanel.updateStats();
            }
            
            // Обновляем страницу задач если мы на ней
            if (window.location.pathname.includes('tasks.html')) {
                setTimeout(() => {
                    if (typeof window.loadTasksForDate === 'function') {
                        const [y, m, d] = formattedDate.split('-').map(Number);
                        window.loadTasksForDate(new Date(y, m - 1, d));
                    } else {
                        window.location.reload();
                    }
                }, 300);
            }
            
            console.log('=== createTaskFromChat SUCCESS ===');
            return newTask;
            
        } catch (error) {
            console.error('=== createTaskFromChat ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Input was:', { dateText, title, description, priority });
            
            addMessage('assistant', `❌ Ошибка при создании задачи: ${error.message}`, true);
            throw error; // Пробрасываем ошибку дальше
        }
    }
    
    // Сохранение сообщения в историю
    function saveChatMessage(role, text) {
        try {
            if (!text || typeof text !== 'string') {
                console.warn('saveChatMessage: invalid text parameter:', text);
                return;
            }
            
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            const message = { role, text, timestamp: Date.now() };
            
            // Добавляем новое сообщение
            history.push(message);
            
            // Храним только последние 100 сообщений - удаляем старые безвозвратно
            const MAX_MESSAGES = 100;
            if (history.length > MAX_MESSAGES) {
                // Удаляем самые старые сообщения (первые в массиве)
                const messagesToRemove = history.length - MAX_MESSAGES;
                history.splice(0, messagesToRemove);
                console.log(`Removed ${messagesToRemove} old messages, keeping only last ${MAX_MESSAGES} messages`);
            }
            
            localStorage.setItem('chat_history', JSON.stringify(history));
            console.log(`Chat message saved: ${role} (${text.substring(0, 50)}...), total messages: ${history.length}`);
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    }
    
    // Загрузка истории чата
    function loadChatHistory() {
        console.log('loadChatHistory called');
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.warn('chat-messages element not found in loadChatHistory');
            return;
        }
        
        // Очищаем контейнер перед загрузкой истории
        chatMessages.innerHTML = '';
        
        try {
            const historyStr = localStorage.getItem('chat_history');
            console.log('Raw history from localStorage:', historyStr ? historyStr.substring(0, 100) + '...' : 'null');
            
            if (!historyStr) {
                console.log('No chat history found in localStorage');
                showEmptyState();
                return;
            }
            
            const history = JSON.parse(historyStr);
            console.log('Parsed chat history:', history.length, 'messages');
            console.log('History structure:', history.length > 0 ? Object.keys(history[0]) : 'empty');
            
            if (!Array.isArray(history)) {
                console.error('Chat history is not an array:', typeof history);
                return;
            }
            
            // Ограничиваем историю до 100 последних сообщений при загрузке
            const MAX_MESSAGES = 100;
            if (history.length > MAX_MESSAGES) {
                const messagesToRemove = history.length - MAX_MESSAGES;
                history.splice(0, messagesToRemove);
                // Сохраняем обрезанную историю обратно в localStorage
                localStorage.setItem('chat_history', JSON.stringify(history));
                console.log(`Trimmed chat history: removed ${messagesToRemove} old messages, keeping last ${MAX_MESSAGES} messages`);
            }
            
            if (history.length === 0) {
                console.log('No chat history found (empty array)');
                showEmptyState();
                return;
            }
            
            let loadedCount = 0;
            history.forEach((msg, index) => {
                // Проверяем структуру сообщения
                if (!msg || typeof msg !== 'object') {
                    console.warn(`Invalid message at index ${index}:`, msg);
                    return;
                }
                
                // Поддерживаем оба формата: msg.text и msg.content
                const messageText = msg.text || msg.content || '';
                if (!messageText) {
                    console.warn(`Message at index ${index} has no text/content:`, msg);
                    return;
                }
                
                const role = msg.role || 'user';
                console.log(`Loading message ${index + 1}:`, role, messageText.substring(0, 50));
                
                // Добавляем сообщение напрямую, без сохранения в историю (чтобы избежать дублирования)
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${role}`;
                
                const avatar = document.createElement('div');
                avatar.className = 'chat-message-avatar';
                // Проверяем наличие аватара пользователя
                const userAvatar = localStorage.getItem('user_avatar');
                if (role === 'user' && userAvatar) {
                    avatar.style.background = 'transparent';
                    avatar.style.padding = '0';
                    const avatarImg = document.createElement('img');
                    avatarImg.src = userAvatar;
                    avatarImg.style.width = '100%';
                    avatarImg.style.height = '100%';
                    avatarImg.style.borderRadius = '50%';
                    avatarImg.style.objectFit = 'cover';
                    avatar.appendChild(avatarImg);
                } else {
                    avatar.textContent = role === 'user' ? 'Я' : 'AI';
                }
                
                const content = document.createElement('div');
                content.className = 'chat-message-content';
                content.textContent = messageText;
                
                messageDiv.appendChild(avatar);
                messageDiv.appendChild(content);
                
                chatMessages.appendChild(messageDiv);
                loadedCount++;
            });
            
            // Скрываем пустое состояние, если сообщения загружены
            if (loadedCount > 0) {
                hideEmptyState();
            }
            
            console.log(`Chat history loaded successfully: ${loadedCount} messages`);
            
            // Прокручиваем вниз после загрузки
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        } catch (error) {
            console.error('Error loading chat history:', error);
            console.error('Error stack:', error.stack);
            // Пробуем очистить поврежденные данные
            try {
                const corrupted = localStorage.getItem('chat_history');
                console.warn('Attempting to clear corrupted chat history');
                localStorage.removeItem('chat_history');
            } catch (clearError) {
                console.error('Failed to clear corrupted chat history:', clearError);
            }
        }
    }
    
    // Очистка истории чата
    function clearChatHistory() {
        localStorage.removeItem('chat_history');
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            showEmptyState();
        }
        console.log('История чата очищена');
    }
    
    // Экспортируем функцию для доступа из консоли
    window.clearChatHistory = clearChatHistory;
    
    // Показ пустого состояния
    function showEmptyState() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Проверяем, есть ли уже сообщения
        const existingMessages = chatMessages.querySelectorAll('.chat-message');
        if (existingMessages.length > 0) {
            return; // Если есть сообщения, не показываем пустое состояние
        }
        
        // Проверяем, не показано ли уже пустое состояние
        if (chatMessages.querySelector('.chat-empty-state')) {
            return;
        }
        
        // Создаем элемент пустого состояния
        const emptyState = document.createElement('div');
        emptyState.className = 'chat-empty-state';
        emptyState.innerHTML = `
            <div class="chat-empty-content">
                <h2 class="chat-empty-title" data-i18n="chat.empty.title">Добро пожаловать в Чат</h2>
                <p class="chat-empty-description" data-i18n="chat.empty.description">Здесь вы можете:</p>
                <ul class="chat-empty-features">
                    <li data-i18n="chat.empty.feature1">Создать задачу или заметку</li>
                    <li data-i18n="chat.empty.feature2">Получить помощь с планированием</li>
                    <li data-i18n="chat.empty.feature3">Задать вопросы и получить ответы</li>
                </ul>
            </div>
        `;
        
        chatMessages.appendChild(emptyState);
        
        // Применяем переводы, если i18n доступен (с небольшой задержкой на случай, если модуль еще загружается)
        setTimeout(() => {
            if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
                try {
                    window.i18n.applyTranslations();
                } catch (error) {
                    console.warn('Error applying translations to empty state:', error);
                }
            }
        }, 100);
    }
    
    // Скрытие пустого состояния
    function hideEmptyState() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const emptyState = chatMessages.querySelector('.chat-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }
}

// Функция для настройки AI меню
function setupAiMenu() {
    const gptMenuBtn = document.getElementById('gpt-menu-btn');
    const aiMenuOverlay = document.getElementById('ai-menu-overlay');
    const aiChatOption = document.getElementById('ai-chat-option');
    const aiPlanOption = document.getElementById('ai-plan-option');
    
    if (gptMenuBtn && aiMenuOverlay) {
        // Открытие меню
        gptMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            aiMenuOverlay.classList.add('active');
        });
        
        // Закрытие при клике на overlay
        aiMenuOverlay.addEventListener('click', (e) => {
            if (e.target === aiMenuOverlay) {
                aiMenuOverlay.classList.remove('active');
            }
        });
        
        // Переход в чат
        if (aiChatOption) {
            aiChatOption.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                aiMenuOverlay.classList.remove('active');
                setTimeout(() => {
                    window.location.href = '/public/chat.html';
                }, 150);
            });
        }
        
        // Переход в создание плана
        if (aiPlanOption) {
            aiPlanOption.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                aiMenuOverlay.classList.remove('active');
                setTimeout(() => {
                    window.location.href = '/public/gpt-plan.html';
                }, 150);
            });
        }
    }
}

function setupSidebar() {
    const burgerMenu = document.getElementById('burger-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Дублируем элементы бегущей строки для бесшовной анимации
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        const spans = marqueeContent.querySelectorAll('span');
        if (spans.length > 0) {
            // Клонируем все элементы и добавляем их в конец
            spans.forEach(span => {
                const clone = span.cloneNode(true);
                marqueeContent.appendChild(clone);
            });
        }
        // Принудительно устанавливаем скорость анимации 60 секунд
        marqueeContent.style.animation = 'marquee 60s linear infinite';
        marqueeContent.style.animationDuration = '60s';
        marqueeContent.style.webkitAnimation = 'marquee 60s linear infinite';
        marqueeContent.style.webkitAnimationDuration = '60s';
    }
    
    console.log('setupSidebar called', {
        burgerMenu: !!burgerMenu,
        sidebarOverlay: !!sidebarOverlay
    });
    
    if (burgerMenu && sidebarOverlay) {
        // Время последнего открытия для предотвращения немедленного закрытия
        let lastOpenTime = 0;
        
        burgerMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Проверяем текущее состояние
            const wasActive = sidebarOverlay.classList.contains('active');
            const isActive = !wasActive;
            
            console.log('Burger clicked, wasActive:', wasActive, 'isActive:', isActive);
            
            if (isActive) {
                // Открываем сайдбар
                lastOpenTime = Date.now();
                sidebarOverlay.classList.add('active');
                burgerMenu.classList.add('active');
                document.body.classList.add('sidebar-open');
                
                // Явно устанавливаем стили с !important через setProperty
                sidebarOverlay.style.setProperty('pointer-events', 'auto', 'important');
                sidebarOverlay.style.setProperty('opacity', '1', 'important');
                sidebarOverlay.style.setProperty('visibility', 'visible', 'important');
                sidebarOverlay.style.setProperty('z-index', '3000', 'important');
                sidebarOverlay.style.setProperty('background', 'rgba(255, 255, 255, 1)', 'important');
                
                // Принудительно устанавливаем скорость анимации бегущей строки на 60 секунд
                setTimeout(() => {
                    const marqueeContent = sidebarOverlay.querySelector('.marquee-content');
                    if (marqueeContent) {
                        // Сбрасываем анимацию
                        marqueeContent.style.animation = 'none';
                        marqueeContent.offsetHeight; // Принудительный reflow
                        // Устанавливаем новую анимацию marquee-chat с нужной скоростью
                        marqueeContent.style.setProperty('animation', 'marquee-chat 180s linear infinite', 'important');
                        marqueeContent.style.setProperty('animation-name', 'marquee-chat', 'important');
                        marqueeContent.style.setProperty('animation-duration', '180s', 'important');
                        marqueeContent.style.setProperty('animation-timing-function', 'linear', 'important');
                        marqueeContent.style.setProperty('animation-iteration-count', 'infinite', 'important');
                        marqueeContent.style.setProperty('-webkit-animation', 'marquee-chat 180s linear infinite', 'important');
                        marqueeContent.style.setProperty('-webkit-animation-name', 'marquee-chat', 'important');
                        marqueeContent.style.setProperty('-webkit-animation-duration', '180s', 'important');
                        marqueeContent.style.setProperty('-webkit-animation-timing-function', 'linear', 'important');
                        marqueeContent.style.setProperty('-webkit-animation-iteration-count', 'infinite', 'important');
                        marqueeContent.style.setProperty('-moz-animation', 'marquee-chat 180s linear infinite', 'important');
                        marqueeContent.style.setProperty('-moz-animation-name', 'marquee-chat', 'important');
                        marqueeContent.style.setProperty('-moz-animation-duration', '180s', 'important');
                        marqueeContent.style.setProperty('-moz-animation-timing-function', 'linear', 'important');
                        marqueeContent.style.setProperty('-moz-animation-iteration-count', 'infinite', 'important');
                        console.log('Marquee animation set to marquee-chat 180s', marqueeContent.style.animation);
                    }
                }, 50);
                
                console.log('Sidebar opened at', lastOpenTime);
            } else {
                // Закрываем сайдбар
                sidebarOverlay.classList.remove('active');
                burgerMenu.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                
                // Явно устанавливаем стили для скрытия
                sidebarOverlay.style.setProperty('pointer-events', 'none', 'important');
                sidebarOverlay.style.setProperty('opacity', '0', 'important');
                sidebarOverlay.style.setProperty('visibility', 'hidden', 'important');
                
                console.log('Sidebar closed');
            }
        });
        
        // Обработчик закрытия при клике на overlay (но не на элементы внутри)
        sidebarOverlay.addEventListener('click', (e) => {
            // Игнорируем клики в течение 300ms после открытия (чтобы избежать немедленного закрытия)
            if (Date.now() - lastOpenTime < 300) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Закрываем только если кликнули именно на overlay, а не на его дочерние элементы
            if (e.target === sidebarOverlay || e.target.classList.contains('sidebar-content')) {
                // Проверяем, что клик не на ссылку или кнопку
                if (!e.target.closest('.sidebar-item')) {
                    e.preventDefault();
                    e.stopPropagation();
                    sidebarOverlay.classList.remove('active');
                    burgerMenu.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
                    sidebarOverlay.style.setProperty('pointer-events', 'none', 'important');
                    sidebarOverlay.style.setProperty('opacity', '0', 'important');
                    sidebarOverlay.style.setProperty('visibility', 'hidden', 'important');
                }
            }
        });
        
        // Обработка действий сайдбара (только для кнопок без ссылок)
        const sidebarButtons = sidebarOverlay.querySelectorAll('button.sidebar-item[data-action]');
        sidebarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                
                // Закрываем сайдбар
                sidebarOverlay.classList.remove('active');
                burgerMenu.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                sidebarOverlay.style.setProperty('pointer-events', 'none', 'important');
                sidebarOverlay.style.setProperty('opacity', '0', 'important');
                sidebarOverlay.style.setProperty('visibility', 'hidden', 'important');
                
                // Обрабатываем только действия без навигации
                if (action === 'info' || action === 'support' || action === 'suggest') {
                    handleSidebarAction(action);
                }
            });
        });
        
        // Обработка плашки подписки
        const subscriptionBanner = sidebarOverlay.querySelector('.sidebar-subscription-banner');
        if (subscriptionBanner) {
            subscriptionBanner.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Закрываем сайдбар
                sidebarOverlay.classList.remove('active');
                burgerMenu.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                sidebarOverlay.style.setProperty('pointer-events', 'none', 'important');
                sidebarOverlay.style.setProperty('opacity', '0', 'important');
                sidebarOverlay.style.setProperty('visibility', 'hidden', 'important');
                
                // Переходим на страницу подписок
                window.location.href = '/public/subscription.html';
            });
        }
        
        // Для ссылок - просто закрываем сайдбар, но не блокируем переход
        const sidebarLinks = sidebarOverlay.querySelectorAll('a.sidebar-item');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // НЕ вызываем preventDefault - позволяем переходу произойти
                // Просто закрываем сайдбар
                sidebarOverlay.classList.remove('active');
                burgerMenu.classList.remove('active');
                document.body.classList.remove('sidebar-open');
            }, { passive: true }); // passive: true означает, что мы не блокируем событие
        });
    } else {
        console.warn('Burger menu or sidebar overlay not found!', {
            burgerMenu: !!burgerMenu,
            sidebarOverlay: !!sidebarOverlay
        });
    }
}

function handleSidebarAction(action) {
    // Обрабатываем только действия без навигации (info, support, suggest)
    switch (action) {
        case 'info':
            window.location.href = '/public/info.html';
            break;
        case 'support':
            console.log('Поддержка');
            // Здесь можно добавить открытие поддержки
            break;
        case 'suggest':
            console.log('Предложить идею');
            // Здесь можно добавить форму предложения идеи
            break;
    }
}

