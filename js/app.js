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

        // Кнопка показа промпта
        document.getElementById('show-prompt-btn')?.addEventListener('click', () => {
            this.showPromptModal();
        });
    },

    /**
     * Показать модальное окно с промптом
     */
    showPromptModal() {
        const modal = document.getElementById('prompt-modal');
        const promptText = document.getElementById('prompt-text');
        const copyBtn = document.getElementById('copy-prompt-btn');
        const editBtn = document.getElementById('edit-prompt-btn');
        const saveBtn = document.getElementById('save-prompt-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const closeBtn = document.getElementById('close-prompt-modal');

        // Загружаем промпт из localStorage или используем дефолтный
        const masterPrompt = this.getMasterPrompt();
        promptText.value = masterPrompt;

        // Показываем модальное окно
        modal.style.display = 'flex';

        // Закрытие модального окна
        const closeModal = () => {
            modal.style.display = 'none';
            promptText.readOnly = true;
            editBtn.style.display = 'inline-block';
            copyBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        };

        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        // Копирование промпта
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(promptText.value);
                Utils.showNotification('Промпт скопирован в буфер обмена!', 'success');
            } catch (err) {
                // Fallback для старых браузеров
                promptText.select();
                document.execCommand('copy');
                Utils.showNotification('Промпт скопирован!', 'success');
            }
        };

        // Редактирование промпта
        editBtn.onclick = () => {
            promptText.readOnly = false;
            promptText.focus();
            editBtn.style.display = 'none';
            copyBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        };

        // Сохранение изменений
        saveBtn.onclick = () => {
            localStorage.setItem('custom_master_prompt', promptText.value);
            promptText.readOnly = true;
            editBtn.style.display = 'inline-block';
            copyBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            Utils.showNotification('Промпт сохранён!', 'success');
        };

        // Отмена редактирования
        cancelBtn.onclick = () => {
            promptText.value = masterPrompt;
            promptText.readOnly = true;
            editBtn.style.display = 'inline-block';
            copyBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        };
    },

    /**
     * Получить мастер-промпт
     */
    getMasterPrompt() {
        // Проверяем, есть ли кастомный промпт
        const customPrompt = localStorage.getItem('custom_master_prompt');
        if (customPrompt) {
            return customPrompt;
        }

        // Возвращаем дефолтный промпт
        return `МАСТЕР-ПРОМТ ДЛЯ АНАЛИЗА ЛИЧНОГО ДНЕВНИКА ТРАНСФОРМАЦИИ

Ты — личный коуч и аналитик. Твоя задача — проанализировать месяц жизни человека и дать честную, конструктивную и тёплую обратную связь на русском языке.

ВХОДНЫЕ ДАННЫЕ:
- Блок «Я сейчас» — как человек описывает себя в начале пути
- Блок «Кем хочу стать» — желаемое состояние
- Ежедневные чекины за месяц — записи о настроении, мыслях, действиях

СТРУКТУРА АНАЛИЗА:

1. 📊 ОБЩАЯ КАРТИНА МЕСЯЦА (2–3 абзаца)
   - Какой был этот месяц в целом?
   - Какие основные темы и события прослеживаются?
   - Общее впечатление от динамики

2. ✅ ЧТО УЛУЧШИЛОСЬ И ВЫРОСЛО
   - Конкретные позитивные изменения
   - Новые привычки или паттерны
   - Моменты роста и прорывов
   - Используй примеры из записей

3. ⚠️ ЧТО ОСТАЛОСЬ ПРЕЖНИМ ИЛИ СТАЛО ХУЖЕ
   - Застрявшие паттерны
   - Нерешённые проблемы
   - Регрессия (если есть)
   - Будь честным, но тактичным

4. 🔁 ПОВТОРЯЮЩИЕСЯ ПАТТЕРНЫ
   - Какие мысли повторяются чаще всего?
   - Какие эмоции доминируют?
   - Какие поведенческие паттерны видны?
   - Связь между мыслями, эмоциями и действиями

5. 📈 ДИНАМИКА НАСТРОЕНИЯ
   - Анализ числовых оценок настроения (1-10)
   - Тренды: улучшение, ухудшение, стабильность
   - Связь настроения с событиями и действиями
   - Выявление триггеров

6. 🎯 ПРИБЛИЖЕНИЕ К ЖЕЛАЕМОМУ «Я»
   - Насколько действия соответствуют целям?
   - Какие качества из «желаемого я» уже проявляются?
   - Какие страхи из «текущего я» ещё активны?
   - Разрыв между намерениями и действиями

7. 💡 3 КОНКРЕТНЫХ РЕКОМЕНДАЦИИ НА СЛЕДУЮЩИЙ МЕСЯЦ
   - Практичные, выполнимые действия
   - Основаны на выявленных паттернах
   - Помогают приблизиться к желаемому состоянию
   - Каждая рекомендация с кратким обоснованием

СТИЛЬ АНАЛИЗА:
- Честный, но поддерживающий
- Конкретный (используй цитаты и примеры из записей)
- Без лишних комплиментов и сахара
- Фокус на паттернах, а не отдельных событиях
- Баланс между признанием прогресса и указанием на проблемы

ЧЕГО ИЗБЕГАТЬ:
- Общих фраз типа «ты молодец, продолжай в том же духе»
- Морализаторства и нравоучений
- Психологических диагнозов
- Советов, не связанных с данными из записей
- Излишнего оптимизма или пессимизма

ФОРМАТ ОТВЕТА:
Используй Markdown для структурирования. Эмодзи для заголовков разделов. Абзацы для читаемости.


ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ:

1. Скопируй этот промпт
2. Открой ChatGPT, Claude, Gemini или любую другую нейросеть
3. Вставь этот промпт
4. Затем скачай свои данные кнопкой "💾 Скачать резервную копию" и вставь содержимое файла
5. Получи анализ своего месяца!`;
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
        const showPromptBtn = document.getElementById('show-prompt-btn');
        if (downloadBtn) downloadBtn.style.display = 'inline-block';
        if (showPromptBtn) showPromptBtn.style.display = 'inline-block';

        // Инициализируем модули
        CheckinModule.init();
        ProfileModule.init();
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