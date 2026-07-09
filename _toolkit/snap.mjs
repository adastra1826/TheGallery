#!/usr/bin/env node
// Screenshot + console/network audit for a local site using installed Chrome.
// usage: node snap.mjs <url> <outdir> [label]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [url, outdir = './shots', label = 'site'] = process.argv.slice(2);
if (!url) {
  console.error('usage: node snap.mjs <url> <outdir> [label]');
  process.exit(1);
}
mkdirSync(outdir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const problems = [];

async function shoot(width, height, tag) {
  const page = await browser.newPage();
  page.on('console', m => {
    if (['error', 'warning'].includes(m.type())) problems.push(`[console.${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', e => problems.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', r => problems.push(`[requestfailed] ${r.url()} → ${r.failure()?.errorText}`));
  page.on('request', r => {
    const u = r.url();
    if (!/^(http:\/\/(127\.0\.0\.1|localhost)|data:|blob:|file:)/.test(u)) problems.push(`[external-request] ${u}`);
  });
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 3000)); // let intro choreography land
  const H = await page.evaluate(() => Math.max(document.body.scrollHeight, innerHeight));
  const stops = [...new Set([0, 0.25, 0.5, 0.75, 1].map(p => Math.max(0, Math.round(p * (H - height)))))];
  for (const y of stops) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y);
    await new Promise(r => setTimeout(r, 1200)); // let scroll-triggered reveals land
    const f = join(outdir, `${label}-${tag}-y${y}.jpg`);
    await page.screenshot({ path: f, type: 'jpeg', quality: 82 });
    console.log('SHOT ' + f);
  }
  await page.close();
}

await shoot(1440, 900, 'desktop');
await shoot(390, 844, 'mobile');
await browser.close();
console.log(problems.length ? '\nPROBLEMS:\n' + [...new Set(problems)].join('\n') : '\nNO CONSOLE/PAGE/NETWORK PROBLEMS');
