// ============================================
// QUANTUM LEAP - Модуль месячных сводок
// ============================================

const ReportModule = {
    /**
     * Инициализация модуля
     */
    init() {
        this.setupEventListeners();
        this.updateCheckinCounter();
        this.loadReportsList();
        this.updateGenerateButton();
    },

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка генерации за прошлый месяц
        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            const { year, month } = Utils.getPreviousMonth();
            this.generateReport(year, month);
        });

        // Кнопка генерации сейчас (тест)
        document.getElementById('generate-now-btn')?.addEventListener('click', () => {
            const { year, month } = Utils.getCurrentMonth();
            this.generateReport(year, month);
        });

        // Закрытие просмотра сводки
        document.getElementById('close-report-btn')?.addEventListener('click', () => {
            document.getElementById('report-viewer').style.display = 'none';
        });
    },

    /**
     * Обновление счётчика чекинов
     */
    async updateCheckinCounter() {
        const { year, month } = Utils.getCurrentMonth();
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const checkins = StorageModule.data.checkins.filter(c => c.date.startsWith(monthStr));
        const daysInMonth = Utils.getDaysInMonth(year, month);
        
        const counter = document.getElementById('checkin-counter');
        if (counter) {
            counter.textContent = `Чекинов за месяц: ${checkins.length} из ${daysInMonth} дней`;
        }
    },

    /**
     * Обновление состояния кнопки генерации
     */
    updateGenerateButton() {
        const btn = document.getElementById('generate-report-btn');
        const hint = document.getElementById('report-hint');
        
        if (btn && hint) {
            if (Utils.isFirstDayOfMonth()) {
                btn.disabled = false;
                hint.textContent = 'Сегодня 1-е число — можно сгенерировать сводку за прошлый месяц!';
            } else {
                btn.disabled = true;
                hint.textContent = 'Сводка генерируется 1-го числа каждого месяца';
            }
        }
    },

    /**
     * Загрузка списка сводок
     */
    async loadReportsList() {
        const container = document.getElementById('reports-container');
        
        if (!container) return;

        // Пока сводки не сохраняются в файл, показываем заглушку
        container.innerHTML = '<p class="empty-state">Сводки генерируются в реальном времени. Скопируй результат и сохрани отдельно, если нужно.</p>';
    },

    /**
     * Генерация сводки
     */
    async generateReport(year, month) {
        try {
            const summary = await AIModule.generateMonthlySummary(year, month);
            this.viewReportText(`${Utils.getMonthName(month)} ${year}`, summary);
        } catch (error) {
            console.error('Ошибка генерации сводки:', error);
        }
    },

    /**
     * Отображение текста сводки
     */
    viewReportText(title, text) {
        const viewer = document.getElementById('report-viewer');
        const titleEl = document.getElementById('report-title');
        const contentEl = document.getElementById('report-content');

        if (viewer && titleEl && contentEl) {
            titleEl.textContent = title;
            contentEl.innerHTML = marked.parse(text);
            viewer.style.display = 'block';
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    ReportModule.init();
});