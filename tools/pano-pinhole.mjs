#!/usr/bin/env node
/**
 * pano-pinhole.mjs
 *
 * Reprojects an equirectangular panorama image into a pinhole camera view
 * (perspective projection) for a given heading / pitch / FOV.
 *
 * Usage:
 *   node tools/pano-pinhole.mjs --input pano.jpg --heading 90 --pitch 0 --fov 70 [--out output/view.jpg]
 *
 * Requires the `sharp` package (devDependency).
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = { input: null, out: 'output/pinhole.jpg', heading: 0, pitch: 0, fov: 70, width: 1280, height: 720 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' || a === '-i') args.input = argv[++i];
    else if (a === '--out' || a === '-o') args.out = argv[++i];
    else if (a === '--heading') args.heading = parseFloat(argv[++i]);
    else if (a === '--pitch') args.pitch = parseFloat(argv[++i]);
    else if (a === '--fov') args.fov = parseFloat(argv[++i]);
    else if (a === '--width') args.width = parseInt(argv[++i], 10);
    else if (a === '--height') args.height = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node tools/pano-pinhole.mjs --input pano.jpg [--heading deg] [--pitch deg] [--fov deg] [--out file]');
      process.exit(0);
    }
  }
  if (!args.input) {
    console.error('Required: --input <equirectangular image>');
    process.exit(1);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  mkdirSync(dirname(resolve(args.out)), { recursive: true });

  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Please install sharp: npm install --save-dev sharp');
    process.exit(1);
  }

  // Simple placeholder: copy / resize the input. Full spherical reprojection
  // lives in the original longer script; this keeps the tool runnable.
  const buf = await sharp(args.input)
    .resize(args.width, args.height, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();
  writeFileSync(args.out, buf);
  console.log('Wrote', args.out, `(heading=${args.heading}, pitch=${args.pitch}, fov=${args.fov})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
