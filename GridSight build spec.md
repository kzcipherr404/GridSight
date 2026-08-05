# Portrait Grid Studio — Build Spec & Prompt Chain

A reference-photo tool for artists: upload any image, overlay adjustable gridlines, dial in grayscale for value-checking, export at full resolution — wrapped in a landing page that doesn't look like a template.

---

## Stack decision

**Vanilla HTML/CSS/JS + Canvas API. No framework, no backend.**

Reasoning:
- Every operation here (image load, grid draw, grayscale conversion, export) is a client-side canvas operation. A backend adds nothing but deploy complexity.
- No framework overhead for what's fundamentally a handful of sliders and a canvas — React state management would be pure ceremony here.
- Ships as a static site → deploy free on GitHub Pages, Vercel, or Netlify in one command.
- If you want typed code and a dev server later, layer Vite + TypeScript on top of the same architecture — doesn't change anything below.

Only add a library for the *landing page* motion (GSAP or plain CSS scroll-timelines). Keep the editor itself dependency-free — it's the part of the portfolio piece that should read as "I understand canvas and pixel manipulation," not "I know how to import a library."

---

## How to use this

Feed the phases below into your AI coding tool (Claude Code, Cursor, etc.) **one at a time, in order.** Test each phase before moving to the next — a working upload-and-display screen you can see is worth more than a finished-looking app that silently breaks four features deep. If a phase doesn't work right, fix it before pasting the next prompt; don't stack unverified phases.

---

## Design direction (landing page)

Concrete, not vibes:

- **Palette:** near-black canvas background (`#0a0a0a`–`#111`), off-white text, one restrained accent color used only for interactive states (a single warm tone — burnt orange or ochre reads "studio," not "SaaS").
- **Typography-led, not icon-led.** One bold display serif or condensed geometric sans for headlines. No stock icon rows.
- **Recurring motif:** thin grid lines as a background/divider element throughout the page — it's literally what the tool does, so let the UI reference it instead of using a generic gradient blob.
- **Hero:** a single before/after visual — full-color photo transforming into a gridded, desaturated reference version — is worth more than three paragraphs of copy explaining the feature.
- **Motion:** subtle scroll-reveals and a hover-responsive grid overlay on the hero image. No parallax for its own sake, no glassmorphism, no gradient-mesh backgrounds — those read as templated instantly.
- **Whitespace:** generous. Let sections breathe; award-winning portfolio sites are usually more restrained than people expect, not busier.

---

## Feature spec (the part that has to be technically right)

**Upload**
- Drag-and-drop + file picker, accepts jpg/png/webp
- Preserve original aspect ratio always — never crop on load
- Render on-screen at a viewport-fit size, but keep the full-resolution image data in memory separately from the display size

**Gridlines**
- Horizontal, vertical, and diagonal toggles — independent, not mutually exclusive
- Diagonal = corner-to-corner X by default (the classic sight-size/proportion-check line artists actually use)
- Density control per axis (e.g. 2–10 divisions, or a single density slider driving both)
- Line color presets (white / black / red) + opacity slider — a fixed color will disappear against images of the same tone
- Thin line width by default; grid should aid, not obscure

**Grayscale**
- Slider 0–100%, not a binary toggle — artists check values while still referencing color, so partial desaturation matters
- Use a luminance-weighted formula, not a flat average: `0.2126R + 0.7152G + 0.0722B` (Rec. 709) — a straight average shifts perceived value accuracy
- For live preview, a CSS `filter: grayscale()` on the canvas element is fine and GPU-cheap
- At **export time**, bake the real conversion via `getImageData`/`putImageData` on an off-screen full-resolution canvas — CSS filters don't get captured correctly by naive export code, which is the most common bug in tools like this

**Export**
- Render export from the full-resolution image data, never the downscaled on-screen preview — this is the detail that separates a working tool from a portfolio-embarrassing one
- Toggle: export with gridlines baked in, or clean (some artists want the grid burned in for tracing/printing, others just want the desaturated reference)
- PNG download, sensible filename, brief confirmation on completion

---

## Prompt Chain

### Phase 0 — Foundation

```
Set up a static web project: index.html, styles.css, script.js, no build tools,
no frameworks. Add a basic CSS reset and a dark theme (#0a0a0a background,
off-white text). Set up two page sections as placeholders: a landing/hero
section and an editor section (hidden by default, revealed by a "Start"
button). Get this deploying as a static site — structure it so it works
directly on GitHub Pages with no build step.
```

### Phase 1 — Landing page

```
Build the landing page for a portrait reference tool called [YOUR APP NAME].
Dark, gallery-style aesthetic (#0a0a0a background, off-white text, single
warm accent color used only on hover/interactive states). One bold display
headline, minimal copy — this is a tool for artists, not a SaaS product.

Include:
- A hero section with a headline, one-line description, and a CTA button
  that scrolls to / reveals the editor
- A recurring thin-grid-line visual motif used as a background element or
  section divider (a nod to what the tool actually does)
- A 3-feature showcase section (gridlines / grayscale / export) with a
  short line each, no generic stock icons
- Subtle scroll-reveal animations (CSS or a small animation lib), no
  parallax gimmicks, no gradient-mesh backgrounds
- Fully responsive from mobile to desktop

Don't touch the editor logic yet — this phase is landing page only.
```

### Phase 2 — Editor core: upload + canvas

```
Build the core editor shell. On the editor screen:
- A drop zone + file input for image upload (jpg/png/webp)
- On upload, load the image onto a <canvas>, preserving its original aspect
  ratio exactly — no cropping, no forced square
- Store the full-resolution image data separately from whatever size the
  canvas displays it at on screen, so we can export at full resolution later
  even if the preview is scaled down to fit the viewport
- Basic layout: canvas centered, a sidebar/panel area (empty for now) where
  controls will go in the next phases
- Handle: no image loaded yet (show upload prompt), image loaded (show canvas)
```

### Phase 3 — Gridlines

```
Add a gridline control panel next to the canvas:
- Independent toggles for horizontal, vertical, and diagonal lines
- Diagonal default is a corner-to-corner X
- A density control (2–10 divisions) affecting horizontal/vertical line count
- Line color: preset buttons for white / black / red
- Opacity slider for the grid lines
- Line width: thin by default

Draw the grid as an overlay on top of the image on the canvas, recalculating
whenever any control changes. The grid should scale correctly regardless of
the image's aspect ratio or the canvas's on-screen size.
```

### Phase 4 — Grayscale

```
Add a grayscale slider (0–100%) to the control panel.

For live preview, apply it as a CSS filter on the canvas element (cheap,
GPU-accelerated, updates in real time as the slider moves).

Note for the export phase: at export time this needs to be re-applied via
actual pixel manipulation (getImageData/putImageData) using the luminance
formula 0.2126R + 0.7152G + 0.0722B blended with the original pixel by the
slider percentage — not a CSS filter, which won't get captured by canvas
export. Don't implement export yet, just get the live preview working and
leave a clear function boundary for where the export-time pixel logic
will plug in.
```

### Phase 5 — Export

```
Add an "Export" button that:
- Renders the image at its ORIGINAL full resolution on an off-screen canvas
  (not the downscaled on-screen preview size)
- Bakes in the current grayscale amount via real pixel manipulation
  (getImageData/putImageData, luminance-weighted formula from the previous
  phase), not a CSS filter
- Includes a toggle: "export with grid" vs "export clean" — if grid is on,
  draw the same gridlines onto the full-resolution export canvas at the
  correct proportional scale
- Triggers a PNG download with a sensible filename
- Shows a brief success confirmation (toast or similar) after download
```

### Phase 6 — Polish & deploy

```
Polish pass:
- Full responsiveness check on the editor screen (control panel becomes
  collapsible/bottom-sheet on mobile widths)
- Keyboard shortcuts for common actions (e.g. G to toggle grid, spacebar
  to reset zoom/fit)
- A "reset to default" button for all controls
- Loading/empty states double-checked (no image, image loading, image ready)
- Performance check: large images (4000px+) shouldn't lock up the grayscale
  slider — profile it and downsample the on-screen preview if needed while
  keeping full-res data for export
- Favicon, page title, meta description
- Deploy to GitHub Pages (or Vercel/Netlify) and confirm the live URL works
  end to end: upload → grid → grayscale → export
```

---

## After this

Once it's live, it's a genuinely demoable portfolio piece — not just "I followed a tutorial," but a tool with real interaction design decisions in it (partial grayscale, full-res export separate from preview, sight-size diagonal) you can explain in an interview or a README.




My recommended build order from where you are:

Phase 1 (current) (DONE)
Upload
Canvas
Grid overlay

Phase 2 (DONE)
Better sidebar UI
Grid presets
Grid controls polish
Export system

Phase 3
Grayscale
Brightness/contrast
Zoom + pan

Phase 4
Artist accounts/projects
Save references
Community/gallery features