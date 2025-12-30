// Компонент анимированного фона в зависимости от времени суток
export function initTimeBackground() {
    const background = document.getElementById('time-background');
    if (!background) return;

    function updateBackground() {
        const hour = new Date().getHours();
        let timeClass = 'day';

        if (hour >= 5 && hour < 12) {
            timeClass = 'morning';
        } else if (hour >= 12 && hour < 17) {
            timeClass = 'day';
        } else if (hour >= 17 && hour < 21) {
            timeClass = 'evening';
        } else {
            timeClass = 'night';
        }

        background.className = timeClass;
    }

    updateBackground();
    // Обновление каждый час
    setInterval(updateBackground, 3600000);
}

