# Globaz Technologies — IroNav website

Premium aerospace website for Globaz Technologies featuring a scroll-controlled,
image-based exploded view of the **original IroNav product photograph**.

**Stack:** Vite · React 19 · TypeScript · GSAP ScrollTrigger · Canvas 2D · Lenis

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build in dist/
```

## Content sources

All product statements live in `src/content/site.ts` and are taken from the Globaz
IroNav and homepage wireframes (comdez.co.uk/globaz-wireframes). No performance
figures, specifications, certifications or compatibility claims are made.

* **Brahmastra:** no approved brand material was supplied, so the section makes no
  product claims. Add copy, points and an image in `brahmastra` in `site.ts`.
* **Product photo:** `public/media/ironav-original.png` is a byte-identical copy of the
  supplied IMG_5771.png (SHA-256 `d9518ea4…`). It is the hero image and the source of
  every exploded-view layer.

## The photographic exploded view

The product photograph (`public/media/ironav-original.png`) is the single source of
truth. No 3D model, generated image or redrawn product appears anywhere on the site.

```
scripts/segment_layers.py   hand-measured polygon masks (+ a copper-colour filter for RF
                            cabling) → aligned component layers + manifest; verifies the
                            layers re-composite to the original bit-for-bit
src/exploded/config.ts      component groups, callout copy, explode scaling, IroNav focus
src/exploded/timeline.ts    GSAP master timeline (scrubbed by ScrollTrigger) — 5 stages
src/exploded/renderer.ts    canvas renderer; draws everything in original-image pixels
```

Stages: original photograph → component highlighting → separation → IroNav module focus
→ reassembly. When nothing is displaced the renderer draws the original photograph
itself, so the opening and closing frames are the photo exactly (validated in-browser:
0 differing pixels after scrolling down and back up).

**Isolated layers (23):** 5 propeller layers, 6 motor assemblies (upper/lower, with
X-plate mounts and clamp blocks), 3 carbon-fibre arms, 2 landing-gear assemblies, the
upper electronic enclosure (with antennas), 4 cable/connector layers (helical antenna &
RF lead, left RF lead & connector, copper coil antenna, shielded black cable), the IroNav
module, and the central frame (everything not separable). Areas hidden behind a
component in the photograph are not recreated, so a moved component leaves an empty
area, by design.

To refine a mask, edit the polygons in `scripts/segment_layers.py` and run
`python3 scripts/segment_layers.py --review review.png` (requires Pillow).

## Performance & accessibility

* Layers (~1 MB total, lossless WebP) load only as the section approaches; the canvas
  renders only while on screen.
* Phones: separation runs mostly vertically so layers never clip; callouts are reduced.
* `prefers-reduced-motion`: no pinning; the stages become step buttons.
* If the layers fail to load, the original photograph is shown.
