#!/usr/bin/env node
// Interactive play-test for quarterworld's TOKEN RUNNER cabinet.
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
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:7142/', { waitUntil: 'networkidle2' });
const wait = ms => new Promise(r => setTimeout(r, ms));

await wait(4200); // boot + into attract
const crt = await page.$('#crt');
const shotCrt = async name => { await crt.screenshot({ path: `${OUT}/${name}.png` }); console.log('SHOT ' + name); };
await shotCrt('01-attract-title');
await wait(5000);
await shotCrt('02-attract-scores');

// coin in + start
await page.keyboard.press('Enter'); await wait(400);
await shotCrt('03-ready');
await page.keyboard.press('Enter'); await wait(600);

// play ~8s with steering
for (let i = 0; i < 4; i++) {
  await page.keyboard.down('ArrowRight'); await wait(700); await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft'); await wait(800); await page.keyboard.up('ArrowLeft');
  if (i === 1) await shotCrt('04-playing');
}
await shotCrt('05-playing-later');

const state = await page.evaluate(() => ({
  wallet: localStorage.getItem('qw.wallet'),
  scores: (localStorage.getItem('qw.scores') || '').slice(0, 80),
}));
console.log('wallet after 1 coin:', state.wallet);

// let the run end naturally (stop steering => slugs will land eventually)
await wait(16000);
await shotCrt('06-late');

// full cabinet crop
const cab = await page.$('.cabinet');
await cab.screenshot({ path: `${OUT}/07-cabinet.png` }); console.log('SHOT 07-cabinet');

// mobile cabinet
const m = await browser.newPage();
m.on('pageerror', e => problems.push(`[m pageerror] ${e.message}`));
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await m.goto('http://127.0.0.1:7142/', { waitUntil: 'networkidle2' });
await m.evaluate(() => document.querySelector('.cabinet').scrollIntoView({ block: 'start' }));
await new Promise(r => setTimeout(r, 4500));
await m.screenshot({ path: `${OUT}/08-mobile-cabinet.png` }); console.log('SHOT 08-mobile-cabinet');
// tap the coin slot then start via deck button
await m.tap('#coinSlot'); await new Promise(r => setTimeout(r, 400));
await m.tap('#btnStart'); await new Promise(r => setTimeout(r, 1200));
await m.screenshot({ path: `${OUT}/09-mobile-playing.png` }); console.log('SHOT 09-mobile-playing');

await browser.close();
console.log(problems.length ? '\nPROBLEMS:\n' + [...new Set(problems)].join('\n') : '\nNO PROBLEMS');
