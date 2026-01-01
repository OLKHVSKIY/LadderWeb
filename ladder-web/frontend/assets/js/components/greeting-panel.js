// Компонент шторки с приветствием
class GreetingPanel {
    constructor() {
        this.panel = document.getElementById('greeting-panel');
        this.headerDivider = document.querySelector('.header-divider');
        this.bottomDivider = document.querySelector('.greeting-panel-bottom-divider');
        this.isOpen = false;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.initialTransform = 0; // Начальная позиция transform в пикселях
        
        this.init();
    }
    
    init() {
        if (!this.panel || !this.headerDivider) return;
        
        // Определяем время суток и устанавливаем стили
        this.updateTimeOfDay();
        
        // Обновляем приветствие
        this.updateGreeting();
        
        // Обновляем день и дату
        this.updateDayAndDate();
        
        // Обновляем статистику задач
        this.updateStats();
        
        // Обновляем время суток каждую минуту
        setInterval(() => {
            this.updateTimeOfDay();
            this.updateGreeting();
        }, 60000);
        
        // Обновляем приветствие и дату при смене языка
        window.addEventListener('storage', (e) => {
            if (e.key === 'language') {
                this.updateGreeting();
                this.updateDayAndDate();
                this.updateStats();
            }
        });
        
        // Также слушаем изменения языка через i18n
        if (window.i18n && window.i18n.applyTranslations) {
            const originalApplyTranslations = window.i18n.applyTranslations;
            window.i18n.applyTranslations = () => {
                originalApplyTranslations();
                this.updateGreeting();
                this.updateDayAndDate();
                this.updateStats();
            };
        }
        
        // Обработчик клика на header-divider
        this.headerDivider.addEventListener('click', () => {
            this.toggle();
        });
        
        // Обработчики для drag/swipe
        this.setupDragHandlers();
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && e.target !== this.headerDivider) {
                this.close();
            }
        });
    }
    
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'day';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }
    
    updateTimeOfDay() {
        const timeOfDay = this.getTimeOfDay();
        this.panel.className = `greeting-panel ${timeOfDay}`;
        
        // Обновляем изображение в зависимости от времени суток
        const imageElement = document.getElementById('greeting-panel-image');
        if (imageElement) {
            const imageMap = {
                morning: '/assets/images/backgrounds/morning.jpg',
                day: '/assets/images/backgrounds/day.jpg',
                evening: '/assets/images/backgrounds/evening.jpg',
                night: '/assets/images/backgrounds/night.jpg'
            };
            imageElement.src = imageMap[timeOfDay] || imageMap.day;
        }
        
        // Генерируем звезды для ночи
        if (timeOfDay === 'night') {
            this.generateStars();
        } else {
            this.clearStars();
        }
    }
    
    generateStars() {
        const container = document.getElementById('stars-container');
        if (!container) return;
        
        container.innerHTML = '';
        const starCount = 50;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            star.style.animationDuration = `${1 + Math.random() * 2}s`;
            container.appendChild(star);
        }
    }
    
    clearStars() {
        const container = document.getElementById('stars-container');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    getGreeting() {
        const timeOfDay = this.getTimeOfDay();
        const userName = this.getUserName();
        const name = userName ? `, ${userName}` : '';
        
        // Используем переводы из i18n
        const i18n = window.i18n;
        if (i18n) {
            const greetingKey = `greeting.${timeOfDay}`;
            const greeting = i18n.t(greetingKey);
            return `${greeting}${name}`;
        }
        
        // Fallback на русский
        const greetings = {
            morning: `Доброе утро${name}`,
            day: `Добрый день${name}`,
            evening: `Добрый вечер${name}`,
            night: `Доброй ночи${name}`
        };
        
        return greetings[timeOfDay] || greetings.day;
    }
    
    getGreetingIcon() {
        const timeOfDay = this.getTimeOfDay();
        const icons = {
            morning: '☀️',
            day: '☀️',
            evening: '🌅',
            night: '🌙'
        };
        return icons[timeOfDay] || '☀️';
    }
    
    getUserName() {
        // Получаем имя из localStorage или профиля
        const userName = localStorage.getItem('user_name');
        return userName ? userName.trim() : null;
    }
    
    updateGreeting() {
        const greetingText = document.getElementById('greeting-text');
        const greetingIcon = document.getElementById('greeting-icon');
        
        if (greetingText) {
            greetingText.textContent = this.getGreeting();
        }
        // Иконка больше не нужна, используем SVG анимации в фоне
        if (greetingIcon) {
            greetingIcon.style.display = 'none';
        }
    }
    
    // Функция для правильного склонения слова "задача"
    getTaskWord(count) {
        const i18n = window.i18n;
        const lang = i18n ? i18n.getCurrentLanguage() : 'ru';
        
        if (!i18n) {
            // Fallback на русский
            const lastDigit = count % 10;
            const lastTwoDigits = count % 100;
            if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
                return 'задач';
            }
            if (lastDigit === 1) {
                return 'задача';
            }
            if (lastDigit >= 2 && lastDigit <= 4) {
                return 'задачи';
            }
            return 'задач';
        }
        
        // Для английского и испанского языков склонение не нужно
        if (lang === 'en') {
            return count === 1 ? i18n.t('greeting.task') : i18n.t('greeting.tasks');
        }
        if (lang === 'es') {
            return count === 1 ? i18n.t('greeting.task') : i18n.t('greeting.tasks');
        }
        
        // Для русского языка - склонение
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        // Исключения для 11-14
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return i18n.t('greeting.tasksGenitive');
        }
        
        // 1, 21, 31, 41... - задача
        if (lastDigit === 1) {
            return i18n.t('greeting.task');
        }
        
        // 2, 3, 4, 22, 23, 24, 32, 33, 34... - задачи
        if (lastDigit >= 2 && lastDigit <= 4) {
            return i18n.t('greeting.tasks');
        }
        
        // 5, 6, 7, 8, 9, 10, 20, 25, 26... - задач
        return i18n.t('greeting.tasksGenitive');
    }
    
    async updateStats() {
        const statsContainer = document.getElementById('greeting-stats');
        if (!statsContainer) return;
        
        try {
            // Получаем задачи из localStorage
            const tasksJson = localStorage.getItem('tasks');
            const allTasks = tasksJson ? JSON.parse(tasksJson) : [];
            
            // Фильтруем задачи на сегодня (всегда читаем свежие данные)
            // Используем локальное форматирование даты, чтобы избежать проблем с часовыми поясами
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            
            const todayTasks = allTasks.filter(task => {
                if (task.due_date) {
                    // Парсим дату задачи как строку YYYY-MM-DD, без использования Date для сравнения
                    // Это избегает проблем с часовыми поясами
                    const taskDateStr = task.due_date;
                    // Если дата в формате ISO с временем, извлекаем только дату
                    const taskDate = taskDateStr.includes('T') ? taskDateStr.split('T')[0] : taskDateStr;
                    return taskDate === todayStr;
                }
                if (task.start_date && task.end_date) {
                    // Аналогично для диапазона дат
                    const startDate = task.start_date.includes('T') ? task.start_date.split('T')[0] : task.start_date;
                    const endDate = task.end_date.includes('T') ? task.end_date.split('T')[0] : task.end_date;
                    return todayStr >= startDate && todayStr <= endDate;
                }
                return false;
            });
            
            const completedTasks = todayTasks.filter(task => task.completed).length;
            const totalTasks = todayTasks.length;
            
            const taskWord = this.getTaskWord(totalTasks);
            const completedWord = this.getTaskWord(completedTasks);
            
            // Используем переводы из i18n
            const i18n = window.i18n;
            const todayText = i18n ? i18n.t('greeting.today') : 'Сегодня у вас';
            const completedText = i18n ? i18n.t('greeting.completed') : 'Выполнено';
            
            statsContainer.innerHTML = `
                <div class="greeting-stats-text">${todayText}: ${totalTasks} ${taskWord},</div>
                <div class="greeting-stats-text">${completedText}: ${completedTasks} ${completedWord}</div>
            `;
        } catch (error) {
            console.error('Error loading stats:', error);
            const i18n = window.i18n;
            const todayText = i18n ? i18n.t('greeting.today') : 'Сегодня у вас';
            const completedText = i18n ? i18n.t('greeting.completed') : 'Выполнено';
            const taskWord = this.getTaskWord(0);
            statsContainer.innerHTML = `
                <div class="greeting-stats-text">${todayText}: 0 ${taskWord},</div>
                <div class="greeting-stats-text">${completedText}: 0 ${taskWord}</div>
            `;
        }
    }
    
    updateDayAndDate() {
        const dayElement = document.getElementById('greeting-day');
        const dateElement = document.getElementById('greeting-date');
        
        if (dayElement || dateElement) {
            const now = new Date();
            const i18n = window.i18n;
            const lang = i18n ? i18n.getCurrentLanguage() : 'ru';
            
            // День недели (сокращенный)
            let dayName;
            if (i18n) {
                const dayKeys = ['weekday.sun', 'weekday.mon', 'weekday.tue', 'weekday.wed', 'weekday.thu', 'weekday.fri', 'weekday.sat'];
                dayName = i18n.t(dayKeys[now.getDay()]);
            } else {
                const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                dayName = dayNames[now.getDay()];
            }
            
            if (dayElement) {
                dayElement.textContent = dayName;
            }
            
            // Полная дата с месяцем
            let monthName;
            if (i18n) {
                if (lang === 'ru') {
                    // Для русского используем родительный падеж
                    const monthKeys = [
                        'month.gen.january', 'month.gen.february', 'month.gen.march', 'month.gen.april',
                        'month.gen.may', 'month.gen.june', 'month.gen.july', 'month.gen.august',
                        'month.gen.september', 'month.gen.october', 'month.gen.november', 'month.gen.december'
                    ];
                    monthName = i18n.t(monthKeys[now.getMonth()]);
                } else {
                    // Для английского и испанского используем именительный падеж
                    const monthKeys = [
                        'month.january', 'month.february', 'month.march', 'month.april',
                        'month.may', 'month.june', 'month.july', 'month.august',
                        'month.september', 'month.october', 'month.november', 'month.december'
                    ];
                    monthName = i18n.t(monthKeys[now.getMonth()]);
                }
            } else {
                const monthNames = [
                    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
                ];
                monthName = monthNames[now.getMonth()];
            }
            
            const day = now.getDate();
            const year = now.getFullYear();
            
            if (dateElement) {
                // Для английского языка формат: "January 21, 2025"
                if (lang === 'en') {
                    dateElement.textContent = `${monthName} ${day}, ${year}`;
                } else if (lang === 'es') {
                    // Для испанского: "21 de enero de 2025"
                    dateElement.textContent = `${day} de ${monthName} de ${year}`;
                } else {
                    // Для русского: "21 января 2025"
                    dateElement.textContent = `${day} ${monthName} ${year}`;
                }
            }
        }
    }
    
    setupDragHandlers() {
        // Touch события
        const handleTouchStart = (e) => {
            this.startY = e.touches[0].clientY;
            this.isDragging = true;
            this.panel.style.transition = 'none';
            
            // Сохраняем текущую позицию панели
            const currentTransform = this.panel.style.transform;
            if (currentTransform) {
                const match = currentTransform.match(/translateY\(([^)]+)\)/);
                if (match) {
                    const value = match[1];
                    if (value.includes('vh')) {
                        this.initialTransform = parseFloat(value) * window.innerHeight / 100;
                    } else if (value.includes('px')) {
                        this.initialTransform = parseFloat(value);
                    } else {
                        this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
                    }
                } else {
                    this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
                }
            } else {
                this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
            }
            
            e.preventDefault();
        };
        
        const handleTouchMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.startY;
            
            // Вычисляем новую позицию
            const panelHeight = window.innerHeight * 0.4;
            let newPosition = this.initialTransform + deltaY;
            
            // Ограничиваем движение в пределах допустимого диапазона
            newPosition = Math.max(0, Math.min(panelHeight, newPosition));
            
            // Применяем transform для следования за пальцем
            this.panel.style.transform = `translateY(${newPosition}px)`;
            
            // Обновляем позицию нижнего divider'а, чтобы он двигался вместе с панелью
            if (this.bottomDivider) {
                this.bottomDivider.style.transform = `translateX(-50%) translateY(${newPosition}px)`;
            }
        };
        
        const handleTouchEnd = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.panel.style.transition = '';
            
            const deltaY = this.currentY - this.startY;
            const panelHeight = window.innerHeight * 0.4;
            let currentPosition = this.initialTransform + deltaY;
            
            // Ограничиваем позицию в допустимых пределах
            currentPosition = Math.max(0, Math.min(panelHeight, currentPosition));
            
            const thresholdPercent = 0.3; // 30% от высоты панели
            const threshold = panelHeight * thresholdPercent;
            
            // Определяем, открывать или закрывать на основе позиции
            // Если панель была открыта изначально и пользователь двигал её вниз (deltaY > 0) - оставляем открытой
            // Если панель была закрыта и пользователь опустил её на 30% или больше - открываем
            // Если панель была открыта и пользователь поднимал её вверх (deltaY < 0) и позиция меньше 30% - закрываем
            if (this.isOpen) {
                // Если шторка была открыта
                if (deltaY > 0) {
                    // Двигали вниз - всегда оставляем открытой
                    this.open();
                } else if (deltaY < 0 && currentPosition < threshold) {
                    // Двигали вверх и позиция меньше 30% - закрываем
                    this.close();
                } else {
                    // Иначе оставляем открытой
                    this.open();
                }
            } else {
                // Если шторка была закрыта
                if (currentPosition >= threshold) {
                    // Опустили на 30% или больше - открываем
                    this.open();
                } else {
                    // Недостаточно - закрываем
                    this.close();
                }
            }
            
            // Сбрасываем transform для bottom divider
            if (this.bottomDivider) {
                this.bottomDivider.style.transform = '';
            }
        };
        
        // Обработчики для header-divider в хедере
        if (this.headerDivider) {
            this.headerDivider.addEventListener('touchstart', handleTouchStart);
            this.headerDivider.addEventListener('touchmove', handleTouchMove);
            this.headerDivider.addEventListener('touchend', handleTouchEnd);
        }
        
        
        // Обработчики для самой панели (можно тянуть за любую часть)
        this.panel.addEventListener('touchstart', (e) => {
            // Начинаем drag только если клик в верхней части панели (первые 60px)
            const rect = this.panel.getBoundingClientRect();
            const clickY = e.touches[0].clientY - rect.top;
            if (clickY < 60) {
                handleTouchStart(e);
            }
        });
        this.panel.addEventListener('touchmove', handleTouchMove);
        this.panel.addEventListener('touchend', handleTouchEnd);
        
        // Mouse события для десктопа
        const handleMouseDown = (e) => {
            this.startY = e.clientY;
            this.isDragging = true;
            this.panel.style.transition = 'none';
            
            // Сохраняем текущую позицию панели
            const currentTransform = this.panel.style.transform;
            if (currentTransform) {
                const match = currentTransform.match(/translateY\(([^)]+)\)/);
                if (match) {
                    const value = match[1];
                    if (value.includes('vh')) {
                        this.initialTransform = parseFloat(value) * window.innerHeight / 100;
                    } else if (value.includes('px')) {
                        this.initialTransform = parseFloat(value);
                    } else {
                        this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
                    }
                } else {
                    this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
                }
            } else {
                this.initialTransform = this.isOpen ? window.innerHeight * 0.4 : 0;
            }
            
            e.preventDefault();
        };
        
        const handleMouseMove = (e) => {
            if (!this.isDragging) return;
            this.currentY = e.clientY;
            const deltaY = this.currentY - this.startY;
            
            // Вычисляем новую позицию
            const panelHeight = window.innerHeight * 0.4;
            let newPosition = this.initialTransform + deltaY;
            
            // Ограничиваем движение
            newPosition = Math.max(0, Math.min(panelHeight, newPosition));
            
            // Применяем transform
            this.panel.style.transform = `translateY(${newPosition}px)`;
            
            // Обновляем позицию нижнего divider'а
            if (this.bottomDivider) {
                this.bottomDivider.style.transform = `translateX(-50%) translateY(${newPosition}px)`;
            }
        };
        
        const handleMouseUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.panel.style.transition = '';
            
            const deltaY = this.currentY - this.startY;
            const panelHeight = window.innerHeight * 0.4;
            let currentPosition = this.initialTransform + deltaY;
            
            // Ограничиваем позицию в допустимых пределах
            currentPosition = Math.max(0, Math.min(panelHeight, currentPosition));
            
            const thresholdPercent = 0.3; // 30% от высоты панели
            const threshold = panelHeight * thresholdPercent;
            
            // Определяем, открывать или закрывать на основе позиции
            if (this.isOpen) {
                // Если шторка была открыта
                if (deltaY > 0) {
                    // Двигали вниз - всегда оставляем открытой
                    this.open();
                } else if (deltaY < 0 && currentPosition < threshold) {
                    // Двигали вверх и позиция меньше 30% - закрываем
                    this.close();
                } else {
                    // Иначе оставляем открытой
                    this.open();
                }
            } else {
                // Если шторка была закрыта
                if (currentPosition >= threshold) {
                    // Опустили на 30% или больше - открываем
                    this.open();
                } else {
                    // Недостаточно - закрываем
                    this.close();
                }
            }
            
            // Сбрасываем transform для bottom divider
            if (this.bottomDivider) {
                this.bottomDivider.style.transform = '';
            }
        };
        
        if (this.headerDivider) {
            this.headerDivider.addEventListener('mousedown', handleMouseDown);
        }
        if (this.bottomDivider) {
            this.bottomDivider.addEventListener('mousedown', handleMouseDown);
        }
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        document.body.classList.add('greeting-panel-open');
        // Используем CSS класс для transform, но также устанавливаем через style для совместимости
        this.panel.style.transform = '';
        // Всегда обновляем статистику при открытии панели
        this.updateStats();
        this.updateDayAndDate();
    }
    
    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        document.body.classList.remove('greeting-panel-open');
        this.panel.style.transform = '';
    }
}

// Глобальная переменная для доступа к панели из других скриптов
let greetingPanelInstance = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    greetingPanelInstance = new GreetingPanel();
    
    // Обновляем день и дату сразу
    greetingPanelInstance.updateDayAndDate();
    
    // Обновляем день и дату каждый день (при смене даты)
    setInterval(() => {
        greetingPanelInstance.updateDayAndDate();
    }, 60000); // Проверяем каждую минуту
    
    // Обновляем статистику при изменении задач
    window.addEventListener('storage', () => {
        greetingPanelInstance.updateStats();
    });
    
    // Экспортируем для использования в других модулях
    window.greetingPanel = greetingPanelInstance;
});

