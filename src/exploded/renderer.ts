import { EXPLODE_FACTOR, FOCUS, GROUPS, IMG_H, IMG_W, LAYOUT, MEDIA_BASE, MODULE_ID, MODULE_NOTES, ORIGINAL_SRC, manifest, type GroupId, type LayerInfo, type Mode } from './config';
import { easeInOut, isAssembled, type ExplodeState } from './state';

interface Loaded {
  info: LayerInfo;
  img: HTMLImageElement;
  outline: HTMLImageElement;
  delay: number;
  depth: number;
  /** Pre-rendered depth effects (desktop only, loaded after the layers). */
  blur?: HTMLImageElement;
  shadow?: HTMLImageElement;
}

/** Padding of the pre-rendered effect sprites (scripts/build_media.py FX_PAD). */
const FX_PAD = 24;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().then(() => resolve(img), () => resolve(img)) : resolve(img));
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });

/** A point in CSS pixels plus its opacity, for DOM callout labels. */
export interface LabelPos {
  x: number;
  y: number;
  a: number;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Canvas renderer for the photographic exploded view.
 *
 * Everything is drawn in ORIGINAL-IMAGE pixel space under one uniform camera
 * transform. At rest (no separation, focus, dimming or light sweep) it draws
 * the original photograph itself, so the assembled state is the photo exactly.
 */
export class PhotoExplodeRenderer {
  private ctx: CanvasRenderingContext2D;
  original: HTMLImageElement | null = null;
  private layers: Loaded[] = [];
  private cssW = 1;
  private cssH = 1;
  private fitScale = 1;
  /** Current transform (exposed for verification). */
  scale = 1;
  ox = 0;
  oy = 0;
  dpr = 1;
  private mode: Mode = 'desktop';
  ready = false;

  groupLabels: LabelPos[] = GROUPS.map(() => ({ x: 0, y: 0, a: 0 }));
  noteLabels: LabelPos[] = MODULE_NOTES.map(() => ({ x: 0, y: 0, a: 0 }));
  /** CSS-space position/scale of the camera, for background parallax. */
  view = { x: 0, y: 0, s: 1 };

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: true })!;
  }

  async load() {
    const meta = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<GroupId, (typeof GROUPS)[number]>;
    const [original, ...layers] = await Promise.all([
      loadImage(ORIGINAL_SRC),
      ...manifest.layers.map(async (info) => {
        const [img, outline] = await Promise.all([loadImage(MEDIA_BASE + info.file), loadImage(MEDIA_BASE + info.outline.file)]);
        return { info, img, outline, delay: meta[info.group]?.delay ?? 0, depth: meta[info.group]?.depth ?? 0 } as Loaded;
      }),
    ]);
    this.original = original;
    this.layers = layers.sort((a, b) => rank(a.info) - rank(b.info));
    this.ready = true;
  }

  /** Loads the defocus / shadow sprites. Optional: the view works without them. */
  async loadEffects() {
    await Promise.all(
      this.layers.map(async (l) => {
        try {
          const [blur, shadow] = await Promise.all([loadImage(`${MEDIA_BASE}fx/${l.info.id}-blur.webp`), loadImage(`${MEDIA_BASE}fx/${l.info.id}-shadow.webp`)]);
          l.blur = blur;
          l.shadow = shadow;
        } catch {
          /* effects are progressive enhancement */
        }
      }),
    );
  }

  resize(cssW: number, cssH: number, mode: Mode) {
    this.mode = mode;
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    const L = LAYOUT[mode];
    this.fitScale = Math.min((cssW * L.fit) / IMG_W, (cssH * L.fitH) / IMG_H);
  }

  /** Image px → CSS px under the current camera. */
  toScreen(x: number, y: number) {
    return { x: this.ox + x * this.scale, y: this.oy + y * this.scale };
  }

  private placement(l: Loaded, s: ExplodeState) {
    const f = EXPLODE_FACTOR[this.mode];
    // per-layer progress, already eased by its own GSAP tween
    const k = s.p[l.info.id] ?? 0;
    const ds = 1 + l.depth * k;
    const w = l.info.w * ds;
    const h = l.info.h * ds;
    let cx = l.info.x + l.info.w / 2 + l.info.explode[0] * f.x * k;
    let cy = l.info.y + l.info.h / 2 + l.info.explode[1] * f.y * k;
    let sc = ds;
    if (l.info.id === MODULE_ID && s.focus > 0) {
      const t = easeInOut(s.focus);
      const target = FOCUS[this.mode];
      sc = ds + (target.scale - ds) * t;
      cx += (target.cx - cx) * t;
      cy += (target.cy - cy) * t;
      return { x: cx - (l.info.w * sc) / 2, y: cy - (l.info.h * sc) / 2, sc, k };
    }
    return { x: cx - w / 2, y: cy - h / 2, sc, k };
  }

  draw(s: ExplodeState) {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.ready || !this.original) return;

    const L = LAYOUT[this.mode];
    this.scale = Math.min(this.fitScale * s.cam.z, L.maxCssPerPx);
    this.ox = this.cssW * L.anchor[0] - s.cam.x * this.scale;
    this.oy = this.cssH * L.anchor[1] - s.cam.y * this.scale;
    this.view = { x: this.ox + (IMG_W / 2) * this.scale, y: this.oy + (IMG_H / 2) * this.scale, s: this.scale / this.fitScale };
    const k = this.dpr * this.scale;
    ctx.setTransform(k, 0, 0, k, this.dpr * this.ox, this.dpr * this.oy);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const desktop = this.mode === 'desktop';

    const placements = new Map<string, ReturnType<PhotoExplodeRenderer['placement']>>();
    for (const l of this.layers) placements.set(l.info.id, this.placement(l, s));
    const mod = this.layers.find((x) => x.info.id === MODULE_ID);

    // Soft key light behind the module while it is in focus.
    if (s.focus > 0.01 && mod) {
      const p = placements.get(MODULE_ID)!;
      const cx = p.x + (mod.info.w * p.sc) / 2;
      const cy = p.y + (mod.info.h * p.sc) / 2;
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 420);
      g.addColorStop(0, `rgba(242,169,59,${0.16 * s.focus})`);
      g.addColorStop(0.45, `rgba(111,143,240,${0.07 * s.focus})`);
      g.addColorStop(1, 'rgba(111,143,240,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(cx - 440, cy - 440, 880, 880);
    }

    const assembled = isAssembled(s);
    if (assembled) {
      // The original photograph, untouched.
      ctx.globalAlpha = 1;
      ctx.drawImage(this.original, 0, 0, IMG_W, IMG_H);
    } else {
      for (const l of this.layers) {
        const p = placements.get(l.info.id)!;
        const isMod = l.info.id === MODULE_ID;
        const a = isMod ? 1 : 1 - 0.78 * s.dim;
        const w = l.info.w * p.sc;
        const h = l.info.h * p.sc;
        const pad = FX_PAD * p.sc;
        // depth cue: a soft contact shadow, from the layer's own silhouette
        if (desktop && l.shadow && p.k > 0.02 && l.info.group !== 'frame') {
          ctx.globalAlpha = a * 0.7 * p.k;
          ctx.drawImage(l.shadow, p.x - pad, p.y - pad + 16 * p.k, w + 2 * pad, h + 2 * pad);
        }
        // depth of field: everything except the module defocuses while it is in focus
        const dof = desktop && l.blur && !isMod ? s.dim : 0;
        if (dof < 0.999) {
          ctx.globalAlpha = a * (1 - dof);
          ctx.drawImage(l.img, p.x, p.y, w, h);
        }
        if (dof > 0.001) {
          ctx.globalAlpha = a * dof;
          ctx.drawImage(l.blur!, p.x - pad, p.y - pad, w + 2 * pad, h + 2 * pad);
        }
      }
    }

    // Specular light sweep, clipped to the aircraft's own pixels.
    if (s.sweepA > 0.01) {
      const x = -200 + s.sweep * (IMG_W + 400);
      const g = ctx.createLinearGradient(x - 120, 0, x + 120, 60);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(255,246,232,${0.2 * s.sweepA})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(-300, -300, IMG_W + 600, IMG_H + 600);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Component outlines — drawn from each layer's own silhouette.
    for (const l of this.layers) {
      let a = s.hl[l.info.group];
      if (l.info.id === MODULE_ID) a = Math.max(a, s.focus * 0.85);
      else a *= 1 - s.dim;
      if (a <= 0.01) continue;
      const p = placements.get(l.info.id)!;
      ctx.globalAlpha = a;
      const o = l.info.outline;
      ctx.drawImage(l.outline, p.x + (o.x - l.info.x) * p.sc, p.y + (o.y - l.info.y) * p.sc, o.w * p.sc, o.h * p.sc);
    }

    // Callout leader lines.
    ctx.lineWidth = 1 / this.scale;
    const line = (ax: number, ay: number, bx: number, by: number, a: number) => {
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#9fb6ff';
      ctx.fillStyle = '#f2a93b';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * 0.55, by);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, 3.4 / this.scale, 0, Math.PI * 2);
      ctx.fill();
    };

    GROUPS.forEach((g, i) => {
      const l = this.layers.find((x) => x.info.id === g.anchorLayer);
      const out = this.groupLabels[i];
      const a = clamp(s.lab[g.id]) * (1 - s.dim);
      out.a = a;
      if (!l || a <= 0.01) return;
      const p = placements.get(l.info.id)!;
      const ax = p.x + (l.info.anchor[0] - l.info.x) * p.sc;
      const ay = p.y + (l.info.anchor[1] - l.info.y) * p.sc;
      const bx = ax + g.labelOffset[0] * (desktop ? 1 : 0.55);
      const by = ay + g.labelOffset[1] * (desktop ? 1 : 0.8);
      line(ax, ay, bx, by, a);
      const sp = this.toScreen(bx, by);
      out.x = sp.x;
      out.y = sp.y;
    });

    MODULE_NOTES.forEach((n, i) => {
      const out = this.noteLabels[i];
      out.a = desktop ? s.notes : 0;
      if (!mod || out.a <= 0.01) return;
      const p = placements.get(MODULE_ID)!;
      const ax = p.x + (n.at[0] - mod.info.x) * p.sc;
      const ay = p.y + (n.at[1] - mod.info.y) * p.sc;
      const bx = ax + n.offset[0];
      const by = ay + n.offset[1];
      line(ax, ay, bx, by, out.a);
      const sp = this.toScreen(bx, by);
      out.x = sp.x;
      out.y = sp.y;
    });
    ctx.globalAlpha = 1;
  }
}

function rank(l: LayerInfo) {
  if (l.group === 'frame') return 0;
  if (l.group === 'ironav') return 3;
  if (l.group === 'propellers') return 2;
  return 1;
}
