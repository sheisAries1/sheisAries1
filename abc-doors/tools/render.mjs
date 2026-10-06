// Render the animation frame-by-frame in headless Chromium and encode it with ffmpeg.
//
//   node tools/render.mjs --three <dir-containing-three-package> [--out video/abc-doors.mp4]
//   node tools/render.mjs --three <dir> --stills 1.0,3.5,9.2 --outdir stills/
//
// --three points at a local copy of the three@0.169.0 npm package so rendering works
// offline; the page's CDN URLs are routed to it. Requires `playwright` and `ffmpeg`.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));

const THREE_DIR = args.three && path.resolve(args.three);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4' };

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => { console.error('[pageerror]', e); process.exit(1); });

await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  let file = null;
  if (url.hostname === 'abc.local') file = path.join(ROOT, decodeURIComponent(url.pathname));
  else if (url.hostname === 'cdn.jsdelivr.net' && THREE_DIR && url.pathname.startsWith('/npm/three@')) {
    file = path.join(THREE_DIR, url.pathname.replace(/^\/npm\/three@[^/]+\//, ''));
  }
  if (file && fs.existsSync(file)) {
    return route.fulfill({ body: fs.readFileSync(file), contentType: MIME[path.extname(file)] || 'application/octet-stream' });
  }
  return route.continue();
});

await page.goto('http://abc.local/index.html?render=1');
await page.waitForFunction(() => window.ABC && document.body.classList.contains('ready'), null, { timeout: 120000 });
const info = await page.evaluate(() => ({ duration: ABC.duration, fps: ABC.fps }));

const toBuf = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

if (args.stills) {
  const outdir = path.resolve(args.outdir || 'stills');
  fs.mkdirSync(outdir, { recursive: true });
  for (const t of String(args.stills).split(',').map(Number)) {
    const t0 = Date.now();
    const data = await page.evaluate((t) => ABC.frame(t, 0.92), t);
    const f = path.join(outdir, `still-${t.toFixed(2)}.jpg`);
    fs.writeFileSync(f, toBuf(data));
    console.log(f, `${Date.now() - t0}ms`);
  }
} else {
  const out = path.resolve(args.out || path.join(ROOT, 'video', 'abc-doors-silent.mp4'));
  const from = Number(args.from || 0), to = Number(args.to || info.duration);
  const total = Math.round((to - from) * info.fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 19), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const data = await page.evaluate((t) => ABC.frame(t, 0.95), from + i / info.fps);
    if (!ff.stdin.write(toBuf(data))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${i}/${total}  ${el.toFixed(0)}s elapsed, ~${((el / (i + 1)) * (total - i - 1)).toFixed(0)}s left`);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
