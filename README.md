# Globaz Technologies — IroNav immersive experience

Concept demo of a premium aerospace website for Globaz Technologies with a
scroll-controlled, real-time 3D disassembly of an IroNav-integrated multirotor.

**Stack:** Vite · React 19 · TypeScript · Three.js · React Three Fiber · Drei · GSAP ScrollTrigger · Lenis

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
* **Product photo:** drop the client image at `public/media/IMG_5771.png`. The hero
  and the "Understanding IroNav" gallery pick it up automatically. Without it, the
  hero shows the live 3D model.

## The 3D experience

```
src/three/
  config/droneConfig.ts   airframe dimensions, arm count, explode paths, IroNav focus pose
  config/timeline.ts      stage timings, camera poses, GSAP master timeline
  rig/rig.ts              scalar animation channels (GSAP writes, R3F reads, no React renders)
  parts/*                 independent procedural assemblies (frame, arms, motors, props,
                          landing gear, battery, upper equipment, cables, IroNav module)
  scene/*                 explode registry, assembly guide lines, annotations, stage/lighting
  DroneAssembly3D.tsx     composes the parts and applies the rig every frame
  ExperienceCanvas.tsx    lazy-loaded canvas shared by the hero and the pinned section
```

Six scrubbed stages: reveal → rotation (front/side/rear/top) → exploded view →
IroNav reveal → conceptual internals (clearly labelled illustrative) → reassembly.
Scrolling up reverses everything exactly.

### Replacing the conceptual model with CAD/GLB assets

The model is a conceptual procedural approximation built from the written
description of the reference aircraft. To swap in production assets, load the GLB
(e.g. with `useGLTF`) and mount each node inside the matching `<ExplodeGroup part="…">`
in `DroneAssembly3D.tsx` in place of the procedural part. Explode paths, timeline,
annotations (by anchor name) and camera poses keep working unchanged. To match the
reference airframe, adjust `armCount`, dimensions and `explodeConfig` in `droneConfig.ts`.

### Still renders

`/?render=assembled|exploded|module` renders a transparent still of the model. These
were captured into `public/media/render-*.png`, used for supporting imagery and as
the no-WebGL fallback.

## Performance & accessibility

* three.js is code-split and only loads as the 3D section approaches; canvases stop
  rendering when off-screen.
* Quality tiers (desktop / tablet / phone): pixel ratio, geometry detail, shadows and
  annotation density scale down automatically.
* GPU resources are disposed on unmount.
* `prefers-reduced-motion`: no pinning or idle motion; the stages become step buttons.
* WebGL unavailable: static renders replace the canvas.
