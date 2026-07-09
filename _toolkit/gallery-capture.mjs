#!/usr/bin/env node
// Capture one hero screenshot per showcase site into thegallery/shots/.
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = '/Users/kyle/Sites/thegallery/shots';
mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(readFileSync('/Users/kyle/Sites/thegallery/.build-manifest.json', 'utf8'));
const names = manifest.map(s => s.name);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--ignore-certificate-errors', '--use-gl=angle'],
});

const failures = [];

async function capture(name) {
  const file = join(OUT, `${name}.jpg`);
  if (existsSync(file)) { console.log(`SKIP ${name}`); return; }
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
    await page.goto(`https://${name}.test/`, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.mouse.move(720, 420); // wake cursor-reactive scenes
    await new Promise(r => setTimeout(r, 3800)); // let intro choreography land
    await page.mouse.move(760, 460);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log(`SHOT ${name}`);
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
    console.log(`FAIL ${name}: ${e.message}`);
  } finally {
    await page.close().catch(() => {});
  }
}

// 3-way concurrency
const queue = [...names];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) await capture(queue.shift());
}));

await browser.close();
console.log(failures.length ? `\nFAILURES (${failures.length}):\n${failures.join('\n')}` : '\nALL CAPTURED');
