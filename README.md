# GridSight

A reference-photo tool for artists. Upload an image, overlay adjustable gridlines, dial in grayscale to check values, export at full resolution.

Built as a fully client-side static app — no backend, no build step required.

---

## Features

- **Upload** — drag-and-drop or file picker, any aspect ratio, no forced cropping
- **Gridlines** — independent horizontal, vertical, and diagonal (corner-to-corner sight-size X) overlays, with adjustable density, line color, opacity, and width
- **Grayscale** — 0–100% slider using a luminance-weighted conversion (Rec. 709: `0.2126R + 0.7152G + 0.0722B`), not a flat average, so value judgments stay accurate
- **Export** — downloads at the image's original full resolution (not the scaled on-screen preview), with an option to bake in the gridlines or export clean

---

## Tech stack

- HTML5 / CSS3 / vanilla JavaScript
- Canvas API for rendering, pixel manipulation, and export
- No frameworks, no backend, no build tools required

Everything the app does — grid drawing, grayscale conversion, export — is a browser-side canvas operation, so it ships as a static site.

---

## Getting started

No install, no dependencies.

```bash
git clone https://github.com/kzcipherr404/gridsight.git
cd gridsight
```

Then either:
- Open `index.html` directly in a browser, or
- Serve it locally (recommended, avoids browser file:// restrictions on some canvas operations):

```bash
# Python
python3 -m http.server 8000 or py -m http.server 8000

# Node
npx serve .
```

Visit `http://localhost:8000`.

---

## Project structure

```
gridsight/
├── index.html      # Landing page + editor markup
├── styles.css       # All styling
├── script.js         # Upload, canvas rendering, grid logic, grayscale, export
├── /assets           # Images, favicon, etc.
└── README.md
```

---

## Usage

1. Open the app and click **Start** on the landing page
2. Upload a reference photo
3. Toggle and configure gridlines (horizontal / vertical / diagonal, density, color, opacity)
4. Adjust the grayscale slider to check values
5. Export — choose whether to bake the grid into the downloaded image or export it clean

**Keyboard shortcuts:**
- `G` — toggle grid
- `Space` — reset zoom/fit

---

## Roadmap

- [ ] Zoom and pan on large images
- [ ] Save/load grid presets
- [ ] Multiple image comparison view
- [ ] PWA support for offline use

---

## Deployment

Static site — Vercel

**Vercel Link:**
```bash
https://grid-sight-sigma.vercel.app/
```

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Built by Kondwani Zulu — Cybersecurity student and developer, Zambia.
