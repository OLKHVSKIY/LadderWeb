// Инициализация страницы плана - Конструктор целей
document.addEventListener('DOMContentLoaded', () => {
    initPlanPage();
});

function initPlanPage() {
    // Инициализация режима редактирования
    isEditMode = false;
    
    // Инициализация сайдбара
    setupSidebar();
    
    // Навигация теперь работает через обычные ссылки в HTML, JavaScript не нужен
    // setupNavigation();
    
    // Обработчик кнопки настроек
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
    
    // Загрузка целей
    loadGoals();
    
    // Обработчики событий
    setupEventHandlers();
    
    // Обновление пустого состояния
    updateEmptyState();
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

// Флаг для отслеживания миграции
let migrationDone = false;

// Миграция данных: добавление ID задачам, у которых их нет
function migrateTasksIds(goals) {
    if (migrationDone) return goals;
    
    let needsSave = false;
    let taskIdCounter = Date.now();
    
    goals.forEach(goal => {
        if (goal.dates && Array.isArray(goal.dates)) {
            goal.dates.forEach(dateData => {
                if (dateData.tasks && Array.isArray(dateData.tasks)) {
                    dateData.tasks.forEach(task => {
                        if (!task.id || task.id === undefined || isNaN(parseFloat(task.id))) {
                            task.id = Math.floor(taskIdCounter++);
                            needsSave = true;
                        }
                    });
                }
            });
        }
    });
    
    if (needsSave) {
        const userId = getUserId();
        localStorage.setItem(`plan_goals_${userId}`, JSON.stringify(goals));
    }
    
    migrationDone = true;
    return goals;
}

// Получение всех целей
function getGoals() {
    const userId = getUserId();
    const goalsJson = localStorage.getItem(`plan_goals_${userId}`);
    const goals = goalsJson ? JSON.parse(goalsJson) : [];
    
    // Мигрируем данные один раз: добавляем ID задачам без ID
    return migrateTasksIds(goals);
}

// Сохранение целей
function saveGoals(goals) {
    const userId = getUserId();
    localStorage.setItem(`plan_goals_${userId}`, JSON.stringify(goals));
}

// Получение текущей цели
function getCurrentGoal() {
    const goals = getGoals();
    return goals.find(g => g.isActive) || null;
}

// Установка текущей цели
function setCurrentGoal(goalId) {
    const goals = getGoals();
    goals.forEach(g => {
        g.isActive = g.id === goalId;
    });
    saveGoals(goals);
}

// Настройка сайдбара
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
    }
    
    if (burgerMenu && sidebarOverlay) {
        burgerMenu.addEventListener('click', () => {
            sidebarOverlay.classList.toggle('active');
            burgerMenu.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });
        
        sidebarOverlay.addEventListener('click', (e) => {
            // Закрываем только если кликнули именно на overlay, а не на его дочерние элементы
            if (e.target === sidebarOverlay || e.target.classList.contains('sidebar-content')) {
                // Проверяем, что клик не на ссылку или кнопку
                if (!e.target.closest('.sidebar-item')) {
                    sidebarOverlay.classList.remove('active');
                    burgerMenu.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
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
    
    function handleSidebarAction(action) {
        // Обрабатываем только действия без навигации (info, support, suggest, about)
        switch(action) {
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
}

// Настройка навигации
// Функция setupNavigation удалена - навигация теперь работает через обычные ссылки в HTML

// Обработчики событий
function setupEventHandlers() {
    // Кнопка создания цели
    const goalInput = document.getElementById('goal-input');
    const goalCreateBtn = document.getElementById('goal-create-btn');
    
    if (goalInput && goalCreateBtn) {
        goalCreateBtn.addEventListener('click', () => {
            createGoal();
        });
        
        goalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                createGoal();
            }
        });
    }
    
    // Кнопка добавления даты
    const addDateBtn = document.getElementById('add-date-btn');
    if (addDateBtn) {
        addDateBtn.addEventListener('click', () => {
            openDateModal();
        });
    }
    
    // Кнопка возврата к списку планов (в header)
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
        headerBackBtn.addEventListener('click', () => {
            goBackToPlansList();
        });
    }
    
    // Кнопка сохранения плана
    const savePlanBtn = document.getElementById('save-plan-btn');
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', () => {
            savePlan();
        });
    }
    
    // Кнопки редактирования и удаления цели
    const editGoalBtn = document.getElementById('edit-goal-btn');
    const deleteGoalBtn = document.getElementById('delete-goal-btn');
    
    if (editGoalBtn) {
        editGoalBtn.addEventListener('click', () => {
            toggleEditMode();
        });
    }
    
    if (deleteGoalBtn) {
        deleteGoalBtn.addEventListener('click', () => {
            deleteCurrentGoal();
        });
    }
    
    // Кнопка создания нового плана
    const createNewPlanBtn = document.getElementById('create-new-plan-btn');
    if (createNewPlanBtn) {
        createNewPlanBtn.addEventListener('click', () => {
            createNewPlan();
        });
    }
    
    // Круглая кнопка "+" в нижнем меню навигации
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            createNewPlan();
        });
    }
    
    // Модальное окно даты
    setupDateModal();
    
    // Модальное окно задачи
    setupTaskModal();
    
    // Модальное окно редактирования цели
    setupEditGoalModal();
}

// Создание цели
function createGoal() {
    const goalInput = document.getElementById('goal-input');
    const title = goalInput.value.trim();
    
    if (!title) {
        const enterGoalName = window.i18n ? window.i18n.t('plan.goalPlaceholder') : 'Введите название цели';
        alert(enterGoalName);
        return;
    }
    
    const goals = getGoals();
    
    // Деактивируем все предыдущие цели
    goals.forEach(g => {
        g.isActive = false;
    });
    
    const newGoal = {
        id: Date.now(),
        title: title,
        isActive: true,
        isSaved: false,
        dates: [],
        createdAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    saveGoals(goals);
    
    goalInput.value = '';
    loadGoals();
}

// Загрузка целей
function loadGoals() {
    const goals = getGoals();
    const currentGoal = getCurrentGoal();
    const savedGoals = goals.filter(g => g.isSaved);
    
    // Если открываем сохраненный план, выключаем режим редактирования
    if (currentGoal && currentGoal.isSaved) {
        isEditMode = false;
    }
    
    const goalCreation = document.getElementById('goal-creation');
    const goalConstructor = document.getElementById('goal-constructor');
    const savedPlans = document.getElementById('saved-plans');
    const goalsList = document.getElementById('goals-list');
    const emptyState = document.getElementById('empty-state');
    
    // Переключаем кнопки в header
    const burgerMenu = document.getElementById('burger-menu');
    const headerBackBtn = document.getElementById('header-back-btn');
    
    if (currentGoal) {
        // Показываем кнопку "назад" и скрываем бургер-меню
        document.body.classList.add('plan-opened');
        if (burgerMenu) {
            burgerMenu.style.display = 'none';
            burgerMenu.style.visibility = 'hidden';
        }
        if (headerBackBtn) headerBackBtn.style.display = 'flex';
        
        // Показываем конструктор текущей цели
        if (goalCreation) goalCreation.style.display = 'none';
        if (goalConstructor) {
            goalConstructor.style.display = 'block';
            renderGoalConstructor(currentGoal);
        }
        if (savedPlans) savedPlans.style.display = 'none';
        if (goalsList) goalsList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    } else {
        // Показываем бургер-меню и скрываем кнопку "назад"
        document.body.classList.remove('plan-opened');
        if (burgerMenu) {
            burgerMenu.style.display = 'flex';
            burgerMenu.style.visibility = 'visible';
        }
        if (headerBackBtn) headerBackBtn.style.display = 'none';
        
        if (savedGoals.length > 0) {
            // Показываем список сохраненных планов
            if (goalCreation) goalCreation.style.display = 'none';
            if (goalConstructor) goalConstructor.style.display = 'none';
            if (savedPlans) {
                savedPlans.style.display = 'block';
                renderSavedPlans(savedGoals);
            }
            if (goalsList) goalsList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
        } else if (goals.length > 0) {
            // Показываем список целей (старый формат)
            if (goalCreation) goalCreation.style.display = 'none';
            if (goalConstructor) goalConstructor.style.display = 'none';
            if (savedPlans) savedPlans.style.display = 'none';
            if (goalsList) {
                goalsList.style.display = 'block';
                renderGoalsList(goals);
            }
            if (emptyState) emptyState.style.display = 'none';
        } else {
            // Показываем форму создания
            if (goalCreation) goalCreation.style.display = 'block';
            if (goalConstructor) goalConstructor.style.display = 'none';
            if (savedPlans) savedPlans.style.display = 'none';
            if (goalsList) goalsList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }
    
    updateEmptyState();
}

// Рендеринг конструктора цели
function renderGoalConstructor(goal) {
    // Не сбрасываем режим редактирования, если он был явно включен пользователем
    // Режим редактирования сохраняется при добавлении элементов
    
    const goalTitle = document.getElementById('goal-title');
    if (goalTitle) {
        // Если это не режим редактирования названия, показываем текст
        if (!goalTitle.classList.contains('editing')) {
            goalTitle.textContent = goal.title;
        }
    }
    
    // Обновляем иконку кнопки "Редактировать"
    const editGoalBtn = document.getElementById('edit-goal-btn');
    if (editGoalBtn) {
        if (isEditMode) {
            // Показываем галочку когда редактирование активно
            editGoalBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            editGoalBtn.title = window.i18n ? window.i18n.t('common.save') : 'Сохранить';
        } else {
            // Показываем иконку редактирования когда редактирование неактивно
            editGoalBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            `;
            editGoalBtn.title = window.i18n ? window.i18n.t('plan.editGoal') : 'Редактировать цель';
        }
    }
    
    // Управляем видимостью элементов в зависимости от режима редактирования
    const goalProgress = document.getElementById('goal-progress');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const addDateBtn = document.getElementById('add-date-btn');
    
    // Определяем видимость элементов в зависимости от режима редактирования
    if (goal.isSaved && isEditMode) {
        // Сохраненный план в режиме редактирования
        if (goalProgress) goalProgress.style.display = 'none';
        if (savePlanBtn) savePlanBtn.style.display = 'flex';
        if (addDateBtn) addDateBtn.style.display = 'flex';
    } else if (goal.isSaved && !isEditMode) {
        // Сохраненный план не в режиме редактирования
        if (goalProgress) goalProgress.style.display = 'flex';
        if (savePlanBtn) savePlanBtn.style.display = 'none';
        if (addDateBtn) addDateBtn.style.display = 'none';
        updateGoalProgress(goal);
    } else {
        // План еще не сохранен
        if (goalProgress) goalProgress.style.display = 'none';
        if (savePlanBtn) savePlanBtn.style.display = 'flex';
        if (addDateBtn) addDateBtn.style.display = 'flex';
    }
    
    // Рендерим даты
    const datesList = document.getElementById('dates-list');
    if (datesList) {
        datesList.innerHTML = '';
        
        // Сортируем даты по возрастанию
        const sortedDates = [...goal.dates].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        sortedDates.forEach(dateData => {
            // Передаем isEditMode вместо isSaved для управления видимостью кнопок
            const dateCard = createDateCard(goal.id, dateData, goal.isSaved && !isEditMode);
            datesList.appendChild(dateCard);
        });
    }
}

// Создание карточки даты
function createDateCard(goalId, dateData, isSaved = false) {
    const dateCard = document.createElement('div');
    dateCard.className = 'date-card';
    dateCard.dataset.date = dateData.date;
    
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header';
    
    const dateTitle = document.createElement('h3');
    dateTitle.className = 'date-title';
    dateTitle.textContent = formatDate(dateData.date);
    
    const dateActions = document.createElement('div');
    dateActions.className = 'date-actions';
    
    // Кнопка удаления даты (всегда доступна)
    const deleteDateBtn = document.createElement('button');
    deleteDateBtn.className = 'date-action-btn';
    deleteDateBtn.title = window.i18n ? window.i18n.t('plan.deleteDate') : 'Удалить дату';
    deleteDateBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    `;
    deleteDateBtn.addEventListener('click', () => {
        deleteDate(goalId, dateData.date);
    });
    dateActions.appendChild(deleteDateBtn);
    
    dateHeader.appendChild(dateTitle);
    dateHeader.appendChild(dateActions);
    
    dateCard.appendChild(dateHeader);
    
    // Список задач
    const tasksList = document.createElement('div');
    tasksList.className = 'tasks-list';
    
    // Сортируем задачи по приоритету (1 - высший, 3 - низший)
    const sortedTasks = [...dateData.tasks].sort((a, b) => a.priority - b.priority);
    
    sortedTasks.forEach(task => {
        const taskItem = createTaskItem(goalId, dateData.date, task, isSaved);
        if (taskItem) {
            tasksList.appendChild(taskItem);
        } else {
            console.error('Failed to create task item:', task);
        }
    });
    
    dateCard.appendChild(tasksList);
    
    // Кнопка добавления задачи (только в режиме редактирования)
    // Размещаем под датой изначально, а если есть задачи - под блоками задач
    if (!isSaved) {
        const addTaskBtn = document.createElement('button');
        addTaskBtn.className = 'add-task-btn';
        const addTaskText = window.i18n ? window.i18n.t('plan.addTask') : 'Добавить задачу';
        addTaskBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>${addTaskText}</span>
        `;
        addTaskBtn.addEventListener('click', () => {
            openTaskModal(goalId, dateData.date);
        });
        // Добавляем кнопку после списка задач (под блоками задач)
        dateCard.appendChild(addTaskBtn);
    }
    
    return dateCard;
}

// Создание элемента задачи
function createTaskItem(goalId, date, task, isSaved = false) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item priority-${task.priority}`;
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    // Чекбокс (всегда доступен для отметки выполнения) - используем data-атрибуты для избежания проблем с замыканием
    const checkbox = document.createElement('div');
    checkbox.className = 'task-checkbox';
    
    // Убеждаемся, что все ID являются числами
    let taskIdNum = typeof task.id === 'number' ? task.id : (typeof task.id === 'string' ? parseFloat(task.id) : null);
    const goalIdNum = typeof goalId === 'number' ? goalId : (typeof goalId === 'string' ? parseFloat(goalId) : null);
    
    // Если ID задачи отсутствует, генерируем новый
    if (taskIdNum === null || isNaN(taskIdNum)) {
        taskIdNum = Math.floor(Date.now() + Math.random() * 1000);
        task.id = taskIdNum;
        
        // Сохраняем обновленную задачу - ищем по ссылке на объект
        const goals = getGoals();
        const goalIndex = goals.findIndex(g => g.id === goalIdNum);
        if (goalIndex !== -1) {
            const goal = goals[goalIndex];
            const dateIndex = goal.dates.findIndex(d => d.date === date);
            if (dateIndex !== -1) {
                // Ищем задачу по ссылке или по title и completed (более точное совпадение)
                const taskIndex = goal.dates[dateIndex].tasks.findIndex(t => 
                    (t === task) || (t.title === task.title && t.completed === task.completed && t.priority === task.priority && !t.id)
                );
                if (taskIndex !== -1) {
                    goal.dates[dateIndex].tasks[taskIndex].id = taskIdNum;
                    saveGoals(goals);
                }
            }
        }
    }
    
    checkbox.setAttribute('data-goal-id', String(goalIdNum));
    checkbox.setAttribute('data-date', String(date));
    checkbox.setAttribute('data-task-id', String(taskIdNum));
    
    if (task.completed) {
        checkbox.classList.add('checked');
    }
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskIdStr = checkbox.getAttribute('data-task-id');
        const goalIdStr = checkbox.getAttribute('data-goal-id');
        const dateAttr = checkbox.getAttribute('data-date');
        
        const taskId = parseFloat(taskIdStr);
        const goalIdAttr = parseFloat(goalIdStr);
        
        if (isNaN(taskId) || isNaN(goalIdAttr) || !dateAttr) {
            console.error('Invalid data attributes:', { taskId: taskIdStr, goalId: goalIdStr, date: dateAttr });
            return;
        }
        
        toggleTaskCompletion(goalIdAttr, dateAttr, taskId);
    });
    
    // Текст задачи
    const taskText = document.createElement('p');
    taskText.className = 'task-text';
    taskText.textContent = task.title;
    
    // Приоритет - молния
    const taskPriority = document.createElement('div');
    taskPriority.className = `task-priority priority-${task.priority}`;
    const priorityImages = {
        1: '/assets/images/icons/thunder-red.png', // Красная
        2: '/assets/images/icons/thunder-yellow.png', // Желтая
        3: '/assets/images/icons/thunder-blue.png'  // Синяя
    };
    const priorityImage = priorityImages[task.priority] || '/assets/images/icons/thunder-yellow.png';
    taskPriority.innerHTML = `<img src="${priorityImage}" alt="Приоритет ${task.priority}" width="16" height="16">`;
    
    // Действия (только в режиме редактирования)
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // Кнопка удаления задачи (всегда доступна)
    const deleteTaskBtn = document.createElement('button');
    deleteTaskBtn.className = 'task-action-btn';
    deleteTaskBtn.title = window.i18n ? window.i18n.t('plan.deleteTask') : 'Удалить задачу';
    deleteTaskBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    `;
    deleteTaskBtn.addEventListener('click', () => {
        deleteTask(goalId, date, task.id);
    });
    taskActions.appendChild(deleteTaskBtn);
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(taskPriority);
    taskItem.appendChild(taskActions);
    
    return taskItem;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const lang = localStorage.getItem('language') || 'ru';
    
    // Месяцы в родительном падеже для русского, в именительном для английского и испанского
    const months = {
        'ru': ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
               'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        'en': ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],
        'es': ['de enero', 'de febrero', 'de marzo', 'de abril', 'de mayo', 'de junio',
               'de julio', 'de agosto', 'de septiembre', 'de octubre', 'de noviembre', 'de diciembre']
    };
    
    const monthNames = months[lang] || months['ru'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    
    // Для английского: "January 28", для испанского: "28 de enero", для русского: "28 января"
    if (lang === 'en') {
        return `${month} ${day}`;
    } else if (lang === 'es') {
        return `${day} ${month}`;
    } else {
        return `${day} ${month}`;
    }
}

// Правильное склонение для "дата/даты"
function getDateWord(count) {
    const lang = localStorage.getItem('language') || 'ru';
    
    if (lang === 'en') {
        return count === 1 ? 'date' : 'dates';
    } else if (lang === 'es') {
        return count === 1 ? 'fecha' : 'fechas';
    }
    
    // Русский язык
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod100 >= 11 && mod100 <= 19) {
        return 'дат';
    }
    
    if (mod10 === 1) {
        return 'дата';
    }
    
    if (mod10 >= 2 && mod10 <= 4) {
        return 'даты';
    }
    
    return 'дат';
}

// Правильное склонение для "задача/задачи/задач"
function getTaskWord(count) {
    const lang = localStorage.getItem('language') || 'ru';
    
    if (lang === 'en') {
        return count === 1 ? 'task' : 'tasks';
    } else if (lang === 'es') {
        return count === 1 ? 'tarea' : 'tareas';
    }
    
    // Русский язык
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod100 >= 11 && mod100 <= 19) {
        return 'задач';
    }
    
    if (mod10 === 1) {
        return 'задача';
    }
    
    if (mod10 >= 2 && mod10 <= 4) {
        return 'задачи';
    }
    
    return 'задач';
}

// Настройка модального окна даты
function setupDateModal() {
    const dateModal = document.getElementById('date-modal-overlay');
    const dateInput = document.getElementById('date-input');
    const dateModalClose = document.getElementById('date-modal-close');
    const dateModalSave = document.getElementById('date-modal-save');
    
    if (dateModalClose) {
        dateModalClose.addEventListener('click', () => {
            closeDateModal();
        });
    }
    
    if (dateModalSave) {
        dateModalSave.addEventListener('click', () => {
            saveDate();
        });
    }
    
    if (dateModal) {
        dateModal.addEventListener('click', (e) => {
            if (e.target === dateModal) {
                closeDateModal();
            }
        });
    }
    
    if (dateInput) {
        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveDate();
            }
        });
        
        // Маска ввода для даты ДД.ММ.ГГГГ
        dateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Убираем все нецифровые символы
            
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
    }
}

let currentGoalIdForDate = null;

// Открытие модального окна даты
function openDateModal() {
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    currentGoalIdForDate = currentGoal.id;
    const dateModal = document.getElementById('date-modal-overlay');
    const dateInput = document.getElementById('date-input');
    
    if (dateModal && dateInput) {
        // Устанавливаем сегодняшнюю дату по умолчанию в формате ДД.ММ.ГГГГ
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        dateInput.value = `${day}.${month}.${year}`;
        dateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            dateInput.focus();
        }, 100);
    }
}

// Закрытие модального окна даты
function closeDateModal() {
    const dateModal = document.getElementById('date-modal-overlay');
    if (dateModal) {
        dateModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentGoalIdForDate = null;
}

// Сохранение даты
function saveDate() {
    const dateInput = document.getElementById('date-input');
    let dateValue = dateInput.value.trim();
    
    if (!dateValue) {
        alert('Введите дату');
        return;
    }
    
    // Парсим дату из формата ДД.ММ.ГГГГ в YYYY-MM-DD
    let formattedDate = dateValue;
    if (dateValue.includes('.')) {
        const parts = dateValue.split('.');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            formattedDate = `${year}-${month}-${day}`;
        }
    }
    
    // Валидация даты
    const date = new Date(formattedDate);
    if (isNaN(date.getTime())) {
        alert('Введите корректную дату в формате ДД.ММ.ГГГГ');
        return;
    }
    
    if (!currentGoalIdForDate) return;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === currentGoalIdForDate);
    
    if (goalIndex === -1) return;
    
    const goal = goals[goalIndex];
    
    // Проверяем, не существует ли уже такая дата
    if (goal.dates.find(d => d.date === date)) {
        alert('Эта дата уже добавлена');
        return;
    }
    
    // Сохраняем состояние режима редактирования
    const wasEditMode = isEditMode;
    
    // Добавляем новую дату
    goal.dates.push({
        date: date,
        tasks: []
    });
    
    saveGoals(goals);
    closeDateModal();
    
    // Восстанавливаем режим редактирования после перезагрузки
    loadGoals();
    if (wasEditMode) {
        setTimeout(() => {
            isEditMode = true;
            renderGoalConstructor(getCurrentGoal());
        }, 0);
    }
}

// Удаление даты
async function deleteDate(goalId, date) {
    const deleteDateConfirm = window.i18n ? window.i18n.t('plan.deleteDateConfirm') : 'Удалить дату и все задачи в ней?';
    const confirmed = await window.customModal?.confirm(deleteDateConfirm) || confirm(deleteDateConfirm);
    if (!confirmed) return;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return;
    
    goals[goalIndex].dates = goals[goalIndex].dates.filter(d => d.date !== date);
    saveGoals(goals);
    loadGoals();
}

// Настройка модального окна задачи
function setupTaskModal() {
    const taskModal = document.getElementById('task-modal-overlay');
    const taskNameInput = document.getElementById('task-name-input');
    const taskModalClose = document.getElementById('task-modal-close');
    const taskModalSave = document.getElementById('task-modal-save');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityInput = document.getElementById('task-priority-plan');
    
    // Обработчики приоритета
    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            priorityOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            if (priorityInput) {
                priorityInput.value = option.dataset.priority;
            }
        });
    });
    
    if (taskModalClose) {
        taskModalClose.addEventListener('click', () => {
            closeTaskModal();
        });
    }
    
    if (taskModalSave) {
        taskModalSave.addEventListener('click', () => {
            saveTask();
        });
    }
    
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }
    
    if (taskNameInput) {
        taskNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveTask();
            }
        });
    }
}

let currentGoalIdForTask = null;
let currentDateForTask = null;

// Открытие модального окна задачи
function openTaskModal(goalId, date) {
    currentGoalIdForTask = goalId;
    currentDateForTask = date;
    
    const taskModal = document.getElementById('task-modal-overlay');
    const taskNameInput = document.getElementById('task-name-input');
    const taskModalTitle = document.getElementById('task-modal-title');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityInput = document.getElementById('task-priority-plan');
    
    if (taskModal && taskNameInput && taskModalTitle) {
        taskNameInput.value = '';
        const addTaskText = window.i18n ? window.i18n.t('plan.addTask') : 'Добавить задачу';
        taskModalTitle.textContent = `${addTaskText} на ${formatDate(date)}`;
        
        // Устанавливаем приоритет 2 по умолчанию
        priorityOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.priority === '2') {
                option.classList.add('active');
            }
        });
        if (priorityInput) {
            priorityInput.value = '2';
        }
        
        taskModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            taskNameInput.focus();
        }, 100);
    }
}

// Закрытие модального окна задачи
function closeTaskModal() {
    const taskModal = document.getElementById('task-modal-overlay');
    if (taskModal) {
        taskModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentGoalIdForTask = null;
    currentDateForTask = null;
}

// Сохранение задачи
function saveTask() {
    const taskNameInput = document.getElementById('task-name-input');
    const title = taskNameInput.value.trim();
    
    if (!title) {
        alert('Введите название задачи');
        return;
    }
    
    if (!currentGoalIdForTask || !currentDateForTask) return;
    
    const priorityInput = document.getElementById('task-priority-plan');
    const priority = priorityInput ? parseInt(priorityInput.value) : 2;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === currentGoalIdForTask);
    
    if (goalIndex === -1) return;
    
    const goal = goals[goalIndex];
    const dateIndex = goal.dates.findIndex(d => d.date === currentDateForTask);
    
    if (dateIndex === -1) return;
    
    // Сохраняем состояние режима редактирования
    const wasEditMode = isEditMode;
    
    // Добавляем новую задачу
    goal.dates[dateIndex].tasks.push({
        id: Date.now(),
        title: title,
        priority: priority,
        completed: false
    });
    
    saveGoals(goals);
    closeTaskModal();
    
    // Восстанавливаем режим редактирования после перезагрузки
    loadGoals();
    if (wasEditMode) {
        setTimeout(() => {
            isEditMode = true;
            renderGoalConstructor(getCurrentGoal());
        }, 0);
    }
}

// Переключение выполнения задачи
function toggleTaskCompletion(goalId, date, taskId) {
    // Находим элемент задачи в DOM
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`)?.closest('.task-item');
    const checkbox = taskItem?.querySelector('.task-checkbox');
    
    if (!taskItem || !checkbox) {
        console.error('Task element not found in DOM');
        return;
    }
    
    const isChecked = checkbox.classList.contains('checked');
    const newCompletedStatus = !isChecked;
    
    // Обновляем визуальное состояние сразу (как в tasks.html)
    checkbox.classList.toggle('checked');
    taskItem.classList.toggle('completed');
    
    const taskText = taskItem.querySelector('.task-text');
    if (taskText) {
        if (newCompletedStatus) {
            taskText.style.textDecoration = 'line-through';
            taskText.style.opacity = '0.5';
        } else {
            taskText.style.textDecoration = 'none';
            taskText.style.opacity = '1';
        }
    }
    
    // Анимация чекбокса (как в tasks.html)
    checkbox.style.transform = 'scale(0.8)';
    setTimeout(() => {
        checkbox.style.transform = '';
    }, 200);
    
    // Сохраняем статус в localStorage
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
        console.error('Goal not found:', goalId);
        // Откатываем визуальные изменения
        checkbox.classList.toggle('checked');
        taskItem.classList.toggle('completed');
        if (taskText) {
            if (newCompletedStatus) {
                taskText.style.textDecoration = 'none';
                taskText.style.opacity = '1';
            } else {
                taskText.style.textDecoration = 'line-through';
                taskText.style.opacity = '0.5';
            }
        }
        return;
    }
    
    const goal = goals[goalIndex];
    const dateIndex = goal.dates.findIndex(d => d.date === date);
    
    if (dateIndex === -1) {
        console.error('Date not found:', date);
        // Откатываем визуальные изменения
        checkbox.classList.toggle('checked');
        taskItem.classList.toggle('completed');
        if (taskText) {
            if (newCompletedStatus) {
                taskText.style.textDecoration = 'none';
                taskText.style.opacity = '1';
            } else {
                taskText.style.textDecoration = 'line-through';
                taskText.style.opacity = '0.5';
            }
        }
        return;
    }
    
    // Убеждаемся, что taskId - это число
    const numericTaskId = typeof taskId === 'string' ? parseFloat(taskId) : taskId;
    
    // Ищем задачу по ID
    const taskIndex = goal.dates[dateIndex].tasks.findIndex(t => {
        const taskIdNum = typeof t.id === 'string' ? parseFloat(t.id) : t.id;
        return taskIdNum === numericTaskId;
    });
    
    if (taskIndex === -1) {
        console.error('Task not found:', taskId);
        // Откатываем визуальные изменения
        checkbox.classList.toggle('checked');
        taskItem.classList.toggle('completed');
        if (taskText) {
            if (newCompletedStatus) {
                taskText.style.textDecoration = 'none';
                taskText.style.opacity = '1';
            } else {
                taskText.style.textDecoration = 'line-through';
                taskText.style.opacity = '0.5';
            }
        }
        return;
    }
    
    // Обновляем статус в данных
    goal.dates[dateIndex].tasks[taskIndex].completed = newCompletedStatus;
    
    // Сохраняем без перерисовки всего списка
    saveGoals(goals);
    
    // Обновляем прогресс цели без полной перерисовки
    updateGoalProgress(goal);
}

// Удаление задачи
async function deleteTask(goalId, date, taskId) {
    const deleteTaskConfirm = window.i18n ? window.i18n.t('plan.deleteTaskConfirm') : 'Удалить задачу?';
    const confirmed = await window.customModal?.confirm(deleteTaskConfirm) || confirm(deleteTaskConfirm);
    if (!confirmed) return;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return;
    
    const goal = goals[goalIndex];
    const dateIndex = goal.dates.findIndex(d => d.date === date);
    
    if (dateIndex === -1) return;
    
    goal.dates[dateIndex].tasks = goal.dates[dateIndex].tasks.filter(t => t.id !== taskId);
    
    saveGoals(goals);
    loadGoals();
}

// Обновление прогресса цели
function updateGoalProgress(goal) {
    let totalTasks = 0;
    let completedTasks = 0;
    
    goal.dates.forEach(dateData => {
        totalTasks += dateData.tasks.length;
        completedTasks += dateData.tasks.filter(t => t.completed).length;
    });
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
}

// Настройка модального окна редактирования цели
function setupEditGoalModal() {
    const editModal = document.getElementById('goal-edit-modal-overlay');
    const editInput = document.getElementById('goal-edit-input');
    const editModalClose = document.getElementById('goal-edit-modal-close');
    const editModalCancel = document.getElementById('goal-edit-modal-cancel');
    const editModalSave = document.getElementById('goal-edit-modal-save');
    
    if (editModalClose) {
        editModalClose.addEventListener('click', () => {
            closeEditGoalModal();
        });
    }
    
    if (editModalCancel) {
        editModalCancel.addEventListener('click', () => {
            closeEditGoalModal();
        });
    }
    
    if (editModalSave) {
        editModalSave.addEventListener('click', () => {
            saveEditGoal();
        });
    }
    
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditGoalModal();
            }
        });
    }
    
    if (editInput) {
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEditGoal();
            }
        });
    }
}

// Открытие модального окна редактирования цели
// Переменная для отслеживания режима редактирования
let isEditMode = false;

// Функция для сброса режима редактирования
function resetEditMode() {
    isEditMode = false;
}

// Переключение режима редактирования плана
function toggleEditMode() {
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        // Включаем режим редактирования
        enableEditMode(currentGoal);
    } else {
        // Выключаем режим редактирования
        disableEditMode(currentGoal);
    }
    
    // Перерисовываем план с учетом режима редактирования
    renderGoalConstructor(currentGoal);
}

// Включение режима редактирования
function enableEditMode(goal) {
    // Включаем редактирование названия
    const goalTitle = document.getElementById('goal-title');
    if (goalTitle) {
        goalTitle.classList.add('editing');
        goalTitle.innerHTML = `<input type="text" value="${goal.title}" class="goal-title-input" maxlength="100">`;
        const input = goalTitle.querySelector('input');
        if (input) {
            setTimeout(() => {
                input.focus();
                input.select();
            }, 10);
        }
    }
    
    // Показываем кнопку "Сохранить"
    const savePlanBtn = document.getElementById('save-plan-btn');
    if (savePlanBtn) {
        savePlanBtn.style.display = 'flex';
    }
    
    // Скрываем прогресс
    const goalProgress = document.getElementById('goal-progress');
    if (goalProgress) {
        goalProgress.style.display = 'none';
    }
    
    // Показываем кнопку "Добавить дату"
    const addDateBtn = document.getElementById('add-date-btn');
    if (addDateBtn) {
        addDateBtn.style.display = 'flex';
    }
}

// Выключение режима редактирования
function disableEditMode(goal) {
    // Сохраняем изменения названия
    const goalTitle = document.getElementById('goal-title');
    if (goalTitle && goalTitle.classList.contains('editing')) {
        const input = goalTitle.querySelector('input');
        if (input) {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== goal.title) {
                const goals = getGoals();
                const goalIndex = goals.findIndex(g => g.id === goal.id);
                if (goalIndex !== -1) {
                    goals[goalIndex].title = newTitle;
                    saveGoals(goals);
                }
            }
        }
        goalTitle.classList.remove('editing');
        goalTitle.textContent = goal.title;
    }
    
    // Скрываем кнопку "Сохранить"
    const savePlanBtn = document.getElementById('save-plan-btn');
    if (savePlanBtn) {
        savePlanBtn.style.display = 'none';
    }
    
    // Показываем прогресс
    const goalProgress = document.getElementById('goal-progress');
    if (goalProgress) {
        goalProgress.style.display = 'flex';
    }
    
    // Скрываем кнопку "Добавить дату"
    const addDateBtn = document.getElementById('add-date-btn');
    if (addDateBtn) {
        addDateBtn.style.display = 'none';
    }
}

// Переключение режима редактирования названия цели (старая функция, оставлена для совместимости)
function toggleGoalTitleEdit() {
    // Эта функция больше не используется, но оставлена для совместимости
}

function openEditGoalModal() {
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    const editModal = document.getElementById('goal-edit-modal-overlay');
    const editInput = document.getElementById('goal-edit-input');
    
    if (editModal && editInput) {
        editInput.value = currentGoal.title;
        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            editInput.focus();
            editInput.select();
        }, 100);
    }
}

// Закрытие модального окна редактирования цели
function closeEditGoalModal() {
    const editModal = document.getElementById('goal-edit-modal-overlay');
    if (editModal) {
        editModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Сохранение редактирования цели
function saveEditGoal() {
    const editInput = document.getElementById('goal-edit-input');
    const title = editInput.value.trim();
    
    if (!title) {
        const enterGoalName = window.i18n ? window.i18n.t('plan.goalPlaceholder') : 'Введите название цели';
        alert(enterGoalName);
        return;
    }
    
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === currentGoal.id);
    
    if (goalIndex === -1) return;
    
    goals[goalIndex].title = title;
    saveGoals(goals);
    closeEditGoalModal();
    loadGoals();
}

// Удаление текущей цели
async function deleteCurrentGoal() {
    const deleteGoalConfirm = window.i18n ? window.i18n.t('plan.deleteConfirm') : 'Удалить цель и все связанные данные?';
    const confirmed = await window.customModal?.confirm(deleteGoalConfirm) || confirm(deleteGoalConfirm);
    if (!confirmed) return;
    
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    const goals = getGoals();
    const filtered = goals.filter(g => g.id !== currentGoal.id);
    saveGoals(filtered);
    loadGoals();
}

// Сохранение плана
function savePlan() {
    const currentGoal = getCurrentGoal();
    if (!currentGoal) return;
    
    if (currentGoal.dates.length === 0) {
        const alertText = window.i18n ? window.i18n.t('plan.addDateFirst') : 'Добавьте хотя бы одну дату с задачами';
        alert(alertText);
        return;
    }
    
    // Сохраняем изменения названия, если было редактирование
    if (isEditMode) {
        disableEditMode(currentGoal);
    }
    
    // Проверяем, что есть хотя бы одна задача
    let hasTasks = false;
    currentGoal.dates.forEach(dateData => {
        if (dateData.tasks.length > 0) {
            hasTasks = true;
        }
    });
    
    if (!hasTasks) {
        alert('Добавьте хотя бы одну задачу');
        return;
    }
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === currentGoal.id);
    
    if (goalIndex === -1) return;
    
    // Сохраняем план
    goals[goalIndex].isSaved = true;
    goals[goalIndex].isActive = false;
    goals[goalIndex].savedAt = new Date().toISOString();
    
    // Выключаем режим редактирования
    isEditMode = false;
    
    saveGoals(goals);
    
    // Показываем сообщение об успехе
    const successText = window.i18n ? window.i18n.t('plan.saveSuccess') : 'План успешно сохранен!';
    alert(successText);
    
    // Перезагружаем страницу для показа списка сохраненных планов
    loadGoals();
}

// Создание нового плана
function createNewPlan() {
    // Выключаем режим редактирования
    isEditMode = false;
    
    const goals = getGoals();
    
    // Деактивируем все цели
    goals.forEach(g => {
        g.isActive = false;
    });
    
    // Очищаем текущую цель
    localStorage.removeItem('current_goal_id');
    
    saveGoals(goals);
    
    // Показываем форму создания напрямую
    const goalCreation = document.getElementById('goal-creation');
    const goalConstructor = document.getElementById('goal-constructor');
    const savedPlans = document.getElementById('saved-plans');
    const goalsList = document.getElementById('goals-list');
    const emptyState = document.getElementById('empty-state');
    
    if (goalCreation) goalCreation.style.display = 'block';
    if (goalConstructor) goalConstructor.style.display = 'none';
    if (savedPlans) savedPlans.style.display = 'none';
    if (goalsList) goalsList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}

// Рендеринг списка сохраненных планов
function renderSavedPlans(savedGoals) {
    const savedPlansList = document.getElementById('saved-plans-list');
    if (!savedPlansList) return;
    
    savedPlansList.innerHTML = '';
    
    // Сортируем по дате сохранения (новые сверху)
    const sortedGoals = [...savedGoals].sort((a, b) => {
        const dateA = a.savedAt ? new Date(a.savedAt) : new Date(a.createdAt);
        const dateB = b.savedAt ? new Date(b.savedAt) : new Date(b.createdAt);
        return dateB - dateA;
    });
    
    sortedGoals.forEach(goal => {
        const planCard = document.createElement('div');
        planCard.className = 'saved-plan-card';
        
        const planHeader = document.createElement('div');
        planHeader.className = 'saved-plan-header';
        
        const planTitle = document.createElement('h3');
        planTitle.className = 'saved-plan-title';
        planTitle.textContent = goal.title;
        
        // Подсчитываем статистику
        let totalTasks = 0;
        let completedTasks = 0;
        let totalDates = goal.dates.length;
        
        goal.dates.forEach(dateData => {
            totalTasks += dateData.tasks.length;
            completedTasks += dateData.tasks.filter(t => t.completed).length;
        });
        
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Правильное склонение для "дата/даты"
        const dateWord = getDateWord(totalDates);
        // Правильное склонение для "задача/задачи/задач"
        const taskWord = getTaskWord(totalTasks);
        
        const planMeta = document.createElement('p');
        planMeta.className = 'saved-plan-meta';
        planMeta.textContent = `${totalDates} ${dateWord}, ${totalTasks} ${taskWord}`;
        
        planHeader.appendChild(planTitle);
        planHeader.appendChild(planMeta);
        
        // Прогресс
        const planProgress = document.createElement('div');
        planProgress.className = 'saved-plan-progress';
        planProgress.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}%</span>
        `;
        
        planCard.appendChild(planHeader);
        planCard.appendChild(planProgress);
        
        // Клик по карточке открывает план для выполнения
        planCard.addEventListener('click', () => {
            openPlanForExecution(goal.id);
        });
        
        savedPlansList.appendChild(planCard);
    });
}

// Открытие плана для выполнения
function openPlanForExecution(goalId) {
    // Выключаем режим редактирования при открытии плана
    isEditMode = false;
    
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return;
    
    // Активируем план
    goals.forEach(g => {
        g.isActive = g.id === goalId;
    });
    
    saveGoals(goals);
    loadGoals();
}

// Удаление цели
function deleteGoal(goalId) {
    const goals = getGoals();
    const filtered = goals.filter(g => g.id !== goalId);
    saveGoals(filtered);
    loadGoals();
}

// Возврат к списку планов
function goBackToPlansList() {
    const goals = getGoals();
    
    // Деактивируем текущую цель
    goals.forEach(g => {
        g.isActive = false;
    });
    
    saveGoals(goals);
    loadGoals();
}

// Рендеринг списка целей
function renderGoalsList(goals) {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    
    goalsList.innerHTML = '';
    
    goals.forEach(goal => {
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        
        const goalTitle = document.createElement('h3');
        goalTitle.className = 'goal-card-title';
        goalTitle.textContent = goal.title;
        
        // Подсчитываем прогресс
        let totalTasks = 0;
        let completedTasks = 0;
        goal.dates.forEach(dateData => {
            totalTasks += dateData.tasks.length;
            completedTasks += dateData.tasks.filter(t => t.completed).length;
        });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const goalProgress = document.createElement('p');
        goalProgress.className = 'goal-card-progress';
        goalProgress.textContent = `Прогресс: ${progress}% (${completedTasks}/${totalTasks} задач)`;
        
        goalCard.appendChild(goalTitle);
        goalCard.appendChild(goalProgress);
        
        goalCard.addEventListener('click', () => {
            setCurrentGoal(goal.id);
            loadGoals();
        });
        
        goalsList.appendChild(goalCard);
    });
}

// Обновление пустого состояния
function updateEmptyState() {
    const goals = getGoals();
    const emptyState = document.getElementById('empty-state');
    
    if (emptyState) {
        if (goals.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
}
