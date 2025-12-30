// Компонент календаря - Минималистичный стиль
class CalendarControl {
    constructor(containerId, onDateSelect = null) {
        this.containerId = containerId;
        this.onDateSelect = onDateSelect;
        this.calendar = new Date();
        this.selectedDate = null;
        this.calWeekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        this.calMonthName = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь"
        ];
        this.localDate = new Date();
        this.initialized = false;
    }

    daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    firstDay() {
        return new Date(this.calendar.getFullYear(), this.calendar.getMonth(), 1);
    }

    lastDay() {
        return new Date(this.calendar.getFullYear(), this.calendar.getMonth() + 1, 0);
    }

    firstDayNumber() {
        // getDay() возвращает 0 для воскресенья, 1 для понедельника и т.д.
        // Нам нужно: понедельник = 1, вторник = 2, ..., воскресенье = 7
        const dayOfWeek = this.firstDay().getDay();
        // Преобразуем: воскресенье (0) -> 7, понедельник (1) -> 1, ..., суббота (6) -> 6
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }

    lastDayNumber() {
        return this.lastDay().getDay() + 1;
    }

    getPreviousMonthLastDate() {
        let lastDate = new Date(
            this.calendar.getFullYear(),
            this.calendar.getMonth(),
            0
        ).getDate();
        return lastDate;
    }

    navigateToPreviousMonth() {
        // Создаем новую дату для предыдущего месяца, чтобы избежать проблем с изменением существующей даты
        const currentYear = this.calendar.getFullYear();
        const currentMonth = this.calendar.getMonth();
        
        // Вычисляем предыдущий месяц и год
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        
        if (prevMonth < 0) {
            prevMonth = 11; // Декабрь
            prevYear = currentYear - 1;
        }
        
        // Создаем новую дату с первым числом предыдущего месяца
        this.calendar = new Date(prevYear, prevMonth, 1);
        
        this.attachEventsOnNextPrev();
    }

    navigateToNextMonth() {
        // Создаем новую дату для следующего месяца, чтобы избежать проблем с изменением существующей даты
        const currentYear = this.calendar.getFullYear();
        const currentMonth = this.calendar.getMonth();
        
        // Вычисляем следующий месяц и год
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        
        if (nextMonth > 11) {
            nextMonth = 0; // Январь
            nextYear = currentYear + 1;
        }
        
        // Создаем новую дату с первым числом следующего месяца
        this.calendar = new Date(nextYear, nextMonth, 1);
        
        this.attachEventsOnNextPrev();
    }

    navigateToCurrentMonth() {
        let currentMonth = this.localDate.getMonth();
        let currentYear = this.localDate.getFullYear();
        this.calendar.setMonth(currentMonth);
        this.calendar.setFullYear(currentYear);
        this.attachEventsOnNextPrev();
    }

    setSelectedDate(date) {
        this.selectedDate = new Date(date);
        // Создаем новую дату для календаря с первым числом месяца выбранной даты
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        this.calendar = new Date(year, month, 1);
        
        // Инициализируем календарь, если еще не инициализирован
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        } else {
            this.attachEventsOnNextPrev();
        }
    }

    displayYear() {
        let yearLabel = document.querySelector(`#${this.containerId} .calendar-year-label`);
        if (yearLabel) {
            yearLabel.innerHTML = this.calendar.getFullYear();
        }
    }

    displayMonth() {
        let monthLabel = document.querySelector(`#${this.containerId} .calendar-month-label`);
        if (monthLabel) {
            monthLabel.innerHTML = this.calMonthName[this.calendar.getMonth()];
        }
    }

    selectDate(e) {
        const dateNum = parseInt(e.target.textContent);
        if (isNaN(dateNum)) return;

        const selectedDate = new Date(
            this.calendar.getFullYear(),
            this.calendar.getMonth(),
            dateNum
        );
        this.selectedDate = selectedDate;
        this.attachEventsOnNextPrev();

        if (this.onDateSelect) {
            this.onDateSelect(selectedDate);
        }
    }

    plotSelectors() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Calendar container not found: ${this.containerId}`);
            return;
        }

        // Создаем календарь с инлайн стилями для гарантии отображения
        container.innerHTML = `
            <div class="calendar" style="font-family: 'Onest', sans-serif; position: relative; max-width: 100%; min-width: 100%; width: 100%; background: #FFFFFF; color: #000000; margin: 0 auto; box-sizing: border-box; overflow: hidden; font-weight: normal; border-radius: 16px; border: 1px solid #F5F5F5;">
                <div class="calendar-inner" style="padding: 16px;">
                    <div class="calendar-controls" style="display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; margin-bottom: 16px;">
                        <div class="calendar-prev" style="text-align: left;">
                            <a href="#" style="color: #000000; font-size: 24px; text-decoration: none; padding: 8px 12px; display: inline-flex; align-items: center; justify-content: center; background: transparent; margin: 0; border-radius: 8px; transition: background-color 0.3s ease;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" style="height: 20px; width: 20px;">
                                    <path fill="#000" d="M88.2 3.8L35.8 56.23 28 64l7.8 7.78 52.4 52.4 9.78-7.76L45.58 64l52.4-52.4z"/>
                                </svg>
                            </a>
                        </div>
                        <div class="calendar-year-month" style="display: flex; min-width: 100px; justify-content: center; align-items: center; gap: 8px;">
                            <div class="calendar-month-label" style="font-weight: 500; font-size: 18px; color: #000000;"></div>
                            <div style="font-weight: 500; font-size: 18px; color: #000000;">-</div>
                            <div class="calendar-year-label" style="font-weight: 500; font-size: 18px; color: #000000;"></div>
                        </div>
                        <div class="calendar-next" style="text-align: right;">
                            <a href="#" style="color: #000000; font-size: 24px; text-decoration: none; padding: 8px 12px; display: inline-flex; align-items: center; justify-content: center; background: transparent; margin: 0; border-radius: 8px; transition: background-color 0.3s ease;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" style="height: 20px; width: 20px;">
                                    <path fill="#000" d="M38.8 124.2l52.4-52.42L99 64l-7.77-7.78-52.4-52.4-9.8 7.77L81.44 64 29 116.42z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="calendar-body" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 4px;"></div>
                </div>
            </div>
        `;
    }

    plotDayNames() {
        const body = document.querySelector(`#${this.containerId} .calendar-body`);
        if (!body) return;

        for (let i = 0; i < this.calWeekDays.length; i++) {
            body.innerHTML += `<div>${this.calWeekDays[i]}</div>`;
        }
    }

    plotDates() {
        const body = document.querySelector(`#${this.containerId} .calendar-body`);
        if (!body) {
            console.error(`Calendar body not found for container: ${this.containerId}`);
            return;
        }

        body.innerHTML = "";
        this.plotDayNames();
        this.displayMonth();
        this.displayYear();
        
        this.prevMonthLastDate = this.getPreviousMonthLastDate();
        let prevMonthDatesArray = [];
        let calendarDays = this.daysInMonth(
            this.calendar.getMonth() + 1,
            this.calendar.getFullYear()
        );
        
        // Вычисляем количество дней предыдущего месяца для отображения
        const firstDayOfWeek = this.firstDayNumber();
        const prevDateCount = firstDayOfWeek > 1 ? firstDayOfWeek - 1 : 0;

        // Пустые ячейки для дней предыдущего месяца
        for (let i = 0; i < prevDateCount; i++) {
            prevMonthDatesArray.push(this.prevMonthLastDate - i);
            body.innerHTML += `<div class="prev-dates empty-dates" style="padding: 8px 4px; min-height: 36px; line-height: 20px; border: 1px solid transparent; margin: 0; display: flex; align-items: center; justify-content: center; color: #CCCCCC;"></div>`;
        }
        
        // Даты текущего месяца
        for (let i = 1; i <= calendarDays; i++) {
            body.innerHTML += `<div class="number-item" data-num=${i} style="padding: 8px 4px; min-height: 36px; line-height: 20px; border: 1px solid transparent; margin: 0; display: flex; align-items: center; justify-content: center; cursor: pointer;"><a class="dateNumber" href="#" style="color: #000000; text-decoration: none; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; border-radius: 8px; transition: all 0.3s ease; font-size: 14px; font-weight: 400;">${i}</a></div>`;
        }

        // Оставшиеся даты после дат месяца (для заполнения сетки)
        const totalCells = 42; // 6 строк * 7 дней
        const currentCells = body.childElementCount;
        const remainingCells = totalCells - currentCells;
        
        for (let j = 1; j <= remainingCells; j++) {
            body.innerHTML += `<div class="next-dates empty-dates" style="padding: 8px 4px; min-height: 36px; line-height: 20px; border: 1px solid transparent; margin: 0; display: flex; align-items: center; justify-content: center; color: #CCCCCC;">${j}</div>`;
        }

        // Заполняем даты предыдущего месяца
        this.plotPrevMonthDates(prevMonthDatesArray);
        
        this.highlightToday();
        this.highlightSelected();
    }

    highlightToday() {
        let currentMonth = this.localDate.getMonth() + 1;
        let changedMonth = this.calendar.getMonth() + 1;
        let currentYear = this.localDate.getFullYear();
        let changedYear = this.calendar.getFullYear();

        if (
            currentYear === changedYear &&
            currentMonth === changedMonth &&
            document.querySelectorAll(`#${this.containerId} .number-item`)
        ) {
            const todayItem = document.querySelectorAll(`#${this.containerId} .number-item`)[this.localDate.getDate() - 1];
            if (todayItem && !todayItem.classList.contains('calendar-selected')) {
                todayItem.classList.add("calendar-today");
                const link = todayItem.querySelector('a');
                if (link) {
                    link.style.background = "#000000";
                    link.style.color = "#FFFFFF";
                }
            }
        }
    }

    highlightSelected() {
        if (!this.selectedDate) return;

        const selectedMonth = this.selectedDate.getMonth() + 1;
        const changedMonth = this.calendar.getMonth() + 1;
        const selectedYear = this.selectedDate.getFullYear();
        const changedYear = this.calendar.getFullYear();

        if (
            selectedYear === changedYear &&
            selectedMonth === changedMonth &&
            document.querySelectorAll(`#${this.containerId} .number-item`)
        ) {
            // Убираем выделение с сегодняшнего дня, если выбран другой день
            document.querySelectorAll(`#${this.containerId} .number-item`).forEach(item => {
                item.classList.remove('calendar-today', 'calendar-selected');
            });

            const selectedItem = document.querySelectorAll(`#${this.containerId} .number-item`)[this.selectedDate.getDate() - 1];
            if (selectedItem) {
                selectedItem.classList.add("calendar-selected");
                const link = selectedItem.querySelector('a');
                if (link) {
                    link.style.background = "#000000";
                    link.style.color = "#FFFFFF";
                }
            }
        }
    }

    plotPrevMonthDates(dates) {
        dates.reverse();
        const prevDates = document.querySelectorAll(`#${this.containerId} .prev-dates`);
        for (let i = 0; i < dates.length; i++) {
            if (prevDates[i]) {
                prevDates[i].textContent = dates[i];
            }
        }
    }

    plotNextMonthDates() {
        const body = document.querySelector(`#${this.containerId} .calendar-body`);
        if (!body) return;

        let childElemCount = body.childElementCount;

        // 7 строк
        if (childElemCount > 42) {
            let diff = 49 - childElemCount;
            this.loopThroughNextDays(diff);
        }

        // 6 строк
        if (childElemCount > 35 && childElemCount <= 42) {
            let diff = 42 - childElemCount;
            this.loopThroughNextDays(diff);
        }
    }

    loopThroughNextDays(count) {
        const body = document.querySelector(`#${this.containerId} .calendar-body`);
        if (!body) return;

        if (count > 0) {
            for (let i = 1; i <= count; i++) {
                body.innerHTML += `<div class="next-dates empty-dates">${i}</div>`;
            }
        }
    }

    attachEvents() {
        const prevBtn = document.querySelector(`#${this.containerId} .calendar-prev a`);
        const nextBtn = document.querySelector(`#${this.containerId} .calendar-next a`);
        const todayDate = document.querySelector(`#${this.containerId} .calendar-today-date`);
        const dateNumbers = document.querySelectorAll(`#${this.containerId} .dateNumber`);

        // Удаляем старые обработчики, если они есть, чтобы избежать накопления
        if (prevBtn) {
            // Клонируем элемент, чтобы удалить все обработчики
            const newPrevBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
            newPrevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateToPreviousMonth();
            });
        }

        if (nextBtn) {
            // Клонируем элемент, чтобы удалить все обработчики
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
            newNextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateToNextMonth();
            });
        }

        // Для дат также удаляем старые обработчики
        for (let i = 0; i < dateNumbers.length; i++) {
            const dateNumber = dateNumbers[i];
            const newDateNumber = dateNumber.cloneNode(true);
            dateNumber.parentNode.replaceChild(newDateNumber, dateNumber);
            newDateNumber.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectDate(e);
            }, false);
        }
    }

    attachEventsOnNextPrev() {
        this.plotDates();
        this.attachEvents();
    }

    init() {
        this.plotSelectors();
        this.plotDates();
        this.attachEvents();
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarControl;
}

