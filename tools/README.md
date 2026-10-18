# Tools

CLI scripts for fetching, rendering, and reprojecting geospatial imagery. All tools read the Google Maps API key from `.env` automatically.

Output files go to `output/` by default (gitignored).

## Prerequisites

- Node.js (via `mise`)
- `sharp` and `puppeteer` (devDependencies — `npm install`)
- Google Maps API key with Maps Tile API / Street View enabled in `.env` as `VITE_GOOGLE_MAPS_API_KEY` or `GOOGLE_MAPS_API_KEY`

## Tools

| Script | Purpose |
|--------|--------|
| `cesium-render.mjs` | Headless Cesium render of a location (uses Google Photorealistic 3D Tiles) |
| `cesium-render.html` | HTML page loaded by the Cesium render script |
| `sat-ortho.mjs` | Fetch satellite orthophoto tiles and stitch them |
| `streetview-panorama.mjs` | Download Google Street View panorama tiles |
| `streetview-headings.mjs` | Sample Street View headings around a point |
| `pano-pinhole.mjs` | Convert equirectangular panorama to pinhole camera views |

## Usage examples

```bash
# Cesium offscreen render
node tools/cesium-render.mjs --lat 30.2672 --lon -97.7431 --out output/austin.png

# Satellite ortho
node tools/sat-ortho.mjs --lat 30.2672 --lon -97.7431 --zoom 18 --out output/ortho.png

# Street View panorama
node tools/streetview-panorama.mjs --lat 30.2672 --lon -97.7431 --out output/pano.jpg
```

See each script's `--help` for full options.
