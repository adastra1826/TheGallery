import puppeteer from 'puppeteer-core';

const outdir = process.argv[2];
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const problems = [];
page.on('console', m => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', e => problems.push('pageerror: ' + e.message));

await page.goto('http://127.0.0.1:7130/', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 2500));

// jump to the end to trigger the finale
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 1500));
const dimOn = await page.evaluate(() => document.body.classList.contains('finale-dim'));
await new Promise(r => setTimeout(r, 6500));
await page.screenshot({ path: outdir + '/probe-finale-mid.jpg', quality: 80, type: 'jpeg' });

// wait for the barrage to finish, the shout, and the encore
let tamayaSeen = false, encoreShown = false;
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 1000));
  if (!tamayaSeen && await page.$('.shot-caption.tamaya')) {
    tamayaSeen = true;
    await page.screenshot({ path: outdir + '/probe-tamaya.jpg', quality: 80, type: 'jpeg' });
  }
  encoreShown = await page.evaluate(() => { const e = document.getElementById('encore'); return e && !e.hidden; });
  if (tamayaSeen && encoreShown) break;
}
console.log(JSON.stringify({ dimOn, tamayaSeen, encoreShown, problems }, null, 2));
await browser.close();
