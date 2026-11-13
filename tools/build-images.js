#!/usr/bin/env node
/* Builds the PWA's PNG icons (from images/icon.svg and images/icon-maskable.svg) and the
   install-dialog screenshots listed in manifest.webmanifest, using headless Chrome or Edge.

   Run the site first (npx http-server -p 5173 -c-1 .), then:
     node tools/build-images.js [http://localhost:5173]
   Set CHROME=/path/to/chrome if it is not found. */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '');

const CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);
const CHROME = CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) { console.error('Chrome/Edge not found; set CHROME=/path/to/chrome'); process.exit(1); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'origami-shots-'));

const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/');

function shoot(url, out, w, h, extra = []) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--force-device-scale-factor=1', `--user-data-dir=${path.join(tmp, 'profile')}`, '--allow-file-access-from-files',
    `--window-size=${w},${h}`, '--virtual-time-budget=4000', `--screenshot=${out}`, ...extra, url
  ], { stdio: 'ignore' });
  console.log('  ' + path.relative(ROOT, out) + `  (${w}x${h})`);
}

/* Headless Chrome will not lay a page out narrower than ~500px, so a phone-sized shot loads the
   page in an iframe of exactly that size and screenshots the frame. */
function shootFramed(url, out, w, h) {
  const page = path.join(tmp, path.basename(out) + '.html');
  fs.writeFileSync(page, `<!doctype html><style>html,body{margin:0;overflow:hidden}iframe{border:0;display:block;width:${w}px;height:${h}px}</style><iframe src="${url}"></iframe>`);
  shoot(fileUrl(page), out, Math.max(w, 600), h);
  // crop is not available from the CLI; the frame sits at 0,0, so trim the PNG width below.
  cropWidth(out, w);
}

/* Minimal PNG width crop (8-bit RGB/RGBA, non-interlaced — what Chrome writes). */
function cropWidth(file, w) {
  const zlib = require('zlib');
  const buf = fs.readFileSync(file);
  let pos = 8, ihdr, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = Buffer.from(data);
    else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const W = ihdr.readUInt32BE(0), H = ihdr.readUInt32BE(4), colorType = ihdr[9];
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = W * bpp + 1, out = Buffer.alloc((w * bpp + 1) * H);
  let prev = Buffer.alloc(W * bpp);
  for (let y = 0; y < H; y++) {
    const f = raw[y * stride], line = Buffer.from(raw.subarray(y * stride + 1, (y + 1) * stride));
    for (let i = 0; i < line.length; i++) { // undo the row filter
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let p = 0;
      if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = (line[i] + p) & 255;
    }
    out[y * (w * bpp + 1)] = 0;
    line.copy(out, y * (w * bpp + 1) + 1, 0, w * bpp);
    prev = line;
  }
  ihdr.writeUInt32BE(w, 0);
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  fs.writeFileSync(file, Buffer.concat([buf.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(out, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
}

// ---------- icons ----------
console.log('Icons');
const icons = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'maskable-192.png', 192],
  ['icon-maskable.svg', 'maskable-512.png', 512],
  ['icon-maskable.svg', 'apple-touch-icon.png', 180]
];
for (const [src, out, size] of icons) {
  const svg = fs.readFileSync(path.join(ROOT, 'images', src), 'utf8');
  const page = path.join(tmp, `${out}.html`);
  fs.writeFileSync(page, `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  // transparent page so the rounded "any" icon keeps clear corners
  shoot(fileUrl(page), path.join(ROOT, 'images', 'icons', out), size, size, ['--default-background-color=00000000']);
}

// ---------- screenshots (keep in step with manifest.webmanifest) ----------
console.log('Screenshots');
const shots = [
  ['wide-home.png', '/?shot#/', 1280, 720],
  ['wide-crane.png', '/?shot#/model/crane/6', 1280, 720],
  ['wide-plane.png', '/?shot#/model/dart/3', 1280, 720],
  ['narrow-home.png', '/?shot#/', 412, 915],
  ['narrow-crane.png', '/?shot#/model/crane/11', 412, 915],
  ['narrow-fortune.png', '/?shot#/model/fortune-teller/2', 412, 915]
];
for (const [out, route, w, h] of shots) {
  const file = path.join(ROOT, 'images', 'screens', out);
  if (w < 600) shootFramed(BASE + route, file, w, h); else shoot(BASE + route, file, w, h);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('Done.');
