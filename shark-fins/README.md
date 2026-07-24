# Shark Fins 101 — School Project Website

A single-page website about shark fin biology and anatomy, built for a school
project. Covers the five main fin types (dorsal, pectoral, pelvic, anal,
caudal), a full labeled anatomy diagram with a click-to-zoom pop-up, fun
facts, and a sources section.

## How to view it

No installation, build step, or internet connection needed — it's plain
HTML/CSS/JS with original inline SVG illustrations.

1. Open `index.html` directly in any web browser (double-click it, or
   right-click → Open With → your browser).

Optional: to view it via a local server instead (e.g. if your browser blocks
local file scripts), run one of these from inside the `shark-fins/` folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000` in your browser.

## Files

- `index.html` — page content and structure
- `style.css` — all styling (ocean color theme, layout, animations)
- `script.js` — mobile nav menu, active-link highlighting, and the
  click-to-zoom lightbox for the anatomy diagram

## Customizing

- Edit the text inside `index.html` to adjust facts or add your own research.
- The `sources` section lists organizations to cite — replace the bullet
  points with the exact page URLs and access dates you used.
