// ============================================
// QUANTUM LEAP - Главный модуль приложения
// ============================================

const App = {
    /**
     * Инициализация приложения
     */
    async init() {
        // Проверка конфига
        if (typeof CONFIG === 'undefined') {
            this.showConfigError();
            return;
        }

        // Настройка переключения табов
        this.setupTabs();

        // Настройка кнопки экспорта для ИИ
        this.setupExportButton();

        // Загрузка данных из localStorage
        const hasData = await StorageModule.init();
        
        if (hasData) {
            this.onDataLoaded();
        }
    },

    /**
     * Настройка переключения табов
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Убираем активный класс со всех кнопок и контента
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Добавляем активный класс к выбранным
                button.classList.add('active');
                document.getElementById(`tab-${targetTab}`)?.classList.add('active');
            });
        });
    },

    /**
     * Настройка кнопок
     */
    setupExportButton() {
        // Кнопка скачивания резервной копии
        document.getElementById('download-backup-btn')?.addEventListener('click', async () => {
            const content = localStorage.getItem(StorageModule.STORAGE_KEY);
            if (content) {
                StorageModule.downloadFile(content);
                Utils.showNotification('Резервная копия скачана в папку Загрузки', 'success');
            }
        });

        // Кнопка экспорта для ИИ
        document.getElementById('export-ai-btn')?.addEventListener('click', async () => {
            await StorageModule.downloadForAI();
        });
    },

    /**
     * Данные загружены - инициализируем модули
     */
    onDataLoaded() {
        const status = document.getElementById('file-status');
        if (status) {
            status.innerHTML = `
                <div class="file-loaded">
                    <span class="status-icon">✅</span>
                    <span>Все ответы автоматически сохраняются в браузере</span>
                </div>
            `;
        }

        // Показываем кнопки
        const downloadBtn = document.getElementById('download-backup-btn');
        const exportAiBtn = document.getElementById('export-ai-btn');
        if (downloadBtn) downloadBtn.style.display = 'inline-block';
        if (exportAiBtn) exportAiBtn.style.display = 'inline-block';

        // Инициализируем модули
        CheckinModule.init();
        ProfileModule.init();
        ReportModule.init();
    },

    /**
     * Показать ошибку отсутствия конфига
     */
    showConfigError() {
        const status = document.getElementById('file-status');
        if (status) {
            status.innerHTML = `
                <div class="file-error">
                    <p>⚠️ Файл config.js не найден!</p>
                    <p>Скопируй <code>js/config.example.js</code> в <code>js/config.js</code> и заполни настройки.</p>
                </div>
            `;
        }

        // Скрываем всё кроме ошибки
        document.querySelector('.tabs')?.style.setProperty('display', 'none');
        document.querySelector('.main')?.style.setProperty('display', 'none');
    }
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});