// ============================================
// QUANTUM LEAP - Модуль работы с localStorage
// ============================================

const StorageModule = {
    FILENAME: 'quantum-leap-answers.txt',
    STORAGE_KEY: 'quantum_leap_data',
    
    data: {
        profileCurrent: null,
        profileFuture: null,
        checkins: []
    },

    /**
     * Инициализация - загрузка из localStorage
     */
    async init() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const content = saved;
                this.parseContent(content);
                return true;
            }
            
            // Создаём начальную структуру
            const initialContent = this.generateInitialContent();
            localStorage.setItem(this.STORAGE_KEY, initialContent);
            this.parseContent(initialContent);
            return true;
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            return false;
        }
    },

    /**
     * Генерация начального содержимого
     */
    generateInitialContent() {
        return `=== КТО Я СЕЙЧАС ===
Дата заполнения: [не заполнено]

1. Как я бы описал(а) себя сейчас в 3–5 словах?
[не заполнено]

2. Какие 3 главные привычки или паттерна сейчас определяют мою жизнь?
[не заполнено]

3. Какие 3 главных страха или ограничивающих убеждений сейчас задерживают меня?
[не заполнено]

4. Какие качества у меня сильны, но я ими почти не пользуюсь?
[не заполнено]

5. Какой человек «здесь и сейчас» я бы назвал(а) своим типичным «я»?
[не заполнено]

=== КЕМ Я ХОЧУ СТАТЬ ===
Дата заполнения: [не заполнено]

1. Как бы я описал(а) своего «идеального себя» через 1–3 года в 3–5 словах?
[не заполнено]

2. Какие 3 привычки и паттерна должен(на) иметь этот человек?
[не заполнено]

3. Какие 3 страха или убеждения должны исчезнуть?
[не заполнено]

4. Какие качества я ценю больше всего и хочу развить?
[не заполнено]

5. Как бы я представил(а) этого будущего себя в одной сцене из обычного дня?
[не заполнено]

=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===

`;
    },

    /**
     * Парсинг содержимого
     */
    parseContent(content) {
        const lines = content.split('\n');
        let section = null;
        let currentCheckin = null;
        let currentQuestion = 0;
        let collectingAnswer = false;
        let currentAnswer = '';

        this.data.checkins = [];
        this.data.profileCurrent = null;
        this.data.profileFuture = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('=== КТО Я СЕЙЧАС ===')) {
                section = 'current';
                this.data.profileCurrent = {
                    q1_description: '',
                    q2_habits: '',
                    q3_fears: '',
                    q4_strengths: '',
                    q5_character: ''
                };
                currentQuestion = 0;
                collectingAnswer = false;
                currentAnswer = '';
            } else if (line.startsWith('=== КЕМ Я ХОЧУ СТАТЬ ===')) {
                // Сохраняем последний ответ из предыдущей секции (5-й вопрос "Я сейчас")
                if (section === 'current' && collectingAnswer && currentAnswer.trim() && currentQuestion > 0) {
                    const fieldNames = ['q1_description', 'q2_habits', 'q3_fears', 'q4_strengths', 'q5_character'];
                    if (this.data.profileCurrent && fieldNames[currentQuestion - 1]) {
                        this.data.profileCurrent[fieldNames[currentQuestion - 1]] = currentAnswer.trim();
                    }
                }
                
                section = 'future';
                this.data.profileFuture = {
                    q1_description: '',
                    q2_habits: '',
                    q3_fears_gone: '',
                    q4_qualities: '',
                    q5_day_scene: ''
                };
                currentQuestion = 0;
                collectingAnswer = false;
                currentAnswer = '';
            } else if (line.startsWith('=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===')) {
                // Сохраняем последний ответ из предыдущей секции (5-й вопрос "Кем хочу стать")
                if (section === 'future' && collectingAnswer && currentAnswer.trim() && currentQuestion > 0) {
                    const fieldNames = ['q1_description', 'q2_habits', 'q3_fears_gone', 'q4_qualities', 'q5_day_scene'];
                    if (this.data.profileFuture && fieldNames[currentQuestion - 1]) {
                        this.data.profileFuture[fieldNames[currentQuestion - 1]] = currentAnswer.trim();
                    }
                }
                
                section = 'checkins';
                collectingAnswer = false;
                currentAnswer = '';
            } else if (line.startsWith('--- ') && line.endsWith(' ---')) {
                const date = line.replace(/---/g, '').trim();
                currentCheckin = { date, answers: [] };
                this.data.checkins.push(currentCheckin);
            } else if (section === 'current' || section === 'future') {
                // Проверяем, это вопрос (начинается с цифры, точки и содержит знак вопроса)
                if (line.match(/^\d+\.\s+.+\?$/)) {
                    // Сохраняем предыдущий ответ
                    if (collectingAnswer && currentAnswer.trim() && currentQuestion > 0) {
                        const fieldNames = section === 'current'
                            ? ['q1_description', 'q2_habits', 'q3_fears', 'q4_strengths', 'q5_character']
                            : ['q1_description', 'q2_habits', 'q3_fears_gone', 'q4_qualities', 'q5_day_scene'];
                        
                        const profile = section === 'current' ? this.data.profileCurrent : this.data.profileFuture;
                        profile[fieldNames[currentQuestion - 1]] = currentAnswer.trim();
                    }
                    
                    // Начинаем новый вопрос
                    currentQuestion++;
                    collectingAnswer = true;
                    currentAnswer = '';
                } else if (collectingAnswer && line.trim() && !line.startsWith('Дата заполнения:') && line !== '[не заполнено]') {
                    // Собираем ответ (включая строки с цифрами в начале, если это не вопрос)
                    currentAnswer += (currentAnswer ? '\n' : '') + line;
                }
            } else if (section === 'checkins' && currentCheckin) {
                if (line.match(/^\d+\./)) {
                    const match = line.match(/^\d+\.\s*(.+?):\s*(.+)$/);
                    if (match) {
                        currentCheckin.answers.push(match[2]);
                    }
                }
            }
        }

        // Сохраняем последний ответ профиля (важно для 5-го вопроса!)
        if ((section === 'current' || section === 'future') && collectingAnswer && currentAnswer.trim() && currentQuestion > 0) {
            const fieldNames = section === 'current'
                ? ['q1_description', 'q2_habits', 'q3_fears', 'q4_strengths', 'q5_character']
                : ['q1_description', 'q2_habits', 'q3_fears_gone', 'q4_qualities', 'q5_day_scene'];
            
            const profile = section === 'current' ? this.data.profileCurrent : this.data.profileFuture;
            if (profile && fieldNames[currentQuestion - 1]) {
                profile[fieldNames[currentQuestion - 1]] = currentAnswer.trim();
            }
        }
    },

    /**
     * Сохранение в localStorage
     */
    async saveToStorage(content) {
        localStorage.setItem(this.STORAGE_KEY, content);
        this.parseContent(content);
        
        // Отправляем на сервер для записи в файл
        await this.saveToServer(content);
    },

    /**
     * Отправка данных на локальный сервер
     */
    async saveToServer(text) {
        try {
            const response = await fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                console.warn('Server save failed, but localStorage is OK');
            }
        } catch (error) {
            // Сервер не запущен или недоступен - не критично
            console.log('Server not available (this is OK if not using server mode)');
        }
    },

    /**
     * Скачивание файла
     */
    downloadFile(content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.FILENAME;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    },

    /**
     * Сохранение профиля "Я сейчас"
     */
    async saveProfileCurrent(answers) {
        try {
            let content = localStorage.getItem(this.STORAGE_KEY);

            const date = Utils.formatDate(new Date());
            const section = `=== КТО Я СЕЙЧАС ===
Дата заполнения: ${date}

1. Как я бы описал(а) себя сейчас в 3–5 словах?
${answers.q1}

2. Какие 3 главные привычки или паттерна сейчас определяют мою жизнь?
${answers.q2}

3. Какие 3 главных страха или ограничивающих убеждений сейчас задерживают меня?
${answers.q3}

4. Какие качества у меня сильны, но я ими почти не пользуюсь?
${answers.q4}

5. Какой человек «здесь и сейчас» я бы назвал(а) своим типичным «я»?
${answers.q5}`;

            content = content.replace(
                /=== КТО Я СЕЙЧАС ===[\s\S]*?(?=\n=== КЕМ Я ХОЧУ СТАТЬ ===)/,
                section + '\n\n'
            );

            await this.saveToStorage(content);
            Utils.showNotification('Профиль "Я сейчас" сохранён', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            Utils.showNotification('Не удалось сохранить', 'error');
            return false;
        }
    },

    /**
     * Сохранение профиля "Кем хочу стать"
     */
    async saveProfileFuture(answers) {
        try {
            let content = localStorage.getItem(this.STORAGE_KEY);

            const date = Utils.formatDate(new Date());
            const section = `=== КЕМ Я ХОЧУ СТАТЬ ===
Дата заполнения: ${date}

1. Как бы я описал(а) своего «идеального себя» через 1–3 года в 3–5 словах?
${answers.q1}

2. Какие 3 привычки и паттерна должен(на) иметь этот человек?
${answers.q2}

3. Какие 3 страха или убеждения должны исчезнуть?
${answers.q3}

4. Какие качества я ценю больше всего и хочу развить?
${answers.q4}

5. Как бы я представил(а) этого будущего себя в одной сцене из обычного дня?
${answers.q5}`;

            content = content.replace(
                /=== КЕМ Я ХОЧУ СТАТЬ ===[\s\S]*?(?=\n=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===)/,
                section + '\n\n'
            );

            await this.saveToStorage(content);
            Utils.showNotification('Профиль "Кем хочу стать" сохранён', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            Utils.showNotification('Не удалось сохранить', 'error');
            return false;
        }
    },

    /**
     * Сохранение чекина
     */
    async saveCheckin(date, data) {
        try {
            let content = localStorage.getItem(this.STORAGE_KEY);

            const dateStr = Utils.formatDate(date);
            const checkinText = `
--- ${dateStr} ---
1. Настроение: ${data.moodScore}/10 | Эмоции: ${data.emotions}
2. Главный паттерн дня: ${data.pattern}
3. Действия к цели: ${data.actions}
4. О чём думал: ${data.thoughts}
5. Осознанный выбор: ${data.choice}
`;

            const checkinRegex = new RegExp(`--- ${dateStr} ---[\\s\\S]*?(?=\\n---|$)`, 'g');
            
            if (content.match(checkinRegex)) {
                content = content.replace(checkinRegex, checkinText.trim());
            } else {
                content += checkinText;
            }

            await this.saveToStorage(content);
            Utils.showNotification('Чекин сохранён', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка сохранения чекина:', error);
            Utils.showNotification('Не удалось сохранить чекин', 'error');
            return false;
        }
    },

    /**
     * Получение чекина за дату
     */
    getCheckin(date) {
        const dateStr = Utils.formatDate(date);
        return this.data.checkins.find(c => c.date === dateStr);
    },

    /**
     * Получение всех дат с чекинами за месяц
     */
    getCheckinDatesForMonth(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return this.data.checkins
            .filter(c => c.date.startsWith(monthStr))
            .map(c => c.date);
    },

    /**
     * Экспорт для ИИ
     */
    async exportForAI() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            return null;
        }
    },

    /**
     * Скачать данные для внешнего ИИ-анализа
     */
    async downloadForAI() {
        try {
            const content = await this.exportForAI();
            if (!content) {
                Utils.showNotification('Нет данных для экспорта', 'error');
                return false;
            }

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-data.txt';
            a.click();
            
            URL.revokeObjectURL(url);
            
            Utils.showNotification('Файл my-data.txt скачан! Сохрани его в папку export-for-ai', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка при скачивании:', error);
            Utils.showNotification('Не удалось скачать файл', 'error');
            return false;
        }
    }
};