#!/usr/bin/env node
/**
 * cesium-render.mjs
 *
 * Renders a CesiumJS 3D view to a JPEG image using headless Chromium
 * (Puppeteer) + Google Photorealistic 3D Tiles.
 *
 * Usage:
 *   node tools/cesium-render.mjs --lat 30.2672 --lon -97.7431 [--out output/render.jpg]
 *
 * Requires VITE_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY in .env
 * and a Cesium ion token if needed for terrain.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { lat: null, lon: null, out: 'output/cesium-render.jpg', width: 1280, height: 720, heading: 0, pitch: -30, heightM: 800 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lat') args.lat = parseFloat(argv[++i]);
    else if (a === '--lon') args.lon = parseFloat(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--width') args.width = parseInt(argv[++i], 10);
    else if (a === '--height') args.height = parseInt(argv[++i], 10);
    else if (a === '--heading') args.heading = parseFloat(argv[++i]);
    else if (a === '--pitch') args.pitch = parseFloat(argv[++i]);
    else if (a === '--height-m') args.heightM = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node tools/cesium-render.mjs --lat <lat> --lon <lon> [--out file] [--width n] [--height n]');
      process.exit(0);
    }
  }
  if (args.lat == null || args.lon == null) {
    console.error('Required: --lat and --lon');
    process.exit(1);
  }
  return args;
}

function loadEnvKey() {
  try {
    const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    const m = env.match(/^(?:VITE_)?GOOGLE_MAPS_API_KEY\s*=\s*(.+)$/m);
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  } catch {
    return process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = loadEnvKey();
  if (!apiKey) {
    console.error('Missing Google Maps API key in .env');
    process.exit(1);
  }

  mkdirSync(dirname(resolve(args.out)), { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: args.width, height: args.height });

  const htmlPath = resolve(__dirname, 'cesium-render.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  await page.evaluate(
    (opts) => {
      window.__GEV_RENDER__ = opts;
    },
    { lat: args.lat, lon: args.lon, heading: args.heading, pitch: args.pitch, heightM: args.heightM, apiKey }
  );

  // Minimal viewer bootstrap (full original script has richer Cesium setup)
  await page.evaluate(async () => {
    const o = window.__GEV_RENDER__;
    Cesium.Ion.defaultAccessToken = o.cesiumToken || undefined;
    const viewer = new Cesium.Viewer('cesiumContainer', {
      imageryProvider: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });
    // Google Photorealistic 3D Tiles
    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset({ key: o.apiKey });
      viewer.scene.primitives.add(tileset);
    } catch (e) {
      console.warn('3D tiles failed', e);
    }
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(o.lon, o.lat, o.heightM),
      orientation: {
        heading: Cesium.Math.toRadians(o.heading),
        pitch: Cesium.Math.toRadians(o.pitch),
        roll: 0,
      },
    });
    window.__viewer = viewer;
  });

  // Wait for tiles to load a bit
  await new Promise((r) => setTimeout(r, 8000));

  const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
  writeFileSync(args.out, buf);
  console.log('Wrote', args.out);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
