// Страница настроек
document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

function initSettingsPage() {
    // Кнопка назад
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/public/tasks.html';
        });
    }
    
    // Инициализация переключателей
    initToggles();
    
    // Загрузка текущих настроек
    loadSettings();
    
    // Загрузка аватара
    loadAvatar();
    
    // Кнопка изменения аватара
    const avatarChangeBtn = document.getElementById('avatar-change-btn');
    if (avatarChangeBtn) {
        avatarChangeBtn.addEventListener('click', () => {
            openAvatarUpload();
        });
    }
    
    // Сохранение настроек
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    // Навигация
    // Навигация теперь работает через обычные ссылки в HTML, JavaScript не нужен
    // setupNavigation();
    
    // Кнопка GPT меню
    setupAiMenu();
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

function initToggles() {
    const toggles = document.querySelectorAll('.setting-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });
}

function loadSettings() {
    // Загрузка настроек из localStorage или API
    const savedName = localStorage.getItem('user_name') || '';
    const savedEmail = localStorage.getItem('user_email') || '';
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'ru';
    const savedNotifications = localStorage.getItem('notifications') === 'true';
    const savedEmailNotifications = localStorage.getItem('email_notifications') === 'true';
    
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const notificationsToggle = document.getElementById('notifications-toggle');
    const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
    
    if (nameInput) nameInput.value = savedName;
    if (emailInput) emailInput.value = savedEmail;
    if (themeSelect) themeSelect.value = savedTheme;
    if (languageSelect) languageSelect.value = savedLanguage;
    if (notificationsToggle && savedNotifications) notificationsToggle.classList.add('active');
    if (emailNotificationsToggle && savedEmailNotifications) emailNotificationsToggle.classList.add('active');
}

function loadAvatar() {
    const avatarContainer = document.querySelector('.avatar-container');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
    const savedAvatar = localStorage.getItem('user_avatar');
    
    if (avatarContainer && savedAvatar) {
        // Удаляем placeholder если есть
        if (avatarPlaceholder) {
            avatarPlaceholder.style.display = 'none';
        }
        
        // Создаем или обновляем img элемент
        let avatarImg = avatarContainer.querySelector('img');
        if (!avatarImg) {
            avatarImg = document.createElement('img');
            avatarContainer.appendChild(avatarImg);
        }
        avatarImg.src = savedAvatar;
        avatarImg.alt = 'Аватар пользователя';
    } else if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'flex';
        const avatarImg = avatarContainer.querySelector('img');
        if (avatarImg) {
            avatarImg.remove();
        }
    }
}

function openAvatarUpload() {
    // Создаем скрытый input для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Для мобильных устройств
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                openCropModal(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    input.click();
}

function openCropModal(imageSrc) {
    // Создаем модальное окно для кропа
    const modal = document.createElement('div');
    modal.className = 'avatar-crop-modal';
    modal.innerHTML = `
        <div class="avatar-crop-content">
            <div class="avatar-crop-header">
                <h3>Выберите область</h3>
                <button class="avatar-crop-close" id="avatar-crop-close">&times;</button>
            </div>
            <div class="avatar-crop-container">
                <canvas id="avatar-crop-canvas"></canvas>
                <div class="avatar-crop-overlay">
                    <div class="avatar-crop-frame"></div>
                </div>
            </div>
            <div class="avatar-crop-controls">
                <button class="avatar-crop-cancel" id="avatar-crop-cancel">Отмена</button>
                <button class="avatar-crop-save" id="avatar-crop-save">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.getElementById('avatar-crop-canvas');
        const ctx = canvas.getContext('2d');
        const container = document.querySelector('.avatar-crop-container');
        const frame = document.querySelector('.avatar-crop-frame');
        
        // Размеры контейнера
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Размеры изображения с сохранением пропорций
        let imgWidth = img.width;
        let imgHeight = img.height;
        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
        imgWidth *= scale;
        imgHeight *= scale;
        
        // Устанавливаем размеры canvas
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        
        // Размеры рамки кропа (круглая, 200x200)
        const cropSize = Math.min(200, imgWidth, imgHeight);
        frame.style.width = cropSize + 'px';
        frame.style.height = cropSize + 'px';
        frame.style.borderRadius = '50%';
        
        // Позиционируем рамку по центру
        frame.style.left = (imgWidth / 2 - cropSize / 2) + 'px';
        frame.style.top = (imgHeight / 2 - cropSize / 2) + 'px';
        
        // Переменные для перетаскивания
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let frameX = imgWidth / 2 - cropSize / 2;
        let frameY = imgHeight / 2 - cropSize / 2;
        
        // Обновляем позицию рамки
        const updateFramePosition = () => {
            frame.style.left = frameX + 'px';
            frame.style.top = frameY + 'px';
        };
        updateFramePosition();
        
        // Получаем координаты относительно canvas
        const getCanvasCoordinates = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };
        
        // Обработчики для перетаскивания
        frame.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            const coords = getCanvasCoordinates(e.clientX, e.clientY);
            startX = coords.x - frameX;
            startY = coords.y - frameY;
        });
        
        frame.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            const touch = e.touches[0];
            const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
            startX = coords.x - frameX;
            startY = coords.y - frameY;
        });
        
        const handleMove = (clientX, clientY) => {
            if (!isDragging) return;
            const coords = getCanvasCoordinates(clientX, clientY);
            frameX = Math.max(0, Math.min(coords.x - startX, imgWidth - cropSize));
            frameY = Math.max(0, Math.min(coords.y - startY, imgHeight - cropSize));
            updateFramePosition();
        };
        
        document.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Сохранение
        document.getElementById('avatar-crop-save').addEventListener('click', () => {
            // Создаем новый canvas для кропнутого изображения
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = 200;
            cropCanvas.height = 200;
            const cropCtx = cropCanvas.getContext('2d');
            
            // Вычисляем координаты и размеры для кропа
            const sourceX = (frameX / imgWidth) * img.width;
            const sourceY = (frameY / imgHeight) * img.height;
            const sourceSize = (cropSize / imgWidth) * img.width;
            
            // Рисуем кропнутое изображение
            cropCtx.drawImage(
                img,
                sourceX, sourceY, sourceSize, sourceSize,
                0, 0, 200, 200
            );
            
            // Сохраняем как base64
            const croppedImage = cropCanvas.toDataURL('image/png');
            localStorage.setItem('user_avatar', croppedImage);
            
            // Обновляем аватар на странице
            loadAvatar();
            
            // Закрываем модальное окно
            modal.remove();
        });
    };
    
    img.src = imageSrc;
    
    // Закрытие модального окна
    document.getElementById('avatar-crop-close').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('avatar-crop-cancel').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Показываем модальное окно
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

async function saveSettings() {
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const notificationsToggle = document.getElementById('notifications-toggle');
    const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
    
    const settings = {
        name: nameInput?.value || '',
        email: emailInput?.value || '',
        theme: themeSelect?.value || 'light',
        language: languageSelect?.value || 'ru',
        notifications: notificationsToggle?.classList.contains('active') || false,
        email_notifications: emailNotificationsToggle?.classList.contains('active') || false
    };
    
    // Сохранение в localStorage
    localStorage.setItem('user_name', settings.name);
    localStorage.setItem('user_email', settings.email);
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('language', settings.language);
    localStorage.setItem('notifications', settings.notifications.toString());
    localStorage.setItem('email_notifications', settings.email_notifications.toString());
    
    // Применяем новый язык
    if (window.i18n) {
        window.i18n.setLanguage(settings.language);
    }
    
    // TODO: Отправка на сервер
    // try {
    //     await fetch('/api/settings', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(settings)
    //     });
    // } catch (error) {
    //     console.error('Error saving settings:', error);
    // }
    
    // Показ уведомления об успешном сохранении
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = window.i18n ? window.i18n.t('settings.saved') : 'Сохранено!';
        saveBtn.style.background = '#28a745';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }
    
    // Применяем переводы без перезагрузки страницы
    if (window.i18n) {
        window.i18n.applyTranslations();
    }
}

// Функция setupNavigation удалена - навигация теперь работает через обычные ссылки в HTML
// Кнопка "Добавить задачу" обрабатывается отдельно в initSettingsPage

