// Quick Add+ (Spotlight-like) overlay
export function initQuickAdd() {
    // Guard: avoid double init
    if (window.__quickAddInitialized) return;
    window.__quickAddInitialized = true;

    const overlay = createOverlay();
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#quick-add-input');
    const closeBtn = overlay.querySelector('#quick-add-close');
    const closeOverlay = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        input.value = '';
    };
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOverlay);
    }

    const openOverlay = () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Обновляем историю при открытии
        updateQuickAddHistory(overlay, input);
        setTimeout(() => input?.focus(), 10);
    };

    // Bind search buttons globally
    const bindSearchButtons = () => {
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openOverlay();
            });
        });
    };

    bindSearchButtons();

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
        }
    });

    // Close on outside click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });

    // Обработка кликов на pills (примеры)
    const pills = overlay.querySelectorAll('.quick-add-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const template = pill.dataset.template;
            if (template) {
                input.value = template;
                input.focus();
            }
        });
    });

    // Загрузка и отображение истории запросов
    updateQuickAddHistory(overlay, input);

    // Обработка кнопки подтвердить
    const confirmBtn = overlay.querySelector('#quick-add-confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const query = input.value.trim();
            if (query) {
                // Сохраняем запрос в историю
                saveQuickAddQuery(query);
                
                // Обрабатываем команды
                const lowerQuery = query.toLowerCase();
                
                if (lowerQuery.startsWith('task:')) {
                    // Обработка команды task:
                    await handleTaskCommand(query, overlay, closeOverlay);
                } else if (lowerQuery.startsWith('search:')) {
                    // Обработка команды search:
                    await handleSearchCommand(query, overlay, closeOverlay);
                } else if (lowerQuery.startsWith('plan:')) {
                    // Обработка команды plan:
                    handlePlanCommand(query, closeOverlay);
                } else {
                    // Обычный запрос - отправляем в чат или просто закрываем
                    closeOverlay();
                    
                    if (typeof window.sendMessage === 'function') {
                        const chatInput = document.getElementById('chat-input');
                        if (chatInput) {
                            chatInput.value = query;
                            setTimeout(() => {
                                window.sendMessage();
                            }, 100);
                        } else {
                            window.sendMessage();
                        }
                    }
                }
            } else {
                // Если поле пустое, просто закрываем
                closeOverlay();
            }
        });
    }
}

// Функция для обновления истории в quick-add
function updateQuickAddHistory(overlay, input) {
    const suggestionsContainer = overlay.querySelector('#quick-add-suggestions');
    if (!suggestionsContainer) return;

    // Получаем историю запросов из localStorage
    const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    // Очищаем контейнер
    suggestionsContainer.innerHTML = '';
    
    // Показываем только последние 2 запроса
    const recentHistory = searchHistory.slice(-2).reverse();
    
    if (recentHistory.length === 0) {
        // Если истории нет, скрываем контейнер
        suggestionsContainer.style.display = 'none';
    } else {
        // Показываем контейнер
        suggestionsContainer.style.display = 'flex';
        
        // Добавляем элементы истории
        recentHistory.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'quick-add-suggestion';
            suggestionItem.dataset.command = item.query || item.displayText;
            
            // Используем displayText если есть, иначе генерируем его
            let displayText = item.displayText;
            if (!displayText && item.query) {
                // Генерируем displayText для старых записей
                const itemType = item.type || 'search';
                displayText = generateQuickAddDisplayText(item.query, itemType);
            } else if (!displayText) {
                displayText = item.query || 'Запрос';
            }
            
            // Формат: "запрос." справа в блоке с типом
            const queryText = item.query || item.displayText || '';
            const typeLabel = item.type || 'search';
            
            suggestionItem.innerHTML = `
                <div style="flex: 1;">
                    <div class="quick-add-suggestion-title">${queryText}.</div>
                </div>
                <span class="quick-add-suggestion-chip">${typeLabel}</span>
            `;
            
            // Обработчик клика
            suggestionItem.addEventListener('click', () => {
                input.value = item.query || item.displayText || '';
                input.focus();
            });
            
            suggestionsContainer.appendChild(suggestionItem);
        });
    }
}

// Функция для генерации отображаемого текста (используем ту же логику, что и в chat-page.js)
function generateQuickAddDisplayText(query, type) {
    const lowerQuery = query.toLowerCase();
    
    if (type === 'tasks') {
        let displayText = 'Создать задачу';
        const parts = [];
        
        if (lowerQuery.startsWith('task:')) {
            const dueMatch = query.match(/due:\s*([^#]+)/i) || query.match(/date:\s*([^#]+)/i);
            const tagMatch = query.match(/#(\w+)/);
            
            if (dueMatch) {
                const dueDate = dueMatch[1].trim();
                const timeMatch = dueDate.match(/(\d{1,2}:\d{2})/);
                const time = timeMatch ? timeMatch[1] : null;
                let dateOnly = dueDate.replace(/\d{1,2}:\d{2}/, '').trim();
                
                if (dateOnly.includes('завтра') || dateOnly.includes('tomorrow')) {
                    parts.push(time ? `завтра, ${time}` : 'завтра');
                } else if (dateOnly.includes('сегодня') || dateOnly.includes('today')) {
                    parts.push(time ? `сегодня, ${time}` : 'сегодня');
                } else if (dateOnly.includes('послезавтра')) {
                    parts.push(time ? `послезавтра, ${time}` : 'послезавтра');
                } else if (time) {
                    parts.push(`${dateOnly}, ${time}`);
                }
            }
            
            if (tagMatch) {
                parts.push(`#${tagMatch[1]}`);
            }
        } else {
            const timeMatch = query.match(/(?:в\s+)?(\d{1,2}:\d{2})/);
            const time = timeMatch ? timeMatch[1] : null;
            
            let datePart = '';
            if (lowerQuery.includes('завтра') || lowerQuery.includes('tomorrow')) {
                datePart = time ? `завтра, ${time}` : 'завтра';
            } else if (lowerQuery.includes('сегодня') || lowerQuery.includes('today')) {
                datePart = time ? `сегодня, ${time}` : 'сегодня';
            } else if (lowerQuery.includes('послезавтра')) {
                datePart = time ? `послезавтра, ${time}` : 'послезавтра';
            } else if (time) {
                datePart = time;
            }
            
            if (datePart) {
                parts.push(datePart);
            }
            
            const tagMatch = query.match(/#(\w+)/);
            if (tagMatch) {
                parts.push(`#${tagMatch[1]}`);
            }
        }
        
        if (parts.length > 0) {
            displayText += ' • ' + parts.join(' • ');
        }
        
        return displayText;
    } else if (type === 'plan') {
        let planDate = '';
        
        if (lowerQuery.startsWith('plan:')) {
            const planMatch = query.match(/plan:\s*(.+)/i);
            if (planMatch) {
                planDate = planMatch[1].trim();
            }
        } else {
            const dayNames = {
                'понедельник': 'понедельник', 'вторник': 'вторник', 'среда': 'среду',
                'четверг': 'четверг', 'пятница': 'пятницу', 'суббота': 'субботу',
                'воскресенье': 'воскресенье', 'monday': 'понедельник', 'tuesday': 'вторник',
                'wednesday': 'среду', 'thursday': 'четверг', 'friday': 'пятницу',
                'saturday': 'субботу', 'sunday': 'воскресенье'
            };
            
            for (const [key, value] of Object.entries(dayNames)) {
                if (lowerQuery.includes(key)) {
                    planDate = value;
                    break;
                }
            }
        }
        
        if (planDate) {
            return `Открыть календарь на ${planDate}`;
        }
        return 'Открыть календарь';
    } else {
        return 'Поиск по задачам и заметкам';
    }
}

// Функция для сохранения запроса (используем ту же логику, что и в chat-page.js)
function saveQuickAddQuery(query) {
    const lowerQuery = query.toLowerCase();
    let queryType = 'search';
    
    if (lowerQuery.startsWith('task:')) {
        queryType = 'tasks';
    } else if (lowerQuery.startsWith('search:')) {
        queryType = 'search';
    } else if (lowerQuery.startsWith('plan:')) {
        queryType = 'plan';
    } else if (lowerQuery.includes('задач') || lowerQuery.includes('task')) {
        if (lowerQuery.includes('покажи') || lowerQuery.includes('найди') || 
            lowerQuery.includes('где') || lowerQuery.includes('поиск')) {
            queryType = 'search';
        } else {
            queryType = 'tasks';
        }
    } else if (lowerQuery.includes('план') || lowerQuery.includes('plan') ||
               lowerQuery.includes('календарь') || lowerQuery.includes('calendar')) {
        queryType = 'plan';
    }
    
    const displayText = generateQuickAddDisplayText(query, queryType);
    const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    
    searchHistory.push({
        query: query,
        displayText: displayText,
        type: queryType,
        timestamp: Date.now()
    });
    
    const limitedHistory = searchHistory.slice(-10);
    localStorage.setItem('search_history', JSON.stringify(limitedHistory));
}

// Обработка команды task:
async function handleTaskCommand(query, overlay, closeOverlay) {
    try {
        // Парсим команду: task: название date: дата #тег
        // Поддерживаем формат без пробелов: task:купить лето date: 2 января #leto
        
        // Сначала извлекаем все хештеги
        const tagMatches = query.match(/#(\w+)/g); // Находим все хештеги
        
        // Убираем хештеги из запроса для парсинга остальных частей
        let queryWithoutTags = query;
        if (tagMatches) {
            tagMatches.forEach(tag => {
                queryWithoutTags = queryWithoutTags.replace(tag, '').trim();
            });
        }
        
        // Извлекаем дату (date: или due:)
        const dateMatch = queryWithoutTags.match(/(?:date:|due:)\s*([^#]+?)(?:\s*$)/i);
        const dateText = dateMatch ? dateMatch[1].trim() : '';
        
        // Извлекаем название задачи (всё между task: и date:/due:)
        // Поддерживаем формат с пробелом и без: task: название или task:название
        const taskMatch = queryWithoutTags.match(/task:\s*(.+?)(?:\s+date:|\s+due:|date:|due:|$)/i);
        let title = taskMatch ? taskMatch[1].trim() : '';
        
        // Если не нашли через регулярку, пробуем другой способ
        if (!title && queryWithoutTags.includes('task:')) {
            const parts = queryWithoutTags.split(/(?:date:|due:)/i);
            if (parts.length > 0) {
                title = parts[0].replace(/^task:\s*/i, '').trim();
            }
        }
        
        if (!title) {
            alert('Укажите название задачи после task:');
            return;
        }
        
        if (!dateText) {
            alert('Укажите дату после date:');
            return;
        }
        
        // Парсим дату
        let date = parseDate(dateText);
        if (!date) {
            date = parseRelativeDate(dateText);
        }
        
        if (!date || isNaN(date.getTime())) {
            alert(`Не удалось распознать дату: "${dateText}"`);
            return;
        }
        
        // Форматируем дату
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Извлекаем хештеги
        const tags = [];
        if (tagMatches) {
            tagMatches.forEach(tag => {
                // Убираем # и добавляем в массив
                const tagName = tag.replace('#', '').trim();
                if (tagName) {
                    tags.push(tagName);
                }
            });
        }
        
        // Создаем задачу
        const { createTask } = await import('../modules/tasks.js');
        const taskData = {
            title: title,
            description: '',
            priority: 1,
            due_date: formattedDate,
            completed: false
        };
        
        // Добавляем хештеги, если они есть
        if (tags.length > 0) {
            taskData.tags = tags;
        }
        
        await createTask(taskData);
        
        // Закрываем модальное окно
        closeOverlay();
        
        // Переходим на страницу задач
        window.location.href = '/public/tasks.html';
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Ошибка при создании задачи: ' + error.message);
    }
}

// Обработка команды search:
async function handleSearchCommand(query, overlay, closeOverlay) {
    try {
        const searchText = query.replace(/^search:\s*/i, '').trim();
        
        if (!searchText) {
            alert('Укажите текст для поиска после search:');
            return;
        }
        
        // Ищем задачи
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        
        // Ищем заметки
        const notesJson = localStorage.getItem('notes');
        const notes = notesJson ? JSON.parse(notesJson) : [];
        
        const lowerSearch = searchText.toLowerCase();
        
        // Фильтруем задачи
        const matchingTasks = tasks.filter(task => {
            const title = (task.title || '').toLowerCase();
            const description = (task.description || '').toLowerCase();
            return title.includes(lowerSearch) || description.includes(lowerSearch);
        });
        
        // Фильтруем заметки
        const matchingNotes = notes.filter(note => {
            const content = (note.content || note.text || '').toLowerCase();
            return content.includes(lowerSearch);
        });
        
        // Показываем результаты
        showSearchResults(matchingTasks, matchingNotes, overlay, closeOverlay);
    } catch (error) {
        console.error('Error searching:', error);
        alert('Ошибка при поиске: ' + error.message);
    }
}

// Показ результатов поиска
function showSearchResults(tasks, notes, overlay, closeOverlay) {
    const suggestionsContainer = overlay.querySelector('#quick-add-suggestions');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'flex';
    
    if (tasks.length === 0 && notes.length === 0) {
        suggestionsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Ничего не найдено</div>';
        return;
    }
    
    // Группируем по датам
    const results = [];
    
    // Добавляем задачи
    tasks.forEach(task => {
        results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            date: task.due_date,
            description: task.description
        });
    });
    
    // Добавляем заметки
    notes.forEach(note => {
        results.push({
            type: 'note',
            id: note.id,
            title: note.content || note.text || 'Заметка',
            date: note.created_at || note.date,
            description: ''
        });
    });
    
    // Сортируем по дате
    results.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    
    // Отображаем результаты
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'quick-add-suggestion';
        
        const dateStr = result.date ? formatDate(result.date) : '';
        const typeLabel = result.type === 'task' ? 'задача' : 'заметка';
        const title = result.title || '';
        
        item.innerHTML = `
            <div style="flex: 1;">
                <div class="quick-add-suggestion-title">${dateStr}</div>
                <div class="quick-add-suggestion-meta">${typeLabel}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            closeOverlay();
            if (result.type === 'task') {
                // Переходим на страницу задач с выбранной датой
                const taskDate = result.date ? new Date(result.date).toISOString().split('T')[0] : '';
                if (taskDate) {
                    window.location.href = `/public/tasks.html?date=${taskDate}`;
                } else {
                    window.location.href = `/public/tasks.html`;
                }
            } else {
                window.location.href = `/public/notes.html`;
            }
        });
        
        suggestionsContainer.appendChild(item);
    });
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const lang = localStorage.getItem('language') || 'ru';
    const locales = {
        'ru': 'ru-RU',
        'en': 'en-US',
        'es': 'es-ES'
    };
    return date.toLocaleDateString(locales[lang] || 'ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Парсинг даты
function parseDate(dateStr) {
    // Формат: "2 января" или "2 января 2025"
    const months = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
        'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
        'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    
    const match = dateStr.match(/(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/i);
    if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        
        if (months[monthName] !== undefined) {
            return new Date(year, months[monthName], day);
        }
    }
    
    return null;
}

// Парсинг относительной даты
function parseRelativeDate(dateStr) {
    const lower = dateStr.toLowerCase().trim();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateMap = [
        ['послезавтра', 2],
        ['позавчера', -2],
        ['через месяц', 30],
        ['через неделю', 7],
        ['через 3 дня', 3],
        ['через 2 дня', 2],
        ['через день', 1],
        ['сегодня', 0],
        ['завтра', 1],
        ['вчера', -1]
    ];
    
    for (const [key, days] of dateMap) {
        if (lower === key || lower.includes(key)) {
            const result = new Date(today);
            result.setDate(result.getDate() + days);
            return result;
        }
    }
    
    return null;
}

// Обработка команды plan:
function handlePlanCommand(query, closeOverlay) {
    const planText = query.replace(/^plan:\s*/i, '').trim();
    
    // Переходим на страницу плана
    closeOverlay();
    window.location.href = '/public/plan.html';
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'quick-add-overlay';
    overlay.innerHTML = `
        <div class="quick-add-modal">
            <div class="quick-add-header">
                <h3 class="quick-add-title">Что нужно сделать?</h3>
                <button id="quick-add-close" class="quick-add-close" aria-label="Закрыть">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="quick-add-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input id="quick-add-input" class="quick-add-input" type="text" placeholder="Введите задачу, поиск или команду (task:, search:, plan:)" autocomplete="off" />
                <button class="quick-add-attach-btn" aria-label="Прикрепить файл">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
            </div>
            <div class="quick-add-hints">
                <span class="quick-add-pill" data-template="task: date:">task: Подготовить отчет date: завтра #работа</span>
                <span class="quick-add-pill" data-template="search:">search: заметки о встрече</span>
                <span class="quick-add-pill" data-template="plan:">plan: суббота</span>
            </div>
            <div class="quick-add-suggestions" id="quick-add-suggestions">
                <!-- История будет добавлена динамически -->
            </div>
            <div class="quick-add-footer">
                <button class="quick-add-confirm-btn" id="quick-add-confirm-btn" type="button">Подтвердить</button>
            </div>
        </div>
    `;
    return overlay;
}

