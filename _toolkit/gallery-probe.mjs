#!/usr/bin/env node
// Interaction probe for thegallery: hover state, feature tiles, search filter.
import puppeteer from 'puppeteer-core';

const OUT = '/Users/kyle/Sites/thegallery/.iterations/shots-pass1';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
const problems = [];
page.on('pageerror', e => problems.push(`[pageerror] ${e.message}`));
page.on('console', m => { if (m.type() === 'error') problems.push(`[console.error] ${m.text()}`); });
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2500));

// 1. hover a mid-grid tile (kiln, room 27)
const tile = await page.$('#room-kiln');
await tile.scrollIntoView();
await new Promise(r => setTimeout(r, 1400));
const box = await tile.boundingBox();
await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.35, { steps: 12 });
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: `${OUT}/probe-hover.jpg`, type: 'jpeg', quality: 85 });
console.log('SHOT probe-hover');

// 2. feature tile (room 12 = ephemeris, nth-child 12? no — 11n+1 → children 1,12,23,34,45)
await page.evaluate(() => document.querySelector('.grid').children[11].scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 1400));
await page.screenshot({ path: `${OUT}/probe-feature.jpg`, type: 'jpeg', quality: 85 });
console.log('SHOT probe-feature');

// 3. search filter
await page.evaluate(() => scrollTo(0, 0));
await page.type('.search', 'paris', { delay: 40 });
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/probe-search.jpg`, type: 'jpeg', quality: 85 });
const shown = await page.$$eval('.vwrap:not(.hidden)', els => els.map(e => e.id));
console.log('SHOT probe-search — visible:', shown.join(', '));

// 4. empty state
await page.click('.search', { clickCount: 3 });
await page.type('.search', 'zzzz');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}/probe-empty.jpg`, type: 'jpeg', quality: 85 });
console.log('SHOT probe-empty');

await browser.close();
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'NO PROBLEMS');
