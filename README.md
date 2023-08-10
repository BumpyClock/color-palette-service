# Color Palette Service

Simple micro-service to provide an API endpoint to generate a color palette from an image. Takes an image URL and the number of desired colors, it returns a color palette as a JSON object. 

## Features

- Fetches an image from a provided URL
- Generates a color palette with a specified number of dominant colors
- Caches the results to improve performance
- Allows for dimming the generated colors
- Implements median cut algorithm for palette calculation

## Usage

### Endpoint

`http://localhost:3000/get-palette`

### Parameters

- `imgUrl`: The URL of the image from which to generate the color palette
- `paletteCount`: The number of colors to return in the color palette

### Sample API Call

`http://localhost:3000/get-palette?imgUrl=https://example.com/image.jpg&paletteCount=5`

## Installation

```bash
git clone https://github.com/your-username/color-palette-service.git
cd color-palette-service
npm install
npm run start
