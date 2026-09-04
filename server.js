const express = require('express');
const { readdirSync } = require('fs');
const { join } = require('path');

const app = express();
const PORT = 4321;

app.use(express.static(__dirname));

function listImageDir(subdir) {
  const dir = join(__dirname, subdir);
  return readdirSync(dir)
    .filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f))
    .sort()
    .map(f => `/${subdir}/${f}`);
}

app.get('/api/stickers', (_req, res) => {
  try {
    res.json(listImageDir('sticker_gallery'));
  } catch (err) {
    res.status(500).json({ error: 'Could not read sticker directory' });
  }
});

app.get('/api/particles', (_req, res) => {
  try {
    res.json(listImageDir('particles'));
  } catch (err) {
    res.status(500).json({ error: 'Could not read particles directory' });
  }
});

app.listen(PORT, () => {
  console.log(`Sticker canvas running at http://localhost:${PORT}`);
});
