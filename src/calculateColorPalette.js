const ColorCache = require('./colorCache');
const sharp = require('sharp');

class CalculateColorPalette {
  constructor(imgUrl) {
    this.imgUrl = imgUrl;
    this.colorCache = new ColorCache();
  }

  loadImageAndColor(paletteCount) {
    return new Promise((resolve, reject) => {
      // Check the cache first
      const cachedColors = this.colorCache.get(this.imgUrl);
      if (cachedColors) {
        resolve(cachedColors.slice(0, paletteCount)); // Return the cached colors
        return;
      }

      // Use sharp to read the image
      sharp(this.imgUrl)
        .raw()
        .toBuffer()
        .then(buffer => {
          const pixels = [];
          for (let i = 0; i < buffer.length; i += 128) {
            if (buffer[i + 3] !== 0) { // Skip transparent pixels
              pixels.push([buffer[i], buffer[i + 1], buffer[i + 2]]);
            }
          }

          // Apply the median cut algorithm to get the quantized colors
          const quantizedColors = this.medianCut(pixels, 64);

          // Create a color map to count the occurrences of each color
          const colorMap = {};
          for (const color of quantizedColors) {
            const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            colorMap[colorStr] = (colorMap[colorStr] || 0) + 1;
          }

          // Find the dominant colors
          const dominantColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]).slice(0, paletteCount);

          // Add the result to the cache
          this.colorCache.set(this.imgUrl, dominantColors);

          // Return the generated color palette
          resolve(dominantColors);
        })
        .catch(reject);
    });
  }

  // Additional helper methods like dimColor, rgbToHsl, medianCut, etc. go here.
  // The same code you've previously provided can be included here, or you can further modularize it into separate helper functions.
}

module.exports = CalculateColorPalette;
