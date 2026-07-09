# SHOWCASE BUILD STANDARDS

You are building one of 25 showcase websites demonstrating the outer limit of AI web design capability. These sites will be shown in a video to over 1,000,000 people. The work is credited to Claude. Nothing generic survives. Every site must look like it came from a world-class studio with a singular point of view.

## Mission rules

1. **The concept brief is law.** Your site's concept, technique mandate, and signature element are assigned. Execute them at maximum quality. You have creative freedom in *how*, not *whether*.
2. **Fundamentally different.** 24 other sites exist. Yours must not lean on generic "AI design" defaults. Explicitly banned unless your brief demands them: (a) warm-cream background + high-contrast serif + terracotta accent; (b) near-black + single acid-green/vermilion accent; (c) broadsheet hairline-rule newspaper layout; (d) purple-to-blue gradient SaaS hero; (e) numbered 01/02/03 section markers without a true sequence.
3. **Spend boldness in one place.** The signature element gets the spectacle. Everything around it is quiet, disciplined, and precise. Chanel rule: before finishing, remove one accessory.
4. **Copy is design material.** Write real, specific, fictional content — names, dates, places, numbers, prices, catalog IDs. Never lorem ipsum, never "Lorem", never placeholder-ish filler like "Discover the difference". Active voice. The copy should be good enough to read aloud in the video.

## Process (mandatory order)

1. Read this file fully. If a `Skill` tool is available to you, invoke `frontend-design:frontend-design` first; if not, proceed — the essentials are distilled here.
2. Write `.iterations/DESIGN.md` in your site folder BEFORE coding: named hex palette (4–6 values), type roles (display / body / utility with exact families), layout concept (one paragraph + ASCII wireframe), signature element plan, motion choreography plan (what animates on load, on scroll, on hover — as one orchestrated system, not scattered effects). Review it against the banned-defaults list; revise anything that smells templated; note what you changed.
3. Build the complete site.
4. Verify visually (see Verification below) and fix everything you find.

## Hard technical floor (all 25 sites)

- **100% self-contained.** Zero external network requests. No CDNs, no Google Fonts links, no hotlinked images. Vendor everything. Verify with the snap.mjs network audit — `requestfailed` or any non-localhost request = failure.
- **File layout:** `index.html`, `css/`, `js/`, `fonts/`, `vendor/` (only what you use), `assets/` (only if needed), `.iterations/` (design + pass logs).
- **Fonts:** self-host via `node /Users/kyle/Sites/_toolkit/fetch-font.mjs "Family Name" "wght@400;700" ./fonts` (also supports variable axes: `"ital,wght@0,300..900;1,300..900"`). Link the generated `fonts/<Family>.css`. Choose characterful, non-default pairings — Inter/Roboto/Open Sans/Lato as display faces are banned. Preload the display font's primary woff2.
- **Vendored libs** (copy from `/Users/kyle/Sites/_toolkit/node_modules/`):
  - three.js (ESM): copy `three/build/three.module.min.js` AND `three/build/three.core.min.js` into `vendor/` (the module build imports the core build). Addons: copy what you need from `three/examples/jsm/` into `vendor/addons/` preserving relative structure (addons import each other by relative path). Import map:
    ```html
    <script type="importmap">
    {"imports":{"three":"./vendor/three.module.min.js","three/addons/":"./vendor/addons/"}}
    </script>
    ```
  - pixi.js: `pixi.js/dist/pixi.min.js` (global `PIXI`). d3: `d3/dist/d3.min.js` (global `d3`). gsap: `gsap/dist/gsap.min.js` + `gsap/dist/ScrollTrigger.min.js` (globals).
- **Imagery is generated, not downloaded.** Produce visuals procedurally (WebGL, canvas, SVG, CSS gradients/filters, inline noise). No stock photos. If your brief needs "photographic" texture, synthesize it (grain, gradients, SVG turbulence).
- **Responsive 390px → 1920px.** Mobile is not an afterthought: the signature element must degrade gracefully (simplified but still impressive, or an intentional static composition).
- **Accessibility floor:** semantic landmarks (`header/main/section/footer`, one `h1`), visible `:focus-visible` styles, body text contrast ≥ 4.5:1 (display type ≥ 3:1), `prefers-reduced-motion: reduce` honored — heavy motion stops, content remains fully usable. Canvas/WebGL scenes get `aria-hidden="true"` with real text content elsewhere.
- **Performance:** animate only `transform`/`opacity` in CSS; rAF loops must pause when tab hidden (`visibilitychange`) and when the canvas is offscreen (IntersectionObserver); cap `devicePixelRatio` at 2; a WebGL failure must fall back to a designed static/CSS alternative, never a blank hero.
- **Page furniture:** proper `<title>`, meta description, OG tags (`og:title`, `og:description`), inline SVG data-URI favicon that matches the palette, `<html lang>`, `theme-color`.
- **No console errors, no page errors, no failed requests** — as reported by snap.mjs.

## Verification (how you SEE your work)

From your site folder:

```bash
lsof -ti:PORT | xargs kill 2>/dev/null; python3 -m http.server PORT --directory /Users/kyle/Sites/SITENAME >/dev/null 2>&1 &
sleep 1
node /Users/kyle/Sites/_toolkit/snap.mjs http://127.0.0.1:PORT/ /Users/kyle/Sites/SITENAME/.iterations/shots-passN SITENAME
```

(Your assigned PORT is in your task prompt.) snap.mjs captures desktop (1440×900) and mobile (390×844) screenshots at 5 scroll depths and prints console/page/network problems. **Read the screenshots with your Read tool — they are images. Actually look at them.** A picture is worth 1000 tokens. Judge them as a hostile design critic would. When finished with all work, kill your server: `lsof -ti:PORT | xargs kill 2>/dev/null`.

## Iteration pass protocol

An iteration pass = fine-toothed comb over the ENTIRE site, then real improvements. Per pass:

1. Re-read every file you own end to end. Take fresh screenshots. Read them.
2. Audit against this checklist: visual hierarchy (does the eye travel correctly?), spacing rhythm (consistent scale, no orphan gaps), palette cohesion + contrast, type scale/measure/line-height (45–75ch body measure), motion choreography (easing quality — no `linear`, no default `ease` on hero moments; use custom cubic-beziers; stagger deliberately), responsive integrity at 390/768/1440, a11y floor, perf floor, copy quality, dead code, console problems.
3. Find at least: 3 concrete defects AND 2 elevation opportunities (ways to deepen/complexify the design — richer signature-element behavior, an orchestrated load sequence, a detail system like custom selection color/scrollbar/cursor treatments, micro-interactions on every interactive element). Implement them.
4. Log to `.iterations/pass-N.md`: what you found, what you changed, before→after.

Elevate, don't homogenize: fixes must push the site MORE toward its concept, never sand it down toward neutral.
