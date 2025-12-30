// Кастомные модальные окна для алертов и подтверждений

// Создание модального окна
function createModal(type, message, options = {}) {
    // Удаляем существующее модальное окно, если есть
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = 'custom-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'custom-modal-content';
    
    // Иконка в зависимости от типа
    const icon = document.createElement('div');
    icon.className = `custom-modal-icon custom-modal-icon-${type}`;
    
    if (type === 'error') {
        icon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else if (type === 'success') {
        icon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
    } else if (type === 'confirm') {
        icon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        icon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
    }
    
    // Текст сообщения
    const messageEl = document.createElement('div');
    messageEl.className = 'custom-modal-message';
    messageEl.textContent = message;
    
    // Кнопки
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'custom-modal-buttons';
    
    if (type === 'confirm') {
        // Кнопка отмены
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'custom-modal-btn custom-modal-btn-cancel';
        cancelBtn.textContent = options.cancelText || (window.i18n ? window.i18n.t('modal.cancel') : 'Отмена');
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            modal.remove();
            if (options.onCancel) {
                options.onCancel();
            }
        });
        
        // Кнопка подтверждения
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'custom-modal-btn custom-modal-btn-confirm';
        confirmBtn.textContent = options.confirmText || (window.i18n ? window.i18n.t('modal.confirm') : 'Подтвердить');
        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            modal.remove();
            if (options.onConfirm) {
                options.onConfirm();
            }
        });
        
        buttonsContainer.appendChild(cancelBtn);
        buttonsContainer.appendChild(confirmBtn);
    } else {
        // Кнопка OK
        const okBtn = document.createElement('button');
        okBtn.className = 'custom-modal-btn custom-modal-btn-ok';
        okBtn.textContent = options.okText || 'OK';
        okBtn.addEventListener('click', () => {
            modal.remove();
            if (options.onOk) options.onOk();
        });
        
        buttonsContainer.appendChild(okBtn);
    }
    
    modalContent.appendChild(icon);
    modalContent.appendChild(messageEl);
    modalContent.appendChild(buttonsContainer);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Анимация появления
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Закрытие при клике на overlay
    const handleOverlayClick = (e) => {
        // Проверяем, что клик был именно на overlay, а не на содержимое модального окна
        // Также проверяем, что клик не был на кнопках внутри модального окна
        const clickedElement = e.target;
        const isClickOnOverlay = clickedElement === modal;
        const isClickOnModalContent = modalContent.contains(clickedElement);
        const isClickOnButton = clickedElement.closest('.custom-modal-btn');
        
        // Закрываем только если клик был именно на overlay, не на содержимое и не на кнопку
        if (isClickOnOverlay && !isClickOnModalContent && !isClickOnButton) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Удаляем модальное окно
            modal.remove();
            
            // Для confirm модальных окон при клике вне окна вызываем onCancel (отмена)
            // НЕ вызываем onConfirm, только onCancel
            if (type === 'confirm') {
                if (options.onCancel) {
                    // Вызываем onCancel асинхронно, чтобы избежать конфликтов
                    setTimeout(() => {
                        options.onCancel();
                    }, 0);
                }
            } else if (options.onCancel) {
                setTimeout(() => {
                    options.onCancel();
                }, 0);
            }
            
            return false;
        }
    };
    
    // Используем обычный обработчик, не capture phase, чтобы не перехватывать клики на кнопках
    modal.addEventListener('click', handleOverlayClick);
    
    // Предотвращаем всплытие кликов внутри модального окна (но не блокируем клики на кнопках)
    modalContent.addEventListener('click', (e) => {
        // Не блокируем клики на кнопках
        if (!e.target.closest('.custom-modal-btn')) {
            e.stopPropagation();
        }
    });
    
    return modal;
}

// Функции-обертки
function showAlert(message, options = {}) {
    return new Promise((resolve) => {
        createModal('alert', message, {
            ...options,
            onOk: () => {
                if (options.onOk) options.onOk();
                resolve(true);
            }
        });
    });
}

function showError(message, options = {}) {
    return new Promise((resolve) => {
        createModal('error', message, {
            ...options,
            onOk: () => {
                if (options.onOk) options.onOk();
                resolve(true);
            }
        });
    });
}

function showSuccess(message, options = {}) {
    return new Promise((resolve) => {
        createModal('success', message, {
            ...options,
            onOk: () => {
                if (options.onOk) options.onOk();
                resolve(true);
            }
        });
    });
}

function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        createModal('confirm', message, {
            ...options,
            onConfirm: () => {
                if (options.onConfirm) options.onConfirm();
                resolve(true);
            },
            onCancel: () => {
                if (options.onCancel) options.onCancel();
                resolve(false);
            }
        });
    });
}

// Экспорт
if (typeof window !== 'undefined') {
    window.customModal = {
        alert: showAlert,
        error: showError,
        success: showSuccess,
        confirm: showConfirm
    };
}

