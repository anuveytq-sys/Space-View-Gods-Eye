#!/usr/bin/env node
/**
 * streetview-headings.mjs
 *
 * Fetches Street View static images at 8 compass headings for a given location.
 *
 * Usage:
 *   node tools/streetview-headings.mjs --lat 30.2672 --lon -97.7431 [--out-dir output/headings]
 *
 * Requires GOOGLE_MAPS_API_KEY / VITE_GOOGLE_MAPS_API_KEY in .env
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const args = { lat: null, lon: null, outDir: 'output/headings', size: 640, pitch: 0, fov: 90 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lat') args.lat = parseFloat(argv[++i]);
    else if (a === '--lon') args.lon = parseFloat(argv[++i]);
    else if (a === '--out-dir') args.outDir = argv[++i];
    else if (a === '--size') args.size = parseInt(argv[++i], 10);
    else if (a === '--pitch') args.pitch = parseFloat(argv[++i]);
    else if (a === '--fov') args.fov = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node tools/streetview-headings.mjs --lat <lat> --lon <lon> [--out-dir dir]');
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
  mkdirSync(args.outDir, { recursive: true });

  const headings = [0, 45, 90, 135, 180, 225, 270, 315];
  for (const h of headings) {
    const url = `https://maps.googleapis.com/maps/api/streetview?size=${args.size}x${args.size}&location=${args.lat},${args.lon}&heading=${h}&pitch=${args.pitch}&fov=${args.fov}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed heading', h, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const out = resolve(args.outDir, `heading-${String(h).padStart(3, '0')}.jpg`);
    writeFileSync(out, buf);
    console.log('Wrote', out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
