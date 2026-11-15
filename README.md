# IroNav — product landing page (Globaz Technologies)

A single-product page for **IroNav** — visual navigation and GNSS interference protection,
developed by infiniDome for uncrewed aircraft — with Globaz Technologies as the India
contact for integration enquiries, platform evaluation and support.

Live: https://globaz-ironav.vercel.app

**Stack:** Vite · React 19 · TypeScript · GSAP ScrollTrigger · Canvas 2D · Lenis

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build in dist/
```

## Page architecture

| # | Chapter | Composition |
|---|---------|-------------|
| — | Hero | Editorial headline over the original photograph; light sheen, float, ticker |
| 01 | Overview | Statement + line trace of the photo with only the module in colour |
| 02 | Anatomy | Pinned, scroll-scrubbed exploded view with a virtual camera (six stages) |
| 03 | Motion | Reel of motion studies rendered from the photograph |
| 04 | Technology | Sticky headline + three illustrated principles |
| 05 | Integration | Navy chapter; three considerations, each with its own view of the aircraft |
| 06 | Evidence | Off-white specification-sheet list of technical resources |
| 07 | Enquiry | Three enquiry paths, email, Globaz contact page |

Copy lives in `src/content/ironav.ts`. It uses only the verified positioning from the Globaz
IroNav wireframe; no performance figures, specifications, certifications, compatibility
claims, documents or customer references.

## Design system — "Instrument"

Graphite / black and warm off-white; Globaz night navy (`#030f35`) for the integration
chapter; Globaz amber (`#f2a93b`) as the single signal colour; technical blue for
annotation. Archivo (variable width) for display, Inter Tight for text, JetBrains Mono for
technical labels. Desktop and mobile have separate compositions (hero product bleed,
camera path in the anatomy, stacked editorial chapters).

## The photographic exploded view

```
scripts/segment_layers.py   polygon masks (+ copper filter) → 23 aligned layers + manifest;
                            verifies the layers re-composite to the original bit-for-bit
scripts/build_media.py      line trace, module crop, motion-study clips, desktop depth sprites
src/exploded/config.ts      groups, callouts, camera keyframes, layout per device
src/exploded/timeline.ts    GSAP master timeline (scrubbed) — six stages
src/exploded/renderer.ts    canvas renderer in original-image pixel space
```

Stages: original photograph → component highlighting (with a light sweep) → controlled
separation → fully exploded → IroNav module focus (depth of field on everything else) →
reassembly. The camera's last keyframe equals its first and, at rest, the renderer draws
the original photograph itself — verified in the browser as **0 differing pixels** after
scrolling down and back up (append `?verify` to the URL to expose the read-only state).

## Motion studies and the film slot

No authorised IroNav footage exists, so the reel uses short loops rendered from the
photograph (an approach to the module, a scan between photo and line trace, a layer
separation study). An authorised film can lead the reel: see `public/media/README.md`.

## Resolution note

The original photograph is 1161 × 558 px. On high-density screens it is displayed at up to
~2.5 device pixels per image pixel, and camera zoom is capped (`LAYOUT.maxCssPerPx`) to
avoid visible softness. A higher-resolution original (≥ 3000 px wide) would allow larger
crops and closer camera moves; re-run both scripts after replacing it.

## Performance & accessibility

* Layers (~1 MB) load as the anatomy approaches; desktop-only depth sprites load after.
* Clips load near the viewport and play only while visible; posters otherwise.
* `prefers-reduced-motion`: no pinning or loops; stages become step buttons, posters shown.
* No horizontal scroll at any width; keyboard-accessible tabs and stage controls.
