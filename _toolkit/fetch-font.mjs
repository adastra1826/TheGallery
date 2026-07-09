#!/usr/bin/env node
// Download a Google Font family for self-hosting.
// usage: node fetch-font.mjs "Family Name" "wght@400;700" ./fonts
//        node fetch-font.mjs "Fraunces" "ital,wght@0,300..900;1,300..900" ./fonts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [family, axes = 'wght@400;700', outdir = './fonts'] = process.argv.slice(2);
if (!family) {
  console.error('usage: node fetch-font.mjs "Family" "wght@400;700" ./fonts');
  process.exit(1);
}
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:${axes}&display=swap`;
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
if (!css.includes('@font-face')) {
  console.error(`No @font-face returned for "${family}" — check family/axes.\n${css.slice(0, 300)}`);
  process.exit(1);
}
mkdirSync(outdir, { recursive: true });
const slug = family.replace(/ /g, '');
const seen = new Map();
let out = css;
let i = 0;
for (const m of css.matchAll(/url\((https:[^)]+\.woff2)\)/g)) {
  const remote = m[1];
  if (!seen.has(remote)) {
    const fname = `${slug}-${String(++i).padStart(2, '0')}.woff2`;
    const buf = Buffer.from(await (await fetch(remote, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(join(outdir, fname), buf);
    seen.set(remote, fname);
  }
  out = out.replaceAll(`url(${remote})`, `url(./${seen.get(remote)})`);
}
writeFileSync(join(outdir, `${slug}.css`), out);
console.log(`Saved ${seen.size} woff2 file(s) + ${slug}.css to ${outdir}`);
