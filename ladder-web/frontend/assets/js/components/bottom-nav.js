// Компонент нижней навигации
export function initBottomNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.innerHTML = `
        <nav class="bottom-nav">
            <a href="/tasks.html" class="nav-item">
                <span class="nav-icon">📋</span>
                <span class="nav-label">Задачи</span>
            </a>
            <a href="/create-task.html" class="nav-item">
                <span class="nav-icon">➕</span>
                <span class="nav-label">Создать</span>
            </a>
            <a href="/ai-task.html" class="nav-item">
                <span class="nav-icon">🤖</span>
                <span class="nav-label">AI</span>
            </a>
            <a href="/profile.html" class="nav-item">
                <span class="nav-icon">👤</span>
                <span class="nav-label">Профиль</span>
            </a>
        </nav>
    `;
}

