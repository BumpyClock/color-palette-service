const axios = require('axios');
const sharp = require('sharp');
const ColorCache = require('./colorCache');

const quantResolution=64;
const pixelStepSize=128;
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
        resolve(cachedColors.slice(0, paletteCount));
        return;
      }

      // Fetch the image using axios
      axios.get(this.imgUrl, { responseType: 'arraybuffer' })
        .then(response => {
          const buffer = Buffer.from(response.data, 'binary');

          // Use sharp to process the buffer
          sharp(buffer)
            .raw()
            .toBuffer()
            .then(imageBuffer => {
              const pixels = [];
              for (let i = 0; i < imageBuffer.length; i += pixelStepSize) {
                if (imageBuffer[i + 3] !== 0) { // Skip transparent pixels
                  pixels.push([imageBuffer[i], imageBuffer[i + 1], imageBuffer[i + 2]]);
                }
              }

              // Apply the median cut algorithm to get the quantized colors
              const quantizedColors = this.medianCut(pixels, quantResolution);

              // Dim the colors
              const dominantColors = quantizedColors.map(color => {
                const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                return this.dimColor(colorStr);
              });

              // Add the result to the cache
              this.colorCache.set(this.imgUrl, dominantColors.slice(0, paletteCount));

              // Return the generated color palette
              resolve(dominantColors.slice(0, paletteCount));
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  dimColor(colorStr) {
    // Extracting the RGB values from the string
    const [r, g, b] = colorStr.match(/(\d+\.\d+|\d+)/g).map(str => parseFloat(str));

    // Convert RGB to HSL
    const [h, s, l] = this.rgbToHsl(r, g, b);

    // Reducing the lightness
    const newL = l * .7; // Adjust the dimming factor here

    // Convert HSL back to RGB for debugging
    // const [debugR, debugG, debugB] = this.hslToRgb(h, s, l);
    // console.log(`Original: ${colorStr}, Debug RGB: rgb(${Math.round(debugR)}, ${Math.round(debugG)}, ${Math.round(debugB)})`); // Debug line

    // Convert back to RGB
    const [newR, newG, newB] = this.hslToRgb(h, s, newL);

    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
}

// RGB to HSL conversion
rgbToHsl(r,g,b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = h;
    let l = h;

    if (max === min) {
        h = s = 0; // Achromatic
    } else {
        const delta = max - min;
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
            case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
            case g: h = (b - r) / delta + 2; break;
            case b: h = (r - g) / delta + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// HSL to RGB conversion
hslToRgb(h,s,l) {
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}






medianCut(pixels, numColors) {
    const boxes = [pixels];

    while (boxes.length < numColors) {
        const boxToSplit = boxes.shift();
        if (boxToSplit) {
            const medianIdx = Math.floor(boxToSplit.length / 2);
            const sortedByComponent = this.findLongestComponent(boxToSplit);
            boxes.push(sortedByComponent.slice(0, medianIdx), sortedByComponent.slice(medianIdx));
        }
    }

    return boxes.map(box => {
        const avg = [0, 0, 0];
        for (const pixel of box) {
            avg[0] += pixel[0];
            avg[1] += pixel[1];
            avg[2] += pixel[2];
        }
        return avg.map(component => component / box.length);
    });
}

findLongestComponent(pixels) {
    const ranges = [0, 0, 0];
    for (const pixel of pixels) {
        ranges[0] = Math.max(ranges[0], pixel[0]);
        ranges[1] = Math.max(ranges[1], pixel[1]);
        ranges[2] = Math.max(ranges[2], pixel[2]);
    }
    const longestComponent = ranges.indexOf(Math.max(...ranges));
    return pixels.sort((a, b) => a[longestComponent] - b[longestComponent]);
}

}

module.exports = CalculateColorPalette;
