const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'notes.txt');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Раздача статических файлов

// Корневой маршрут - отдаём index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint для сохранения текста
app.post('/save', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Читаем существующий файл
        let existingContent = '';
        try {
            existingContent = await fs.readFile(FILE_PATH, 'utf8');
        } catch (error) {
            // Файл не существует - это нормально при первом запуске
            existingContent = '';
        }

        // Определяем тип данных по содержимому
        let newContent = '';
        
        if (text.includes('=== КТО Я СЕЙЧАС ===')) {
            // Это профиль "Я сейчас" - заменяем старый
            newContent = replaceSection(existingContent, '=== КТО Я СЕЙЧАС ===', '=== КЕМ Я ХОЧУ СТАТЬ ===', text);
        } else if (text.includes('=== КЕМ Я ХОЧУ СТАТЬ ===')) {
            // Это профиль "Кем хочу стать" - заменяем старый
            newContent = replaceSection(existingContent, '=== КЕМ Я ХОЧУ СТАТЬ ===', '=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===', text);
        } else if (text.includes('---') && text.match(/\d{4}-\d{2}-\d{2}/)) {
            // Это чекин - добавляем в конец
            newContent = appendCheckin(existingContent, text);
        } else {
            // Неизвестный формат - просто дописываем
            newContent = existingContent + '\n' + text;
        }

        // Сохраняем обновлённый файл
        await fs.writeFile(FILE_PATH, newContent, 'utf8');

        res.json({ success: true, message: 'Text saved successfully' });
    } catch (error) {
        console.error('Error saving text:', error);
        res.status(500).json({ error: 'Failed to save text' });
    }
});

/**
 * Заменяет секцию в файле
 */
function replaceSection(content, startMarker, endMarker, newSection) {
    // Ищем начало и конец секции
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1) {
        // Секции нет - добавляем в начало
        return newSection + '\n\n' + content;
    }

    if (endIndex === -1) {
        // Нет следующей секции - заменяем до конца
        return content.substring(0, startIndex) + newSection + '\n\n';
    }

    // Заменяем секцию
    return content.substring(0, startIndex) + newSection + '\n\n' + content.substring(endIndex);
}

/**
 * Добавляет чекин в секцию чекинов
 */
function appendCheckin(content, checkin) {
    const checkinsMarker = '=== ЕЖЕДНЕВНЫЕ ЧЕКИНЫ ===';
    const checkinsIndex = content.indexOf(checkinsMarker);

    if (checkinsIndex === -1) {
        // Секции чекинов нет - создаём
        return content + '\n\n' + checkinsMarker + '\n\n' + checkin + '\n';
    }

    // Извлекаем дату из чекина
    const dateMatch = checkin.match(/--- (\d{4}-\d{2}-\d{2}) ---/);
    if (!dateMatch) {
        // Не нашли дату - просто добавляем в конец
        return content + '\n' + checkin + '\n';
    }

    const newDate = dateMatch[1];

    // Проверяем, есть ли уже чекин за эту дату
    const existingCheckinPattern = new RegExp(`--- ${newDate} ---[\\s\\S]*?(?=\\n--- \\d{4}-\\d{2}-\\d{2} ---|$)`, 'g');
    
    if (existingCheckinPattern.test(content)) {
        // Чекин за эту дату уже есть - заменяем его
        return content.replace(existingCheckinPattern, checkin);
    }

    // Чекина за эту дату нет - добавляем в конец секции
    return content + '\n' + checkin + '\n';
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Saving to: ${FILE_PATH}`);
});