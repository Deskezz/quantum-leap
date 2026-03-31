// ============================================
// QUANTUM LEAP - ИИ модуль (локальная модель)
// ============================================

const AIModule = {
    /**
     * Генерация системного промпта
     */
    getSystemPrompt() {
        return `Ты — личный коуч и аналитик. Твоя задача — проанализировать месяц жизни человека и дать честную, конструктивную и тёплую обратную связь на русском языке.

Структурируй сводку по следующим разделам:

## 📊 Общая картина месяца
2-3 абзаца о том, каким был этот месяц в целом.

## ✅ Что улучшилось и выросло
Конкретные позитивные изменения, которые ты заметил.

## ⚠️ Что осталось прежним или стало хуже
Честная обратная связь о том, что не изменилось.

## 🔁 Повторяющиеся паттерны
Мысли, эмоции, поведение, которые повторяются из дня в день.

## 📈 Динамика настроения
Анализ изменения настроения на основе числовых оценок.

## 🎯 Прогресс к цели
Насколько человек приближается к своему желаемому "я".

## 💡 3 конкретных рекомендации на следующий месяц
Практичные, выполнимые советы.

Пиши честно, без лишних комплиментов. Используй конкретные примеры из записей. Будь поддерживающим, но прямым.`;
    },

    /**
     * Формирование промпта из содержимого файла
     */
    buildSummaryPromptFromFile(fileContent, year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        
        // Извлекаем только нужный месяц из чекинов
        const lines = fileContent.split('\n');
        let inCheckins = false;
        let relevantContent = '';
        let profileSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Собираем профили (всё до чекинов)
            if (!inCheckins && !line.startsWith('=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===')) {
                profileSection += line + '\n';
            }
            
            // Начало секции чекинов
            if (line.startsWith('=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===')) {
                inCheckins = true;
                continue;
            }
            
            // Собираем чекины нужного месяца
            if (inCheckins && line.startsWith('---') && line.includes(monthStr)) {
                // Добавляем этот чекин и следующие 5 строк
                relevantContent += line + '\n';
                for (let j = 1; j <= 6 && (i + j) < lines.length; j++) {
                    relevantContent += lines[i + j] + '\n';
                }
            }
        }
        
        if (!relevantContent.trim()) {
            throw new Error(`Нет чекинов за ${Utils.getMonthName(month)} ${year}`);
        }
        
        return `Проанализируй месяц жизни человека и дай развёрнутую сводку.

${profileSection}

ЧЕКИНЫ ЗА ${Utils.getMonthName(month).toUpperCase()} ${year}:

${relevantContent}

Проанализируй этот месяц согласно структуре из системного промпта.`;
    },

    /**
     * Вызов локального ИИ
     */
    async callLocalAI(prompt) {
        try {
            const systemPrompt = this.getSystemPrompt();
            
            const response = await fetch(`${CONFIG.LOCAL_AI_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.LOCAL_AI_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: CONFIG.AI_MAX_TOKENS,
                    temperature: CONFIG.AI_TEMPERATURE,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.choices || !result.choices[0]) {
                throw new Error('Некорректный ответ от ИИ');
            }

            return result.choices[0].message.content;
        } catch (error) {
            console.error('Ошибка вызова локального ИИ:', error);
            throw new Error(`Не удалось связаться с локальным ИИ: ${error.message}\n\nПроверь:\n1. Запущен ли Ollama/LM Studio\n2. Правильность URL в config.js\n3. Установлена ли модель`);
        }
    },

    /**
     * Генерация месячной сводки
     */
    async generateMonthlySummary(year, month) {
        try {
            Utils.showLoading(true);

            // Получаем данные из файла
            const content = await StorageModule.exportForAI();
            if (!content) {
                throw new Error('Не удалось прочитать файл');
            }

            // Формируем промпт с полным содержимым файла
            const prompt = this.buildSummaryPromptFromFile(content, year, month);

            console.log('📤 Отправка данных в ИИ...');
            console.log('Размер промпта:', prompt.length, 'символов');

            // Отправляем в ИИ
            const summary = await this.callLocalAI(prompt);

            Utils.showLoading(false);
            Utils.showNotification('Сводка готова!', 'success');
            
            return summary;
        } catch (error) {
            Utils.showLoading(false);
            console.error('Ошибка генерации сводки:', error);
            Utils.showNotification(error.message, 'error');
            throw error;
        }
    }
};