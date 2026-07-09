# The Gallery

**Fifty rooms built by Claude — one hall, fifty doors.**

The Gallery is a single static index page that hangs fifty self-contained
websites side by side. Each "room" is its own invented world — a night airmail
line, a wood-fired kiln, an orbital-debris observatory, a tea room on a cedar
ridge — with its own typography, physics and point of view. Pick a door and step
inside.

Everything here is static and self-contained: no build step, no framework, no
database, no CDNs, no stock imagery, no outside requests. The fonts, the physics
and the pictures all live inside the folder.

## Quick start

The Gallery is plain HTML, CSS and JavaScript. Any static file server works —
serve the project root and open it in a browser:

```bash
# from the project root
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Or use any equivalent static server (`npx serve`, `php -S localhost:8000`,
nginx, Apache, …). You can also open `index.html` directly from disk — the room
links resolve to `sites/<room>/index.html`, so navigation works over `file://`
too, though a local server is recommended for consistent font and image loading.

## Deployment

Drop the whole folder onto any static host — **no configuration required.**
It works as-is on GitHub Pages, Netlify, Cloudflare Pages, Amazon S3, or a plain
nginx/Apache document root. Every link is relative, so the site can live at a
domain root or inside a subfolder.

## Project structure

```
thegallery/
├── index.html          The hall — masthead, spectrum nav, search, the grid
├── css/
│   └── main.css        All styling for the index page
├── js/
│   ├── data.js         The collection manifest — one entry per room
│   └── main.js         Renders the grid, spectrum, search, and pointer tilt
├── fonts/              Self-hosted webfonts (Bricolage Grotesque, Newsreader,
│                       Spline Sans Mono) as .woff2 + @font-face CSS
├── shots/              One 2160×1350 preview image per room (<room>.jpg)
└── sites/              The fifty rooms — each a self-contained website
    ├── aeropost/
    │   └── index.html
    ├── afterhours/
    │   └── index.html
    └── …               (50 folders total)
```

## How it works

- **`js/data.js`** is the manifest. It exports a `ROOMS` array with one object
  per room: `name` (which is also the `sites/` folder name), an `accent` color,
  a `title`, a `where` line and a short `blurb`.
- **`js/main.js`** reads that array and builds the page: it hangs each room as a
  card linking to `sites/<name>/index.html`, draws the color **spectrum** strip
  used to jump between rooms, wires up the **search** box, and adds a
  pointer-tracked **tilt** effect. It respects `prefers-reduced-motion` and only
  enables tilt for fine pointers.
- **`sites/<name>/`** holds each room as a completely independent website with
  its own assets and relative links. Rooms don't depend on the gallery or on one
  another.

## Adding or editing a room

1. Add the room's website as a new folder under `sites/` containing an
   `index.html` (e.g. `sites/newroom/index.html`).
2. Add a preview image at `shots/newroom.jpg` (2160×1350 keeps it consistent
   with the rest).
3. Add one entry to the `ROOMS` array in `js/data.js`, where `name` matches the
   folder name:

   ```js
   { name: 'newroom', accent: '#3EC5D6', title: 'New Room',
     where: 'Somewhere · a date', blurb: 'One sentence that makes them curious.' },
   ```

The card, its screenshot, its spectrum chip and its search entry are all
generated from that one line.

## Credits

Built by Claude — every room, one at a time. Fonts are self-hosted open
typefaces (Bricolage Grotesque, Newsreader, Spline Sans Mono).

## License

Released under the [MIT License](LICENSE) — © 2026 Kyle Provost. You're free to
use, modify and distribute it; see the `LICENSE` file for the full text.
