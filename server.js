const express = require('express');
const { readdirSync } = require('fs');
const { join } = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get('/api/stickers', (_req, res) => {
  try {
    const dir = join(__dirname, 'sticker_gallery');
    const files = readdirSync(dir)
      .filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f))
      .sort()
      .map(f => `/sticker_gallery/${f}`);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Could not read sticker directory' });
  }
});

app.listen(PORT, () => {
  console.log(`Sticker canvas running at http://localhost:${PORT}`);
});
