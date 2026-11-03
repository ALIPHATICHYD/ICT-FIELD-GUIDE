// Renders the app icons from SVG using the preinstalled Chromium (Playwright).
// Run: npm run icons   (needs Playwright: npm i -D playwright, or a global install)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const sizes = [
  ['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['apple-touch-icon.png', 180, 0], ['maskable-512.png', 512, 0.12]
];
let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  const root = execSync('npm root -g').toString().trim();
  ({ chromium } = createRequire(import.meta.url)(`${root}/playwright`));
}
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, pad] of sizes) {
  const inner = Math.round(size * (1 - pad * 2));
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${pad ? '#1E4B3A' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: `public/icons/${name}`, omitBackground: !pad });
}
await browser.close();
console.log('icons written');
