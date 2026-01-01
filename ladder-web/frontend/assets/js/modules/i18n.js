// Модуль интернационализации (i18n)
// Поддержка русского, английского и испанского языков

const translations = {
    ru: {
        // Общие
        'common.back': 'Назад',
        'common.save': 'Сохранить',
        'common.cancel': 'Отмена',
        'common.delete': 'Удалить',
        'common.edit': 'Редактировать',
        'common.rename': 'Переименовать',
        'common.share': 'Поделиться',
        'common.close': 'Закрыть',
        'common.add': 'Добавить',
        'common.settings': 'Настройки',
        'common.menu': 'Меню',
        
        // Задачи
        'tasks.title': 'Задачи',
        'tasks.add': 'Добавить задачу',
        'tasks.empty': 'Нет задач на этот день',
        'tasks.completed': 'Выполнено',
        'tasks.today': 'Сегодня у вас',
        'tasks.priority': 'Приоритет',
        'tasks.description': 'Описание',
        'tasks.date': 'Дата',
        'tasks.create': 'Создать задачу',
        'tasks.edit': 'Редактировать задачу',
        'tasks.delete': 'Удалить задачу',
        'tasks.deleteConfirm': 'Удалить задачу?',
        'tasks.rename': 'Переименовать задачу',
        'tasks.new': 'Новая задача',
        'tasks.editTask': 'Редактировать задачу',
        'tasks.loadError': 'Ошибка загрузки задач',
        'tasks.name': 'Название',
        'tasks.namePlaceholder': 'Введите название задачи',
        'tasks.descriptionPlaceholder': 'Введите описание задачи (необязательно)',
        'tasks.singleDay': 'Один день',
        'tasks.range': 'Период',
        'tasks.selectDate': 'Выберите дату',
        'tasks.selectPeriod': 'Выберите период',
        'tasks.selectStartDate': 'Выберите начальную дату',
        'tasks.selectEndDate': 'Выберите конечную дату',
        'tasks.from': 'С',
        'tasks.to': 'По',
        'tasks.update': 'Обновить',
        'tasks.datePickerTitle': 'Выберите дату',
        'tasks.copied': 'Скопировано в буфер обмена',
        'tasks.shareWithUser': 'Поделиться с пользователем?',
        'tasks.shareWith': 'Поделиться с',
        'tasks.shareDescription': 'Вы можете поделиться своей задачей с другим человеком',
        'tasks.shareEmailPlaceholder': 'email@example.com',
        
        // Заметки
        'notes.title': 'Заметки',
        'notes.add': 'Добавить заметку',
        'notes.empty': 'Добавьте стикер с заметкой',
        'notes.attach': 'Прикрепить',
        'notes.edit': 'Редактировать',
        'notes.delete': 'Удалить',
        'notes.color': 'Цвет',
        'notes.lock': 'Заблокировать',
        'notes.unlock': 'Разблокировать',
        'notes.align': 'Выровнять',
        
        // План
        'plan.title': 'План',
        'plan.createGoal': 'Создайте новую цель',
        'plan.createGoalSubtitle': 'Введите название цели, чтобы начать планирование',
        'plan.create': 'Создать',
        'plan.goalPlaceholder': 'Например: Подготовка к марафону',
        'plan.editing': 'Редактирование',
        'plan.saved': 'Сохранен',
        'plan.save': 'Сохранить',
        'plan.editGoal': 'Редактировать цель',
        'plan.deleteGoal': 'Удалить цель',
        'plan.back': 'Вернуться к списку планов',
        'plan.savePlan': 'Сохранить план',
        'plan.deleteConfirm': 'Удалить цель и все связанные данные?',
        'plan.addDate': 'Добавить дату',
        'plan.addTask': 'Добавить задачу',
        'plan.selectDate': 'Выберите дату',
        'plan.taskName': 'Название задачи',
        'plan.priority': 'Приоритет',
        'plan.priorityHigh': 'Высокий',
        'plan.priorityMedium': 'Средний',
        'plan.priorityLow': 'Низкий',
        'plan.savedPlans': 'Список планов',
        'plan.createNew': 'Создать',
        'plan.empty': 'Создайте первую цель для начала планирования',
        'plan.deleteDate': 'Удалить дату',
        'plan.deleteDateConfirm': 'Удалить дату и все задачи в ней?',
        'plan.deleteTask': 'Удалить задачу',
        'plan.deleteTaskConfirm': 'Удалить задачу?',
        'plan.dates': 'дат',
        'plan.tasks': 'задач',
        'plan.date': 'дата',
        'plan.task': 'задача',
        'plan.taskPlural1': 'задачи',
        'plan.taskPlural2': 'задач',
        'plan.datePlural1': 'даты',
        'plan.datePlural2': 'дат',
        
        // Чат
        'chat.title': 'Чат с AI',
        'chat.placeholder': 'Введите сообщение...',
        'chat.send': 'Отправить',
        'chat.you': 'Я',
        'chat.ai': 'AI',
        'chat.loading': 'Загрузка...',
        'chat.error': 'Ошибка при отправке сообщения',
        
        // AI Меню
        'ai.menu.title': 'Выберите тип проекта',
        'ai.menu.subtitle': 'Создайте обычный проект или используйте ИИ для автоматического планирования',
        'ai.menu.chat.title': 'Чат с AI',
        'ai.menu.chat.description': 'Общайтесь с AI и получайте помощь',
        'ai.menu.plan.title': 'AI создание плана',
        'ai.menu.plan.description': 'AI создаст план автоматически',
        
        // GPT План
        'gpt.title': 'GPT План',
        'gpt.description': 'Создайте план проекта с помощью нейросети. Опишите вашу цель, и AI разобьет её на шаги и задачи.',
        'gpt.planName': 'Название плана',
        'gpt.goalDescription': 'Описание цели',
        'gpt.startDate': 'С какого дня начинать план?',
        'gpt.daysCount': 'На сколько дней разбить план?',
        'gpt.weekends': 'Выходные дни',
        'gpt.mon': 'Пн',
        'gpt.tue': 'Вт',
        'gpt.wed': 'Ср',
        'gpt.thu': 'Чт',
        'gpt.fri': 'Пт',
        'gpt.sat': 'Сб',
        'gpt.sun': 'Вс',
        'gpt.generate': 'Сгенерировать',
        'gpt.generating': 'Генерация плана',
        'gpt.edit': 'Редактировать',
        'gpt.save': 'Сохранить',
        'gpt.regenerate': 'Сгенерировать еще',
        'gpt.enterPlanName': 'Введите название плана',
        'gpt.enterGoalDescription': 'Опишите вашу цель',
        'gpt.goalDescriptionPlaceholder': 'Опишите вашу цель подробно. Чем больше деталей, тем точнее будет план...',
        'common.continue': 'Продолжить',
        
        // Настройки
        'settings.title': 'Настройки',
        'settings.profile': 'Профиль',
        'settings.name': 'Имя',
        'settings.nameDesc': 'Как к вам обращаться',
        'settings.enterName': 'Введите имя',
        'settings.email': 'Email',
        'settings.emailDesc': 'Для уведомлений',
        'settings.subscription': 'ПОДПИСКА',
        'settings.currentPlan': 'Текущий тариф',
        'settings.free': 'Бесплатный',
        'settings.pro': 'Basic',
        'settings.moreFeatures': 'Оформи Pro, чтобы получить больше',
        'settings.upgrade': 'Обновить',
        'settings.changePhoto': 'Изменить фото',
        'settings.appearance': 'Внешний вид',
        'settings.theme': 'Тема',
        'settings.themeDesc': 'Светлая или темная',
        'settings.themeLight': 'Светлая',
        'settings.themeDark': 'Темная',
        'settings.language': 'Язык',
        'settings.languageDesc': 'Язык интерфейса',
        'settings.notifications': 'Уведомления',
        'settings.notificationsDesc': 'Получать уведомления о задачах',
        'settings.emailNotifications': 'Email уведомления',
        'settings.emailNotificationsDesc': 'Получать уведомления на email',
        'settings.about': 'О приложении',
        'settings.version': 'Версия',
        'settings.save': 'Сохранить изменения',
        'settings.saved': 'Сохранено!',
        
        // Сайдбар
        'sidebar.chat': 'Чат с AI',
        'sidebar.tasks': 'Задачи',
        'sidebar.notes': 'Заметки',
        'sidebar.gpt': 'GPT План',
        'sidebar.plan': 'План',
        'sidebar.info': 'Информация',
        'sidebar.support': 'Поддержка',
        'sidebar.suggest': 'Предложить идею',
        'sidebar.about': 'О нас',
        
        // Предложение идей
        'suggest.title': 'Предложить идею',
        'suggest.subtitle': 'Поделитесь своими идеями для улучшения приложения',
        'suggest.titleLabel': 'Название идеи',
        'suggest.titlePlaceholder': 'Краткое описание идеи',
        'suggest.descriptionLabel': 'Описание',
        'suggest.descriptionPlaceholder': 'Подробно опишите вашу идею',
        'suggest.emailLabel': 'Email (необязательно)',
        'suggest.emailPlaceholder': 'your@email.com',
        'suggest.submit': 'Отправить',
        'suggest.success': 'Спасибо! Ваша идея отправлена.',
        'suggest.fillFields': 'Заполните все обязательные поля',
        
        // Информация о приложении
        'info.title': 'Информация',
        'info.aboutApp.title': 'О приложении',
        'info.aboutApp.description': 'Ladder — это современное приложение для управления задачами и целями, которое помогает вам организовать свою жизнь и достигать поставленных целей. Мы объединили простоту использования с мощными функциями искусственного интеллекта, чтобы сделать планирование максимально эффективным.',
        'info.advantages.title': 'Почему Ladder?',
        'info.advantages.ai.title': 'Искусственный интеллект',
        'info.advantages.ai.text': 'AI помогает создавать планы, отвечает на вопросы о задачах и предлагает решения. В отличие от конкурентов, наш AI понимает контекст и работает на русском, английском и испанском языках.',
        'info.advantages.goals.title': 'Умное планирование',
        'info.advantages.goals.text': 'Создавайте многоэтапные цели с автоматическим разбиением на задачи. AI анализирует вашу цель и создает детальный план с учетом выходных дней и даты начала.',
        'info.advantages.workspaces.title': 'Рабочие пространства',
        'info.advantages.workspaces.text': 'Создавайте личные и совместные пространства для работы над проектами. Приглашайте друзей и коллег, делитесь заметками и изображениями. Многие приложения не поддерживают совместную работу.',
        'info.advantages.multilang.title': 'Многоязычность',
        'info.advantages.multilang.text': 'Полная поддержка русского, английского и испанского языков. Интерфейс, AI-ответы и все функции работают на вашем языке. Большинство конкурентов ограничены одним языком.',
        'info.advantages.design.title': 'Элегантный дизайн',
        'info.advantages.design.text': 'Минималистичный интерфейс в черно-белой гамме с красными акцентами. Каждый элемент продуман для максимального удобства. Динамические фоны меняются в зависимости от времени суток.',
        'info.pages.title': 'Страницы приложения',
        'info.pages.tasks.title': 'Задачи',
        'info.pages.tasks.description': 'Главная страница для управления вашими задачами. Здесь вы видите задачи на выбранный день, можете создавать новые, редактировать существующие и отмечать выполненные.',
        'info.pages.tasks.calendar': 'Календарь недели',
        'info.pages.tasks.create': 'Создание задач',
        'info.pages.tasks.complete': 'Отметка выполнения',
        'info.pages.tasks.stats': 'Статистика дня',
        'info.pages.plan.title': 'План',
        'info.pages.plan.description': 'Конструктор целей и планов. Создавайте многоэтапные цели, разбивайте их на задачи с приоритетами и отслеживайте прогресс выполнения.',
        'info.pages.plan.goals': 'Создание целей',
        'info.pages.plan.tasks': 'Задачи в плане',
        'info.pages.plan.priority': 'Приоритеты задач',
        'info.pages.plan.progress': 'Прогресс выполнения',
        'info.pages.gpt.title': 'GPT План',
        'info.pages.gpt.description': 'Уникальная функция создания планов с помощью искусственного интеллекта. Опишите свою цель, и AI создаст детальный план с задачами, приоритетами и датами.',
        'info.pages.gpt.describe': 'Описание цели',
        'info.pages.gpt.startDate': 'Выбор даты начала',
        'info.pages.gpt.weekends': 'Выходные дни',
        'info.pages.gpt.generate': 'Генерация плана',
        'info.pages.chat.title': 'Чат с AI',
        'info.pages.chat.description': 'Интеллектуальный помощник, который отвечает на вопросы о ваших задачах, помогает создавать новые задачи и заметки, ищет задачи по ключевым словам и датам.',
        'info.pages.chat.questions': 'Вопросы о задачах',
        'info.pages.chat.search': 'Поиск задач',
        'info.pages.chat.create': 'Создание через AI',
        'info.pages.chat.notes': 'Создание заметок',
        'info.pages.notes.title': 'Заметки',
        'info.pages.notes.description': 'Доска для заметок и изображений. Создавайте текстовые заметки, загружайте изображения, организуйте их в пространствах и работайте вместе с другими пользователями.',
        'info.pages.notes.text': 'Текстовые заметки',
        'info.pages.notes.images': 'Изображения',
        'info.pages.notes.workspaces': 'Рабочие пространства',
        'info.pages.notes.share': 'Совместная работа',
        'info.navigation.title': 'Навигация',
        'info.navigation.description': 'Нижняя панель навигации позволяет быстро переключаться между основными разделами приложения.',
        'info.navigation.tasks': 'Задачи',
        'info.navigation.tasksDesc': 'Переход на главную страницу с задачами',
        'info.navigation.gpt': 'GPT',
        'info.navigation.gptDesc': 'Открывает меню выбора: Чат с AI или AI создание плана',
        'info.navigation.add': 'Добавить',
        'info.navigation.addDesc': 'Центральная кнопка для быстрого создания задач',
        'info.navigation.plan': 'План',
        'info.navigation.planDesc': 'Переход к конструктору целей и планов',
        'info.navigation.notes': 'Заметки',
        'info.navigation.notesDesc': 'Переход к доске заметок и изображений',
        'info.features.title': 'Ключевые функции',
        'info.features.greeting.title': 'Приветственная панель',
        'info.features.greeting.text': 'Динамическая панель с приветствием, статистикой задач и красивыми фонами, меняющимися в зависимости от времени суток.',
        'info.features.priority.title': 'Система приоритетов',
        'info.features.priority.text': 'Три уровня приоритета задач с визуальными индикаторами: красная молния (P1), желтая (P2), синяя (P3).',
        'info.features.calendar.title': 'Умный календарь',
        'info.features.calendar.text': 'Календарь с фиксированным размером, поддержкой диапазонов дат и удобной навигацией по месяцам.',
        'info.features.customization.title': 'Настройка',
        'info.features.customization.text': 'Выбор языка интерфейса, загрузка аватара, настройка приложения под свои потребности.',
        
        // Навигация
        'nav.tasks': 'Задачи',
        'nav.notes': 'Заметки',
        'nav.plan': 'План',
        'nav.gpt': 'GPT',
        
        // Приветствие
        'greeting.morning': 'Доброе утро',
        'greeting.day': 'Добрый день',
        'greeting.evening': 'Добрый вечер',
        'greeting.night': 'Доброй ночи',
        'greeting.today': 'Сегодня у вас',
        'greeting.completed': 'Выполнено',
        'greeting.task': 'задача',
        'greeting.tasks': 'задачи',
        'greeting.tasksGenitive': 'задач',
        
        // Модальные окна
        'modal.newTheme': 'Новая тема',
        'modal.editTheme': 'Редактировать тему',
        'modal.newSubtheme': 'Новая подтема',
        'modal.editSubtheme': 'Редактировать подтему',
        'modal.themeName': 'Название темы',
        'modal.subthemeName': 'Название подтемы',
        'modal.enterThemeName': 'Введите название темы',
        'modal.enterSubthemeName': 'Введите название подтемы',
        'modal.deleteTheme': 'Удалить тему',
        'modal.deleteThemeConfirm': 'Удалить тему и все её подтемы?',
        'modal.deleteSubtheme': 'Удалить подтему',
        'modal.deleteSubthemeConfirm': 'Удалить подтему?',
        
        // Статистика
        'stats.total': 'Всего тем',
        'stats.completed': 'Выполнено',
        'stats.inProgress': 'В процессе',
        'stats.progress': 'Прогресс',
        
        // Дни недели
        'weekday.mon': 'Пн',
        'weekday.tue': 'Вт',
        'weekday.wed': 'Ср',
        'weekday.thu': 'Чт',
        'weekday.fri': 'Пт',
        'weekday.sat': 'Сб',
        'weekday.sun': 'Вс',
        
        // Месяцы в родительном падеже (для дат)
        'month.gen.january': 'января',
        'month.gen.february': 'февраля',
        'month.gen.march': 'марта',
        'month.gen.april': 'апреля',
        'month.gen.may': 'мая',
        'month.gen.june': 'июня',
        'month.gen.july': 'июля',
        'month.gen.august': 'августа',
        'month.gen.september': 'сентября',
        'month.gen.october': 'октября',
        'month.gen.november': 'ноября',
        'month.gen.december': 'декабря',
        
        // Месяцы в родительном падеже (для дат)
        'month.gen.january': 'января',
        'month.gen.february': 'февраля',
        'month.gen.march': 'марта',
        'month.gen.april': 'апреля',
        'month.gen.may': 'мая',
        'month.gen.june': 'июня',
        'month.gen.july': 'июля',
        'month.gen.august': 'августа',
        'month.gen.september': 'сентября',
        'month.gen.october': 'октября',
        'month.gen.november': 'ноября',
        'month.gen.december': 'декабря',
        
        // Workspace
        'workspace.title': 'Пространства',
        
        // Месяцы
        'month.january': 'Январь',
        'month.february': 'Февраль',
        'month.march': 'Март',
        'month.april': 'Апрель',
        'month.may': 'Май',
        'month.june': 'Июнь',
        'month.july': 'Июль',
        'month.august': 'Август',
        'month.september': 'Сентябрь',
        'month.october': 'Октябрь',
        'month.november': 'Ноябрь',
        'month.december': 'Декабрь',
        
        // Сокращенные названия месяцев
        'month.short.january': 'янв.',
        'month.short.february': 'фев.',
        'month.short.march': 'мар.',
        'month.short.april': 'апр.',
        'month.short.may': 'май',
        'month.short.june': 'июн.',
        'month.short.july': 'июл.',
        'month.short.august': 'авг.',
        'month.short.september': 'сен.',
        'month.short.october': 'окт.',
        'month.short.november': 'ноя.',
        'month.short.december': 'дек.',
        
        // Модальные окна подтверждения
        'modal.confirm': 'Подтвердить',
        'modal.cancel': 'Отмена',
        'modal.deleteTask': 'Вы уверены, что хотите удалить эту задачу?',
        'modal.deleteNote': 'Удалить заметку?',
        'modal.deleteImage': 'Удалить картинку?',
        'modal.deleteWorkspace': 'Удалить пространство? Все стикеры будут удалены.',
        'modal.enterTaskTitle': 'Пожалуйста, введите название задачи',
        
        // Workspace
        'workspace.invite': 'Пригласить участника',
        'workspace.inviteText': 'Поделитесь ссылкой с человеком, которого хотите пригласить',
        'workspace.create': 'Создать новое пространство',
        'workspace.createNew': 'Создать',
        'workspace.edit': 'Редактировать пространство',
        'workspace.name': 'Название пространства',
        'workspace.created': 'Пространство создано!',
        'workspace.renamed': 'Пространство переименовано!',
        'workspace.personal': 'Личное пространство',
        'workspace.members': 'Участники',
        'workspace.cannotInvitePersonal': 'Нельзя пригласить в личное пространство. Создайте новое пространство для совместной работы.',
        'workspace.linkCopied': 'Ссылка скопирована!',
        'workspace.linkCopyError': 'Ошибка при копировании ссылки',
        'workspace.delete': 'Удалить',
        'workspace.editTitle': 'Редактировать',
        
        // Редактор заметок
        'editor.bold': 'Жирный',
        'editor.italic': 'Курсив',
        'editor.underline': 'Подчеркнутый',
        'editor.strikethrough': 'Зачеркнутый',
        'editor.align': 'Выровнять стикеры',
        'editor.save': 'Сохранить картинку'
    },
    en: {
        // Common
        'common.loading': 'Loading...',
        'common.back': 'Back',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.rename': 'Rename',
        'common.close': 'Close',
        'common.add': 'Add',
        'common.settings': 'Settings',
        'common.menu': 'Menu',
        
        // Tasks
        'tasks.title': 'Tasks',
        'tasks.loadError': 'Error loading tasks',
        'tasks.new': 'New task',
        'tasks.editTask': 'Edit task',
        'tasks.name': 'Name',
        'tasks.namePlaceholder': 'Enter task name',
        'tasks.descriptionPlaceholder': 'Enter task description (optional)',
        'tasks.date': 'Date',
        'tasks.singleDay': 'One day',
        'tasks.range': 'Range',
        'tasks.selectDate': 'Select date',
        'tasks.selectPeriod': 'Select period',
        'tasks.selectStartDate': 'Select start date',
        'tasks.selectEndDate': 'Select end date',
        'tasks.from': 'From',
        'tasks.to': 'To',
        'tasks.create': 'Create',
        'tasks.update': 'Update',
        'tasks.datePickerTitle': 'Select date',
        'tasks.add': 'Add task',
        'tasks.empty': 'No tasks for this date',
        'tasks.completed': 'Completed',
        'tasks.today': 'Today you have',
        'tasks.priority': 'Priority',
        'tasks.description': 'Description',
        'tasks.date': 'Date',
        'tasks.create': 'Create task',
        'tasks.edit': 'Edit task',
        'tasks.delete': 'Delete task',
        'tasks.deleteConfirm': 'Delete task?',
        'tasks.rename': 'Rename task',
        
        // Notes
        'notes.title': 'Notes',
        'notes.add': 'Add note',
        'notes.empty': 'Add a note sticker',
        'notes.attach': 'Attach',
        'notes.edit': 'Edit',
        'notes.delete': 'Delete',
        'notes.color': 'Color',
        'notes.lock': 'Lock',
        'notes.unlock': 'Unlock',
        'notes.align': 'Align',
        
        // Plan
        'plan.title': 'Plan',
        'plan.createGoal': 'Create a new goal',
        'plan.createGoalSubtitle': 'Enter the goal name to start planning',
        'plan.create': 'Create',
        'plan.goalPlaceholder': 'For example: Marathon training',
        'plan.editing': 'Editing',
        'plan.saved': 'Saved',
        'plan.save': 'Save',
        'plan.editGoal': 'Edit goal',
        'plan.deleteGoal': 'Delete goal',
        'plan.back': 'Back to plans list',
        'plan.savePlan': 'Save plan',
        'plan.deleteConfirm': 'Delete goal and all related data?',
        'plan.addDate': 'Add date',
        'plan.addTask': 'Add task',
        'plan.selectDate': 'Select date',
        'plan.taskName': 'Task name',
        'plan.priority': 'Priority',
        'plan.priorityHigh': 'High',
        'plan.priorityMedium': 'Medium',
        'plan.priorityLow': 'Low',
        'plan.savedPlans': 'Plans list',
        'plan.createNew': 'Create',
        'plan.empty': 'Create your first goal to start planning',
        'plan.deleteDate': 'Delete date',
        'plan.deleteDateConfirm': 'Delete date and all tasks in it?',
        'plan.deleteTask': 'Delete task',
        'plan.deleteTaskConfirm': 'Delete task?',
        'plan.dates': 'dates',
        'plan.tasks': 'tasks',
        'plan.date': 'date',
        'plan.task': 'task',
        'plan.taskPlural1': 'tasks',
        'plan.taskPlural2': 'tasks',
        'plan.datePlural1': 'dates',
        'plan.datePlural2': 'dates',
        
        // Chat
        'chat.title': 'Chat with AI',
        'chat.placeholder': 'Type a message...',
        'chat.send': 'Send',
        'chat.you': 'Me',
        'chat.ai': 'AI',
        'chat.loading': 'Loading...',
        'chat.error': 'Error sending message',
        
        // AI Menu
        'ai.menu.title': 'Choose project type',
        'ai.menu.subtitle': 'Create a regular project or use AI for automatic planning',
        'ai.menu.chat.title': 'Chat with AI',
        'ai.menu.chat.description': 'Chat with AI and get help',
        'ai.menu.plan.title': 'AI plan creation',
        'ai.menu.plan.description': 'AI will create a plan automatically',
        
        // GPT Plan
        'gpt.title': 'GPT Plan',
        'gpt.description': 'Create a project plan with AI. Describe your goal, and AI will break it down into steps and tasks.',
        'gpt.planName': 'Plan name',
        'gpt.goalDescription': 'Goal description',
        'gpt.startDate': 'What day to start the plan?',
        'gpt.daysCount': 'How many days to split the plan?',
        'gpt.weekends': 'Weekend days',
        'gpt.mon': 'Mon',
        'gpt.tue': 'Tue',
        'gpt.wed': 'Wed',
        'gpt.thu': 'Thu',
        'gpt.fri': 'Fri',
        'gpt.sat': 'Sat',
        'gpt.sun': 'Sun',
        'gpt.generate': 'Generate',
        'gpt.generating': 'Generating plan',
        'gpt.edit': 'Edit',
        'gpt.save': 'Save',
        'gpt.regenerate': 'Generate again',
        'gpt.enterPlanName': 'Enter plan name',
        'gpt.enterGoalDescription': 'Describe your goal',
        'gpt.goalDescriptionPlaceholder': 'Describe your goal in detail. The more details, the more accurate the plan will be...',
        'gpt.datePlaceholder': 'DD.MM.YYYY',
        'common.continue': 'Continue',
        
        // Settings
        'settings.title': 'Settings',
        'settings.profile': 'Profile',
        'settings.name': 'Name',
        'settings.nameDesc': 'How to address you',
        'settings.enterName': 'Enter name',
        'settings.email': 'Email',
        'settings.emailDesc': 'For notifications',
        'settings.subscription': 'SUBSCRIPTION',
        'settings.currentPlan': 'Current plan',
        'settings.free': 'Free',
        'settings.pro': 'Basic',
        'settings.moreFeatures': 'Get Pro to get more',
        'settings.upgrade': 'Upgrade',
        'settings.changePhoto': 'Change photo',
        'settings.appearance': 'Appearance',
        'settings.theme': 'Theme',
        'settings.themeDesc': 'Light or dark',
        'settings.themeLight': 'Light',
        'settings.themeDark': 'Dark',
        'settings.language': 'Language',
        'settings.languageDesc': 'Interface language',
        'settings.notifications': 'Notifications',
        'settings.notificationsDesc': 'Receive task notifications',
        'settings.emailNotifications': 'Email notifications',
        'settings.emailNotificationsDesc': 'Receive email notifications',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.save': 'Save changes',
        'settings.saved': 'Saved!',
        
        // Sidebar
        'sidebar.chat': 'Chat with AI',
        'sidebar.tasks': 'Tasks',
        'sidebar.notes': 'Notes',
        'sidebar.gpt': 'GPT Plan',
        'sidebar.plan': 'Plan',
        'sidebar.info': 'Info',
        'sidebar.support': 'Support',
        'sidebar.suggest': 'Suggest idea',
        'sidebar.about': 'About us',
        
        // Suggest ideas
        'suggest.title': 'Suggest an idea',
        'suggest.subtitle': 'Share your ideas to improve the app',
        'suggest.titleLabel': 'Idea title',
        'suggest.titlePlaceholder': 'Brief description of your idea',
        'suggest.descriptionLabel': 'Description',
        'suggest.descriptionPlaceholder': 'Describe your idea in detail',
        'suggest.emailLabel': 'Email (optional)',
        'suggest.emailPlaceholder': 'your@email.com',
        'suggest.submit': 'Submit',
        'suggest.success': 'Thank you! Your idea has been submitted.',
        'suggest.fillFields': 'Please fill in all required fields',
        
        // Navigation
        'nav.tasks': 'Tasks',
        'nav.notes': 'Notes',
        'nav.plan': 'Plan',
        'nav.gpt': 'GPT',
        
        // Greeting
        'greeting.morning': 'Good morning',
        'greeting.day': 'Good afternoon',
        'greeting.evening': 'Good evening',
        'greeting.night': 'Good night',
        'greeting.today': 'Today you have',
        'greeting.completed': 'Completed',
        'greeting.task': 'task',
        'greeting.tasks': 'tasks',
        'greeting.tasksGenitive': 'tasks',
        
        // Modals
        'modal.newTheme': 'New theme',
        'modal.editTheme': 'Edit theme',
        'modal.newSubtheme': 'New subtheme',
        'modal.editSubtheme': 'Edit subtheme',
        'modal.themeName': 'Theme name',
        'modal.subthemeName': 'Subtheme name',
        'modal.enterThemeName': 'Enter theme name',
        'modal.enterSubthemeName': 'Enter subtheme name',
        'modal.deleteTheme': 'Delete theme',
        'modal.deleteThemeConfirm': 'Delete theme and all its subthemes?',
        'modal.deleteSubtheme': 'Delete subtheme',
        'modal.deleteSubthemeConfirm': 'Delete subtheme?',
        
        // Statistics
        'stats.total': 'Total themes',
        'stats.completed': 'Completed',
        'stats.inProgress': 'In progress',
        'stats.progress': 'Progress',
        
        // Weekdays
        'weekday.mon': 'Mon',
        'weekday.tue': 'Tue',
        'weekday.wed': 'Wed',
        'weekday.thu': 'Thu',
        'weekday.fri': 'Fri',
        'weekday.sat': 'Sat',
        'weekday.sun': 'Sun',
        
        // Months in genitive case (for dates) - same as nominative for English
        'month.gen.january': 'January',
        'month.gen.february': 'February',
        'month.gen.march': 'March',
        'month.gen.april': 'April',
        'month.gen.may': 'May',
        'month.gen.june': 'June',
        'month.gen.july': 'July',
        'month.gen.august': 'August',
        'month.gen.september': 'September',
        'month.gen.october': 'October',
        'month.gen.november': 'November',
        'month.gen.december': 'December',
        
        // Months in genitive case (for dates) - same as nominative for English
        'month.gen.january': 'January',
        'month.gen.february': 'February',
        'month.gen.march': 'March',
        'month.gen.april': 'April',
        'month.gen.may': 'May',
        'month.gen.june': 'June',
        'month.gen.july': 'July',
        'month.gen.august': 'August',
        'month.gen.september': 'September',
        'month.gen.october': 'October',
        'month.gen.november': 'November',
        'month.gen.december': 'December',
        
        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December',
        
        // Short month names
        'month.short.january': 'Jan',
        'month.short.february': 'Feb',
        'month.short.march': 'Mar',
        'month.short.april': 'Apr',
        'month.short.may': 'May',
        'month.short.june': 'Jun',
        'month.short.july': 'Jul',
        'month.short.august': 'Aug',
        'month.short.september': 'Sep',
        'month.short.october': 'Oct',
        'month.short.november': 'Nov',
        'month.short.december': 'Dec',
        
        // Modal confirmations
        'modal.confirm': 'Confirm',
        'modal.cancel': 'Cancel',
        'modal.deleteTask': 'Are you sure you want to delete this task?',
        'modal.deleteNote': 'Delete note?',
        'modal.deleteImage': 'Delete image?',
        'modal.deleteWorkspace': 'Delete workspace? All stickers will be deleted.',
        'modal.enterTaskTitle': 'Please enter task title',
        
        // Workspace
        'workspace.title': 'Workspaces',
        'workspace.invite': 'Invite member',
        'workspace.inviteText': 'Share the link with the person you want to invite',
        'workspace.create': 'Create new workspace',
        'workspace.createNew': 'New workspace',
        'workspace.edit': 'Edit workspace',
        'workspace.name': 'Workspace name',
        'workspace.created': 'Workspace created!',
        'workspace.renamed': 'Workspace renamed!',
        'workspace.personal': 'Personal workspace',
        'workspace.members': 'Members',
        'workspace.cannotInvitePersonal': 'Cannot invite to personal workspace. Create a new workspace for collaboration.',
        'workspace.linkCopied': 'Link copied!',
        'workspace.linkCopyError': 'Error copying link',
        'workspace.delete': 'Delete',
        'workspace.editTitle': 'Edit',
        
        // Note editor
        'editor.bold': 'Bold',
        'editor.italic': 'Italic',
        'editor.underline': 'Underline',
        'editor.strikethrough': 'Strikethrough',
        'editor.align': 'Align stickers',
        'editor.save': 'Save image'
    },
    es: {
        // Común
        'common.loading': 'Cargando...',
        'common.back': 'Atrás',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.rename': 'Renombrar',
        'common.share': 'Compartir',
        'common.close': 'Cerrar',
        'common.add': 'Añadir',
        'common.settings': 'Configuración',
        'common.menu': 'Menú',
        
        // Workspace
        'workspace.title': 'Espacios',
        
        // Tareas
        'tasks.title': 'Tareas',
        'tasks.loadError': 'Error al cargar tareas',
        'tasks.new': 'Nueva tarea',
        'tasks.editTask': 'Editar tarea',
        'tasks.name': 'Nombre',
        'tasks.namePlaceholder': 'Introduce el nombre de la tarea',
        'tasks.descriptionPlaceholder': 'Introduce la descripción de la tarea (opcional)',
        'tasks.date': 'Fecha',
        'tasks.singleDay': 'Un día',
        'tasks.range': 'Período',
        'tasks.selectDate': 'Seleccionar fecha',
        'tasks.selectPeriod': 'Seleccionar período',
        'tasks.selectStartDate': 'Seleccionar fecha inicial',
        'tasks.selectEndDate': 'Seleccionar fecha final',
        'tasks.from': 'Desde',
        'tasks.to': 'Hasta',
        'tasks.create': 'Crear',
        'tasks.update': 'Actualizar',
        'tasks.datePickerTitle': 'Seleccionar fecha',
        'tasks.copied': 'Copiado al portapapeles',
        'tasks.shareWithUser': '¿Compartir con usuario?',
        'tasks.shareWith': 'Compartir con',
        'tasks.shareDescription': 'Puedes compartir tu tarea con otra persona',
        'tasks.shareEmailPlaceholder': 'email@example.com',
        'tasks.copied': 'Copiado al portapapeles',
        'tasks.add': 'Añadir tarea',
        'tasks.empty': 'No hay tareas para esta fecha',
        'tasks.completed': 'Completado',
        'tasks.today': 'Hoy tienes',
        'tasks.priority': 'Prioridad',
        'tasks.description': 'Descripción',
        'tasks.date': 'Fecha',
        'tasks.create': 'Crear tarea',
        'tasks.edit': 'Editar tarea',
        'tasks.delete': 'Eliminar tarea',
        'tasks.deleteConfirm': '¿Eliminar tarea?',
        'tasks.rename': 'Renombrar tarea',
        
        // Notas
        'notes.title': 'Notas',
        'notes.add': 'Añadir nota',
        'notes.empty': 'Añade una nota con pegatina',
        'notes.attach': 'Adjuntar',
        'notes.edit': 'Editar',
        'notes.delete': 'Eliminar',
        'notes.color': 'Color',
        'notes.lock': 'Bloquear',
        'notes.unlock': 'Desbloquear',
        'notes.align': 'Alinear',
        
        // Plan
        'plan.title': 'Plan',
        'plan.createGoal': 'Crea un nuevo objetivo',
        'plan.createGoalSubtitle': 'Introduce el nombre del objetivo para comenzar a planificar',
        'plan.create': 'Crear',
        'plan.goalPlaceholder': 'Por ejemplo: Entrenamiento para maratón',
        'plan.editing': 'Editando',
        'plan.saved': 'Guardado',
        'plan.save': 'Guardar',
        'plan.editGoal': 'Editar objetivo',
        'plan.deleteGoal': 'Eliminar objetivo',
        'plan.back': 'Volver a la lista de planes',
        'plan.savePlan': 'Guardar plan',
        'plan.deleteConfirm': '¿Eliminar objetivo y todos los datos relacionados?',
        'plan.addDate': 'Añadir fecha',
        'plan.addTask': 'Añadir tarea',
        'plan.selectDate': 'Seleccionar fecha',
        'plan.taskName': 'Nombre de la tarea',
        'plan.priority': 'Prioridad',
        'plan.priorityHigh': 'Alta',
        'plan.priorityMedium': 'Media',
        'plan.priorityLow': 'Baja',
        'plan.savedPlans': 'Lista de planes',
        'plan.createNew': 'Crear',
        'plan.empty': 'Crea tu primer objetivo para comenzar a planificar',
        'plan.deleteDate': 'Eliminar fecha',
        'plan.deleteDateConfirm': '¿Eliminar fecha y todas las tareas en ella?',
        'plan.deleteTask': 'Eliminar tarea',
        'plan.deleteTaskConfirm': '¿Eliminar tarea?',
        'plan.dates': 'fechas',
        'plan.tasks': 'tareas',
        'plan.date': 'fecha',
        'plan.task': 'tarea',
        'plan.taskPlural1': 'tareas',
        'plan.taskPlural2': 'tareas',
        'plan.datePlural1': 'fechas',
        'plan.datePlural2': 'fechas',
        
        // Chat
        'chat.title': 'Chat con IA',
        'chat.placeholder': 'Escribe un mensaje...',
        'chat.send': 'Enviar',
        'chat.you': 'Yo',
        'chat.ai': 'IA',
        'chat.loading': 'Cargando...',
        'chat.error': 'Error al enviar mensaje',
        
        // Menú IA
        'ai.menu.title': 'Elige el tipo de proyecto',
        'ai.menu.subtitle': 'Crea un proyecto regular o usa IA para planificación automática',
        'ai.menu.chat.title': 'Chat con IA',
        'ai.menu.chat.description': 'Chatea con IA y obtén ayuda',
        'ai.menu.plan.title': 'Creación de plan con IA',
        'ai.menu.plan.description': 'IA creará un plan automáticamente',
        
        // Plan GPT
        'gpt.title': 'Plan GPT',
        'gpt.description': 'Crea un plan de proyecto con IA. Describe tu objetivo y la IA lo dividirá en pasos y tareas.',
        'gpt.planName': 'Nombre del plan',
        'gpt.goalDescription': 'Descripción del objetivo',
        'gpt.startDate': '¿Desde qué día comenzar el plan?',
        'gpt.daysCount': '¿En cuántos días dividir el plan?',
        'gpt.weekends': 'Días de fin de semana',
        'gpt.mon': 'Lun',
        'gpt.tue': 'Mar',
        'gpt.wed': 'Mié',
        'gpt.thu': 'Jue',
        'gpt.fri': 'Vie',
        'gpt.sat': 'Sáb',
        'gpt.sun': 'Dom',
        'gpt.generate': 'Generar',
        'gpt.generating': 'Generando plan',
        'gpt.edit': 'Editar',
        'gpt.save': 'Guardar',
        'gpt.regenerate': 'Generar de nuevo',
        'gpt.enterPlanName': 'Introduce el nombre del plan',
        'gpt.enterGoalDescription': 'Describe tu objetivo',
        'gpt.goalDescriptionPlaceholder': 'Describe tu objetivo en detalle. Cuantos más detalles, más preciso será el plan...',
        'gpt.datePlaceholder': 'DD.MM.AAAA',
        'common.continue': 'Continuar',
        
        // Configuración
        'settings.title': 'Configuración',
        'settings.profile': 'Perfil',
        'settings.name': 'Nombre',
        'settings.nameDesc': 'Cómo dirigirse a ti',
        'settings.enterName': 'Introduce el nombre',
        'settings.email': 'Email',
        'settings.emailDesc': 'Para notificaciones',
        'settings.subscription': 'SUSCRIPCIÓN',
        'settings.currentPlan': 'Plan actual',
        'settings.free': 'Gratis',
        'settings.pro': 'Basic',
        'settings.moreFeatures': 'Obtén Pro para obtener más',
        'settings.upgrade': 'Actualizar',
        'settings.changePhoto': 'Cambiar foto',
        'settings.appearance': 'Apariencia',
        'settings.theme': 'Tema',
        'settings.themeDesc': 'Claro u oscuro',
        'settings.themeLight': 'Claro',
        'settings.themeDark': 'Oscuro',
        'settings.language': 'Idioma',
        'settings.languageDesc': 'Idioma de la interfaz',
        'settings.notifications': 'Notificaciones',
        'settings.notificationsDesc': 'Recibir notificaciones de tareas',
        'settings.emailNotifications': 'Notificaciones por email',
        'settings.emailNotificationsDesc': 'Recibir notificaciones por email',
        'settings.about': 'Acerca de',
        'settings.version': 'Versión',
        'settings.save': 'Guardar cambios',
        'settings.saved': '¡Guardado!',
        
        // Barra lateral
        'sidebar.chat': 'Chat con IA',
        'sidebar.tasks': 'Tareas',
        'sidebar.info': 'Información',
        'sidebar.support': 'Soporte',
        'sidebar.suggest': 'Sugerir idea',
        'sidebar.about': 'Sobre nosotros',
        
        // Sugerir ideas
        'suggest.title': 'Sugerir una idea',
        'suggest.subtitle': 'Comparte tus ideas para mejorar la aplicación',
        'suggest.titleLabel': 'Título de la idea',
        'suggest.titlePlaceholder': 'Breve descripción de tu idea',
        'suggest.descriptionLabel': 'Descripción',
        'suggest.descriptionPlaceholder': 'Describe tu idea en detalle',
        'suggest.emailLabel': 'Email (opcional)',
        'suggest.emailPlaceholder': 'tu@email.com',
        'suggest.submit': 'Enviar',
        'suggest.success': '¡Gracias! Tu idea ha sido enviada.',
        'suggest.fillFields': 'Por favor, completa todos los campos obligatorios',
        
        // Información de la aplicación
        'info.title': 'Información',
        'info.aboutApp.title': 'Sobre la aplicación',
        'info.aboutApp.description': 'Ladder es una aplicación moderna para gestionar tareas y objetivos que te ayuda a organizar tu vida y alcanzar tus metas. Combinamos facilidad de uso con potentes funciones de inteligencia artificial para hacer la planificación lo más eficiente posible.',
        'info.advantages.title': '¿Por qué Ladder?',
        'info.advantages.ai.title': 'Inteligencia Artificial',
        'info.advantages.ai.text': 'La IA ayuda a crear planes, responde preguntas sobre tareas y sugiere soluciones. A diferencia de los competidores, nuestra IA entiende el contexto y funciona en ruso, inglés y español.',
        'info.advantages.goals.title': 'Planificación Inteligente',
        'info.advantages.goals.text': 'Crea objetivos de múltiples etapas con división automática en tareas. La IA analiza tu objetivo y crea un plan detallado considerando los días de descanso y la fecha de inicio.',
        'info.advantages.workspaces.title': 'Espacios de Trabajo',
        'info.advantages.workspaces.text': 'Crea espacios personales y compartidos para trabajar en proyectos. Invita a amigos y colegas, comparte notas e imágenes. Muchas aplicaciones no admiten colaboración.',
        'info.advantages.multilang.title': 'Multilingüe',
        'info.advantages.multilang.text': 'Soporte completo para ruso, inglés y español. La interfaz, las respuestas de IA y todas las funciones funcionan en tu idioma. La mayoría de los competidores están limitados a un idioma.',
        'info.advantages.design.title': 'Diseño Elegante',
        'info.advantages.design.text': 'Interfaz minimalista en blanco y negro con acentos rojos. Cada elemento está diseñado para la máxima comodidad. Los fondos dinámicos cambian según la hora del día.',
        'info.pages.title': 'Páginas de la aplicación',
        'info.pages.tasks.title': 'Tareas',
        'info.pages.tasks.description': 'Página principal para gestionar tus tareas. Aquí ves las tareas del día seleccionado, puedes crear nuevas, editar existentes y marcar completadas.',
        'info.pages.tasks.calendar': 'Calendario semanal',
        'info.pages.tasks.create': 'Crear tareas',
        'info.pages.tasks.complete': 'Marcar como completada',
        'info.pages.tasks.stats': 'Estadísticas del día',
        'info.pages.plan.title': 'Plan',
        'info.pages.plan.description': 'Constructor de objetivos y planes. Crea objetivos de múltiples etapas, divídelos en tareas con prioridades y rastrea el progreso de finalización.',
        'info.pages.plan.goals': 'Crear objetivos',
        'info.pages.plan.tasks': 'Tareas en el plan',
        'info.pages.plan.priority': 'Prioridades de tareas',
        'info.pages.plan.progress': 'Progreso de finalización',
        'info.pages.gpt.title': 'Plan GPT',
        'info.pages.gpt.description': 'Función única para crear planes usando inteligencia artificial. Describe tu objetivo y la IA creará un plan detallado con tareas, prioridades y fechas.',
        'info.pages.gpt.describe': 'Describir objetivo',
        'info.pages.gpt.startDate': 'Seleccionar fecha de inicio',
        'info.pages.gpt.weekends': 'Días de descanso',
        'info.pages.gpt.generate': 'Generar plan',
        'info.pages.chat.title': 'Chat con IA',
        'info.pages.chat.description': 'Asistente inteligente que responde preguntas sobre tus tareas, ayuda a crear nuevas tareas y notas, busca tareas por palabras clave y fechas.',
        'info.pages.chat.questions': 'Preguntas sobre tareas',
        'info.pages.chat.search': 'Buscar tareas',
        'info.pages.chat.create': 'Crear mediante IA',
        'info.pages.chat.notes': 'Crear notas',
        'info.pages.notes.title': 'Notas',
        'info.pages.notes.description': 'Tablero para notas e imágenes. Crea notas de texto, sube imágenes, organízalas en espacios de trabajo y trabaja junto con otros usuarios.',
        'info.pages.notes.text': 'Notas de texto',
        'info.pages.notes.images': 'Imágenes',
        'info.pages.notes.workspaces': 'Espacios de trabajo',
        'info.pages.notes.share': 'Colaboración',
        'info.navigation.title': 'Navegación',
        'info.navigation.description': 'El panel de navegación inferior permite cambiar rápidamente entre las secciones principales de la aplicación.',
        'info.navigation.tasks': 'Tareas',
        'info.navigation.tasksDesc': 'Ir a la página principal de tareas',
        'info.navigation.gpt': 'GPT',
        'info.navigation.gptDesc': 'Abre el menú de selección: Chat con IA o Creación de Plan con IA',
        'info.navigation.add': 'Agregar',
        'info.navigation.addDesc': 'Botón central para crear tareas rápidamente',
        'info.navigation.plan': 'Plan',
        'info.navigation.planDesc': 'Ir al constructor de objetivos y planes',
        'info.navigation.notes': 'Notas',
        'info.navigation.notesDesc': 'Ir al tablero de notas e imágenes',
        'info.features.title': 'Funciones Clave',
        'info.features.greeting.title': 'Panel de Bienvenida',
        'info.features.greeting.text': 'Panel dinámico con saludo, estadísticas de tareas y hermosos fondos que cambian según la hora del día.',
        'info.features.priority.title': 'Sistema de Prioridades',
        'info.features.priority.text': 'Tres niveles de prioridad de tareas con indicadores visuales: rayo rojo (P1), amarillo (P2), azul (P3).',
        'info.features.calendar.title': 'Calendario Inteligente',
        'info.features.calendar.text': 'Calendario con tamaño fijo, soporte de rangos de fechas y navegación conveniente por meses.',
        'info.features.customization.title': 'Personalización',
        'info.features.customization.text': 'Selección de idioma de interfaz, carga de avatar, personalización de la aplicación según tus necesidades.',
        
        // Navegación
        'nav.tasks': 'Tareas',
        'nav.notes': 'Notas',
        'nav.plan': 'Plan',
        'nav.gpt': 'GPT',
        
        // Saludo
        'greeting.morning': 'Buenos días',
        'greeting.day': 'Buenas tardes',
        'greeting.evening': 'Buenas tardes',
        'greeting.night': 'Buenas noches',
        'greeting.today': 'Hoy tienes',
        'greeting.completed': 'Completado',
        'greeting.task': 'tarea',
        'greeting.tasks': 'tareas',
        'greeting.tasksGenitive': 'tareas',
        
        // Modales
        'modal.newTheme': 'Nuevo tema',
        'modal.editTheme': 'Editar tema',
        'modal.newSubtheme': 'Nueva subtema',
        'modal.editSubtheme': 'Editar subtema',
        'modal.themeName': 'Nombre del tema',
        'modal.subthemeName': 'Nombre de la subtema',
        'modal.enterThemeName': 'Introduce el nombre del tema',
        'modal.enterSubthemeName': 'Introduce el nombre de la subtema',
        'modal.deleteTheme': 'Eliminar tema',
        'modal.deleteThemeConfirm': '¿Eliminar tema y todas sus subtemas?',
        'modal.deleteSubtheme': 'Eliminar subtema',
        'modal.deleteSubthemeConfirm': '¿Eliminar subtema?',
        
        // Estadísticas
        'stats.total': 'Total de temas',
        'stats.completed': 'Completado',
        'stats.inProgress': 'En progreso',
        'stats.progress': 'Progreso',
        
        // Días de la semana
        'weekday.mon': 'Lun',
        'weekday.tue': 'Mar',
        'weekday.wed': 'Mié',
        'weekday.thu': 'Jue',
        'weekday.fri': 'Vie',
        'weekday.sat': 'Sáb',
        'weekday.sun': 'Dom',
        
        // Meses en genitivo (para fechas) - igual que nominativo para español
        'month.gen.january': 'enero',
        'month.gen.february': 'febrero',
        'month.gen.march': 'marzo',
        'month.gen.april': 'abril',
        'month.gen.may': 'mayo',
        'month.gen.june': 'junio',
        'month.gen.july': 'julio',
        'month.gen.august': 'agosto',
        'month.gen.september': 'septiembre',
        'month.gen.october': 'octubre',
        'month.gen.november': 'noviembre',
        'month.gen.december': 'diciembre',
        
        // Meses
        'month.january': 'Enero',
        'month.february': 'Febrero',
        'month.march': 'Marzo',
        'month.april': 'Abril',
        'month.may': 'Mayo',
        'month.june': 'Junio',
        'month.july': 'Julio',
        'month.august': 'Agosto',
        'month.september': 'Septiembre',
        'month.october': 'Octubre',
        'month.november': 'Noviembre',
        'month.december': 'Diciembre',
        
        // Nombres cortos de meses
        'month.short.january': 'ene.',
        'month.short.february': 'feb.',
        'month.short.march': 'mar.',
        'month.short.april': 'abr.',
        'month.short.may': 'may',
        'month.short.june': 'jun.',
        'month.short.july': 'jul.',
        'month.short.august': 'ago.',
        'month.short.september': 'sep.',
        'month.short.october': 'oct.',
        'month.short.november': 'nov.',
        'month.short.december': 'dic.',
        
        // Modales de confirmación
        'modal.confirm': 'Confirmar',
        'modal.cancel': 'Cancelar',
        'modal.deleteTask': '¿Estás seguro de que quieres eliminar esta tarea?',
        'modal.deleteNote': '¿Eliminar nota?',
        'modal.deleteImage': '¿Eliminar imagen?',
        'modal.deleteWorkspace': '¿Eliminar espacio? Todas las pegatinas serán eliminadas.',
        'modal.enterTaskTitle': 'Por favor, introduce el título de la tarea',
        
        // Espacio de trabajo
        'workspace.invite': 'Invitar miembro',
        'workspace.inviteText': 'Comparte el enlace con la persona que quieres invitar',
        'workspace.create': 'Crear nuevo espacio',
        'workspace.createNew': 'Nuevo espacio',
        'workspace.edit': 'Editar espacio',
        'workspace.name': 'Nombre del espacio',
        'workspace.created': '¡Espacio creado!',
        'workspace.renamed': '¡Espacio renombrado!',
        'workspace.personal': 'Espacio personal',
        'workspace.members': 'Miembros',
        'workspace.cannotInvitePersonal': 'No se puede invitar al espacio personal. Crea un nuevo espacio para colaborar.',
        'workspace.linkCopied': '¡Enlace copiado!',
        'workspace.linkCopyError': 'Error al copiar enlace',
        'workspace.delete': 'Eliminar',
        'workspace.editTitle': 'Editar',
        
        // Editor de notas
        'editor.bold': 'Negrita',
        'editor.italic': 'Cursiva',
        'editor.underline': 'Subrayado',
        'editor.strikethrough': 'Tachado',
        'editor.align': 'Alinear pegatinas',
        'editor.save': 'Guardar imagen'
    }
};

// Получение текущего языка
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}

// Установка языка
function setLanguage(lang) {
    if (translations[lang]) {
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        applyTranslations();
        return true;
    }
    return false;
}

// Получение перевода
function t(key, params = {}) {
    const lang = getCurrentLanguage();
    let translation = translations[lang]?.[key] || translations['ru']?.[key] || key;
    
    // Замена параметров
    Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
}

// Применение переводов ко всем элементам с data-i18n
function applyTranslations() {
    // Обрабатываем элементы с data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const attr = element.getAttribute('data-i18n');
        
        // Проверяем, является ли это атрибутом в формате [attrName]key
        if (attr && attr.startsWith('[') && attr.includes(']')) {
            const match = attr.match(/\[(\w+)\](.+)/);
            if (match) {
                const attrName = match[1];
                const key = match[2];
                element.setAttribute(attrName, t(key));
                return; // Пропускаем обычную обработку
            }
        }
        
        // Обычная обработка текста
        const translation = t(attr);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else if (element.tagName === 'OPTION') {
            element.textContent = translation;
        } else if (element.hasAttribute('title')) {
            element.title = translation;
        } else if (element.hasAttribute('aria-label')) {
            element.setAttribute('aria-label', translation);
        } else {
            element.textContent = translation;
        }
    });
    
    // Обрабатываем элементы с data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Обновление заголовка страницы
    const pageTitle = document.querySelector('[data-i18n-title]');
    if (pageTitle) {
        const titleKey = pageTitle.getAttribute('data-i18n-title');
        document.title = t(titleKey) + ' - Ladder';
    }
}

// Инициализация i18n
function initI18n() {
    try {
        const lang = getCurrentLanguage();
        document.documentElement.lang = lang;
        applyTranslations();
        
        // Показываем контент после применения переводов
        if (document.body) {
            document.body.classList.add('i18n-ready');
        }
        
        // Слушаем изменения языка
        window.addEventListener('storage', (e) => {
            if (e.key === 'language') {
                applyTranslations();
            }
        });
    } catch (error) {
        console.error('Error initializing i18n:', error);
        // В случае ошибки все равно показываем контент
        if (document.body) {
            document.body.classList.add('i18n-ready');
        }
    }
}

// Экспорт для использования в других модулях
export { t, setLanguage, getCurrentLanguage, applyTranslations, initI18n };

if (typeof window !== 'undefined') {
    window.i18n = {
        t,
        setLanguage,
        getCurrentLanguage,
        applyTranslations,
        initI18n
    };
}

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Инициализируем сразу, без задержки
        initI18n();
    });
} else {
    // Если DOM уже загружен, инициализируем сразу
    initI18n();
}

