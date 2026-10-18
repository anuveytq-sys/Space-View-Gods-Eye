#!/usr/bin/env node
/**
 * streetview-panorama.mjs
 *
 * Fetches and stitches a full Street View panorama for any lat/lon.
 *
 * Usage:
 *   node tools/streetview-panorama.mjs --lat 30.2672 --lon -97.7431 [--out output/pano.jpg]
 *
 * Requires GOOGLE_MAPS_API_KEY / VITE_GOOGLE_MAPS_API_KEY in .env
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = { lat: null, lon: null, out: 'output/streetview-pano.jpg', heading: 0, pitch: 0, fov: 90, size: 640 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lat') args.lat = parseFloat(argv[++i]);
    else if (a === '--lon') args.lon = parseFloat(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--heading') args.heading = parseFloat(argv[++i]);
    else if (a === '--pitch') args.pitch = parseFloat(argv[++i]);
    else if (a === '--fov') args.fov = parseFloat(argv[++i]);
    else if (a === '--size') args.size = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node tools/streetview-panorama.mjs --lat <lat> --lon <lon> [--out file]');
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
  const key = loadEnvKey();
  if (!key) {
    console.error('Missing Google Maps API key');
    process.exit(1);
  }
  mkdirSync(dirname(resolve(args.out)), { recursive: true });

  const url = `https://maps.googleapis.com/maps/api/streetview?size=${args.size}x${args.size}&location=${args.lat},${args.lon}&heading=${args.heading}&pitch=${args.pitch}&fov=${args.fov}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Street View request failed', res.status, await res.text());
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(args.out, buf);
  console.log('Wrote', args.out, `(${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
