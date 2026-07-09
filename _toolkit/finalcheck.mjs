#!/usr/bin/env node
// Final verification over real nginx HTTPS origins.
// usage: node finalcheck.mjs <outdir> <name1> <name2> ...
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [outdir, ...names] = process.argv.slice(2);
mkdirSync(outdir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--host-resolver-rules=MAP *.test 127.0.0.1'],
});

let failures = 0;
for (const name of names) {
  const url = `https://${name}.test/`;
  const problems = [];
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) problems.push(`console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', r => problems.push(`requestfailed: ${r.url()}`));
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith(`https://${name}.test/`) && !/^(data:|blob:)/.test(u)) problems.push(`external: ${u}`);
  });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 2500));
    const info = await page.evaluate(() => ({
      title: document.title,
      textLen: document.body.innerText.replace(/\s+/g, ' ').length,
      canvases: document.querySelectorAll('canvas').length,
      svgs: document.querySelectorAll('svg').length,
      h1: document.querySelectorAll('h1').length,
      lang: document.documentElement.lang || 'MISSING',
      desc: !!document.querySelector('meta[name="description"]'),
      og: !!document.querySelector('meta[property="og:title"]'),
      favicon: !!document.querySelector('link[rel*="icon"]'),
    }));
    await page.screenshot({ path: join(outdir, `${name}.jpg`), type: 'jpeg', quality: 82 });
    const uniq = [...new Set(problems)];
    const status = resp.status();
    const bad = status !== 200 || uniq.length > 0 || info.textLen < 200 || info.h1 !== 1;
    if (bad) failures++;
    console.log(`${bad ? 'FAIL' : 'PASS'} ${name}: http=${status} text=${info.textLen} canvas=${info.canvases} svg=${info.svgs} h1=${info.h1} lang=${info.lang} desc=${info.desc} og=${info.og} icon=${info.favicon} problems=${uniq.length}`);
    for (const p of uniq.slice(0, 4)) console.log(`    ! ${p}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}
await browser.close();
console.log(`\n${names.length - failures}/${names.length} PASS`);
