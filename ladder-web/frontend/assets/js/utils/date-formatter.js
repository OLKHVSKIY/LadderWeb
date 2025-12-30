// Утилиты для работы с датами
export function formatDate(date, locale = 'ru-RU') {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTime(date, locale = 'ru-RU') {
    return new Date(date).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(date, locale = 'ru-RU') {
    return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
}

export function isPast(date) {
    return new Date(date) < new Date();
}

export function isFuture(date) {
    return new Date(date) > new Date();
}

