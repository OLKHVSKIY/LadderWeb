// Модуль календаря
// Используем глобальный dayjs, который должен быть загружен до этого модуля
const dayjs = typeof window !== 'undefined' && window.dayjs ? window.dayjs : (() => {
    console.error('dayjs is not loaded. Make sure dayjs.min.js is loaded before this module.');
    // Fallback implementation
    return (date) => {
        const d = date ? new Date(date) : new Date();
        return {
            format: () => d.toLocaleDateString(),
            startOf: () => dayjs(d),
            endOf: () => dayjs(d),
            date: () => dayjs(d),
            subtract: () => dayjs(d),
            add: () => dayjs(d),
            isSame: () => false,
        };
    };
})();

export class Calendar {
    constructor(container, options = {}) {
        this.container = container;
        this.currentDate = dayjs();
        this.selectedDate = null;
        this.onDateSelect = options.onDateSelect || (() => {});
        this.tasksByDate = options.tasksByDate || {};
    }

    render() {
        const monthStart = this.currentDate.startOf('month');
        const monthEnd = this.currentDate.endOf('month');
        const daysInMonth = monthEnd.date();
        const startDay = monthStart.day();

        const lang = localStorage.getItem('language') || 'ru';
        const date = this.currentDate;
        const month = parseInt(date.format('M')) - 1; // 0-based
        const year = date.format('YYYY');
        const monthNames = {
            'ru': ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'es': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        };
        const monthName = (monthNames[lang] || monthNames['ru'])[month];

        let html = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" data-action="prev">‹</button>
                <h2>${monthName} ${year}</h2>
                <button class="calendar-nav-btn" data-action="next">›</button>
            </div>
            <div class="calendar-grid">
                ${(() => {
                    const lang = localStorage.getItem('language') || 'ru';
                    const weekdays = {
                        'ru': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                        'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        'es': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                    };
                    return (weekdays[lang] || weekdays['ru']).map(day => 
                    `<div class="calendar-day-name">${day}</div>`
                    ).join('');
                })()}
        `;

        // Пустые ячейки для начала месяца
        for (let i = 0; i < startDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = monthStart.date(day);
            const dateStr = date.format('YYYY-MM-DD');
            const isToday = date.isSame(dayjs(), 'day');
            const hasTasks = this.tasksByDate[dateStr]?.length > 0;
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}" 
                     data-date="${dateStr}">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        this.container.innerHTML = html;

        // Обработчики событий
        this.container.querySelectorAll('.calendar-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'prev') {
                    this.currentDate = this.currentDate.subtract(1, 'month');
                } else if (action === 'next') {
                    this.currentDate = this.currentDate.add(1, 'month');
                }
                this.render();
            });
        });

        this.container.querySelectorAll('.calendar-day[data-date]').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.target.dataset.date;
                this.selectedDate = date;
                this.onDateSelect(date);
            });
        });
    }
}

