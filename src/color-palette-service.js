const express = require('express');
const cors = require('cors');
const ColorPalette = require('./calculateColorPalette');
const ColorCache = require('./colorCache');

const app = express();
const port = 3000;


const colorCache = new ColorCache();


app.use(cors()); // To allow cross-origin requests

app.get('/get-palette', (req, res) => {
  const imgUrl = req.query.imgUrl;
  const paletteCount = Number(req.query.paletteCount) || 2;

  if (!imgUrl) {
    res.status(400).send('imgUrl is required');
    return;
  }

  // Check the cache first
  const cachedColors = colorCache.get(imgUrl);
  if (cachedColors) {
    res.json(cachedColors.slice(0, paletteCount)); // Return the cached colors
    return;
  }

  const palette = new ColorPalette(imgUrl);
  palette.loadImageAndColor(paletteCount, colorCache).then(colors => {
    colorCache.set(imgUrl, colors); // Store the full set of colors in the cache
    res.json({ colors: colors.slice(0, paletteCount) }); // Return the requested number of colors
  }).catch(error => {
    console.error(error);
    res.status(500).send('Error processing image');
  });
});

app.listen(port, () => {
  console.log(`Color palette service listening at http://localhost:${port}`);
});
