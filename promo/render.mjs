import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('📦 Bundling...');
  const bundled = await bundle({
    entryPoint: path.join(__dirname, 'src', 'index.tsx'),
    webpackOverride: (config) => config,
  });

  console.log('🎬 Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'NasdaqPromo',
    browserExecutable: '/usr/bin/chromium-browser',
  });

  const outPath = path.join(__dirname, 'nasdaq-promo.mp4');
  console.log('🎥 Rendering to', outPath);

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outPath,
    browserExecutable: '/usr/bin/chromium-browser',
    onProgress: ({ progress }) => {
      process.stdout.write(`\r⏳ ${Math.round(progress * 100)}%`);
    },
  });

  console.log('\n✅ Done! Output:', outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
