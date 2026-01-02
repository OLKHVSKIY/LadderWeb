// Analytics Module - отслеживание использования функций

// Функции для отслеживания
export function trackFeatureUsage(featureName) {
    try {
        const featureUsage = JSON.parse(localStorage.getItem('feature_usage') || '{}');
        featureUsage[featureName] = (featureUsage[featureName] || 0) + 1;
        localStorage.setItem('feature_usage', JSON.stringify(featureUsage));
    } catch (e) {
        console.error('Error tracking feature usage:', e);
    }
}

// Отслеживание создания задачи
export function trackTaskCreation() {
    trackFeatureUsage('Создание задач');
}

// Отслеживание создания заметки
export function trackNoteCreation() {
    trackFeatureUsage('Создание заметок');
}

// Отслеживание поиска
export function trackSearch() {
    trackFeatureUsage('Поиск');
}

// Отслеживание использования Quick Add
export function trackQuickAdd() {
    trackFeatureUsage('Quick Add');
}

// Отслеживание использования чата
export function trackChat() {
    trackFeatureUsage('Чат с AI');
}

// Отслеживание использования календаря
export function trackCalendar() {
    trackFeatureUsage('Календарь');
}

