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

        // Дописываем текст в файл (создаётся автоматически если не существует)
        await fs.appendFile(FILE_PATH, text + '\n', 'utf8');

        res.json({ success: true, message: 'Text saved successfully' });
    } catch (error) {
        console.error('Error saving text:', error);
        res.status(500).json({ error: 'Failed to save text' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Saving to: ${FILE_PATH}`);
});