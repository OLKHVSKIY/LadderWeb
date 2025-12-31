// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация страницы задач
document.addEventListener('DOMContentLoaded', () => {
    initTasksPage();
});

let currentSelectedDate = new Date();
let mainDateCalendar = null;

function initTasksPage() {
    // Инициализация календаря
    initWeekCalendar();
    
    // Инициализация даты - используем текущую дату
    currentSelectedDate = new Date();
    updateSelectedDate(currentSelectedDate);
    
    // Инициализация выпадающего списка даты
    initDatePicker();
    
    // Загрузка задач
    loadTasksForDate(currentSelectedDate);
    
    // Обработчики событий
    setupEventHandlers();
}

function initWeekCalendar() {
    updateWeekCalendar();
}

function updateSelectedDate(date) {
    const dateNumber = document.getElementById('date-number');
    const dateMonthYear = document.getElementById('date-month-year');
    
    if (!dateNumber || !dateMonthYear) return;
    
    currentSelectedDate = new Date(date);
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : (localStorage.getItem('language') || 'ru');
    
    // Получаем сокращенные названия месяцев в зависимости от языка
    const monthKeys = [
        'month.short.january', 'month.short.february', 'month.short.march', 'month.short.april',
        'month.short.may', 'month.short.june', 'month.short.july', 'month.short.august',
        'month.short.september', 'month.short.october', 'month.short.november', 'month.short.december'
    ];
    const monthNames = monthKeys.map(key => window.i18n ? window.i18n.t(key) : 
        (lang === 'ru' ? ['янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'][monthKeys.indexOf(key)] :
         lang === 'en' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthKeys.indexOf(key)] :
         ['ene.', 'feb.', 'mar.', 'abr.', 'may', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'][monthKeys.indexOf(key)]));
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    dateNumber.textContent = day;
    dateMonthYear.textContent = `${month} ${year}`;
    
    // Анимация обновления
    dateNumber.style.transform = 'scale(0.9)';
    dateMonthYear.style.opacity = '0.5';
    
    setTimeout(() => {
        dateNumber.style.transform = 'scale(1)';
        dateMonthYear.style.opacity = '1';
    }, 200);
}

function initDatePicker() {
    const dateMonthYear = document.getElementById('date-month-year');
    const overlay = document.getElementById('date-picker-overlay');
    const closeBtn = document.getElementById('date-picker-close');
    const calendarContainer = document.getElementById('main-date-calendar');
    
    if (!dateMonthYear || !overlay) return;
    
    // Инициализация календаря - создаем при первом открытии
    // Календарь будет создан при открытии overlay
    
    // Открытие выпадающего списка
    dateMonthYear.addEventListener('click', () => {
        openDatePicker();
    });
    
    // Закрытие по клику на overlay
    overlay.addEventListener('click', (e) => {
        // Закрываем если клик именно по overlay (темному фону), но не по модальному окну
        if (e.target === overlay) {
            e.preventDefault();
            e.stopPropagation();
            closeDatePicker(e);
        }
    });
    
    // Предотвращаем закрытие при клике на модальное окно
    const modal = overlay.querySelector('.date-picker-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDatePicker(e);
        });
    }
}

function openDatePicker() {
    const overlay = document.getElementById('date-picker-overlay');
    const calendarContainer = document.getElementById('main-date-calendar');
    if (!overlay || !calendarContainer) return;
    
    // Создаем календарь при первом открытии
    if (!mainDateCalendar) {
        mainDateCalendar = new CalendarControl('main-date-calendar', (selectedDate) => {
            currentSelectedDate = selectedDate;
            updateSelectedDate(selectedDate);
            updateWeekCalendar();
            loadTasksForDate(selectedDate);
            setTimeout(() => {
                closeDatePicker(null);
            }, 300);
        });
    }
    
    mainDateCalendar.setSelectedDate(currentSelectedDate);
    overlay.classList.add('active');
    
    // Добавляем класс для применения стилей через CSS
    document.body.classList.add('calendar-open');
    
    // Добавляем размытие для хедера и main-content
    const header = document.querySelector('.main-header');
    const mainContent = document.querySelector('.main-content');
    
    if (header) {
        header.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
        header.style.setProperty('-webkit-backdrop-filter', 'blur(10px)', 'important');
        header.style.setProperty('z-index', '2999', 'important');
    }
    if (mainContent) {
        mainContent.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
        mainContent.style.setProperty('-webkit-backdrop-filter', 'blur(10px)', 'important');
        mainContent.style.setProperty('pointer-events', 'none', 'important');
        mainContent.style.setProperty('z-index', '1', 'important');
    }
    
    // Блокировка прокрутки body
    document.body.style.overflow = 'hidden';
}

function closeDatePicker(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const overlay = document.getElementById('date-picker-overlay');
    if (!overlay) return;
    
    overlay.classList.remove('active');
    
    // Убираем класс
    document.body.classList.remove('calendar-open');
    
    // Убираем размытие для хедера и main-content
    const header = document.querySelector('.main-header');
    const mainContent = document.querySelector('.main-content');
    
    if (header) {
        header.style.removeProperty('backdrop-filter');
        header.style.removeProperty('-webkit-backdrop-filter');
        header.style.removeProperty('background');
        header.style.removeProperty('z-index');
    }
    if (mainContent) {
        mainContent.style.removeProperty('backdrop-filter');
        mainContent.style.removeProperty('-webkit-backdrop-filter');
        mainContent.style.removeProperty('pointer-events');
        mainContent.style.removeProperty('z-index');
    }
    
    // Разблокировка прокрутки body
    document.body.style.overflow = '';
}

function selectMonth(month) {
    // Создаем новую дату с первым числом выбранного месяца, чтобы избежать проблем с setMonth()
    const year = currentSelectedDate.getFullYear();
    currentSelectedDate = new Date(year, month, 1);
    updateDatePickerActive();
    updateDaysPicker();
}

function selectYear(year) {
    // Создаем новую дату с первым числом текущего месяца и новым годом
    const month = currentSelectedDate.getMonth();
    currentSelectedDate = new Date(year, month, 1);
    updateDatePickerActive();
    updateDaysPicker();
}

function selectDay(day) {
    currentSelectedDate.setDate(day);
    updateSelectedDate(currentSelectedDate);
    updateWeekCalendar();
    loadTasksForDate(currentSelectedDate);
    updateDatePickerActive();
    updateDaysPicker();
    
    // Плавное закрытие после выбора
    setTimeout(() => {
        closeDatePicker();
    }, 300);
}

function updateDaysPicker() {
    const daysContainer = document.getElementById('date-picker-days');
    if (!daysContainer) return;
    
    daysContainer.innerHTML = '';
    
    // Заголовки дней недели
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayNames.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'date-picker-day';
        dayHeader.style.fontWeight = '600';
        dayHeader.style.color = '#999999';
        dayHeader.style.cursor = 'default';
        dayHeader.textContent = dayName;
        daysContainer.appendChild(dayHeader);
    });
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth(), 1);
    const lastDay = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Понедельник = 0
    
    // Пустые ячейки для начала месяца
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'date-picker-day other-month';
        daysContainer.appendChild(emptyDay);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'date-picker-day';
        dayEl.textContent = day;
        dayEl.dataset.day = day;
        
        // Проверяем, является ли этот день выбранным
        const checkDate = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth(), day);
        if (checkDate.toDateString() === currentSelectedDate.toDateString()) {
            dayEl.classList.add('active');
        }
        
        dayEl.addEventListener('click', () => {
            selectDay(day);
        });
        
        daysContainer.appendChild(dayEl);
    }
}

function updateDatePickerActive() {
    const months = document.querySelectorAll('.date-picker-month');
    const years = document.querySelectorAll('.date-picker-year');
    
    // Обновление активного месяца
    months.forEach(monthEl => {
        const month = parseInt(monthEl.dataset.month);
        if (month === currentSelectedDate.getMonth()) {
            monthEl.classList.add('active');
        } else {
            monthEl.classList.remove('active');
        }
    });
    
    // Обновление активного года
    years.forEach(yearEl => {
        const year = parseInt(yearEl.dataset.year);
        if (year === currentSelectedDate.getFullYear()) {
            yearEl.classList.add('active');
        } else {
            yearEl.classList.remove('active');
        }
    });
}

function updateWeekCalendar() {
    const calendar = document.getElementById('week-calendar');
    if (!calendar) return;
    
    const selectedDate = new Date(currentSelectedDate);
    
    // Находим начало недели для выбранной даты
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = selectedDate.getDay();
    startOfWeek.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const lang = localStorage.getItem('language') || 'ru';
    const weekdays = {
        'ru': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'es': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    };
    const days = weekdays[lang] || weekdays['ru'];
    calendar.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'week-day';
        
        // Проверяем, является ли этот день выбранной датой
        if (date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('active');
        }
        
        dayElement.dataset.date = date.toISOString().split('T')[0];
        
        dayElement.innerHTML = `
            <span class="week-day-name">${days[i]}</span>
            <span class="week-day-number">${date.getDate()}</span>
        `;
        
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.week-day').forEach(day => {
                day.classList.remove('active');
            });
            dayElement.classList.add('active');
            
            currentSelectedDate = new Date(date);
            updateSelectedDate(date);
            loadTasksForDate(date);
            
            dayElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                dayElement.style.transform = '';
            }, 150);
        });
        
        calendar.appendChild(dayElement);
    }
}

function getPriorityIcon(priority) {
    switch(priority) {
        case 1:
            return '/assets/images/icons/thunder-red.png';
        case 2:
            return '/assets/images/icons/thunder-yellow.png';
        case 3:
            return '/assets/images/icons/thunder-blue.png';
        default:
            return '/assets/images/icons/thunder-red.png';
    }
}

function updatePriorityHeader(tasks) {
    const priorityIcon = document.getElementById('priority-icon');
    const priorityText = document.getElementById('priority-text');
    
    if (!priorityIcon || !priorityText) return;
    
    if (tasks.length === 0) {
        // Если нет задач, показываем приоритет 1 по умолчанию
        priorityIcon.src = getPriorityIcon(1);
        const priorityText1 = window.i18n ? window.i18n.t('tasks.priority') : 'Приоритет';
        priorityText.textContent = `${priorityText1} 1`;
        return;
    }
    
    // Находим максимальный приоритет среди задач
    const maxPriority = Math.max(...tasks.map(task => task.priority || 1));
    
    priorityIcon.src = getPriorityIcon(maxPriority);
    const priorityLabel = window.i18n ? window.i18n.t('tasks.priority') : 'Приоритет';
    priorityText.textContent = `${priorityLabel} ${maxPriority}`;
}

async function loadTasksForDate(date) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    // Показываем загрузку
        const loadingText = window.i18n ? window.i18n.t('common.loading') : 'Загрузка...';
        taskList.innerHTML = `<div class="loading">${loadingText}</div>`;
    
    try {
        // Загружаем задачи из localStorage
        const { loadTasks } = await import('../modules/tasks.js');
        const allTasks = await loadTasks();
        
        // Фильтруем задачи по выбранной дате
        // Используем локальное форматирование даты, чтобы избежать проблем с часовыми поясами
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const tasks = allTasks.filter(task => {
            if (task.due_date) {
                // Парсим дату задачи как строку YYYY-MM-DD, без использования Date для сравнения
                // Это избегает проблем с часовыми поясами
                const taskDateStr = task.due_date;
                // Если дата в формате ISO с временем, извлекаем только дату
                const taskDate = taskDateStr.includes('T') ? taskDateStr.split('T')[0] : taskDateStr;
                return taskDate === dateStr;
            }
            if (task.start_date && task.end_date) {
                // Аналогично для диапазона дат
                const startDate = task.start_date.includes('T') ? task.start_date.split('T')[0] : task.start_date;
                const endDate = task.end_date.includes('T') ? task.end_date.split('T')[0] : task.end_date;
                return dateStr >= startDate && dateStr <= endDate;
            }
            return false;
        });
        
        if (tasks.length === 0) {
            const emptyText = window.i18n ? window.i18n.t('tasks.empty') : 'Нет задач на этот день';
            taskList.innerHTML = `<div class="empty-state">${emptyText}</div>`;
            return;
        }
        
        taskList.innerHTML = '';
        
        // Сортируем задачи по приоритету (1 сверху, 2 ниже, 3 еще ниже)
        const sortedTasks = tasks.sort((a, b) => {
            const priorityA = a.priority || 1;
            const priorityB = b.priority || 1;
            return priorityA - priorityB;
        });
        
        sortedTasks.forEach((task) => {
            const taskCard = createTaskCard(task);
            taskList.appendChild(taskCard);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        const errorText = window.i18n ? window.i18n.t('tasks.loadError') : 'Ошибка загрузки задач';
        taskList.innerHTML = `<div class="error-state">${errorText}</div>`;
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    // Убеждаемся, что completed всегда булево значение
    const isCompleted = task.completed === true;
    
    if (isCompleted) {
        card.classList.add('completed');
    }
    
    // Показываем иконку приоритета только если он выбран
    const priorityLabel = window.i18n ? window.i18n.t('tasks.priority') : 'Приоритет';
    const priorityIcon = task.priority ? 
        `<img src="${getPriorityIcon(task.priority)}" alt="${priorityLabel} ${task.priority}" class="task-priority-icon" width="16" height="16">` : 
        '';
    
    // Показываем описание, если оно есть
    const descriptionHtml = task.description ? 
        `<div class="task-description">${escapeHtml(task.description)}</div>` : 
        '';
    
    card.innerHTML = `
        <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-task-id="${task.id}"></div>
        <div class="task-content">
            <span class="task-text" style="${isCompleted ? 'text-decoration: line-through; color: #999999;' : ''}">${escapeHtml(task.title)}</span>
            ${descriptionHtml}
        </div>
        ${priorityIcon}
        <div class="task-menu-wrapper">
            <button class="task-menu" aria-label="Меню задачи" data-task-id="${task.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
            </svg>
        </button>
            <div class="task-menu-dropdown" data-task-id="${task.id}">
                <button class="task-menu-item" data-action="rename">${window.i18n ? window.i18n.t('common.rename') : 'Переименовать'}</button>
                <button class="task-menu-item" data-action="edit">${window.i18n ? window.i18n.t('common.edit') : 'Редактировать'}</button>
                <button class="task-menu-item" data-action="delete">${window.i18n ? window.i18n.t('common.delete') : 'Удалить'}</button>
            </div>
        </div>
    `;
    
    // Обработчик чекбокса
    const checkbox = card.querySelector('.task-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTask(task.id, checkbox);
    });
    
    // Обработчик клика по карточке
    card.addEventListener('click', () => {
        // Можно открыть детали задачи
        console.log('Task clicked:', task.id);
    });
    
    // Обработчик меню задачи
    const menuButton = card.querySelector('.task-menu');
    const menuDropdown = card.querySelector('.task-menu-dropdown');
    
    if (menuButton && menuDropdown) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTaskMenu(menuDropdown, task.id);
        });
        
        // Обработчики для пунктов меню
        const menuItems = menuDropdown.querySelectorAll('.task-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                handleTaskMenuAction(action, task.id);
                closeAllTaskMenus();
            });
        });
    }
    
    return card;
}

async function toggleTask(taskId, checkbox) {
    const isChecked = checkbox.classList.contains('checked');
    const newCompletedStatus = !isChecked;
    
    // Обновляем визуальное состояние
    checkbox.classList.toggle('checked');
    const card = checkbox.closest('.task-card');
    card.classList.toggle('completed');
    
    const taskText = card.querySelector('.task-text');
    if (newCompletedStatus) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.color = '#999999';
    } else {
        taskText.style.textDecoration = 'none';
        taskText.style.color = '#000000';
    }
    
    // Анимация
    checkbox.style.transform = 'scale(0.8)';
    setTimeout(() => {
        checkbox.style.transform = '';
    }, 200);
    
    // Сохраняем статус в localStorage
    try {
        const { updateTask } = await import('../modules/tasks.js');
        await updateTask(taskId, { completed: newCompletedStatus });
        
        // Обновляем статистику в greeting-panel
        if (window.greetingPanel && typeof window.greetingPanel.updateStats === 'function') {
            window.greetingPanel.updateStats();
        }
    } catch (error) {
        console.error('Error updating task status:', error);
        // Откатываем визуальные изменения при ошибке
        checkbox.classList.toggle('checked');
        card.classList.toggle('completed');
        if (newCompletedStatus) {
            taskText.style.textDecoration = 'none';
            taskText.style.color = '#000000';
        } else {
            taskText.style.textDecoration = 'line-through';
            taskText.style.color = '#999999';
        }
    }
}

// Функции для работы с меню задач
function toggleTaskMenu(menuDropdown, taskId) {
    // Проверяем, открыто ли уже это меню
    const isOpen = menuDropdown.classList.contains('active');
    
    // Находим карточку задачи
    const taskCard = menuDropdown.closest('.task-card');
    
    if (isOpen) {
        // Если открыто - просто закрываем его
        menuDropdown.classList.remove('active');
        if (taskCard) {
            taskCard.classList.remove('menu-open');
        }
    } else {
        // Закрываем все остальные меню
        closeAllTaskMenus();
        
        // Увеличиваем z-index карточки, чтобы меню было поверх других карточек
        if (taskCard) {
            taskCard.classList.add('menu-open');
        }
        
        // Открываем текущее меню
        menuDropdown.classList.add('active');
    }
}

function closeAllTaskMenus() {
    const allMenus = document.querySelectorAll('.task-menu-dropdown');
    allMenus.forEach(menu => {
        menu.classList.remove('active');
        const taskCard = menu.closest('.task-card');
        if (taskCard) {
            taskCard.classList.remove('menu-open');
        }
    });
}

function handleTaskMenuAction(action, taskId) {
    switch(action) {
        case 'rename':
            renameTask(taskId);
            break;
        case 'edit':
            editTask(taskId);
            break;
        case 'delete':
            (async () => {
                // Используем только customModal, без fallback на confirm
                if (window.customModal && window.customModal.confirm) {
                    const confirmText = window.i18n ? window.i18n.t('modal.deleteTask') : 'Вы уверены, что хотите удалить эту задачу?';
                    const confirmed = await window.customModal.confirm(confirmText);
                    if (confirmed === true) {
                        deleteTask(taskId);
                    }
                } else {
                    // Fallback только если customModal недоступен
                    const confirmText = window.i18n ? window.i18n.t('modal.deleteTask') : 'Вы уверены, что хотите удалить эту задачу?';
                    const confirmed = confirm(confirmText);
                    if (confirmed) {
                        deleteTask(taskId);
                    }
                }
            })();
            break;
    }
}

function renameTask(taskId) {
    // Ищем карточку задачи по кнопке меню или тексту задачи
    const menuButton = document.querySelector(`.task-menu[data-task-id="${taskId}"]`);
    const taskTextElement = document.querySelector(`.task-text[data-task-id="${taskId}"]`);
    
    let card = null;
    let taskText = null;
    
    if (menuButton) {
        card = menuButton.closest('.task-card');
        taskText = card?.querySelector('.task-text');
    } else if (taskTextElement) {
        taskText = taskTextElement;
        card = taskText.closest('.task-card');
    }
    
    if (!card || !taskText) return;
    
    // Получаем текущий текст
    const currentText = taskText.textContent;
    
    // Создаем input для редактирования
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-text-edit';
    input.style.cssText = `
        width: 100%;
        padding: 4px 8px;
        border: 2px solid #DC3545;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 400;
        font-family: 'Onest', sans-serif;
        background: #FFFFFF;
        color: #000000;
        outline: none;
    `;
    
    // Заменяем текст на input
    taskText.style.display = 'none';
    taskText.parentNode.insertBefore(input, taskText);
    input.focus();
    input.select();
    
    // Сохраняем при потере фокуса или нажатии Enter
    const saveRename = () => {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
            updateTaskTitle(taskId, newText);
        }
        input.remove();
        taskText.style.display = '';
    };
    
    input.addEventListener('blur', saveRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        } else if (e.key === 'Escape') {
            input.remove();
            taskText.style.display = '';
        }
    });
    
    closeAllTaskMenus();
}

function updateTaskTitle(taskId, newTitle) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        let tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].title = newTitle;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Обновляем отображение
            const taskText = document.querySelector(`.task-text[data-task-id="${taskId}"]`);
            if (taskText) {
                taskText.textContent = newTitle;
            }
            
            // Обновляем статистику в панели приветствия
            if (window.greetingPanel) {
                window.greetingPanel.updateStats();
            }
        }
    } catch (error) {
        console.error('Error updating task title:', error);
    }
}

function editTask(taskId) {
    try {
        // Получаем задачу из localStorage
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }
        
        // Открываем модальное окно для редактирования
        openTaskEditModal(task);
        closeAllTaskMenus();
    } catch (error) {
        console.error('Error loading task for editing:', error);
    }
}

function deleteTask(taskId) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        let tasks = tasksJson ? JSON.parse(tasksJson) : [];
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Перезагружаем задачи
        loadTasksForDate(currentSelectedDate);
        
        // Обновляем статистику в панели приветствия
        if (window.greetingPanel) {
            window.greetingPanel.updateStats();
        }
        
        console.log('Задача удалена:', taskId);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Закрытие меню при клике вне его
document.addEventListener('click', (e) => {
    if (!e.target.closest('.task-menu-wrapper')) {
        closeAllTaskMenus();
    }
});

function setupEventHandlers() {
    // Бургер меню
    const burgerMenu = document.getElementById('burger-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (burgerMenu && sidebarOverlay) {
        burgerMenu.addEventListener('click', () => {
            const isActive = sidebarOverlay.classList.toggle('active');
            burgerMenu.classList.toggle('active');
            // Добавляем/убираем класс на body для скрытия элементов хедера
            if (isActive) {
                document.body.classList.add('sidebar-open');
                sidebarOverlay.style.pointerEvents = 'auto'; // Разрешаем клики когда открыт
            } else {
                document.body.classList.remove('sidebar-open');
                sidebarOverlay.style.pointerEvents = 'none'; // Блокируем клики когда закрыт
            }
        });
        
        // Закрытие при клике на overlay (но не на кнопки и ссылки)
        sidebarOverlay.addEventListener('click', (e) => {
            // Закрываем только если кликнули именно на overlay, а не на его дочерние элементы
            if (e.target === sidebarOverlay || e.target.classList.contains('sidebar-content')) {
                // Проверяем, что клик не на ссылку или кнопку
                if (!e.target.closest('.sidebar-item')) {
                    sidebarOverlay.classList.remove('active');
                    burgerMenu.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
                    sidebarOverlay.style.pointerEvents = 'none';
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
                sidebarOverlay.style.pointerEvents = 'none';
                
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
                sidebarOverlay.style.pointerEvents = 'none';
                
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
    }
    
    function handleSidebarAction(action) {
        // Обрабатываем только действия без навигации (info, support, suggest)
        switch(action) {
            case 'info':
                window.location.href = '/public/info.html';
                break;
            case 'support':
                console.log('Поддержка');
                // Здесь можно добавить открытие поддержки
                break;
            case 'suggest':
                openSuggestModal();
                break;
        }
    }
    
    // Кнопка настроек
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/public/settings.html';
        });
    }
    
    // Кнопка GPT меню
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
    
    // Кнопка добавления задачи
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskCreateModal();
        });
    }
    
    // Инициализация модального окна создания задачи
    initTaskCreateModal();
    
    // Навигация теперь работает через обычные ссылки в HTML, JavaScript не нужен
}

// Загрузка задач из localStorage
async function getMockTasks() {
    try {
        // Загружаем задачи из localStorage
        const tasksJson = localStorage.getItem('tasks');
        if (!tasksJson) return [];
        
        const allTasks = JSON.parse(tasksJson);
        const selectedDateStr = currentSelectedDate.toISOString().split('T')[0];
        
        // Фильтруем задачи по выбранной дате
        const filteredTasks = allTasks.filter(task => {
            if (task.due_date) {
                const taskDate = new Date(task.due_date).toISOString().split('T')[0];
                return taskDate === selectedDateStr;
            }
            if (task.start_date && task.end_date) {
                const startDate = new Date(task.start_date).toISOString().split('T')[0];
                const endDate = new Date(task.end_date).toISOString().split('T')[0];
                return selectedDateStr >= startDate && selectedDateStr <= endDate;
            }
            return false;
        });
        
        return filteredTasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

// Сохранение задачи в localStorage
function saveTaskToStorage(task, taskId = null) {
    try {
        const tasksJson = localStorage.getItem('tasks');
        let tasks = tasksJson ? JSON.parse(tasksJson) : [];
        
        if (taskId) {
            // Обновляем существующую задачу
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                task.id = taskId;
                task.updated_at = new Date().toISOString();
                // Сохраняем created_at из существующей задачи
                task.created_at = tasks[taskIndex].created_at;
                // Сохраняем completed только если оно не передано в taskData
                if (task.completed === undefined) {
                    task.completed = tasks[taskIndex].completed || false;
                }
                tasks[taskIndex] = task;
            } else {
                throw new Error('Task not found');
            }
        } else {
            // Создаем новую задачу
        const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) : 0;
        task.id = maxId + 1;
        task.created_at = new Date().toISOString();
            task.completed = false;
        tasks.push(task);
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        return task;
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
}

// Модальное окно создания задачи
let currentSelectedDateModal = new Date();
let currentSelectedMonth = new Date().getMonth();
let currentSelectedYear = new Date().getFullYear();
let currentDateType = 'single';
let selectedStartDate = null;
let selectedEndDate = null;
let editingTaskId = null; // ID задачи, которую редактируем (null для создания новой)

function initTaskCreateModal() {
    const modal = document.getElementById('task-create-modal');
    const closeBtn = document.getElementById('task-create-close');
    const cancelBtn = document.getElementById('task-create-cancel');
    const form = document.getElementById('task-create-form');
    
    if (!modal) return;
    
    // Закрытие модального окна
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Закрытие при клике на фон (но не на содержимое)
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('task-create-modal')) {
            closeModal();
        }
    });
    
    // Предотвращаем закрытие при клике на содержимое
    const modalContent = modal.querySelector('.task-create-modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Инициализация выбора приоритета
    initPrioritySelector();
    
    // Инициализация выбора типа даты
    initDateTypeSelector();
    
    // Инициализация выбора даты
    initDatePickerModal();
    
    // Обработка отправки формы
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleTaskCreate(form);
        });
    }
}

function openTaskCreateModal() {
    editingTaskId = null;
    const modal = document.getElementById('task-create-modal');
    if (!modal) return;
    
    // Очищаем форму
    const form = document.getElementById('task-create-form');
    if (form) form.reset();
    
    // Обновляем заголовок модального окна
    const modalTitle = modal.querySelector('.task-create-header h2');
    if (modalTitle) {
        const titleText = window.i18n ? window.i18n.t('tasks.new') : 'Новая задача';
        modalTitle.textContent = titleText;
    }
    
    // Обновляем текст кнопки отправки
    const submitBtn = modal.querySelector('.task-create-submit');
    if (submitBtn) {
        const submitText = window.i18n ? window.i18n.t('tasks.create') : 'Создать';
        submitBtn.textContent = submitText;
    }
    
    // Устанавливаем текущую дату по умолчанию
    const today = new Date();
    currentSelectedDateModal = new Date(today);
    currentSelectedMonth = currentSelectedDateModal.getMonth();
    currentSelectedYear = currentSelectedDateModal.getFullYear();
    currentDateType = 'single';
    
    // Для периода: начальная дата = сегодня, конечная = сегодня + 2 дня
    selectedStartDate = new Date(today);
    selectedEndDate = new Date(today);
    selectedEndDate.setDate(today.getDate() + 2);
    
    updateDateDisplay();
    updateDateTypeDisplay();
    updateRangeDateDisplay();
    
    // Устанавливаем приоритет 1 по умолчанию
    const priorityOptions = document.querySelectorAll('.priority-option');
    priorityOptions.forEach(opt => opt.classList.remove('active'));
    if (priorityOptions.length > 0) {
        priorityOptions[0].classList.add('active');
        const priorityInput = document.getElementById('task-priority');
        if (priorityInput) priorityInput.value = '1';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openTaskEditModal(task) {
    editingTaskId = task.id;
    const modal = document.getElementById('task-create-modal');
    if (!modal) return;
    
    // Обновляем заголовок модального окна
    const modalTitle = modal.querySelector('.task-create-header h2');
    if (modalTitle) {
        const titleText = window.i18n ? window.i18n.t('tasks.editTask') : 'Редактировать задачу';
        modalTitle.textContent = titleText;
    }
    
    // Обновляем текст кнопки отправки
    const submitBtn = modal.querySelector('.task-create-submit');
    if (submitBtn) {
        const submitText = window.i18n ? window.i18n.t('tasks.update') : 'Обновить';
        submitBtn.textContent = submitText;
    }
    
    // Заполняем форму данными задачи
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const priorityInput = document.getElementById('task-priority');
    
    if (titleInput) titleInput.value = task.title || '';
    if (descriptionInput) descriptionInput.value = task.description || '';
    if (priorityInput) priorityInput.value = task.priority || 1;
    
    // Устанавливаем активный приоритет
    const priorityOptions = document.querySelectorAll('.priority-option');
    priorityOptions.forEach(opt => {
        opt.classList.remove('active');
        if (parseInt(opt.dataset.priority) === (task.priority || 1)) {
            opt.classList.add('active');
        }
    });
    
    // Определяем тип даты и устанавливаем даты
    if (task.due_date) {
        // Одна дата
        currentDateType = 'single';
        currentSelectedDateModal = new Date(task.due_date);
        currentSelectedMonth = currentSelectedDateModal.getMonth();
        currentSelectedYear = currentSelectedDateModal.getFullYear();
        updateDateTypeDisplay();
        updateDateDisplay();
        
        // Инициализируем календарь для одной даты, если он еще не создан
        const calendarContainer = document.getElementById('single-date-calendar');
        if (calendarContainer && !singleDateCalendar) {
            singleDateCalendar = new CalendarControl('single-date-calendar', (selectedDate) => {
                currentSelectedDateModal = selectedDate;
                updateDateDisplay();
                setTimeout(() => {
                    const dateOverlay = document.getElementById('date-picker-overlay-modal');
                    if (dateOverlay) dateOverlay.classList.remove('active');
                }, 300);
            });
        }
        if (singleDateCalendar) {
            singleDateCalendar.setSelectedDate(currentSelectedDateModal);
        }
    } else if (task.start_date && task.end_date) {
        // Период
        currentDateType = 'range';
        selectedStartDate = new Date(task.start_date);
        selectedEndDate = new Date(task.end_date);
        updateDateTypeDisplay();
        updateRangeDateDisplay();
        
        // Инициализируем календари для периода, если они еще не созданы
        if (!startDateCalendar) {
            startDateCalendar = new CalendarControl('start-date-calendar', (selectedDate) => {
                selectedStartDate = selectedDate;
                updateRangeDateDisplay();
                setTimeout(() => {
                    const overlay = document.getElementById('start-date-picker-overlay');
                    if (overlay) overlay.classList.remove('active');
                }, 300);
            });
        }
        if (!endDateCalendar) {
            endDateCalendar = new CalendarControl('end-date-calendar', (selectedDate) => {
                selectedEndDate = selectedDate;
                updateRangeDateDisplay();
                setTimeout(() => {
                    const overlay = document.getElementById('end-date-picker-overlay');
                    if (overlay) overlay.classList.remove('active');
                }, 300);
            });
        }
        if (startDateCalendar) {
            startDateCalendar.setSelectedDate(selectedStartDate);
        }
        if (endDateCalendar) {
            endDateCalendar.setSelectedDate(selectedEndDate);
        }
    } else {
        // По умолчанию - сегодня
        const today = new Date();
        currentSelectedDateModal = new Date(today);
        currentSelectedMonth = currentSelectedDateModal.getMonth();
        currentSelectedYear = currentSelectedDateModal.getFullYear();
        currentDateType = 'single';
        updateDateTypeDisplay();
        updateDateDisplay();
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function initPrioritySelector() {
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityInput = document.getElementById('task-priority');
    
    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            priorityOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            if (priorityInput) {
                priorityInput.value = option.dataset.priority;
            }
        });
    });
    
    // Устанавливаем приоритет 1 по умолчанию
    if (priorityOptions.length > 0) {
        priorityOptions[0].classList.add('active');
    }
}

function initDateTypeSelector() {
    const dateTypeOptions = document.querySelectorAll('.date-type-option');
    const singleDateField = document.getElementById('single-date-field');
    const rangeDateField = document.getElementById('range-date-field');
    
    dateTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            dateTypeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentDateType = option.dataset.type;
            
            if (currentDateType === 'single') {
                if (singleDateField) singleDateField.style.display = 'block';
                if (rangeDateField) rangeDateField.style.display = 'none';
            } else {
                if (singleDateField) singleDateField.style.display = 'none';
                if (rangeDateField) rangeDateField.style.display = 'block';
            }
        });
    });
}

function updateDateTypeDisplay() {
    const dateTypeOptions = document.querySelectorAll('.date-type-option');
    dateTypeOptions.forEach(opt => {
        if (opt.dataset.type === currentDateType) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
    
    const singleDateField = document.getElementById('single-date-field');
    const rangeDateField = document.getElementById('range-date-field');
    
    if (currentDateType === 'single') {
        if (singleDateField) singleDateField.style.display = 'block';
        if (rangeDateField) rangeDateField.style.display = 'none';
    } else {
        if (singleDateField) singleDateField.style.display = 'none';
        if (rangeDateField) rangeDateField.style.display = 'block';
    }
}

let singleDateCalendar = null;
let startDateCalendar = null;
let endDateCalendar = null;

function initDatePickerModal() {
    const dateDisplay = document.getElementById('selected-date-display');
    const dateOverlay = document.getElementById('date-picker-overlay-modal');
    const closeDatePicker = document.getElementById('date-picker-close-modal');
    const calendarContainer = document.getElementById('single-date-calendar');
    
    // Открытие календаря
    if (dateDisplay) {
        dateDisplay.addEventListener('click', () => {
            if (dateOverlay && calendarContainer) {
                // Создаем календарь при первом открытии
                if (!singleDateCalendar) {
                    singleDateCalendar = new CalendarControl('single-date-calendar', (selectedDate) => {
                        currentSelectedDateModal = selectedDate;
                        updateDateDisplay();
                        setTimeout(() => {
                            if (dateOverlay) dateOverlay.classList.remove('active');
                        }, 300);
                    });
                    singleDateCalendar.setSelectedDate(currentSelectedDateModal);
                } else {
                    singleDateCalendar.setSelectedDate(currentSelectedDateModal);
                }
                dateOverlay.classList.add('active');
            }
        });
    }
    
    // Закрытие календаря
    if (closeDatePicker) {
        closeDatePicker.addEventListener('click', () => {
            if (dateOverlay) dateOverlay.classList.remove('active');
        });
    }
    
    if (dateOverlay) {
        dateOverlay.addEventListener('click', (e) => {
            if (e.target === dateOverlay) {
                dateOverlay.classList.remove('active');
            }
        });
    }
    
    // Инициализация для периода
    initRangeDatePicker();
}


function initRangeDatePicker() {
    const startDateDisplay = document.getElementById('start-date-display');
    const endDateDisplay = document.getElementById('end-date-display');
    const startDateOverlay = document.getElementById('start-date-picker-overlay');
    const endDateOverlay = document.getElementById('end-date-picker-overlay');
    const startDateClose = document.getElementById('start-date-picker-close');
    const endDateClose = document.getElementById('end-date-picker-close');
    
    // Открытие календаря для начальной даты
    if (startDateDisplay) {
        startDateDisplay.addEventListener('click', () => {
            if (startDateOverlay) {
                initRangeDatePickerCalendar('start');
                startDateOverlay.classList.add('active');
            }
        });
    }
    
    // Открытие календаря для конечной даты
    if (endDateDisplay) {
        endDateDisplay.addEventListener('click', () => {
            if (endDateOverlay) {
                initRangeDatePickerCalendar('end');
                endDateOverlay.classList.add('active');
            }
        });
    }
    
    // Закрытие календарей
    if (startDateClose) {
        startDateClose.addEventListener('click', () => {
            if (startDateOverlay) startDateOverlay.classList.remove('active');
        });
    }
    
    if (endDateClose) {
        endDateClose.addEventListener('click', () => {
            if (endDateOverlay) endDateOverlay.classList.remove('active');
        });
    }
    
    if (startDateOverlay) {
        startDateOverlay.addEventListener('click', (e) => {
            if (e.target === startDateOverlay) {
                startDateOverlay.classList.remove('active');
            }
        });
    }
    
    if (endDateOverlay) {
        endDateOverlay.addEventListener('click', (e) => {
            if (e.target === endDateOverlay) {
                endDateOverlay.classList.remove('active');
            }
        });
    }
}

function initRangeDatePickerCalendar(type) {
    const calendarContainer = document.getElementById(`${type}-date-calendar`);
    if (!calendarContainer) {
        console.error(`Calendar container not found: ${type}-date-calendar`);
        return;
    }
    
    const targetDate = type === 'start' ? selectedStartDate : selectedEndDate;
    if (!targetDate) return;
    
    // Создаем или обновляем календарь
    if (type === 'start') {
        if (!startDateCalendar) {
            startDateCalendar = new CalendarControl(`${type}-date-calendar`, (selectedDate) => {
                selectedStartDate = selectedDate;
                updateRangeDateDisplay();
                setTimeout(() => {
                    const overlay = document.getElementById(`${type}-date-picker-overlay`);
                    if (overlay) overlay.classList.remove('active');
                }, 300);
            });
            startDateCalendar.setSelectedDate(targetDate);
        } else {
            startDateCalendar.setSelectedDate(targetDate);
        }
    } else {
        if (!endDateCalendar) {
            endDateCalendar = new CalendarControl(`${type}-date-calendar`, (selectedDate) => {
                selectedEndDate = selectedDate;
                updateRangeDateDisplay();
                setTimeout(() => {
                    const overlay = document.getElementById(`${type}-date-picker-overlay`);
                    if (overlay) overlay.classList.remove('active');
                }, 300);
            });
            endDateCalendar.setSelectedDate(targetDate);
        } else {
            endDateCalendar.setSelectedDate(targetDate);
        }
    }
}

function updateRangeDateDisplay() {
    const startNumber = document.getElementById('start-date-number');
    const startMonthYear = document.getElementById('start-date-month-year');
    const endNumber = document.getElementById('end-date-number');
    const endMonthYear = document.getElementById('end-date-month-year');
    
    if (!selectedStartDate || !selectedEndDate) return;
    
    // Получаем сокращенные названия месяцев в зависимости от языка
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ru';
    const monthKeys = [
        'month.short.january', 'month.short.february', 'month.short.march', 'month.short.april',
        'month.short.may', 'month.short.june', 'month.short.july', 'month.short.august',
        'month.short.september', 'month.short.october', 'month.short.november', 'month.short.december'
    ];
    const monthNames = monthKeys.map(key => window.i18n ? window.i18n.t(key) : 
        (lang === 'ru' ? ['янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'][monthKeys.indexOf(key)] :
         lang === 'en' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthKeys.indexOf(key)] :
         ['ene.', 'feb.', 'mar.', 'abr.', 'may', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'][monthKeys.indexOf(key)]));
    
    if (startNumber && startMonthYear) {
        startNumber.textContent = selectedStartDate.getDate();
        startMonthYear.textContent = `${monthNames[selectedStartDate.getMonth()]} ${selectedStartDate.getFullYear()}`;
    }
    
    if (endNumber && endMonthYear) {
        endNumber.textContent = selectedEndDate.getDate();
        endMonthYear.textContent = `${monthNames[selectedEndDate.getMonth()]} ${selectedEndDate.getFullYear()}`;
    }
    
    // Обновляем скрытые поля
    const startInput = document.getElementById('task-start-date');
    const endInput = document.getElementById('task-end-date');
    if (startInput) startInput.value = selectedStartDate.toISOString().split('T')[0];
    if (endInput) endInput.value = selectedEndDate.toISOString().split('T')[0];
}

function updateDatePickerModal() {
    const months = document.querySelectorAll('.date-picker-month-modal');
    const years = document.querySelectorAll('.date-picker-year-modal');
    
    months.forEach(month => {
        if (parseInt(month.dataset.month) === currentSelectedMonth) {
            month.classList.add('active');
        } else {
            month.classList.remove('active');
        }
    });
    
    years.forEach(year => {
        if (parseInt(year.dataset.year) === currentSelectedYear) {
            year.classList.add('active');
        } else {
            year.classList.remove('active');
        }
    });
}

function updateDateDisplay() {
    const dateNumber = document.getElementById('date-number-display');
    const dateMonthYear = document.getElementById('date-month-year-display');
    
    if (!dateNumber || !dateMonthYear) return;
    
    const date = currentSelectedDateModal;
    // Получаем сокращенные названия месяцев в зависимости от языка
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ru';
    const monthKeys = [
        'month.short.january', 'month.short.february', 'month.short.march', 'month.short.april',
        'month.short.may', 'month.short.june', 'month.short.july', 'month.short.august',
        'month.short.september', 'month.short.october', 'month.short.november', 'month.short.december'
    ];
    const monthNames = monthKeys.map(key => window.i18n ? window.i18n.t(key) : 
        (lang === 'ru' ? ['янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'][monthKeys.indexOf(key)] :
         lang === 'en' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthKeys.indexOf(key)] :
         ['ene.', 'feb.', 'mar.', 'abr.', 'may', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'][monthKeys.indexOf(key)]));
    
    dateNumber.textContent = date.getDate();
    dateMonthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    // Обновляем скрытое поле
    const dateInput = document.getElementById('task-date');
    if (dateInput) {
        dateInput.value = date.toISOString().split('T')[0];
    }
}

async function handleTaskCreate(form) {
    const formData = new FormData(form);
    const title = formData.get('title');
    const description = formData.get('description') || '';
    const priority = parseInt(formData.get('priority')) || 1;
    
    if (!title || title.trim() === '') {
        const alertText = window.i18n ? window.i18n.t('modal.enterTaskTitle') : 'Пожалуйста, введите название задачи';
        alert(alertText);
        return;
    }
    
    let dueDate = null;
    let startDate = null;
    let endDate = null;
    
    if (currentDateType === 'single') {
        if (!currentSelectedDateModal) {
            alert('Пожалуйста, выберите дату');
            return;
        }
        dueDate = currentSelectedDateModal.toISOString().split('T')[0];
    } else {
        // Для периода
        if (!selectedStartDate || !selectedEndDate) {
            alert('Пожалуйста, выберите период');
            return;
        }
        startDate = selectedStartDate.toISOString().split('T')[0];
        endDate = selectedEndDate.toISOString().split('T')[0];
    }
    
    // При редактировании сохраняем текущий статус completed
    let currentCompletedStatus = false;
    if (editingTaskId) {
        try {
            const { loadTasks } = await import('../modules/tasks.js');
            const allTasks = await loadTasks();
            const existingTask = allTasks.find(t => t.id === editingTaskId);
            if (existingTask) {
                currentCompletedStatus = existingTask.completed || false;
            }
        } catch (error) {
            console.error('Error loading task for edit:', error);
        }
    }
    
    const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        due_date: dueDate,
        start_date: startDate,
        end_date: endDate,
        completed: editingTaskId ? currentCompletedStatus : false
    };
    
    try {
        // Сохраняем или обновляем задачу в localStorage
        if (editingTaskId) {
            saveTaskToStorage(taskData, editingTaskId);
            console.log('Задача обновлена:', taskData);
        } else {
        saveTaskToStorage(taskData);
            console.log('Задача создана:', taskData);
        }
        
        // Закрываем модальное окно
        const modal = document.getElementById('task-create-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Очищаем форму
        form.reset();
        editingTaskId = null;
        currentSelectedDateModal = new Date();
        selectedStartDate = new Date();
        selectedEndDate = new Date();
        selectedEndDate.setDate(selectedEndDate.getDate() + 2);
        
        // Перезагружаем задачи
        loadTasksForDate(currentSelectedDate);
        
        // Обновляем статистику в панели приветствия
        if (window.greetingPanel) {
            window.greetingPanel.updateStats();
        }
    } catch (error) {
        console.error('Error saving task:', error);
        alert(editingTaskId ? 'Ошибка при обновлении задачи' : 'Ошибка при создании задачи');
    }
}

// Функция для открытия модального окна предложения идей
function openSuggestModal() {
    const modal = document.getElementById('suggest-modal-overlay');
    const form = document.getElementById('suggest-form');
    const closeBtn = document.getElementById('suggest-modal-close');
    const cancelBtn = document.getElementById('suggest-form-cancel');
    
    if (!modal || !form) return;
    
    // Открываем модальное окно
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обработчик закрытия по клику на overlay
    const handleOverlayClick = (e) => {
        if (e.target === modal) {
            closeSuggestModal();
        }
    };
    
    // Обработчик закрытия по кнопке X
    const handleClose = () => {
        closeSuggestModal();
    };
    
    // Обработчик отмены
    const handleCancel = () => {
        closeSuggestModal();
    };
    
    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const description = formData.get('description').trim();
        const email = formData.get('email').trim();
        
        if (!title || !description) {
            if (window.customModal) {
                await window.customModal.alert(
                    window.i18n ? window.i18n.t('suggest.fillFields') : 'Заполните все обязательные поля'
                );
            } else {
                alert('Заполните все обязательные поля');
            }
            return;
        }
        
        // Здесь можно отправить данные на сервер
        // Пока просто сохраняем в localStorage для примера
        const suggestions = JSON.parse(localStorage.getItem('suggestions') || '[]');
        suggestions.push({
            id: Date.now(),
            title,
            description,
            email: email || null,
            date: new Date().toISOString()
        });
        localStorage.setItem('suggestions', JSON.stringify(suggestions));
        
        // Показываем сообщение об успехе
        if (window.customModal) {
            await window.customModal.alert(
                window.i18n ? window.i18n.t('suggest.success') : 'Спасибо! Ваша идея отправлена.'
            );
        } else {
            alert('Спасибо! Ваша идея отправлена.');
        }
        
        // Очищаем форму и закрываем модальное окно
        form.reset();
        closeSuggestModal();
    };
    
    // Удаляем старые обработчики, если есть
    modal.removeEventListener('click', handleOverlayClick);
    closeBtn.removeEventListener('click', handleClose);
    cancelBtn.removeEventListener('click', handleCancel);
    form.removeEventListener('submit', handleSubmit);
    
    // Добавляем новые обработчики
    modal.addEventListener('click', handleOverlayClick);
    closeBtn.addEventListener('click', handleClose);
    cancelBtn.addEventListener('click', handleCancel);
    form.addEventListener('submit', handleSubmit);
}

// Функция для закрытия модального окна
function closeSuggestModal() {
    const modal = document.getElementById('suggest-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

