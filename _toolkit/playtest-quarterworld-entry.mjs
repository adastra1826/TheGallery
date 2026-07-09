#!/usr/bin/env node
// Verify the high-score entry flow: game over -> 3-letter entry -> table -> localStorage.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const OUT = '/Users/kyle/Sites/quarterworld/.iterations/shots-play';
mkdirSync(OUT, { recursive: true });
const problems = [];

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
page.on('console', m => { if (['error', 'warning'].includes(m.type())) problems.push(`[console.${m.type()}] ${m.text()}`); });
page.on('pageerror', e => problems.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:7142/?qa=1', { waitUntil: 'networkidle2' });
const wait = ms => new Promise(r => setTimeout(r, ms));
const crt = () => page.$('#crt');
const shot = async n => { await (await crt()).screenshot({ path: `${OUT}/${n}.png` }); console.log('SHOT ' + n); };

await wait(4000);
await page.keyboard.press('Enter'); await wait(300);   // coin
await page.keyboard.press('Enter'); await wait(800);   // start
await page.evaluate(() => window.QW_QA.endRun(8400));  // force qualifying game over
await wait(300);
console.log('mode after endRun:', await page.evaluate(() => window.QW_QA.mode()));
await shot('10-entry');
// spell K Y L : K = +10 downs? letters cycle A.. down=next. Use ArrowDown x10 -> K
for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowUp'); // A -> Y (up twice: A->Z->Y)
await page.keyboard.press('Enter');
for (let i = 0; i < 11; i++) await page.keyboard.press('ArrowDown'); // A -> L
await shot('11-entry-filled');
await page.keyboard.press('Enter'); // commit
await wait(600);
console.log('mode after commit:', await page.evaluate(() => window.QW_QA.mode()));
await shot('12-table-new');
const stored = await page.evaluate(() => localStorage.getItem('qw.scores'));
console.log('stored scores:', stored);
await wait(7200);
console.log('mode after table timeout:', await page.evaluate(() => window.QW_QA.mode()));
await browser.close();
console.log(problems.length ? '\nPROBLEMS:\n' + [...new Set(problems)].join('\n') : '\nNO PROBLEMS');
