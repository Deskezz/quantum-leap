// ============================================
// QUANTUM LEAP - Вспомогательные функции
// ============================================

const Utils = {
    /**
     * Форматирование даты в читаемый вид
     * @param {Date} date - Дата для форматирования
     * @returns {string} - Форматированная дата
     */
    formatDate(date) {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const dayOfWeek = days[date.getDay()];
        
        return `${dayOfWeek}, ${day} ${month} ${year}`;
    },

    /**
     * Получить дату в формате YYYY-MM-DD
     * @param {Date} date - Дата
     * @returns {string} - Дата в формате YYYY-MM-DD
     */
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Получить название месяца
     * @param {number} month - Номер месяца (1-12)
     * @returns {string} - Название месяца
     */
    getMonthName(month) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month - 1];
    },

    /**
     * Получить количество дней в месяце
     * @param {number} year - Год
     * @param {number} month - Месяц (1-12)
     * @returns {number} - Количество дней
     */
    getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Показать уведомление
     * @param {string} message - Текст сообщения
     * @param {string} type - Тип: 'success', 'error', 'info'
     */
    showNotification(message, type = 'info') {
        // Создаём элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#2D6A4F' : type === 'error' ? '#d32f2f' : '#666'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Показать индикатор загрузки
     * @param {boolean} show - Показать или скрыть
     */
    showLoading(show) {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Автоматический ресайз textarea
     * @param {HTMLTextAreaElement} textarea - Элемент textarea
     */
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    },

    /**
     * Инициализация автоматического ресайза для всех textarea
     */
    initAutoResize() {
        document.querySelectorAll('.textarea').forEach(textarea => {
            textarea.addEventListener('input', () => this.autoResize(textarea));
            // Инициализация при загрузке
            this.autoResize(textarea);
        });
    },

    /**
     * Переключение табов
     * @param {string} tabName - Название таба
     */
    switchTab(tabName) {
        // Убираем активный класс со всех кнопок и контента
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Добавляем активный класс к выбранному табу
        const btn = document.querySelector(`[data-tab="${tabName}"]`);
        const content = document.getElementById(`tab-${tabName}`);
        
        if (btn && content) {
            btn.classList.add('active');
            content.classList.add('active');
        }
    },

    /**
     * Сжатие текста для ИИ (удаление лишних пробелов и переносов)
     * @param {string} text - Исходный текст
     * @param {number} maxLength - Максимальная длина
     * @returns {string} - Сжатый текст
     */
    compressText(text, maxLength = 300) {
        if (!text) return '';
        
        // Удаляем лишние пробелы и переносы
        let compressed = text.replace(/\s+/g, ' ').trim();
        
        // Обрезаем если слишком длинный
        if (compressed.length > maxLength) {
            compressed = compressed.substring(0, maxLength) + '...';
        }
        
        return compressed;
    },

    /**
     * Проверка, является ли сегодня первым днём месяца
     * @returns {boolean}
     */
    isFirstDayOfMonth() {
        return new Date().getDate() === 1;
    },

    /**
     * Получить предыдущий месяц
     * @returns {object} - {year, month}
     */
    getPreviousMonth() {
        const now = new Date();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const month = now.getMonth() === 0 ? 12 : now.getMonth();
        return { year, month };
    },

    /**
     * Получить текущий месяц
     * @returns {object} - {year, month}
     */
    getCurrentMonth() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1
        };
    },

    /**
     * Дебаунс функции
     * @param {Function} func - Функция для дебаунса
     * @param {number} wait - Время ожидания в мс
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Экранирование HTML
     * @param {string} text - Текст для экранирования
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);