// Страница информации о приложении

document.addEventListener('DOMContentLoaded', () => {
    initInfoPage();
});

function initInfoPage() {
    // Инициализация i18n
    if (window.i18n && window.i18n.initI18n) {
        window.i18n.initI18n();
    }
    
    // Настройка сайдбара
    setupSidebar();
    
    // Настройка навигации
    setupNavigation();
}

function setupSidebar() {
    const burgerMenu = document.getElementById('burger-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (!burgerMenu || !sidebarOverlay) return;
    
    // Открытие/закрытие сайдбара
    burgerMenu.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebarOverlay.classList.toggle('active');
        burgerMenu.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
        sidebarOverlay.style.pointerEvents = sidebarOverlay.classList.contains('active') ? 'auto' : 'none';
    });
    
    // Закрытие при клике на overlay
    sidebarOverlay.addEventListener('click', (e) => {
        if (e.target === sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
            burgerMenu.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            sidebarOverlay.style.pointerEvents = 'none';
        }
    });
    
    // Обработка действий сайдбара
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
            
            // Обрабатываем действия
            if (action === 'info') {
                // Уже на странице информации
                return;
            } else if (action === 'support') {
                // Можно добавить страницу поддержки
                console.log('Поддержка');
            } else if (action === 'suggest') {
                openSuggestModal();
            } else if (action === 'about') {
                // Можно добавить страницу "О нас"
                console.log('О нас');
            }
        });
    });
}

function setupNavigation() {
    // Обработка кнопки настроек
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/public/settings.html';
        });
    }
    
    // Инициализация модального окна предложения идей
    initSuggestModal();
}

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
        
        // Валидация
        if (!title || !description) {
            if (window.customModal && window.customModal.alert) {
                await window.customModal.alert(
                    window.i18n ? window.i18n.t('suggest.fillFields') : 'Заполните все обязательные поля'
                );
            } else {
                alert('Заполните все обязательные поля');
            }
            return;
        }
        
        try {
            // Сохраняем в localStorage
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
            if (window.customModal && window.customModal.alert) {
                await window.customModal.alert(
                    window.i18n ? window.i18n.t('suggest.success') : 'Спасибо! Ваша идея отправлена.'
                );
            } else {
                alert('Спасибо! Ваша идея отправлена.');
            }
            
            // Очищаем форму и закрываем модальное окно
            form.reset();
            closeSuggestModal();
        } catch (error) {
            console.error('Error saving suggestion:', error);
            if (window.customModal && window.customModal.alert) {
                await window.customModal.alert(
                    window.i18n ? window.i18n.t('suggest.errorMessage') : 'Произошла ошибка при отправке идеи.'
                );
            } else {
                alert('Произошла ошибка при отправке идеи.');
            }
        }
    };
    
    // Удаляем старые обработчики, если есть
    if (modal._suggestHandlers) {
        modal.removeEventListener('click', modal._suggestHandlers.overlay);
        form.removeEventListener('submit', modal._suggestHandlers.submit);
    }
    if (closeBtn && closeBtn._suggestHandler) {
        closeBtn.removeEventListener('click', closeBtn._suggestHandler);
    }
    if (cancelBtn && cancelBtn._suggestHandler) {
        cancelBtn.removeEventListener('click', cancelBtn._suggestHandler);
    }
    
    // Добавляем новые обработчики
    modal.addEventListener('click', handleOverlayClick);
    if (closeBtn) closeBtn.addEventListener('click', handleClose);
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    form.addEventListener('submit', handleSubmit);
    
    // Сохраняем обработчики для последующего удаления
    modal._suggestHandlers = {
        overlay: handleOverlayClick,
        submit: handleSubmit
    };
    if (closeBtn) closeBtn._suggestHandler = handleClose;
    if (cancelBtn) cancelBtn._suggestHandler = handleCancel;
}

function closeSuggestModal() {
    const modal = document.getElementById('suggest-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Удаляем обработчики
        if (modal._suggestHandlers) {
            modal.removeEventListener('click', modal._suggestHandlers.overlay);
            const form = document.getElementById('suggest-form');
            if (form) {
                form.removeEventListener('submit', modal._suggestHandlers.submit);
            }
            delete modal._suggestHandlers;
        }
        
        const closeBtn = document.getElementById('suggest-modal-close');
        const cancelBtn = document.getElementById('suggest-form-cancel');
        if (closeBtn && closeBtn._suggestHandler) {
            closeBtn.removeEventListener('click', closeBtn._suggestHandler);
            delete closeBtn._suggestHandler;
        }
        if (cancelBtn && cancelBtn._suggestHandler) {
            cancelBtn.removeEventListener('click', cancelBtn._suggestHandler);
            delete cancelBtn._suggestHandler;
        }
    }
}

function initSuggestModal() {
    // Модальное окно будет инициализировано при первом открытии
    // Здесь можно добавить дополнительную инициализацию, если нужно
}

