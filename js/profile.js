// ============================================
// QUANTUM LEAP - Модуль профилей
// ============================================

const ProfileModule = {
    /**
     * Инициализация модуля профиля
     */
    init() {
        this.loadProfiles();
        this.setupEventListeners();
    },

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Раскрытие/скрытие блоков профиля
        document.querySelectorAll('.profile-block-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const content = header.nextElementSibling;
                content.classList.toggle('collapsed');
            });
        });

        // Кнопки "Заполнить"
        document.getElementById('fill-current-btn')?.addEventListener('click', () => {
            this.showForm('current');
        });

        document.getElementById('fill-future-btn')?.addEventListener('click', () => {
            this.showForm('future');
        });

        // Общая кнопка "Редактировать профиль"
        document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
            this.showAllForms();
        });

        // Формы
        document.getElementById('profile-current-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile('current');
        });

        document.getElementById('profile-future-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile('future');
        });
    },

    /**
     * Загрузка профилей
     */
    async loadProfiles() {
        await this.loadProfile('current');
        await this.loadProfile('future');
        this.updateEditButton();
    },

    /**
     * Загрузка конкретного профиля
     */
    async loadProfile(type) {
        const data = type === 'current' 
            ? StorageModule.data.profileCurrent
            : StorageModule.data.profileFuture;

        if (data && this.hasData(data)) {
            this.displayProfile(type, data);
        } else {
            this.showFillButton(type);
        }
    },

    /**
     * Проверка наличия данных в профиле
     */
    hasData(data) {
        const values = Object.values(data);
        return values.some(val => val && val.trim() && val !== '[не заполнено]');
    },

    /**
     * Отображение заполненного профиля
     */
    displayProfile(type, data) {
        const viewEl = document.getElementById(`profile-${type}-view`);
        const formEl = document.getElementById(`profile-${type}-form`);
        const fillBtn = document.getElementById(`fill-${type}-btn`);

        const questions = type === 'current' ? [
            'Как я бы описал(а) себя сейчас в 3–5 словах?',
            'Какие 3 главные привычки или паттерна сейчас определяют мою жизнь?',
            'Какие 3 главных страха или ограничивающих убеждений сейчас задерживают меня?',
            'Какие качества у меня сильны, но я ими почти не пользуюсь?',
            'Какой человек «здесь и сейчас» я бы назвал(а) своим типичным «я»?'
        ] : [
            'Как бы я описал(а) своего «идеального себя» через 1–3 года в 3–5 словах?',
            'Какие 3 привычки и паттерна должен(на) иметь этот человек?',
            'Какие 3 страха или убеждения должны исчезнуть?',
            'Какие качества я ценю больше всего и хочу развить?',
            'Как бы я представил(а) этого будущего себя в одной сцене из обычного дня?'
        ];

        const fields = type === 'current'
            ? ['q1_description', 'q2_habits', 'q3_fears', 'q4_strengths', 'q5_character']
            : ['q1_description', 'q2_habits', 'q3_fears_gone', 'q4_qualities', 'q5_day_scene'];

        viewEl.innerHTML = fields.map((field, i) => `
            <div class="profile-answer">
                <strong>${i + 1}. ${questions[i]}</strong>
                <p>${Utils.escapeHtml(data[field] || '')}</p>
            </div>
        `).join('');

        viewEl.style.display = 'block';
        formEl.style.display = 'none';
        fillBtn.style.display = 'none';
    },

    /**
     * Показать кнопку "Заполнить"
     */
    showFillButton(type) {
        const viewEl = document.getElementById(`profile-${type}-view`);
        const formEl = document.getElementById(`profile-${type}-form`);
        const fillBtn = document.getElementById(`fill-${type}-btn`);

        viewEl.style.display = 'none';
        formEl.style.display = 'none';
        fillBtn.style.display = 'inline-block';
    },

    /**
     * Показать форму
     */
    showForm(type) {
        const viewEl = document.getElementById(`profile-${type}-view`);
        const formEl = document.getElementById(`profile-${type}-form`);
        const fillBtn = document.getElementById(`fill-${type}-btn`);

        // Загружаем текущие данные в форму
        const data = type === 'current' 
            ? StorageModule.data.profileCurrent
            : StorageModule.data.profileFuture;

        if (data) {
            const fields = type === 'current'
                ? ['q1_description', 'q2_habits', 'q3_fears', 'q4_strengths', 'q5_character']
                : ['q1_description', 'q2_habits', 'q3_fears_gone', 'q4_qualities', 'q5_day_scene'];

            const textareas = formEl.querySelectorAll('textarea');
            fields.forEach((field, i) => {
                if (textareas[i]) {
                    textareas[i].value = data[field] || '';
                }
            });
        }

        viewEl.style.display = 'none';
        formEl.style.display = 'block';
        fillBtn.style.display = 'none';

        Utils.initAutoResize();
    },

    /**
     * Показать все формы для редактирования
     */
    showAllForms() {
        this.showForm('current');
        this.showForm('future');
        
        // Скрываем кнопку "Редактировать профиль"
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    },

    /**
     * Обновить видимость кнопки "Редактировать профиль"
     */
    updateEditButton() {
        const editBtn = document.getElementById('edit-profile-btn');
        if (!editBtn) return;

        const hasCurrent = StorageModule.data.profileCurrent && 
                          this.hasData(StorageModule.data.profileCurrent);
        const hasFuture = StorageModule.data.profileFuture && 
                         this.hasData(StorageModule.data.profileFuture);

        // Показываем кнопку только если оба профиля заполнены
        if (hasCurrent && hasFuture) {
            editBtn.style.display = 'inline-block';
        } else {
            editBtn.style.display = 'none';
        }
    },

    /**
     * Сохранение профиля
     */
    async saveProfile(type) {
        const formEl = document.getElementById(`profile-${type}-form`);
        const textareas = formEl.querySelectorAll('textarea');
        
        const answers = {
            q1: textareas[0].value.trim(),
            q2: textareas[1].value.trim(),
            q3: textareas[2].value.trim(),
            q4: textareas[3].value.trim(),
            q5: textareas[4].value.trim()
        };

        // Проверка заполненности
        if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5) {
            Utils.showNotification('Заполни все поля', 'error');
            return;
        }

        // Сохранение
        const success = type === 'current'
            ? await StorageModule.saveProfileCurrent(answers)
            : await StorageModule.saveProfileFuture(answers);

        if (success) {
            await this.loadProfile(type);
            this.updateEditButton();
        }
    }
};