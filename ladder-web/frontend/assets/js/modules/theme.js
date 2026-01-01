// Модуль для управления темой приложения

/**
 * Инициализация темы при загрузке страницы
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Применяем тему к body и html для совместимости
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
}

/**
 * Применение темы
 * @param {string} theme - 'light' или 'dark'
 */
export function applyTheme(theme) {
    // Устанавливаем атрибуты для CSS селекторов
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
        document.body.setAttribute('data-theme', theme);
    }
    
    // Переключаем CSS файлы темы (если они уже загружены)
    const lightTheme = document.getElementById('theme-light');
    const darkTheme = document.getElementById('theme-dark');
    
    if (lightTheme && darkTheme) {
        if (theme === 'dark') {
            lightTheme.disabled = true;
            darkTheme.disabled = false;
        } else {
            lightTheme.disabled = false;
            darkTheme.disabled = true;
        }
    } else {
        // Если темы еще не загружены, создаем их
        const styleLink = document.querySelector('link[href*="style.css"]');
        if (styleLink && !lightTheme) {
            // Создаем light theme
            const lightLink = document.createElement('link');
            lightLink.rel = 'stylesheet';
            lightLink.href = '/assets/css/themes/light.css';
            lightLink.id = 'theme-light';
            
            // Создаем dark theme
            const darkLink = document.createElement('link');
            darkLink.rel = 'stylesheet';
            darkLink.href = '/assets/css/themes/dark.css';
            darkLink.id = 'theme-dark';
            
            styleLink.parentNode.insertBefore(lightLink, styleLink.nextSibling);
            styleLink.parentNode.insertBefore(darkLink, lightLink.nextSibling);
            
            // Применяем тему
            if (theme === 'dark') {
                lightLink.disabled = true;
                darkLink.disabled = false;
            } else {
                lightLink.disabled = false;
                darkLink.disabled = true;
            }
        }
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', theme);
    
    console.log(`Theme applied: ${theme}`);
}

/**
 * Переключение темы
 */
export function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return newTheme;
}

/**
 * Получение текущей темы
 */
export function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

