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
* **Product photo:** the client reference image is `public/media/IMG_5771.png`
  (transparent background). The hero and the "Understanding IroNav" gallery use it
  automatically; if removed, the hero falls back to the live 3D model.

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

The model is a conceptual procedural approximation of the reference photograph:
a coaxial X8 (four carbon arms, upper and lower motor/propeller per arm, X-pattern
mount plates with aluminium blocks), stacked-plate frame, strapped power enclosure,
antennas, and the IroNav module with its white chevron name panel, side bracket,
gold RF connectors and copper coax. Third-party branding visible in the photo is
intentionally not reproduced. `/?render=reference` renders the model from roughly
the photo's camera angle for side-by-side comparison. To swap in production assets, load the GLB
(e.g. with `useGLTF`) and mount each node inside the matching `<ExplodeGroup part="…">`
in `DroneAssembly3D.tsx` in place of the procedural part. Explode paths, timeline,
annotations (by anchor name) and camera poses keep working unchanged. Dimensions, coaxial layout and `explodeConfig` live in `droneConfig.ts`.

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
