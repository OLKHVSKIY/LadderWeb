// Импортируем конфигурацию Yandex GPT API
import { YANDEX_GPT_CONFIG, getYandexGptApiUrl } from '../config/yandex-gpt-config.js';
import { initI18n } from '../modules/i18n.js';

// API ключи не нужны на фронтенде - используется бэкенд прокси
// Ключи хранятся в .env файле и используются только на сервере

// Состояние генерации плана
let currentPlanData = {
    name: '',
    description: '',
    startDate: null, // Дата начала плана
    daysCount: 30,
    weekendDays: [5, 6], // Массив дней недели (0=Пн, 1=Вт, ..., 6=Вс)
    generatedPlan: null
};

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    initGptPlanPage();
});

function initGptPlanPage() {
    // Инициализация i18n
    initI18n();
    
    // Инициализация стартовой даты
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    currentPlanData.startDate = `${year}-${month}-${day}`;
    
    // Настройка сайдбара
    setupSidebar();
    
    // Навигация теперь работает через обычные ссылки в HTML, JavaScript не нужен
    // setupNavigation();
    
    // Настройка обработчиков экранов
    setupScreenHandlers();
    
    // Настройка прокрутки при фокусе на полях ввода
    setupInputScrollHandlers();
    
    // Настройка кнопки настроек
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/public/settings.html';
        });
    }
    
    // Кнопка GPT меню
    setupAiMenu();
}

// Функция для настройки AI меню
function setupAiMenu() {
    const gptMenuBtn = document.getElementById('gpt-menu-btn');
    const aiMenuOverlay = document.getElementById('ai-menu-overlay');
    
    if (gptMenuBtn && aiMenuOverlay) {
        // Открытие меню
        gptMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            aiMenuOverlay.classList.add('active');
        });
        
        // Делегирование событий для кнопок и закрытия
        aiMenuOverlay.addEventListener('click', (e) => {
            // Кнопка "Чат с AI" - ведет на /public/chat.html (как в сайдбаре)
            const chatButton = e.target.closest('#ai-chat-option');
            if (chatButton) {
                e.preventDefault();
                e.stopPropagation();
                aiMenuOverlay.classList.remove('active');
                window.location.href = '/public/chat.html';
                return;
            }
            
            // Кнопка "AI создание плана"
            const planButton = e.target.closest('#ai-plan-option');
            if (planButton) {
                e.preventDefault();
                e.stopPropagation();
                aiMenuOverlay.classList.remove('active');
                window.location.href = '/public/gpt-plan.html';
                return;
            }
            
            // Закрытие при клике на overlay
            if (e.target === aiMenuOverlay) {
                aiMenuOverlay.classList.remove('active');
            }
        });
    } else {
        console.warn('GPT menu button or overlay not found!', {
            gptMenuBtn: !!gptMenuBtn,
            aiMenuOverlay: !!aiMenuOverlay
        });
    }
}

// Настройка прокрутки при фокусе на полях ввода
function setupInputScrollHandlers() {
    // Находим все поля ввода, включая те, что могут быть скрыты на других экранах
    const allInputs = document.querySelectorAll('#plan-name-input, #goal-description-input, #days-count-input, #start-date-input, .gpt-input, .gpt-textarea');
    
    // Сохраняем исходную позицию прокрутки для каждого поля
    const originalScrollPositions = new Map();
    
    // Функция для прокрутки к полю ввода
    const scrollToInput = (inputElement) => {
        const rect = inputElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        
        // Рассчитываем позицию с учетом отступа от верха и высоты навигации снизу
        const bottomNavHeight = 100; // Высота нижней навигации + отступ
        const topOffset = 80; // Отступ от верха (хедер)
        const inputTop = rect.top;
        const inputBottom = rect.bottom;
        const availableHeight = viewportHeight - bottomNavHeight - topOffset;
        
        // Если поле ввода находится слишком низко или перекрывается навигацией/хедером
        if (inputBottom > availableHeight || inputTop < topOffset) {
            const targetPosition = scrollTop + inputTop - topOffset;
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    };
    
    allInputs.forEach(input => {
        // Сохраняем исходную позицию прокрутки при фокусе
        const handleFocus = (e) => {
            const inputElement = e.target;
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Сохраняем исходную позицию
            originalScrollPositions.set(inputElement, currentScrollTop);
            
            // Прокручиваем сразу
            scrollToInput(inputElement);
            
            // Прокручиваем еще раз после небольшой задержки (когда клавиатура откроется)
            setTimeout(() => {
                scrollToInput(inputElement);
            }, 300);
            
            // Дополнительная проверка после полного открытия клавиатуры
            setTimeout(() => {
                scrollToInput(inputElement);
            }, 600);
        };
        
        // Возвращаем исходную позицию при потере фокуса
        const handleBlur = (e) => {
            const inputElement = e.target;
            const originalPosition = originalScrollPositions.get(inputElement);
            
            if (originalPosition !== undefined) {
                // Ждем немного, чтобы клавиатура закрылась
                setTimeout(() => {
                    window.scrollTo({
                        top: originalPosition,
                        behavior: 'smooth'
                    });
                    // Удаляем сохраненную позицию
                    originalScrollPositions.delete(inputElement);
                }, 300);
            }
        };
        
        input.addEventListener('focus', handleFocus);
        input.addEventListener('touchstart', handleFocus);
        input.addEventListener('blur', handleBlur);
        
        // Для мобильных устройств также обрабатываем событие при клике
        if ('ontouchstart' in window) {
            input.addEventListener('click', handleFocus);
        }
    });
}

// Настройка сайдбара
function setupSidebar() {
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
                if (action === 'info' || action === 'support' || action === 'suggest' || action === 'about') {
                    handleSidebarAction(action);
                }
            });
        });
        
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
}

function handleSidebarAction(action) {
    // Обрабатываем только действия без навигации (info, support, suggest, about)
    switch (action) {
        case 'info':
            window.location.href = '/public/info.html';
            break;
        case 'support':
            console.log('Поддержка');
            break;
        case 'suggest':
            console.log('Предложить идею');
            break;
        case 'about':
            console.log('О нас');
            break;
    }
}

// Настройка навигации
// Функция setupNavigation удалена - навигация теперь работает через обычные ссылки в HTML

// Настройка обработчиков экранов
function setupScreenHandlers() {
    // Экран 1: Название плана
    const continueBtn1 = document.getElementById('continue-btn-1');
    const planNameInput = document.getElementById('plan-name-input');
    
    if (continueBtn1 && planNameInput) {
        continueBtn1.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const planName = planNameInput.value.trim();
            if (!planName) {
                const errorText = window.i18n ? window.i18n.t('gpt.enterPlanName') : 'Введите название плана';
                await window.customModal?.error(errorText) || alert(errorText);
                return;
            }
            currentPlanData.name = planName;
            showScreen(2);
        });
        
        planNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                continueBtn1.click();
            }
        });
    } else {
        console.warn('continue-btn-1 or plan-name-input not found');
    }
    
    // Экран 2: Описание цели
    const continueBtn2 = document.getElementById('continue-btn-2');
    const goalDescriptionInput = document.getElementById('goal-description-input');
    
    if (continueBtn2 && goalDescriptionInput) {
        continueBtn2.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const description = goalDescriptionInput.value.trim();
            if (!description) {
                const errorText = window.i18n ? window.i18n.t('gpt.enterGoalDescription') : 'Опишите вашу цель';
                await window.customModal?.error(errorText) || alert(errorText);
                return;
            }
            currentPlanData.description = description;
            showScreen(3);
        });
    } else {
        console.warn('continue-btn-2 or goal-description-input not found');
    }
    
    // Экран 3: Выбор дней и выходных
    const generateBtn = document.getElementById('generate-btn');
    const daysCountInput = document.getElementById('days-count-input');
    const startDateInput = document.getElementById('start-date-input');
    const weekendDayBtns = document.querySelectorAll('.weekend-day-btn');
    
    // Обработчик стартовой даты
    if (startDateInput) {
        // Маска ввода для даты ДД.ММ.ГГГГ
        startDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    e.target.value = value;
                } else if (value.length <= 4) {
                    e.target.value = value.slice(0, 2) + '.' + value.slice(2);
                } else {
                    e.target.value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4, 8);
                }
            } else {
                e.target.value = '';
            }
        });
        
        // Устанавливаем сегодняшнюю дату по умолчанию
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        startDateInput.value = `${day}.${month}.${year}`;
        currentPlanData.startDate = `${year}-${month}-${day}`;
        
        startDateInput.addEventListener('blur', () => {
            const dateValue = startDateInput.value.trim();
            if (dateValue.includes('.')) {
                const parts = dateValue.split('.');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    currentPlanData.startDate = `${year}-${month}-${day}`;
                }
            }
        });
    }
    
    if (daysCountInput) {
        daysCountInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 0 && value <= 365) {
                currentPlanData.daysCount = value;
            }
        });
    }
    
    // Обработчики для выбора выходных дней
    weekendDayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const day = parseInt(btn.dataset.day);
            
            if (btn.classList.contains('active')) {
                if (!currentPlanData.weekendDays.includes(day)) {
                    currentPlanData.weekendDays.push(day);
                }
            } else {
                currentPlanData.weekendDays = currentPlanData.weekendDays.filter(d => d !== day);
            }
        });
    });
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            if (!currentPlanData.startDate) {
                await window.customModal?.error('Введите дату начала плана') || alert('Введите дату начала плана');
                return;
            }
            if (!currentPlanData.daysCount || currentPlanData.daysCount < 1) {
                await window.customModal?.error('Введите количество дней') || alert('Введите количество дней');
                return;
            }
            generatePlan();
        });
    }
    
    // Экран результата: Кнопки действий
    const editPlanBtn = document.getElementById('edit-plan-btn');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    
    if (editPlanBtn) {
        editPlanBtn.addEventListener('click', () => {
            // TODO: Реализовать редактирование плана
            alert('Редактирование плана будет доступно в следующей версии');
        });
    }
    
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', () => {
            saveGeneratedPlan();
        });
    }
    
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', async () => {
            const confirmed = await window.customModal?.confirm('Сгенерировать план заново? Текущий план будет потерян.') || confirm('Сгенерировать план заново? Текущий план будет потерян.');
            if (confirmed) {
                // Используем те же условия для регенерации
                generatePlan();
            }
        });
    }
}

// Показать экран
function showScreen(screenNumber) {
    const screens = document.querySelectorAll('.gpt-screen');
    screens.forEach((screen, index) => {
        if (index + 1 === screenNumber || screen.id === `screen-${screenNumber}` || screen.id === `screen-${getScreenName(screenNumber)}`) {
            screen.style.display = 'block';
            // Прокручиваем вверх при показе экрана генерации
            if (screen.id === 'screen-generating') {
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        } else {
            screen.style.display = 'none';
        }
    });
}

function getScreenName(number) {
    const names = {
        1: '1',
        2: '2',
        3: '3',
        4: 'generating',
        5: 'result'
    };
    return names[number] || number.toString();
}

// Сброс данных плана
function resetPlanData() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    currentPlanData = {
        name: '',
        description: '',
        startDate: `${year}-${month}-${day}`,
        daysCount: 30,
        weekendDays: [5, 6], // Сб и Вс по умолчанию
        generatedPlan: null
    };
    
    document.getElementById('plan-name-input').value = '';
    document.getElementById('goal-description-input').value = '';
    document.getElementById('days-count-input').value = '30';
    
    const startDateInput = document.getElementById('start-date-input');
    if (startDateInput) {
        startDateInput.value = `${day}.${month}.${year}`;
    }
    
    const weekendDayBtns = document.querySelectorAll('.weekend-day-btn');
    weekendDayBtns.forEach(btn => {
        const day = parseInt(btn.dataset.day);
        if (day === 5 || day === 6) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Генерация плана через AI
// Проверка осмысленности текста
function isValidText(text, minLength = 10) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    const trimmedText = text.trim();
    
    // Минимальная длина
    if (trimmedText.length < minLength) {
        return false;
    }
    
    // Проверка на повторяющиеся символы (если более 50% символов повторяются)
    const charCounts = {};
    let letterCount = 0;
    for (let char of trimmedText.toLowerCase()) {
        if (char.match(/[а-яa-z]/)) {
            letterCount++;
            charCounts[char] = (charCounts[char] || 0) + 1;
        }
    }
    
    if (letterCount > 0) {
        const maxCount = Math.max(...Object.values(charCounts));
        if (maxCount / letterCount > 0.5) {
            return false; // Слишком много повторяющихся символов
        }
    }
    
    // Проверка на наличие гласных букв (осмысленный текст должен содержать гласные)
    const vowels = /[аеёиоуыэюяaeiou]/i;
    if (!vowels.test(trimmedText)) {
        return false;
    }
    
    // Проверка на слишком много одинаковых символов подряд (более 2)
    if (/(.)\1{2,}/.test(trimmedText)) {
        return false;
    }
    
    // Проверка на бессмысленные комбинации согласных (более 3 подряд)
    const consonantPattern = /[бвгджзйклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz]{4,}/i;
    if (consonantPattern.test(trimmedText.replace(/\s/g, ''))) {
        return false;
    }
    
    // Проверка на паттерн "авпвфпв" - чередование согласных и гласных без смысла
    // Если текст короткий (до 15 символов) и состоит только из букв без пробелов,
    // и содержит много разных согласных подряд - возможно бессмысленный
    if (trimmedText.length <= 15 && !trimmedText.includes(' ') && !trimmedText.includes('-')) {
        const lettersOnly = trimmedText.replace(/[^а-яa-z]/gi, '');
        if (lettersOnly.length >= 5) {
            // Проверяем, нет ли слишком много разных согласных подряд
            const consonantSequence = lettersOnly.match(/[бвгджзйклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz]{3,}/gi);
            if (consonantSequence && consonantSequence.some(seq => seq.length >= 4)) {
                return false;
            }
            // Проверяем разнообразие символов - если все символы разные и их много, возможно бессмысленный текст
            const uniqueChars = new Set(lettersOnly.toLowerCase());
            if (uniqueChars.size / lettersOnly.length > 0.9 && lettersOnly.length >= 6) {
                // Если более 90% символов уникальны в коротком тексте - возможно бессмысленный
                return false;
            }
        }
    }
    
    return true;
}

async function generatePlan() {
    // Проверяем осмысленность названия плана
    if (!isValidText(currentPlanData.name, 3)) {
        await window.customModal?.error('Пожалуйста, введите осмысленное название плана.') || alert('Пожалуйста, введите осмысленное название плана.');
        showScreen(1); // Возвращаемся на первый экран
        return;
    }
    
    // Проверяем осмысленность описания цели перед генерацией
    if (!isValidText(currentPlanData.description, 10)) {
        await window.customModal?.error('Пожалуйста, опишите вашу цель более подробно и осмысленно. Текущее описание слишком короткое или неразборчивое.') || alert('Пожалуйста, опишите вашу цель более подробно и осмысленно. Текущее описание слишком короткое или неразборчивое.');
        showScreen(2); // Возвращаемся на экран с описанием цели
        return;
    }
    
    // Сбрасываем прогресс бар
    const progressFill = document.getElementById('generation-progress');
    const progressText = document.getElementById('generation-progress-text');
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    
    // Прокручиваем вверх перед показом экрана
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    showScreen('generating');
    
    // Симуляция прогресса
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }, 300);
    
    try {
        // API ключи хранятся на сервере в .env файле
        // Фронтенд использует бэкенд прокси на localhost:8001
        
        // Формируем промпт для генерации плана
        const prompt = createPlanPrompt();
        
        // Вызываем Yandex GPT API
        const planText = await callYandexGpt(prompt);
        
        // Парсим ответ и создаем структуру плана
        const plan = parsePlanResponse(planText);
        
        // Проверяем, что план был успешно распарсен
        if (!plan || !plan.dates || plan.dates.length === 0) {
            clearInterval(progressInterval);
            throw new Error('Не удалось разобрать ответ нейросети. Пожалуйста, попробуйте снова с более четким описанием цели.');
        }
        
        currentPlanData.generatedPlan = plan;
        
        // Завершаем прогресс
        clearInterval(progressInterval);
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = '100%';
        
        setTimeout(() => {
            displayGeneratedPlan();
        }, 500);
        
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Ошибка генерации плана:', error);
        
        // Показываем алерт с ошибкой
        const errorMessage = error.message || 'Произошла ошибка при генерации плана. Пожалуйста, попробуйте снова.';
        await window.customModal?.error(errorMessage) || alert(errorMessage);
        
        // Возвращаемся на первый этап
        resetPlanData();
        showScreen(1);
    }
}

// Определение языка текста
function detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'ru';
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) return 'ru';
    
    // 1. Проверка на русский (кириллица) - самый надежный индикатор
    const cyrillicPattern = /[а-яёА-ЯЁ]/;
    if (cyrillicPattern.test(trimmedText)) {
        return 'ru';
    }
    
    // 2. Проверка на испанский - специфические символы (уникальные для испанского)
    const spanishSpecialChars = /[ñáéíóúüÑÁÉÍÓÚÜ]/;
    if (spanishSpecialChars.test(trimmedText)) {
        return 'es';
    }
    
    // 3. Проверка на испанские артикли/предлоги в начале слов (более специфично)
    const spanishWords = /\b(el |la |los |las |un |una |de |del |que |y |en |es |son |con |por |para |está |están |tiene |tienen )/i;
    const englishWords = /\b(the |a |an |is |are |and |or |in |on |at |to |for |of |with |from |this |that |will |can |should )/i;
    
    // Подсчитываем количество совпадений
    const spanishMatches = (trimmedText.match(spanishWords) || []).length;
    const englishMatches = (trimmedText.match(englishWords) || []).length;
    
    // Если есть латиница, проверяем характерные слова
    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(trimmedText)) {
        // Если больше испанских слов, чем английских, и разница значительна
        if (spanishMatches > englishMatches && spanishMatches >= 2) {
            return 'es';
        }
        // Если есть английские слова или больше английских совпадений
        if (englishMatches > 0 || englishMatches >= spanishMatches) {
            return 'en';
        }
        // Если только латиница без специфических слов, по умолчанию английский
        return 'en';
    }
    
    // По умолчанию русский
    return 'ru';
}

// Создание промпта для генерации плана
function createPlanPrompt() {
    // Определяем язык описания цели
    const goalLanguage = detectLanguage(currentPlanData.description);
    
    // Названия дней недели в зависимости от языка
    const dayNames = {
        ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    };
    
    // Промпты на разных языках
    const prompts = {
        ru: {
            create: 'Создай детальный план для достижения цели',
            requirements: 'Требования:',
            days: 'План должен быть разбит на',
            start: 'Начало плана:',
            weekends: 'Выходные дни:',
            noWeekends: 'без выходных',
            tasks: 'Каждый день должен содержать конкретные задачи и шаги',
            logical: 'Задачи должны быть последовательными и логичными',
            priority: 'Укажи приоритет для каждой задачи (1 - высокий, 2 - средний, 3 - низкий)',
            skipWeekends: 'Пропускай выходные дни (не создавай задачи на выходные)',
            format: 'Формат ответа (строго соблюдай):',
            day: 'ДЕНЬ',
            task: 'Задача',
            priorityLabel: 'Приоритет:',
            startFrom: 'Начни с даты',
            distribute: 'и распредели задачи на',
            daysLabel: 'дней',
            skipping: 'пропуская выходные дни'
        },
        en: {
            create: 'Create a detailed plan to achieve the goal',
            requirements: 'Requirements:',
            days: 'The plan should be divided into',
            start: 'Plan start:',
            weekends: 'Weekend days:',
            noWeekends: 'no weekends',
            tasks: 'Each day should contain specific tasks and steps',
            logical: 'Tasks should be sequential and logical',
            priority: 'Specify priority for each task (1 - high, 2 - medium, 3 - low)',
            skipWeekends: 'Skip weekend days (do not create tasks on weekends)',
            format: 'Response format (strictly follow):',
            day: 'DAY',
            task: 'Task',
            priorityLabel: 'Priority:',
            startFrom: 'Start from date',
            distribute: 'and distribute tasks over',
            daysLabel: 'days',
            skipping: 'skipping weekend days'
        },
        es: {
            create: 'Crea un plan detallado para lograr el objetivo',
            requirements: 'Requisitos:',
            days: 'El plan debe dividirse en',
            start: 'Inicio del plan:',
            weekends: 'Días de fin de semana:',
            noWeekends: 'sin fines de semana',
            tasks: 'Cada día debe contener tareas y pasos específicos',
            logical: 'Las tareas deben ser secuenciales y lógicas',
            priority: 'Especifica la prioridad para cada tarea (1 - alta, 2 - media, 3 - baja)',
            skipWeekends: 'Omite los días de fin de semana (no crees tareas en los fines de semana)',
            format: 'Formato de respuesta (sigue estrictamente):',
            day: 'DÍA',
            task: 'Tarea',
            priorityLabel: 'Prioridad:',
            startFrom: 'Comienza desde la fecha',
            distribute: 'y distribuye las tareas en',
            daysLabel: 'días',
            skipping: 'omitiendo los días de fin de semana'
        }
    };
    
    const p = prompts[goalLanguage] || prompts.ru;
    const names = dayNames[goalLanguage] || dayNames.ru;
    
    const weekendDaysNames = currentPlanData.weekendDays
        .sort((a, b) => a - b)
        .map(day => names[day])
        .join(', ');
    
    const startDate = new Date(currentPlanData.startDate);
    const startDateFormatted = `${startDate.getDate()}.${startDate.getMonth() + 1}.${startDate.getFullYear()}`;
    
    return `${p.create}: "${currentPlanData.description}"

${p.requirements}
- ${p.days} ${currentPlanData.daysCount} ${p.daysLabel}
- ${p.start} ${startDateFormatted}
- ${p.weekends} ${currentPlanData.weekendDays.length > 0 ? weekendDaysNames : p.noWeekends}
- ${p.tasks}
- ${p.logical}
- ${p.priority}
- ${p.skipWeekends}

${p.format}
${p.day} 1: ${startDateFormatted}
- ${p.task} 1: [${goalLanguage === 'en' ? 'title' : goalLanguage === 'es' ? 'título' : 'название'}] | ${p.priorityLabel} [1/2/3]
- ${p.task} 2: [${goalLanguage === 'en' ? 'title' : goalLanguage === 'es' ? 'título' : 'название'}] | ${p.priorityLabel} [1/2/3]

${p.day} 2: [${goalLanguage === 'en' ? 'next date' : goalLanguage === 'es' ? 'siguiente fecha' : 'следующая дата'}]
- ${p.task} 1: [${goalLanguage === 'en' ? 'title' : goalLanguage === 'es' ? 'título' : 'название'}] | ${p.priorityLabel} [1/2/3]
...

${p.startFrom} ${startDateFormatted} ${p.distribute} ${currentPlanData.daysCount} ${p.daysLabel}, ${p.skipping} (${weekendDaysNames || p.noWeekends}).`;
}

// Вызов Yandex GPT API
async function callYandexGpt(prompt) {
    // Используем прокси через бэкенд для обхода CORS
    const apiUrl = 'http://localhost:8001/api/ai/yandex-gpt/chat';
    
    // Определяем язык для системного промпта
    const goalLanguage = detectLanguage(currentPlanData.description);
    const systemPrompts = {
        ru: 'Ты помощник для создания детальных планов. Создавай структурированные планы с датами и задачами. Отвечай на русском языке.',
        en: 'You are an assistant for creating detailed plans. Create structured plans with dates and tasks. Respond in English.',
        es: 'Eres un asistente para crear planes detallados. Crea planes estructurados con fechas y tareas. Responde en español.'
    };
    
    const systemPrompt = systemPrompts[goalLanguage] || systemPrompts.ru;
    
    const requestBody = {
        model: 'yandexgpt',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.6,
        max_tokens: 4000
    };
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { error: errorText };
        }
        throw new Error(`HTTP error! status: ${response.status}. ${errorData.error?.message || errorData.message || 'Ошибка API'}`);
    }
    
    const data = await response.json();
    
    // Парсим ответ от Yandex GPT API
    // Пробуем OpenAI-совместимый формат (API Gateway)
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    } 
    // Пробуем формат Yandex GPT API
    else if (data.result && data.result.alternatives && data.result.alternatives[0]) {
        return data.result.alternatives[0].message.text;
    } 
    // Альтернативный формат ответа
    else if (data.alternatives && data.alternatives[0] && data.alternatives[0].message) {
        return data.alternatives[0].message.text;
    } else {
        console.error('Unexpected Yandex GPT API response:', data);
        throw new Error('Неверный формат ответа от Yandex GPT API');
    }
}

// Парсинг ответа AI в структуру плана
function parsePlanResponse(text) {
    const plan = {
        dates: []
    };
    
    const lines = text.split('\n');
    let currentDate = null;
    let currentDateData = null;
    
    // Используем стартовую дату из currentPlanData
    const startDate = currentPlanData.startDate ? new Date(currentPlanData.startDate) : new Date();
    let dayCounter = 0;
    let taskIdCounter = Date.now(); // Базовый счетчик для уникальных ID задач
    
    // Убеждаемся, что начальное значение достаточно большое для уникальности
    if (taskIdCounter < 1000000000000) {
        taskIdCounter = 1000000000000;
    }
    
    // Определяем язык для парсинга
    const goalLanguage = detectLanguage(currentPlanData.description);
    
    // Паттерны для разных языков
    const dayPatterns = {
        ru: /^ДЕНЬ\s+\d+:/i,
        en: /^DAY\s+\d+:/i,
        es: /^DÍA\s+\d+:/i
    };
    
    const taskPatterns = {
        ru: /-\s*(.+?)\s*\|\s*Приоритет:\s*([123])/i,
        en: /-\s*(.+?)\s*\|\s*Priority:\s*([123])/i,
        es: /-\s*(.+?)\s*\|\s*Prioridad:\s*([123])/i
    };
    
    const dayPattern = dayPatterns[goalLanguage] || dayPatterns.ru;
    const taskPattern = taskPatterns[goalLanguage] || taskPatterns.ru;
    
    lines.forEach((line, index) => {
        line = line.trim();
        
        // Проверяем, начинается ли строка с "ДЕНЬ/DAY/DÍA" или содержит дату
        if (line.match(dayPattern) || line.match(/^\d{1,2}\.\d{1,2}\.\d{4}/)) {
            // Сохраняем предыдущую дату
            if (currentDateData) {
                plan.dates.push(currentDateData);
            }
            
            // Извлекаем дату
            const dateMatch = line.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]) - 1;
                const year = parseInt(dateMatch[3]);
                // Используем локальное время для избежания проблем с часовыми поясами
                currentDate = new Date(year, month, day);
                currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else {
                // Если дата не указана, используем последовательные дни от стартовой даты
                dayCounter++;
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + dayCounter - 1);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                currentDate = `${year}-${month}-${day}`;
            }
            
            currentDateData = {
                date: currentDate,
                tasks: []
            };
        } else if (line.startsWith('-') && currentDateData) {
            // Извлекаем задачу (используем паттерн для текущего языка)
            const taskMatch = line.match(taskPattern);
            if (taskMatch) {
                const taskTitle = taskMatch[1].trim();
                const priority = parseInt(taskMatch[2]);
                
                currentDateData.tasks.push({
                    id: Math.floor(taskIdCounter++), // Уникальный числовой ID для каждой задачи
                    title: taskTitle,
                    priority: priority,
                    completed: false
                });
            } else {
                // Простой формат без приоритета
                const taskTitle = line.replace(/^-\s*/, '').trim();
                if (taskTitle) {
                    currentDateData.tasks.push({
                        id: Math.floor(taskIdCounter++), // Уникальный числовой ID для каждой задачи
                        title: taskTitle,
                        priority: 2, // По умолчанию средний приоритет
                        completed: false
                    });
                }
            }
        }
    });
    
    // Сохраняем последнюю дату
    if (currentDateData) {
        plan.dates.push(currentDateData);
    }
    
    // Проверяем, что план был успешно распарсен
    if (plan.dates.length === 0) {
        return null; // План не может быть распарсен
    }
    
    // Проверяем, что есть хотя бы одна задача
    const hasTasks = plan.dates.some(dateData => dateData.tasks && dateData.tasks.length > 0);
    if (!hasTasks) {
        return null; // Нет задач в плане
    }
    
    return plan;
}

// Отображение сгенерированного плана
function displayGeneratedPlan() {
    showScreen('result');
    
    const resultTitle = document.getElementById('result-plan-name');
    const resultContent = document.getElementById('result-content');
    
    if (resultTitle) {
        resultTitle.textContent = currentPlanData.name;
    }
    
    if (resultContent && currentPlanData.generatedPlan) {
        resultContent.innerHTML = '';
        
        currentPlanData.generatedPlan.dates.forEach(dateData => {
            const dateCard = document.createElement('div');
            dateCard.className = 'gpt-date-card';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'gpt-date-header';
            dateHeader.textContent = formatDate(dateData.date);
            
            const tasksList = document.createElement('div');
            tasksList.className = 'gpt-tasks-list';
            
            dateData.tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `gpt-task-item priority-${task.priority}`;
                const priorityImages = {
                    1: '/assets/images/icons/thunder-red.png', // Красная
                    2: '/assets/images/icons/thunder-yellow.png', // Желтая
                    3: '/assets/images/icons/thunder-blue.png'  // Синяя
                };
                const priorityImage = priorityImages[task.priority] || '/assets/images/icons/thunder-yellow.png';
                taskItem.innerHTML = `
                    <span class="gpt-task-text">${task.title}</span>
                    <span class="gpt-task-priority">
                        <img src="${priorityImage}" alt="Приоритет ${task.priority}" width="16" height="16">
                    </span>
                `;
                tasksList.appendChild(taskItem);
            });
            
            dateCard.appendChild(dateHeader);
            dateCard.appendChild(tasksList);
            resultContent.appendChild(dateCard);
        });
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('ru-RU', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Сохранение сгенерированного плана
async function saveGeneratedPlan() {
    if (!currentPlanData.generatedPlan) {
        await window.customModal?.error('Нет плана для сохранения') || alert('Нет плана для сохранения');
        return;
    }
    
    // Получаем ID пользователя
    const userId = getUserId();
    
    // Получаем существующие цели
    const goalsJson = localStorage.getItem(`plan_goals_${userId}`);
    const goals = goalsJson ? JSON.parse(goalsJson) : [];
    
    // Создаем новую цель из сгенерированного плана
    const newGoal = {
        id: Date.now(),
        title: currentPlanData.name,
        description: currentPlanData.description,
        dates: currentPlanData.generatedPlan.dates,
        isActive: false,
        isSaved: true,
        createdAt: new Date().toISOString(),
        savedAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    localStorage.setItem(`plan_goals_${userId}`, JSON.stringify(goals));
    
    await window.customModal?.success('План успешно сохранен!') || alert('План успешно сохранен!');
    
    // Переходим на страницу планов
    window.location.href = '/public/plan.html';
}

// Получение ID пользователя
function getUserId() {
    const telegramUser = localStorage.getItem('telegram_user');
    if (telegramUser) {
        try {
            const user = JSON.parse(telegramUser);
            if (user.id) {
                return `telegram_${user.id}`;
            }
        } catch (e) {
            console.error('Error parsing telegram user:', e);
        }
    }
    
    let userId = localStorage.getItem('local_user_id');
    if (!userId) {
        userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('local_user_id', userId);
    }
    return userId;
}

