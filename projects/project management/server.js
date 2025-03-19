const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 9221;

app.use(express.json());
app.use(express.static('public'));

const projectsFilePath = path.join(__dirname, 'public', 'projects.json');

// Projeleri kaydet
app.post('/projects/add', (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(projectsFilePath, JSON.stringify(newData, null, 2));
        res.json({ message: 'Projeler başarıyla kaydedildi.' });
    } catch (error) {
        console.error('Projeler kaydedilirken hata oluştu:', error);
        res.status(500).json({ error: 'Projeler kaydedilirken bir hata oluştu.' });
    }
});

// Projeleri getir
app.get('/projects', (req, res) => {
    try {
        const data = fs.readFileSync(projectsFilePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Projeler yüklenirken hata oluştu:', error);
        res.status(500).json({ error: 'Projeler yüklenirken bir hata oluştu.' });
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});