// ============================================
// QUANTUM LEAP - Модуль ежедневных чекинов
// ============================================

const CheckinModule = {
    currentDate: new Date(),

    /**
     * Инициализация модуля
     */
    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.loadTodayCheckin();
        this.renderCalendar();
    },

    /**
     * Обновление отображения текущей даты
     */
    updateCurrentDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = Utils.formatDate(this.currentDate);
        }
    },

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Слайдер настроения
        const moodSlider = document.getElementById('mood-score');
        const moodValue = document.getElementById('mood-value');
        if (moodSlider && moodValue) {
            moodSlider.addEventListener('input', (e) => {
                moodValue.textContent = e.target.value;
            });
        }

        // Форма чекина
        const form = document.getElementById('checkin-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCheckin();
            });
        }
    },

    /**
     * Загрузка чекина за сегодня
     */
    async loadTodayCheckin() {
        const checkin = StorageModule.getCheckin(this.currentDate);
        
        if (checkin) {
            // Заполняем форму существующими данными
            document.getElementById('mood-score').value = checkin.q1_mood_score;
            document.getElementById('mood-value').textContent = checkin.q1_mood_score;
            document.getElementById('emotions').value = checkin.q1_emotions || '';
            document.getElementById('pattern').value = checkin.q2_pattern || '';
            document.getElementById('actions').value = checkin.q3_actions || '';
            document.getElementById('thoughts').value = checkin.q4_thoughts || '';
            document.getElementById('choice').value = checkin.q5_choice || '';
            
            document.getElementById('save-checkin-btn').textContent = 'Обновить чекин';
        }
    },

    /**
     * Сохранение чекина
     */
    async saveCheckin() {
        const data = {
            moodScore: document.getElementById('mood-score').value,
            emotions: document.getElementById('emotions').value,
            pattern: document.getElementById('pattern').value,
            actions: document.getElementById('actions').value,
            thoughts: document.getElementById('thoughts').value,
            choice: document.getElementById('choice').value
        };

        const success = await StorageModule.saveCheckin(this.currentDate, data);
        
        if (success) {
            this.renderCalendar(); // Обновляем календарь
        }
    },

    /**
     * Рендер календаря текущего месяца
     */
    async renderCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1;
        const daysInMonth = Utils.getDaysInMonth(year, month);
        const today = this.currentDate.getDate();

        // Получаем даты с чекинами
        const checkinDates = StorageModule.getCheckinDatesForMonth(year, month);
        const checkinDays = new Set(checkinDates.map(d => parseInt(d.split('-')[2])));

        // Очищаем календарь
        calendar.innerHTML = '';

        // Создаём ячейки для каждого дня
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            if (checkinDays.has(day)) {
                dayEl.classList.add('has-checkin');
            }

            if (day === today) {
                dayEl.classList.add('today');
            }

            calendar.appendChild(dayEl);
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    CheckinModule.init();
    Utils.initAutoResize();
});