const express = require('express');
const path = require('path');
const app = express();
const PORT = 9221;

// JSON ve statik dosyalar için middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'gallery')));

// JSON dosyasını oku
app.get('/images', (req, res) => {
  const data = require('./image.json');
  res.json(data);
});

// Ana sayfa servisi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Statik dosyalar için doğru MIME tipi ayarlayın
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/script');
    }
  }
}));