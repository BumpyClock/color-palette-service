const express = require('express');
const cors = require('cors');
const ColorPalette = require('./calculateColorPalette');
const app = express();
const port = 3000;

app.use(cors()); // To allow cross-origin requests

app.get('/get-palette', (req, res) => {
  const imgUrl = req.query.imgUrl;
  const paletteCount = Number(req.query.paletteCount) || 2;

  if (!imgUrl) {
    res.status(400).send('imgUrl is required');
    return;
  }

  const palette = new ColorPalette(imgUrl);
  palette.loadImageAndColor(paletteCount).then(colors => {
    res.json({ colors });
  }).catch(error => {
    console.error(error);
    res.status(500).send('Error processing image');
  });
});

app.listen(port, () => {
  console.log(`Color palette service listening at http://localhost:${port}`);
});
