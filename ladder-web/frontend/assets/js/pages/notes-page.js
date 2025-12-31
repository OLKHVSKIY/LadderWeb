// Инициализация страницы заметок
document.addEventListener('DOMContentLoaded', async () => {
    // Убеждаемся, что контент виден сразу
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
    }
    
    // Проверяем приглашение по ссылке
    await checkInviteCode();
    
    initNotesPage();
});

// Проверка кода приглашения из URL
async function checkInviteCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    
    if (inviteCode) {
        try {
            const { acceptInvite } = await import('../modules/workspaces.js');
            await acceptInvite(inviteCode);
            // Убираем код из URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Показываем уведомление
            await window.customModal?.success('Вы успешно присоединились к пространству!');
            // Обновляем страницу
            location.reload();
        } catch (error) {
            console.error('Error accepting invite:', error);
            await window.customModal?.error(error.message || 'Ошибка при присоединении к пространству');
        }
    }
}

// Дополнительная проверка после полной загрузки
window.addEventListener('load', () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
    }
});

function initNotesPage() {
    try {
        // Убеждаемся, что основной контент виден
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
        
        // Обработчик клика на кнопку + в нижней навигации
        const addBtn = document.getElementById('add-task-btn') || document.querySelector('.nav-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openAddMenu();
            });
        }
        
        // Инициализация сайдбара
        setupSidebar();
        
        // Обработчик кнопки изменения (открытие шторки пространств)
        const changeBtn = document.getElementById('change-btn');
        if (changeBtn) {
            changeBtn.addEventListener('click', () => {
                openWorkspacesPanel();
            });
        }
        
        // Обработчик кнопки совместной работы (приглашения)
        setupCollaborateButton();
        
        // Инициализация работы с пространствами
        setupWorkspaces();
        
        // Обновляем название пространства
        updateWorkspaceName();
        
        // Кнопка GPT меню
        setupAiMenu();
        
        // Загрузка сохраненных стикеров
        loadStickers();
        
        // Показываем пустое состояние, если стикеров нет
        updateEmptyState();
    
        // Обработчик изменения размера окна - только обновление высоты контента
        let resizeTimeout;
        let isResizing = false;
        window.addEventListener('resize', () => {
            if (isResizing) return;
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                try {
                    isResizing = true;
                    // Убеждаемся, что контент виден
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.style.visibility = 'visible';
                        mainContent.style.opacity = '1';
                    }
                    updateContentHeight();
                } catch (error) {
                    console.error('Error in resize handler:', error);
                } finally {
                    isResizing = false;
                }
            }, 150);
        });
    } catch (error) {
        console.error('Error initializing notes page:', error);
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

function openNoteEditor(stickerId = null) {
    // Проверяем, не открыт ли уже редактор
    if (document.getElementById('note-editor-overlay')) {
        return;
    }
    
    // Создаем overlay
    const overlay = document.createElement('div');
    overlay.id = 'note-editor-overlay';
    overlay.className = 'note-editor-overlay';
    
    // Создаем контейнер заметки
    const noteContainer = document.createElement('div');
    noteContainer.className = 'note-editor-container';
    noteContainer.id = 'note-editor-container';
    
    // Панель инструментов
    const toolbar = document.createElement('div');
    toolbar.className = 'note-toolbar';
    toolbar.innerHTML = `
        <div class="toolbar-group">
            <button class="toolbar-btn" data-command="bold" title="Жирный">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="italic" title="Курсив">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="4" x2="10" y2="4"></line>
                    <line x1="14" y1="20" x2="5" y2="20"></line>
                    <line x1="15" y1="4" x2="9" y2="20"></line>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="underline" title="Подчеркнутый">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                    <line x1="4" y1="21" x2="20" y2="21"></line>
                </svg>
            </button>
        </div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-command="formatBlock" data-value="h1" title="Заголовок 1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 4h12v4H6z"></path>
                    <path d="M6 12h12v4H6z"></path>
                    <path d="M6 20h12v4H6z"></path>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="formatBlock" data-value="h2" title="Заголовок 2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 4h10v3H6z"></path>
                    <path d="M6 12h10v3H6z"></path>
                    <path d="M6 20h10v3H6z"></path>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="insertUnorderedList" title="Маркированный список">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="4" cy="6" r="1.5"></circle>
                    <circle cx="4" cy="12" r="1.5"></circle>
                    <circle cx="4" cy="18" r="1.5"></circle>
                    <line x1="8" y1="6" x2="20" y2="6"></line>
                    <line x1="8" y1="12" x2="20" y2="12"></line>
                    <line x1="8" y1="18" x2="20" y2="18"></line>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="insertOrderedList" title="Нумерованный список">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-command="outdent" title="Уменьшить отступ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="8 8 4 12 8 16"></polyline>
                </svg>
            </button>
            <button class="toolbar-btn" data-command="indent" title="Увеличить отступ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="16 8 20 12 16 16"></polyline>
                </svg>
            </button>
        </div>
        <div class="toolbar-actions">
            <button class="toolbar-btn toolbar-btn-close" id="note-editor-close" title="Закрыть">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    // Область редактирования
    const editor = document.createElement('div');
    editor.className = 'note-editor';
    editor.contentEditable = true;
    editor.setAttribute('data-placeholder', 'Начните писать...');
    
    // Загружаем содержимое стикера, если это редактирование
    if (stickerId) {
        const stickers = getStickers();
        const sticker = stickers.find(s => s.id === stickerId);
        if (sticker) {
            editor.innerHTML = sticker.content;
        }
    }
    
    // Ресайзер для изменения высоты
    const resizer = document.createElement('div');
    resizer.className = 'note-resizer';
    
    // Кнопка прикрепить/сохранить
    const attachBtn = document.createElement('button');
    attachBtn.className = 'note-attach-btn';
    const attachText = window.i18n ? (stickerId ? window.i18n.t('common.save') : window.i18n.t('notes.attach')) : (stickerId ? 'Сохранить' : 'Прикрепить');
    attachBtn.innerHTML = `
        <span>${attachText}</span>
    `;
    
    // Сохраняем stickerId в контейнере для использования в обработчиках
    noteContainer.dataset.stickerId = stickerId || '';
    
    // Собираем структуру
    noteContainer.appendChild(toolbar);
    noteContainer.appendChild(editor);
    noteContainer.appendChild(resizer);
    noteContainer.appendChild(attachBtn);
    overlay.appendChild(noteContainer);
    document.body.appendChild(overlay);
    
    // Анимация появления
    setTimeout(() => {
        overlay.classList.add('active');
        noteContainer.classList.add('active');
    }, 10);
    
    // Фокус на редактор
    editor.focus();
    
    // Обработчики событий
    setupNoteEditorHandlers(overlay, noteContainer, editor, toolbar, resizer, attachBtn, stickerId);
}

function setupNoteEditorHandlers(overlay, container, editor, toolbar, resizer, attachBtn, stickerId = null) {
    // Закрытие редактора
    const closeBtn = toolbar.querySelector('#note-editor-close');
    closeBtn.addEventListener('click', () => {
        closeNoteEditor(overlay);
    });
    
    // Закрытие при клике на overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeNoteEditor(overlay);
        }
    });
    
    // Обработчик кнопки "Прикрепить"/"Сохранить"
    attachBtn.addEventListener('click', () => {
        const content = editor.innerHTML.trim();
        if (!content || content === '<br>') {
            alert('Введите текст заметки');
            return;
        }
        
        if (stickerId) {
            // Обновляем существующий стикер
            const stickers = getStickers();
            const stickerIndex = stickers.findIndex(s => s.id === stickerId);
            if (stickerIndex !== -1) {
                stickers[stickerIndex].content = content;
                
                // Обновляем стикер в DOM
                const stickerElement = document.querySelector(`[data-sticker-id="${stickerId}"]`);
                if (stickerElement) {
                    const contentElement = stickerElement.querySelector('.sticker-content');
                    if (contentElement) {
                        contentElement.innerHTML = content;
                        // Пересчитываем высоту
                        setTimeout(() => {
                            const contentHeight = contentElement.scrollHeight;
                            const headerHeight = stickerElement.querySelector('.sticker-header').offsetHeight;
                            const resizerHeight = stickerElement.querySelector('.sticker-resizer')?.offsetHeight || 0;
                            const totalHeight = Math.max(150, contentHeight + headerHeight + resizerHeight);
                            stickers[stickerIndex].height = totalHeight;
                            stickerElement.style.height = `${totalHeight}px`;
                            saveStickers(stickers);
                            updateContentHeight();
                        }, 50);
                    }
                } else {
                    // Если элемент не найден, просто сохраняем
                    saveStickers(stickers);
                }
            }
        } else {
            // Создаем новый стикер
            createSticker(content);
        }
        
        // Закрываем редактор
        closeNoteEditor(overlay);
        
        // Очищаем редактор
        editor.innerHTML = '';
    });
    
    // Обработчики кнопок панели инструментов
    const toolbarBtns = toolbar.querySelectorAll('.toolbar-btn:not(.toolbar-btn-close)');
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const command = btn.dataset.command;
            const value = btn.dataset.value;
            
            document.execCommand(command, false, value);
            editor.focus();
        });
    });
    
    // Ресайзер для изменения высоты
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = container.offsetHeight;
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
        container.style.height = `${newHeight}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
        }
    });
    
    // Touch события для мобильных устройств
    resizer.addEventListener('touchstart', (e) => {
        isResizing = true;
        startY = e.touches[0].clientY;
        startHeight = container.offsetHeight;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isResizing) return;
        
        const deltaY = e.touches[0].clientY - startY;
        const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
        container.style.height = `${newHeight}px`;
        e.preventDefault();
    });
    
    document.addEventListener('touchend', () => {
        if (isResizing) {
            isResizing = false;
        }
    });
}

function closeNoteEditor(overlay) {
    overlay.classList.remove('active');
    const container = overlay.querySelector('.note-editor-container');
    if (container) {
        container.classList.remove('active');
    }
    
    setTimeout(() => {
        overlay.remove();
    }, 300);
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
    }
    
    if (burgerMenu && sidebarOverlay) {
        burgerMenu.addEventListener('click', () => {
            const isActive = sidebarOverlay.classList.toggle('active');
            burgerMenu.classList.toggle('active');
            if (isActive) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
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
                break;
            case 'suggest':
                console.log('Предложить идею');
                break;
        }
    }
}

// Функция setupNavigation удалена - навигация теперь работает через обычные ссылки в HTML

// Меню выбора: Заметка или Картинка
function openAddMenu() {
    // Проверяем, не открыто ли уже меню
    const existingOverlay = document.getElementById('add-menu-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Получаем позицию кнопки навигации
    const addBtn = document.getElementById('add-task-btn') || document.querySelector('.nav-add-btn');
    if (!addBtn) {
        // Если кнопка не найдена, просто открываем редактор заметки
        openNoteEditor();
        return;
    }
    
    const btnRect = addBtn.getBoundingClientRect();
    
    const overlay = document.createElement('div');
    overlay.id = 'add-menu-overlay';
    overlay.className = 'add-menu-overlay';
    
    overlay.innerHTML = `
        <div class="add-menu-content">
            <button class="add-menu-option" id="add-note-option">
                <div class="add-option-text">Добавить заметку</div>
            </button>
            <button class="add-menu-option" id="add-image-option">
                <div class="add-option-text">Добавить картинку</div>
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const menuContent = overlay.querySelector('.add-menu-content');
    
    // Вычисляем позицию меню рядом с кнопкой
    const menuWidth = 200; // Ширина меню
    const menuHeight = 120; // Высота меню (2 опции)
    let left = btnRect.left + (btnRect.width / 2) - (menuWidth / 2);
    let top = btnRect.top - menuHeight - 12; // Над кнопкой с отступом
    
    // Проверяем границы экрана
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
    }
    if (top < 10) {
        // Если не помещается сверху, показываем снизу
        top = btnRect.bottom + 12;
    }
    
    menuContent.style.left = `${left}px`;
    menuContent.style.top = `${top}px`;
    menuContent.style.transformOrigin = `${btnRect.left + btnRect.width / 2 - left}px ${btnRect.top - top}px`;
    
    // Показываем меню с анимацией
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    // Обработчик для добавления заметки
    const noteOption = overlay.querySelector('#add-note-option');
    if (noteOption) {
        noteOption.addEventListener('click', () => {
            overlay.remove();
            openNoteEditor();
        });
    }
    
    // Обработчик для загрузки картинки
    const imageOption = overlay.querySelector('#add-image-option');
    if (imageOption) {
        imageOption.addEventListener('click', () => {
            overlay.remove();
            openImageUpload();
        });
    }
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Загрузка картинки
function openImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                createImageSticker(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    input.click();
}

// Создание стикера
function createSticker(content) {
    const stickerId = Date.now();
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const contentRect = mainContent.getBoundingClientRect();
    const stickerWidth = window.innerWidth <= 768 ? 395 : 340; // Ширина стикера (395px на телефонах)
    const padding = 10; // Отступ от краев
    
    // Центрируем стикер по ширине
    const centerX = (contentRect.width - stickerWidth) / 2;
    const x = Math.max(padding, centerX);
    
    // Позиционируем в текущей видимой области
    const scrollTop = mainContent.scrollTop;
    const viewportHeight = window.innerHeight;
    const y = scrollTop + 100; // 100px от верха видимой области
    
    const sticker = {
        id: stickerId,
        type: 'note', // Тип: заметка
        content: content,
        color: '#FFEB3B', // Желтый по умолчанию
        height: 200, // Высота по умолчанию
        locked: false, // Заблокирован ли стикер
        position: { x, y }
    };
    
    // Сохраняем в localStorage
    saveSticker(sticker);
    
    // Отображаем на странице
    renderSticker(sticker);
    
    // Прокручиваем к новому стикеру
    setTimeout(() => {
        const stickerElement = document.querySelector(`[data-sticker-id="${stickerId}"]`);
        if (stickerElement) {
            stickerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
    
    // Обновляем состояние пустого экрана
    updateEmptyState();
}

// Создание картинки
function createImageSticker(imageSrc) {
    const stickerId = Date.now();
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const contentRect = mainContent.getBoundingClientRect();
    const padding = 10; // Отступ от краев
    
    // Загружаем изображение для получения размеров
    const img = new Image();
    img.onload = () => {
        // Вычисляем размеры для отображения
        const maxWidth = window.innerWidth <= 768 ? 395 : 800;
        let displayWidth = img.width;
        let displayHeight = img.height;
        
        if (displayWidth > maxWidth) {
            const scale = maxWidth / displayWidth;
            displayWidth = maxWidth;
            displayHeight = displayHeight * scale;
        }
        
        // Центрируем картинку по ширине
        const centerX = (contentRect.width - displayWidth) / 2;
        const x = Math.max(padding, centerX);
        
        // Позиционируем в текущей видимой области
        const scrollTop = mainContent.scrollTop;
        const y = scrollTop + 100; // 100px от верха видимой области
        
        const sticker = {
            id: stickerId,
            type: 'image', // Тип: картинка
            imageSrc: imageSrc,
            width: displayWidth,
            height: displayHeight,
            locked: false,
            position: { x, y }
        };
        
        // Сохраняем в localStorage
        saveSticker(sticker);
        
        // Отображаем на странице
        renderSticker(sticker);
        
        // Прокручиваем к новой картинке
        setTimeout(() => {
            const stickerElement = document.querySelector(`[data-sticker-id="${stickerId}"]`);
            if (stickerElement) {
                stickerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        
        // Обновляем состояние пустого экрана
        updateEmptyState();
    };
    
    img.src = imageSrc;
}

// Сохранение стикера
function saveSticker(sticker) {
    const stickers = getStickers();
    stickers.push(sticker);
    // Сохраняем в localStorage для обратной совместимости
    localStorage.setItem('notes_stickers', JSON.stringify(stickers));
    // Сохраняем в текущее пространство
    saveStickersToWorkspace(stickers);
}

// Сохранение стикеров в текущее пространство
function saveStickersToWorkspace(stickers) {
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
            }
        }
    } catch (error) {
        console.error('Error saving to workspace:', error);
    }
}

// Получение всех стикеров (синхронная версия для обратной совместимости)
function getStickers() {
    try {
        // Пытаемся загрузить из текущего пространства
        const workspacesJson = localStorage.getItem('workspaces');
        if (workspacesJson) {
            const workspaces = JSON.parse(workspacesJson);
            const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
            const workspace = currentWorkspaceId 
                ? workspaces.find(w => w.id === currentWorkspaceId)
                : workspaces.find(w => w.isPersonal) || workspaces[0];
            
            if (workspace && workspace.stickers) {
                return workspace.stickers;
            }
        }
    } catch (error) {
        console.error('Error loading workspace stickers:', error);
    }
    
    // Fallback на старый способ
    const stickersJson = localStorage.getItem('notes_stickers');
    return stickersJson ? JSON.parse(stickersJson) : [];
}

// Глобальная переменная для отслеживания текущего максимального z-index
let maxStickerZIndex = 1;

// Функция для определения, является ли цвет темным
function isDarkColor(color) {
    // Конвертируем hex в RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Вычисляем яркость по формуле YIQ
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Если яркость меньше 128, цвет темный
    return brightness < 128;
}

// Функция для обновления цвета текста в зависимости от фона
function updateTextColor(stickerElement, backgroundColor) {
    const stickerContent = stickerElement.querySelector('.sticker-content');
    if (stickerContent) {
        if (isDarkColor(backgroundColor)) {
            stickerContent.style.color = '#FFFFFF';
        } else {
            stickerContent.style.color = '#000000';
        }
    }
}

// Отображение стикера
function renderSticker(sticker) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const stickerElement = document.createElement('div');
    stickerElement.className = 'note-sticker';
    stickerElement.dataset.stickerId = sticker.id;
    stickerElement.style.left = `${sticker.position.x}px`;
    stickerElement.style.top = `${sticker.position.y}px`;
    stickerElement.style.zIndex = maxStickerZIndex++;
    
    // Применяем состояние блокировки (по умолчанию false, если не указано)
    if (sticker.locked === undefined) {
        sticker.locked = false;
    }
    if (sticker.locked) {
        stickerElement.classList.add('sticker-locked');
    }
    
    // Если это картинка
    if (sticker.type === 'image') {
        stickerElement.classList.add('sticker-image');
        stickerElement.style.width = `${sticker.width}px`;
        stickerElement.style.height = `${sticker.height}px`;
        stickerElement.style.backgroundColor = 'transparent';
        
        stickerElement.innerHTML = `
            <div class="sticker-header">
                <div class="sticker-controls">
                    <button class="sticker-btn sticker-lock-btn" title="Зафиксировать">
                        <svg class="lock-icon ${sticker.locked ? 'locked' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <g class="lock-open-group" style="${sticker.locked ? 'display: none;' : 'display: block;'}">
                                <rect class="lock-body-open" x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path class="lock-shackle-open" d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </g>
                            <g class="lock-closed-group" style="${sticker.locked ? 'display: block;' : 'display: none;'}">
                                <rect class="lock-body-closed" x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <circle class="lock-shackle-closed" cx="12" cy="16" r="3"></circle>
                            </g>
                        </svg>
                    </button>
                    <button class="sticker-btn sticker-save-btn" title="Сохранить картинку" data-image-src="${sticker.imageSrc}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </button>
                    <button class="sticker-btn sticker-align-btn" title="Выровнять стикеры">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="3" x2="21" y2="3"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="21" x2="21" y2="21"></line>
                        </svg>
                    </button>
                    <button class="sticker-btn sticker-delete-btn" title="${window.i18n ? window.i18n.t('common.delete') : 'Удалить'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="sticker-image-content">
                <img src="${sticker.imageSrc}" alt="Загруженное изображение" draggable="false" style="width: 100%; height: 100%; object-fit: contain; display: block; user-select: none; -webkit-user-drag: none;">
            </div>
        `;
        
        // Предотвращаем перетаскивание изображения браузером
        const img = stickerElement.querySelector('img');
        if (img) {
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
            img.addEventListener('selectstart', (e) => {
                e.preventDefault();
                return false;
            });
            // Разрешаем pointer-events для перетаскивания стикера
            img.style.pointerEvents = 'auto';
        }
        
        // Добавляем стикер в DOM
        mainContent.appendChild(stickerElement);
        
        // Настраиваем обработчики для стикера
        setupStickerHandlers(stickerElement, sticker);
        
        // Обновляем высоту контента
        updateContentHeight();
        return;
    }
    
    // Если это заметка
    stickerElement.style.backgroundColor = sticker.color || '#FFEB3B';
    if (sticker.height && sticker.height !== 200) {
        stickerElement.style.height = `${sticker.height}px`;
    } else {
        stickerElement.style.height = 'auto';
        stickerElement.style.minHeight = '150px';
    }
    
    stickerElement.innerHTML = `
        <div class="sticker-header">
            <div class="sticker-controls">
                <button class="sticker-btn sticker-color-btn" title="Изменить цвет">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </button>
                <button class="sticker-btn sticker-edit-btn" title="Редактировать">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="sticker-btn sticker-lock-btn" title="Зафиксировать стикер">
                    <svg class="lock-icon ${sticker.locked ? 'locked' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <g class="lock-open-group" style="${sticker.locked ? 'display: none;' : 'display: block;'}">
                            <rect class="lock-body-open" x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path class="lock-shackle-open" d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </g>
                        <g class="lock-closed-group" style="${sticker.locked ? 'display: block;' : 'display: none;'}">
                            <rect class="lock-body-closed" x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <circle class="lock-shackle-closed" cx="12" cy="16" r="3"></circle>
                        </g>
                    </svg>
                </button>
                <button class="sticker-btn sticker-align-btn" title="Выровнять стикеры">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="3" x2="21" y2="3"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="21" x2="21" y2="21"></line>
                    </svg>
                </button>
                <button class="sticker-btn sticker-delete-btn" title="Удалить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="sticker-content">${sticker.content}</div>
        <div class="sticker-resizer"></div>
    `;
    
    // Устанавливаем начальный цвет текста
    updateTextColor(stickerElement, sticker.color || '#FFEB3B');
    
    // Высота автоматическая на основе содержимого (если не задана вручную)
    if (sticker.height && sticker.height !== 200) {
        stickerElement.style.height = `${sticker.height}px`;
    } else {
        stickerElement.style.height = 'auto';
        stickerElement.style.minHeight = '150px';
    }
    
    // Обработчики для стикера
    setupStickerHandlers(stickerElement, sticker);
    
    // Обновляем высоту после рендеринга, если она автоматическая
    if (!sticker.height || sticker.height === 200) {
        setTimeout(() => {
            const contentHeight = stickerElement.querySelector('.sticker-content').scrollHeight;
            const headerHeight = stickerElement.querySelector('.sticker-header').offsetHeight;
            const resizerHeight = stickerElement.querySelector('.sticker-resizer')?.offsetHeight || 0;
            const totalHeight = contentHeight + headerHeight + resizerHeight;
            if (totalHeight > 150) {
                sticker.height = totalHeight;
                stickerElement.style.height = `${totalHeight}px`;
                updateSticker(sticker);
            }
        }, 100);
    }
    
    // Добавляем стикер в DOM (после настройки всего содержимого)
    mainContent.appendChild(stickerElement);
    
    // Настраиваем обработчики для стикера
    setupStickerHandlers(stickerElement, sticker);
    
    // Обновляем высоту контента
    updateContentHeight();
}

// Функция для поднятия стикера наверх (как окна в macOS)
function bringStickerToFront(stickerElement) {
    // Убираем класс у всех стикеров
    document.querySelectorAll('.note-sticker').forEach(sticker => {
        sticker.classList.remove('bring-to-front');
        // Сбрасываем z-index на начальный, кроме текущего
        if (sticker !== stickerElement) {
            sticker.style.zIndex = '1';
        }
    });
    
    // Поднимаем текущий стикер (но не выше z-index хедера 3001)
    stickerElement.classList.add('bring-to-front');
    const newZIndex = Math.min(maxStickerZIndex++, 50); // Максимум 50, чтобы быть под хедером
    stickerElement.style.zIndex = newZIndex;
}

// Обработчики для стикера
function setupStickerHandlers(stickerElement, sticker) {
    // Определяем тип стикера (для обратной совместимости, если type не указан, считаем заметкой)
    const isImage = sticker.type === 'image';
    
    // Поднятие стикера наверх при клике (как окна в macOS)
    stickerElement.addEventListener('mousedown', (e) => {
        // Не поднимаем при клике на кнопки
        if (e.target.closest('.sticker-btn')) return;
        bringStickerToFront(stickerElement);
    });
    
    stickerElement.addEventListener('touchstart', (e) => {
        if (e.target.closest('.sticker-btn')) return;
        bringStickerToFront(stickerElement);
    });
    
    // Изменение цвета через палитру (только для заметок)
    const colorBtn = stickerElement.querySelector('.sticker-color-btn');
    if (colorBtn && !isImage) {
        colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Закрываем другие открытые палитры
        document.querySelectorAll('.color-picker-popup').forEach(popup => {
            popup.remove();
        });
        
        // Получаем позицию кнопки
        const btnRect = colorBtn.getBoundingClientRect();
        
        // Предустановленные цвета
        const presetColors = [
            '#FFEB3B', '#FF9800', '#F44336', '#E91E63',
            '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
            '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39',
            '#795548', '#607D8B', '#000000', '#FFFFFF'
        ];
        
        // Создаем кастомную палитру
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker-popup';
        colorPicker.style.position = 'fixed';
        colorPicker.style.zIndex = '10000';
        colorPicker.style.visibility = 'hidden'; // Скрываем для измерения
        
        // Создаем сетку цветов
        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-picker-grid';
        presetColors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-picker-item';
            colorItem.style.backgroundColor = color;
            if (color === '#FFFFFF') {
                colorItem.style.border = '1px solid #E0E0E0';
            }
            colorItem.title = color;
            colorItem.addEventListener('click', () => {
                sticker.color = color;
                stickerElement.style.backgroundColor = color;
                updateTextColor(stickerElement, color);
                updateSticker(sticker);
                colorPicker.remove();
            });
            colorGrid.appendChild(colorItem);
        });
        
        colorPicker.appendChild(colorGrid);
        document.body.appendChild(colorPicker);
        
        // Получаем реальные размеры палитры
        const pickerWidth = colorPicker.offsetWidth;
        const pickerHeight = colorPicker.offsetHeight;
        
        // Вычисляем позицию с учетом границ экрана
        let left = btnRect.left;
        let top = btnRect.bottom + 8;
        
        // Проверяем правую границу
        if (left + pickerWidth > window.innerWidth - 10) {
            left = window.innerWidth - pickerWidth - 10;
        }
        
        // Проверяем левую границу
        if (left < 10) {
            left = 10;
        }
        
        // Проверяем нижнюю границу
        if (top + pickerHeight > window.innerHeight - 10) {
            // Если не помещается снизу, показываем сверху
            top = btnRect.top - pickerHeight - 8;
            // Если и сверху не помещается, прижимаем к верхней границе
            if (top < 10) {
                top = 10;
            }
        }
        
        // Устанавливаем финальную позицию и делаем видимой
        colorPicker.style.left = `${left}px`;
        colorPicker.style.top = `${top}px`;
        colorPicker.style.visibility = 'visible';
        
        // Закрываем при клике вне палитры
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!colorPicker.contains(e.target) && e.target !== colorBtn) {
                    colorPicker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 0);
        });
    }
    
    // Редактирование стикера (только для заметок)
    const editBtn = stickerElement.querySelector('.sticker-edit-btn');
    if (editBtn && !isImage) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteEditor(sticker.id);
        });
    }
    
    // Устанавливаем начальный цвет текста (только для заметок)
    if (!isImage) {
        updateTextColor(stickerElement, sticker.color || '#FFEB3B');
    }
    
    // Изменение размера через перетаскивание нижнего угла (только для заметок)
    const resizer = stickerElement.querySelector('.sticker-resizer');
    if (resizer && !isImage) {
        let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    
    const startResize = (e) => {
        if (sticker.locked) return; // Нельзя изменять размер заблокированного стикера
        isResizing = true;
        startY = e.clientY || e.touches[0].clientY;
        startHeight = stickerElement.offsetHeight;
        document.body.style.cursor = 'ns-resize';
        stickerElement.style.cursor = 'ns-resize';
        e.preventDefault();
    };
    
    const doResize = (e) => {
        if (!isResizing) return;
        const currentY = e.clientY || e.touches[0].clientY;
        const deltaY = currentY - startY;
        const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
        sticker.height = newHeight;
        stickerElement.style.height = `${newHeight}px`;
        updateSticker(sticker);
        updateContentHeight();
        e.preventDefault();
    };
    
    const stopResize = () => {
        isResizing = false;
        document.body.style.cursor = '';
        stickerElement.style.cursor = sticker.locked ? 'default' : 'grab';
    };
    
        resizer.addEventListener('mousedown', startResize);
        resizer.addEventListener('touchstart', startResize);
        document.addEventListener('mousemove', doResize);
        document.addEventListener('touchmove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
    }
    
    // Блокировка/разблокировка стикера
    // Закрепление (работает для всех типов)
    const lockBtn = stickerElement.querySelector('.sticker-lock-btn');
    if (lockBtn) {
        const lockIcon = lockBtn.querySelector('.lock-icon');
        const lockOpenGroup = lockIcon.querySelector('.lock-open-group');
        const lockClosedGroup = lockIcon.querySelector('.lock-closed-group');
        
        // Устанавливаем начальное состояние иконки
        updateLockIcon(sticker.locked);
        
        function updateLockIcon(locked) {
            if (locked) {
                // Показываем закрытый замочек с анимацией
                lockOpenGroup.style.display = 'none';
                lockClosedGroup.style.display = 'block';
                lockIcon.classList.add('locked');
            } else {
                // Показываем открытый замочек с анимацией
                lockOpenGroup.style.display = 'block';
                lockClosedGroup.style.display = 'none';
                lockIcon.classList.remove('locked');
            }
        }
        
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sticker.locked = !sticker.locked;
            
            if (sticker.locked) {
                // Блокируем стикер
                stickerElement.classList.add('sticker-locked');
                stickerElement.style.cursor = 'default';
                // Отключаем перетаскивание
                stickerHeader.style.cursor = 'default';
            } else {
                // Разблокируем стикер
                stickerElement.classList.remove('sticker-locked');
                stickerElement.style.cursor = 'grab';
                stickerHeader.style.cursor = 'grab';
            }
            
            // Анимируем изменение иконки
            updateLockIcon(sticker.locked);
            
            // Сохраняем состояние
            updateSticker(sticker);
        });
    }
    
    // Сохранение картинки (только для изображений)
    if (isImage) {
        const saveBtn = stickerElement.querySelector('.sticker-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    const imageSrc = saveBtn.dataset.imageSrc || sticker.imageSrc;
                    if (!imageSrc) return;
                    
                    // Создаем временное изображение для получения оригинальных размеров
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        // Создаем canvas с оригинальными размерами
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        // Конвертируем в blob и сохраняем
                        canvas.toBlob((blob) => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `image-${sticker.id}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            window.customModal?.success('Картинка сохранена!') || alert('Картинка сохранена!');
                        }, 'image/png');
                    };
                    img.onerror = () => {
                        // Если не удалось загрузить с crossOrigin, пробуем напрямую
                        const a = document.createElement('a');
                        a.href = imageSrc;
                        a.download = `image-${sticker.id}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.customModal?.success('Картинка сохранена!') || alert('Картинка сохранена!');
                    };
                    img.src = imageSrc;
                } catch (error) {
                    console.error('Error saving image:', error);
                    window.customModal?.error('Ошибка при сохранении картинки') || alert('Ошибка при сохранении картинки');
                }
            });
        }
    }
    
    // Выравнивание стикеров (для всех типов)
    const alignBtn = stickerElement.querySelector('.sticker-align-btn');
    if (alignBtn) {
        alignBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alignAllStickers();
        });
    }
    
    // Удаление
    const deleteBtn = stickerElement.querySelector('.sticker-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmText = isImage 
                ? (window.i18n ? window.i18n.t('modal.deleteImage') : 'Удалить картинку?')
                : (window.i18n ? window.i18n.t('modal.deleteNote') : 'Удалить заметку?');
            
            // Используем только customModal, без fallback на confirm
            if (window.customModal && window.customModal.confirm) {
                const confirmed = await window.customModal.confirm(confirmText);
                if (confirmed === true) {
                    deleteSticker(sticker.id);
                    stickerElement.remove();
                    updateContentHeight();
                    updateEmptyState();
                }
            } else {
                // Fallback только если customModal недоступен
                const confirmed = confirm(confirmText);
                if (confirmed) {
                    deleteSticker(sticker.id);
                    stickerElement.remove();
                    updateContentHeight();
                    updateEmptyState();
                }
            }
        });
    }
    
    // Перетаскивание стикера
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let stickerStartX = 0;
    let stickerStartY = 0;
    
    const stickerHeader = stickerElement.querySelector('.sticker-header');
    
    // Устанавливаем курсор в зависимости от состояния блокировки
    if (sticker.locked) {
        stickerElement.style.cursor = 'default';
        stickerHeader.style.cursor = 'default';
    } else {
        stickerElement.style.cursor = 'grab';
        stickerHeader.style.cursor = 'grab';
    }
    
    const handleMouseMove = (e) => {
        if (!isDragging || sticker.locked) return; // Не перетаскиваем заблокированный стикер
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;
        
        // Вычисляем новую позицию относительно контента
        const newX = stickerStartX + deltaX;
        const newY = stickerStartY + deltaY;
        
        sticker.position.x = newX;
        sticker.position.y = newY;
        stickerElement.style.left = `${newX}px`;
        stickerElement.style.top = `${newY}px`;
        updateSticker(sticker);
        updateContentHeight();
        e.preventDefault();
    };
    
    const handleMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            stickerElement.style.cursor = sticker.locked ? 'default' : 'grab';
            if (stickerHeader) stickerHeader.style.cursor = sticker.locked ? 'default' : 'grab';
            const stickerImageContent = stickerElement.querySelector('.sticker-image-content');
            if (stickerImageContent) stickerImageContent.style.cursor = sticker.locked ? 'default' : 'grab';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        }
    };
    
    const startDrag = (e) => {
        if (e.target.closest('.sticker-btn') || sticker.locked) return; // Не перетаскиваем заблокированный стикер
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        isDragging = true;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        dragStartX = clientX;
        dragStartY = clientY;
        const rect = stickerElement.getBoundingClientRect();
        const contentRect = mainContent.getBoundingClientRect();
        
        // Позиция относительно контента с учетом скролла
        stickerStartX = rect.left - contentRect.left;
        stickerStartY = rect.top - contentRect.top + mainContent.scrollTop;
        
        stickerElement.style.cursor = 'grabbing';
        if (stickerHeader) stickerHeader.style.cursor = 'grabbing';
        const stickerImageContent = stickerElement.querySelector('.sticker-image-content');
        if (stickerImageContent) stickerImageContent.style.cursor = 'grabbing';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', handleMouseUp);
        e.preventDefault();
    };
    
    // Перетаскивание через header
    if (stickerHeader) {
        stickerHeader.addEventListener('mousedown', startDrag);
        stickerHeader.addEventListener('touchstart', startDrag);
    }
    
    // Перетаскивание через само изображение (для картинок)
    const stickerImageContent = stickerElement.querySelector('.sticker-image-content');
    if (stickerImageContent) {
        stickerImageContent.addEventListener('mousedown', startDrag);
        stickerImageContent.addEventListener('touchstart', startDrag);
    }
}

// Обновление стикера в localStorage
function updateSticker(sticker) {
    const stickers = getStickers();
    const index = stickers.findIndex(s => s.id === sticker.id);
    if (index !== -1) {
        stickers[index] = sticker;
        localStorage.setItem('notes_stickers', JSON.stringify(stickers));
        saveStickersToWorkspace(stickers);
    }
}

// Удаление стикера
function deleteSticker(stickerId) {
    const stickers = getStickers();
    const filtered = stickers.filter(s => s.id !== stickerId);
    localStorage.setItem('notes_stickers', JSON.stringify(filtered));
    saveStickersToWorkspace(filtered);
    updateContentHeight();
    
    // Обновляем состояние пустого экрана
    updateEmptyState();
}

// Обновление высоты контента для возможности прокрутки до всех стикеров
function updateContentHeight() {
    try {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        const stickers = mainContent.querySelectorAll('.note-sticker');
        if (stickers.length === 0) {
            mainContent.style.minHeight = 'calc(100vh - 160px)';
            return;
        }
        
        let maxBottom = 0;
        const viewportHeight = window.innerHeight || 800;
        const headerHeight = 60;
        const minViewportHeight = Math.max(400, viewportHeight - headerHeight - 100);
        
        stickers.forEach(sticker => {
            try {
                const rect = sticker.getBoundingClientRect();
                const contentRect = mainContent.getBoundingClientRect();
                const relativeTop = rect.top - contentRect.top + mainContent.scrollTop;
                const bottom = relativeTop + (rect.height || 200);
                if (bottom > maxBottom) {
                    maxBottom = bottom;
                }
            } catch (error) {
                console.error('Error calculating sticker position:', error);
            }
        });
        
        // Устанавливаем минимальную высоту контента
        const minHeight = Math.max(
            minViewportHeight,
            maxBottom + 150
        );
        mainContent.style.minHeight = `${minHeight}px`;
    } catch (error) {
        console.error('Error in updateContentHeight:', error);
    }
}

// Создание элемента пустого состояния
function createEmptyState() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Проверяем, не существует ли уже элемент пустого состояния
    let emptyState = mainContent.querySelector('.empty-state');
    if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-text">Добавьте стикер с заметкой</div>
        `;
        // Устанавливаем стили сразу, чтобы избежать визуального "перемещения"
        emptyState.style.position = 'absolute';
        emptyState.style.top = '0';
        emptyState.style.left = '0';
        emptyState.style.right = '0';
        emptyState.style.bottom = '0';
        emptyState.style.display = 'flex';
        emptyState.style.alignItems = 'center';
        emptyState.style.justifyContent = 'center';
        emptyState.style.width = '100%';
        emptyState.style.height = '100%';
        emptyState.style.padding = '40px 20px';
        emptyState.style.pointerEvents = 'none';
        emptyState.style.zIndex = '1';
        mainContent.appendChild(emptyState);
    }
    return emptyState;
}

// Обновление видимости пустого состояния
function updateEmptyState() {
    const stickers = getStickers();
    const emptyState = createEmptyState();
    if (!emptyState) return;
    
    if (stickers.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
    }
}

// Функция выравнивания всех стикеров
function alignAllStickers() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('main-content element not found in alignAllStickers');
        return;
    }
    
    const stickers = getStickers();
    const stickerElements = document.querySelectorAll('.note-sticker');
    if (stickers.length === 0 || stickerElements.length === 0) {
        console.warn('No stickers to align');
        return;
    }
    
    // Определяем количество столбцов в зависимости от ширины экрана
    let columns = 1;
    if (window.innerWidth >= 1024) {
        columns = 3; // ПК
    } else if (window.innerWidth >= 768) {
        columns = 2; // Планшет
    } else {
        columns = 1; // Телефон
    }
    
    const padding = 10; // Одинаковый отступ слева и справа
    const gap = 20; // Отступ между стикерами (сверху и снизу)
    // Определяем ширину стикера в зависимости от размера экрана
    let stickerWidth = 340;
    if (window.innerWidth <= 768) {
        stickerWidth = 370; // Ширина для телефонов
    } else if (window.innerWidth <= 810) {
        stickerWidth = 370; // Ширина для экранов 810px и ниже
    } else if (window.innerWidth >= 811 && window.innerWidth < 1024) {
        stickerWidth = 380; // Увеличенная ширина для планшетов
    }
    const availableWidth = mainContent.offsetWidth - (padding * 2);
    
    // Вычисляем ширину столбца и начальную позицию
    let columnWidth, startX;
    if (columns === 1) {
        // Один столбец - стикер по центру
        // Используем реальную ширину стикера для центрирования
        startX = padding + (availableWidth - stickerWidth) / 2;
        // Убеждаемся, что не выходим за границы
        startX = Math.max(padding, Math.min(startX, mainContent.offsetWidth - padding - stickerWidth));
    } else {
        // Несколько столбцов - одинаковые отступы слева и справа
        columnWidth = (availableWidth - (gap * (columns - 1))) / columns;
        startX = padding; // Одинаковый отступ слева
    }
    
    // Сортируем стикеры по ID для стабильного порядка
    const sortedStickers = Array.from(stickerElements).sort((a, b) => {
        return parseInt(a.dataset.stickerId) - parseInt(b.dataset.stickerId);
    });
    
    // Распределяем стикеры по столбцам (начинаем с отступа сверху)
    const columnHeights = new Array(columns).fill(padding);
    
    sortedStickers.forEach((stickerElement, index) => {
        const column = index % columns;
        let x;
        
        if (columns === 1) {
            // Один столбец - по центру
            // Для картинок используем их реальную ширину (370px на телефонах), для заметок - stickerWidth
            let currentStickerWidth;
            if (stickerElement.classList.contains('sticker-image')) {
                // Для картинок на телефонах используем 370px
                if (window.innerWidth <= 810) {
                    currentStickerWidth = 370;
                } else {
                    currentStickerWidth = stickerElement.offsetWidth || 370;
                }
            } else {
                currentStickerWidth = stickerWidth;
            }
            x = padding + (availableWidth - currentStickerWidth) / 2;
            x = Math.max(padding, Math.min(x, mainContent.offsetWidth - padding - currentStickerWidth));
        } else {
            // Несколько столбцов - учитываем отступ справа
            x = startX + column * (columnWidth + gap);
            // Убеждаемся, что последний столбец не выходит за границы (одинаковый отступ справа)
            if (column === columns - 1) {
                const maxX = mainContent.offsetWidth - padding - columnWidth;
                if (x > maxX) {
                    x = maxX;
                }
            }
        }
        
        const y = columnHeights[column];
        
        // Обновляем позицию и ширину (для заметок, не для картинок)
        stickerElement.style.left = `${x}px`;
        stickerElement.style.top = `${y}px`;
        stickerElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Обновляем ширину стикера (только для заметок, не для картинок)
        if (!stickerElement.classList.contains('sticker-image')) {
            stickerElement.style.width = `${stickerWidth}px`;
            stickerElement.style.maxWidth = `${stickerWidth}px`;
        }
        
        // Обновляем высоту столбца (используем реальную высоту стикера + отступ)
        // Для картинок используем getBoundingClientRect для более точного измерения
        // Важно: получаем высоту ПОСЛЕ установки позиции, чтобы она была актуальной
        let stickerHeight;
        if (stickerElement.classList.contains('sticker-image')) {
            // Принудительно пересчитываем layout для картинок
            void stickerElement.offsetHeight; // Force reflow
            const rect = stickerElement.getBoundingClientRect();
            stickerHeight = rect.height || stickerElement.offsetHeight || stickerElement.scrollHeight || 200;
            // Убеждаемся, что высота не равна 0
            if (stickerHeight < 10) {
                stickerHeight = stickerElement.scrollHeight || 200;
            }
        } else {
            stickerHeight = stickerElement.offsetHeight || stickerElement.scrollHeight || 200;
        }
        // Используем одинаковый отступ для всех типов стикеров
        columnHeights[column] += stickerHeight + gap; // Добавляем gap для отступа снизу
        
        // Обновляем позицию в данных стикера
        const stickerId = parseInt(stickerElement.dataset.stickerId);
        const sticker = stickers.find(s => s.id === stickerId);
        if (sticker) {
            sticker.position.x = x;
            sticker.position.y = y;
            updateSticker(sticker);
        }
    });
    
    // Убираем transition после анимации
    setTimeout(() => {
        sortedStickers.forEach(stickerElement => {
            stickerElement.style.transition = '';
        });
    }, 400);
    
    // Обновляем высоту контента после выравнивания
    setTimeout(() => {
        updateContentHeight();
        // Убеждаемся, что стикеры видны
        const mainContent = document.querySelector('.main-content');
        if (mainContent && sortedStickers.length > 0) {
            // Прокручиваем к первому стикеру, если он не виден
            const firstSticker = sortedStickers[0];
            if (firstSticker) {
                const firstRect = firstSticker.getBoundingClientRect();
                const contentRect = mainContent.getBoundingClientRect();
                if (firstRect.top < contentRect.top || firstRect.bottom > contentRect.bottom) {
                    firstSticker.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }, 500);
}

// Загрузка всех стикеров при инициализации
function loadStickers() {
    try {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('main-content element not found');
            updateEmptyState();
            return;
        }
        
        // Убеждаемся, что контент виден
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        mainContent.style.display = 'block';
        
        // Загружаем стикеры из текущего пространства
        const stickers = getStickers();
        if (!stickers || !Array.isArray(stickers) || stickers.length === 0) {
            updateEmptyState();
            return;
        }
        
        // Очищаем существующие стикеры в DOM (на случай повторной загрузки)
        const existingStickers = mainContent.querySelectorAll('.note-sticker');
        existingStickers.forEach(sticker => {
            try {
                sticker.remove();
            } catch (error) {
                console.error('Error removing sticker:', error);
            }
        });
        
        // Рендерим все стикеры
        stickers.forEach((sticker, index) => {
            try {
                // Убеждаемся, что поле locked установлено (по умолчанию false)
                if (sticker.locked === undefined) {
                    sticker.locked = false;
                }
                // Убеждаемся, что тип установлен (для обратной совместимости)
                if (!sticker.type) {
                    sticker.type = 'note';
                }
                // Убеждаемся, что позиция установлена и центрируем
                const contentRect = mainContent.getBoundingClientRect();
                // Определяем ширину стикера в зависимости от размера экрана
                let stickerWidth = 340;
                if (window.innerWidth <= 768) {
                    stickerWidth = 370; // Ширина для телефонов
                } else if (window.innerWidth <= 810) {
                    stickerWidth = 370; // Ширина для экранов 810px и ниже
                } else if (window.innerWidth >= 811 && window.innerWidth < 1024) {
                    stickerWidth = 380; // Увеличенная ширина для планшетов
                }
                // Для картинок используем их реальную ширину, если она меньше stickerWidth
                if (sticker.type === 'image' && sticker.width) {
                    stickerWidth = Math.min(sticker.width, stickerWidth);
                }
                
                const padding = 10;
                const availableWidth = contentRect.width - (padding * 2);
                const centerX = padding + (availableWidth - stickerWidth) / 2;
                const x = Math.max(padding, Math.min(centerX, contentRect.width - padding - stickerWidth));
                
                if (!sticker.position || typeof sticker.position !== 'object') {
                    sticker.position = { x, y: 20 + (index * 10) };
                } else {
                    // Центрируем существующие стикеры по ширине
                    sticker.position.x = x;
                }
                // Убеждаемся, что есть id
                if (!sticker.id) {
                    sticker.id = Date.now() + index;
                }
                renderSticker(sticker);
            } catch (error) {
                console.error('Error rendering sticker:', error, sticker);
            }
        });
        
        // Обновляем высоту и состояние пустого экрана
        requestAnimationFrame(() => {
            try {
                updateContentHeight();
                updateEmptyState();
            } catch (error) {
                console.error('Error updating content after loading stickers:', error);
            }
        });
    } catch (error) {
        console.error('Error in loadStickers:', error);
        // Убеждаемся, что контент виден даже при ошибке
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            mainContent.style.display = 'block';
        }
        updateEmptyState();
    }
}

// ==================== РАБОТА С ПРОСТРАНСТВАМИ ====================

let workspacesModule = null;

// Инициализация модуля пространств
async function initWorkspacesModule() {
    if (!workspacesModule) {
        workspacesModule = await import('../modules/workspaces.js');
    }
    return workspacesModule;
}

// Настройка работы с пространствами
async function setupWorkspaces() {
    const module = await initWorkspacesModule();
    
    // Обработчик закрытия шторки
    const closeBtn = document.getElementById('workspaces-close-btn');
    const panel = document.getElementById('workspaces-panel');
    const panelContent = panel?.querySelector('.workspaces-panel-content');
    
    if (closeBtn && panel) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWorkspacesPanel();
        });
        
        // Закрытие при клике вне панели (на overlay, но не на content)
        panel.addEventListener('click', (e) => {
            // Проверяем, что клик был именно на overlay (сам panel), а не на content или его дочерние элементы
            if (e.target === panel) {
                closeWorkspacesPanel();
            }
        });
        
        // Предотвращаем закрытие при клике внутри content
        if (panelContent) {
            panelContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    // Обработчик создания пространства
    const createBtn = document.getElementById('workspace-create-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            openCreateWorkspaceModal();
        });
    }
    
    // Обработчики модального окна создания
    const createModal = document.getElementById('workspace-create-modal');
    const createInput = document.getElementById('workspace-name-input');
    const createCancel = document.getElementById('workspace-cancel-btn');
    const createConfirm = document.getElementById('workspace-confirm-btn');
    
    if (createCancel) {
        createCancel.addEventListener('click', () => {
            closeCreateWorkspaceModal();
        });
    }
    
    if (createConfirm) {
        createConfirm.addEventListener('click', async () => {
            const name = createInput?.value.trim();
            if (name) {
                try {
                    const newWorkspace = module.createWorkspace(name);
                    await switchWorkspace(newWorkspace.id);
                    closeCreateWorkspaceModal();
                    closeWorkspacesPanel();
                    renderWorkspacesList();
                    if (window.customModal) {
                        const successText = window.i18n ? window.i18n.t('workspace.created') : 'Пространство создано!';
                        await window.customModal.success(successText);
                    }
                } catch (error) {
                    console.error('Error creating workspace:', error);
                    if (window.customModal) {
                        await window.customModal.error('Ошибка при создании пространства');
                    }
                }
            }
        });
    }
    
    if (createInput) {
        createInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createConfirm?.click();
            }
        });
    }
    
    // Обработчики модального окна редактирования
    const editModal = document.getElementById('workspace-edit-modal');
    const editInput = document.getElementById('workspace-edit-input');
    const editCancel = document.getElementById('workspace-edit-cancel-btn');
    const editConfirm = document.getElementById('workspace-edit-confirm-btn');
    
    if (editCancel) {
        editCancel.addEventListener('click', () => {
            closeEditWorkspaceModal();
        });
    }
    
    if (editConfirm) {
        editConfirm.addEventListener('click', async () => {
            const name = editInput?.value.trim();
            const workspaceId = editInput?.dataset.workspaceId;
            if (name && workspaceId) {
                try {
                    module.renameWorkspace(workspaceId, name);
                    closeEditWorkspaceModal();
                    renderWorkspacesList();
                    updateWorkspaceName();
                    if (window.customModal) {
                        const successText = window.i18n ? window.i18n.t('workspace.renamed') : 'Пространство переименовано!';
                        await window.customModal.success(successText);
                    }
                } catch (error) {
                    console.error('Error renaming workspace:', error);
                    if (window.customModal) {
                        await window.customModal.error('Ошибка при переименовании пространства');
                    }
                }
            }
        });
    }
    
    // Обработчик закрытия модального окна участников
    const membersClose = document.getElementById('workspace-members-close');
    if (membersClose) {
        membersClose.addEventListener('click', () => {
            closeMembersModal();
        });
    }
    
    // Инициализация списка пространств
    renderWorkspacesList();
}

// Открытие шторки пространств
async function openWorkspacesPanel() {
    const panel = document.getElementById('workspaces-panel');
    if (panel) {
        // Получаем количество пространств для определения высоты
        const module = await initWorkspacesModule();
        const workspaces = module.getWorkspaces();
        const workspacesCount = workspaces.length;
        
        // Устанавливаем высоту в зависимости от количества пространств
        if (workspacesCount <= 2) {
            panel.style.height = '40vh';
        } else {
            panel.style.height = '55vh';
        }
        
        panel.classList.add('active');
        renderWorkspacesList();
    }
}

// Закрытие шторки пространств
function closeWorkspacesPanel() {
    const panel = document.getElementById('workspaces-panel');
    if (panel) {
        panel.classList.remove('active');
    }
}

// Отображение списка пространств
async function renderWorkspacesList() {
    const module = await initWorkspacesModule();
    const workspaces = module.getWorkspaces();
    const currentWorkspace = module.getCurrentWorkspace();
    const list = document.getElementById('workspaces-list');
    const panel = document.getElementById('workspaces-panel');
    
    if (!list) return;
    
    // Обновляем высоту шторки в зависимости от количества пространств
    if (panel) {
        const workspacesCount = workspaces.length;
        if (workspacesCount <= 2) {
            panel.style.height = '40vh';
        } else {
            panel.style.height = '55vh';
        }
    }
    
    list.innerHTML = '';
    
    workspaces.forEach(workspace => {
        const item = document.createElement('div');
        item.className = `workspace-item ${workspace.id === currentWorkspace.id ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="workspace-item-content">
                <div class="workspace-item-name" data-workspace-id="${workspace.id}">
                    ${escapeHtml(workspace.name)}
                </div>
                ${workspace.isPersonal ? `<span class="workspace-personal-badge">${window.i18n ? window.i18n.t('workspace.personal') : 'Личное пространство'}</span>` : ''}
            </div>
            <div class="workspace-item-actions">
                ${!workspace.isPersonal ? `
                    <button class="workspace-action-btn workspace-edit-btn" data-workspace-id="${workspace.id}" title="${window.i18n ? window.i18n.t('workspace.editTitle') : 'Редактировать'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="workspace-action-btn workspace-delete-btn" data-workspace-id="${workspace.id}" title="${window.i18n ? window.i18n.t('workspace.delete') : 'Удалить'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
        
        // Обработчик клика на название (показать участников)
        const nameElement = item.querySelector('.workspace-item-name');
        if (nameElement) {
            nameElement.addEventListener('click', () => {
                showWorkspaceMembers(workspace);
            });
        }
        
        // Обработчик переключения пространства
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.workspace-item-actions') && !e.target.closest('.workspace-item-name')) {
                switchWorkspace(workspace.id);
            }
        });
        
        // Обработчик редактирования
        const editBtn = item.querySelector('.workspace-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditWorkspaceModal(workspace);
            });
        }
        
        // Обработчик удаления
        const deleteBtn = item.querySelector('.workspace-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmText = window.i18n ? window.i18n.t('modal.deleteWorkspace') : 'Удалить пространство? Все стикеры будут удалены.';
                const confirmed = await window.customModal?.confirm(confirmText) || confirm(confirmText);
                if (confirmed) {
                    try {
                        module.deleteWorkspace(workspace.id);
                        // Обновляем высоту шторки после удаления
                        const panel = document.getElementById('workspaces-panel');
                        if (panel) {
                            const remainingWorkspaces = module.getWorkspaces();
                            if (remainingWorkspaces.length <= 2) {
                                panel.style.height = '40vh';
                            } else {
                                panel.style.height = '55vh';
                            }
                        }
                        renderWorkspacesList();
                        updateWorkspaceName();
                        // Перезагружаем стикеры
                        loadStickers();
                    } catch (error) {
                        console.error('Error deleting workspace:', error);
                        if (window.customModal) {
                            await window.customModal.error(error.message || 'Ошибка при удалении пространства');
                        }
                    }
                }
            });
        }
        
        list.appendChild(item);
    });
}

// Переключение пространства
async function switchWorkspace(workspaceId) {
    const module = await initWorkspacesModule();
    
    // Сохраняем текущие стикеры в текущее пространство
    const currentStickers = getStickers();
    saveStickersToWorkspace(currentStickers);
    
    // Переключаемся на новое пространство
    module.setCurrentWorkspace(workspaceId);
    
    // Загружаем стикеры нового пространства
    const newStickers = module.getWorkspaceStickers();
    // Обновляем localStorage для обратной совместимости
    localStorage.setItem('notes_stickers', JSON.stringify(newStickers));
    
    // Очищаем DOM от старых стикеров
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const existingStickers = mainContent.querySelectorAll('.note-sticker');
        existingStickers.forEach(sticker => sticker.remove());
    }
    
    // Обновляем UI
    updateWorkspaceName();
    loadStickers();
    closeWorkspacesPanel();
}

// Обновление названия пространства в хедере
async function updateWorkspaceName() {
    const module = await initWorkspacesModule();
    const workspace = module.getCurrentWorkspace();
    const nameBar = document.getElementById('workspace-name-bar');
    const nameText = document.getElementById('workspace-name-text');
    
    if (nameText && workspace) {
        nameText.textContent = workspace.name;
    }
    
    if (nameBar) {
        nameBar.style.display = 'block';
    }
}

// Открытие модального окна создания пространства
function openCreateWorkspaceModal() {
    const modal = document.getElementById('workspace-create-modal');
    const input = document.getElementById('workspace-name-input');
    if (modal) {
        modal.classList.add('active');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

// Закрытие модального окна создания пространства
function closeCreateWorkspaceModal() {
    const modal = document.getElementById('workspace-create-modal');
    const input = document.getElementById('workspace-name-input');
    if (modal) {
        modal.classList.remove('active');
    }
    if (input) {
        input.value = '';
    }
}

// Открытие модального окна редактирования пространства
async function openEditWorkspaceModal(workspace) {
    const modal = document.getElementById('workspace-edit-modal');
    const input = document.getElementById('workspace-edit-input');
    if (modal && input) {
        input.value = workspace.name;
        input.dataset.workspaceId = workspace.id;
        modal.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }
}

// Закрытие модального окна редактирования пространства
function closeEditWorkspaceModal() {
    const modal = document.getElementById('workspace-edit-modal');
    const input = document.getElementById('workspace-edit-input');
    if (modal) {
        modal.classList.remove('active');
    }
    if (input) {
        input.value = '';
        delete input.dataset.workspaceId;
    }
}

// Показать участников пространства
async function showWorkspaceMembers(workspace) {
    const module = await initWorkspacesModule();
    const modal = document.getElementById('workspace-members-modal');
    const title = document.getElementById('workspace-members-title');
    const list = document.getElementById('workspace-members-list');
    
    if (!modal || !list) return;
    
    if (title) {
        title.textContent = `Участники: ${workspace.name}`;
    }
    
    list.innerHTML = '';
    
    if (workspace.members.length === 0) {
        list.innerHTML = '<div class="workspace-members-empty">Нет участников</div>';
    } else {
        workspace.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'workspace-member-item';
            
            memberItem.innerHTML = `
                <div class="workspace-member-avatar" data-user-name="${escapeHtml(member.userName)}">
                    ${member.avatar ? 
                        `<img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.userName)}">` : 
                        `<div class="workspace-member-avatar-placeholder">${member.userName.charAt(0).toUpperCase()}</div>`
                    }
                </div>
                <div class="workspace-member-name">${escapeHtml(member.userName)}</div>
            `;
            
            // Показ имени при клике на аватар
            const avatar = memberItem.querySelector('.workspace-member-avatar');
            if (avatar) {
                avatar.addEventListener('click', async () => {
                    const userName = avatar.dataset.userName;
                    await window.customModal?.alert(`Пользователь: ${userName}`);
                });
            }
            
            list.appendChild(memberItem);
        });
    }
    
    modal.classList.add('active');
}

// Закрытие модального окна участников
function closeMembersModal() {
    const modal = document.getElementById('workspace-members-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Настройка кнопки совместной работы
function setupCollaborateButton() {
    // Пробуем найти кнопку несколько раз с задержкой
    const trySetup = (attempt = 0) => {
        const collaborateBtn = document.getElementById('collaborate-btn');
        if (collaborateBtn) {
            // Удаляем все старые обработчики
            const newBtn = collaborateBtn.cloneNode(true);
            collaborateBtn.parentNode?.replaceChild(newBtn, collaborateBtn);
            
            // Добавляем новый обработчик
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('✅ Collaborate button clicked!');
                try {
                    await handleInviteClick();
                } catch (error) {
                    console.error('Error in handleInviteClick:', error);
                    await window.customModal?.error('Ошибка при обработке приглашения: ' + error.message);
                }
            }, true); // Используем capture phase
            
            // Также добавляем обработчик на touchstart для мобильных
            newBtn.addEventListener('touchstart', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('✅ Collaborate button touched!');
                try {
                    await handleInviteClick();
                } catch (error) {
                    console.error('Error in handleInviteClick:', error);
                    await window.customModal?.error('Ошибка при обработке приглашения: ' + error.message);
                }
            }, true);
            
            console.log('✅ Collaborate button handler attached');
        } else if (attempt < 10) {
            // Пробуем еще раз через 100ms
            setTimeout(() => trySetup(attempt + 1), 100);
        } else {
            console.error('❌ collaborate-btn not found after 10 attempts');
        }
    };
    
    trySetup();
}

// Обработка клика на кнопку приглашения
async function handleInviteClick() {
    console.log('handleInviteClick called');
    const module = await initWorkspacesModule();
    const workspace = module.getCurrentWorkspace();
    
    if (workspace.isPersonal) {
        console.log('Personal workspace detected, showing error modal');
        console.log('window.customModal:', window.customModal);
        console.log('window.customModal?.error:', window.customModal?.error);
        
        // Ждем немного, чтобы убедиться, что customModal загружен
        let attempts = 0;
        while (!window.customModal && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            console.log(`Waiting for customModal, attempt ${attempts}`);
        }
        
        if (window.customModal && typeof window.customModal.error === 'function') {
            console.log('Calling customModal.error');
            try {
                await window.customModal.error('Нельзя пригласить в личное пространство. Создайте новое пространство для совместной работы.');
                console.log('customModal.error called successfully');
            } catch (error) {
                console.error('Error calling customModal.error:', error);
                const errorText = window.i18n ? window.i18n.t('workspace.cannotInvitePersonal') : 'Нельзя пригласить в личное пространство. Создайте новое пространство для совместной работы.';
                alert(errorText);
            }
        } else {
            console.error('customModal.error is not available, using alert');
            console.error('window.customModal:', window.customModal);
            alert('Нельзя пригласить в личное пространство. Создайте новое пространство для совместной работы.');
        }
        return;
    }
    
    try {
        const inviteLink = module.getInviteLink(workspace.id);
        showInviteModal(inviteLink);
    } catch (error) {
        console.error('Error generating invite link:', error);
        if (window.customModal && window.customModal.error) {
            await window.customModal.error(error.message || 'Ошибка при создании ссылки-приглашения');
        } else {
            alert(error.message || 'Ошибка при создании ссылки-приглашения');
        }
    }
}

// Показать модальное окно приглашения
function showInviteModal(inviteLink) {
    console.log('showInviteModal called with link:', inviteLink);
    const modal = document.getElementById('workspace-invite-modal');
    const linkInput = document.getElementById('workspace-invite-link-input');
    const copyBtn = document.getElementById('workspace-invite-copy-btn');
    const closeBtn = document.getElementById('workspace-invite-close');
    
    if (!modal) {
        console.error('❌ workspace-invite-modal not found');
        return;
    }
    
    if (!linkInput) {
        console.error('❌ workspace-invite-link-input not found');
        return;
    }
    
    if (!copyBtn) {
        console.error('❌ workspace-invite-copy-btn not found');
        return;
    }
    
    console.log('✅ All modal elements found');
    
    // Устанавливаем ссылку
    linkInput.value = inviteLink;
    
    // Обработчик копирования ссылки
    const handleCopy = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Copy button clicked');
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(inviteLink);
            } else {
                // Fallback для старых браузеров
                linkInput.select();
                document.execCommand('copy');
            }
            
            // Визуальная обратная связь
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            copyBtn.style.color = '#34C759';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.color = '';
            }, 2000);
            
            const successText = window.i18n ? window.i18n.t('workspace.linkCopied') : 'Ссылка скопирована!';
            await window.customModal?.success(successText);
        } catch (error) {
            console.error('Error copying link:', error);
            const errorText = window.i18n ? window.i18n.t('workspace.linkCopyError') : 'Ошибка при копировании ссылки';
            await window.customModal?.error(errorText);
        }
    };
    
    // Удаляем старые обработчики и добавляем новые
    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', handleCopy);
    
    // Обработчик закрытия
    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        modal.classList.remove('active');
    };
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', handleClose);
    }
    
    // Закрытие при клике вне модального окна
    const handleOverlayClick = (e) => {
        if (e.target === modal) {
            console.log('Overlay clicked');
            modal.classList.remove('active');
        }
    };
    
    // Удаляем старый обработчик и добавляем новый
    modal.removeEventListener('click', handleOverlayClick);
    modal.addEventListener('click', handleOverlayClick);
    
    // Копирование при клике на саму ссылку
    linkInput.addEventListener('click', handleCopy);
    
    // Показываем модальное окно
    console.log('Adding active class to modal');
    modal.classList.add('active');
    console.log('Modal classes:', modal.className);
}

// Функция экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

