import { EXPLODE_FACTOR, FOCUS, GROUPS, IMG_H, IMG_W, MEDIA_BASE, MODULE_ID, MODULE_NOTES, ORIGINAL_SRC, STAGE_PAD, manifest, type GroupId, type LayerInfo } from './config';
import { easeInOut, staggered, type ExplodeState } from './state';

type Mode = 'desktop' | 'mobile';

interface Loaded {
  info: LayerInfo;
  img: HTMLImageElement;
  outline: HTMLImageElement;
  delay: number;
}

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

/**
 * Canvas renderer for the photographic exploded view.
 *
 * All drawing happens in ORIGINAL-IMAGE pixel space under one uniform
 * transform. At rest (no separation, no focus) it draws the original
 * photograph itself, so the assembled state is the photo exactly.
 */
export class PhotoExplodeRenderer {
  private ctx: CanvasRenderingContext2D;
  private original: HTMLImageElement | null = null;
  private layers: Loaded[] = [];
  private scale = 1;
  private ox = 0;
  private oy = 0;
  private dpr = 1;
  private mode: Mode = 'desktop';
  ready = false;

  /** Latest callout positions (CSS px), indexed like GROUPS / MODULE_NOTES. */
  groupLabels: LabelPos[] = GROUPS.map(() => ({ x: 0, y: 0, a: 0 }));
  noteLabels: LabelPos[] = MODULE_NOTES.map(() => ({ x: 0, y: 0, a: 0 }));

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: true })!;
  }

  async load() {
    const delays = Object.fromEntries(GROUPS.map((g) => [g.id, g.delay])) as Record<GroupId, number>;
    const [original, ...layers] = await Promise.all([
      loadImage(ORIGINAL_SRC),
      ...manifest.layers.map(async (info) => {
        const [img, outline] = await Promise.all([loadImage(MEDIA_BASE + info.file), loadImage(MEDIA_BASE + info.outline.file)]);
        return { info, img, outline, delay: delays[info.group] ?? 0 } as Loaded;
      }),
    ]);
    this.original = original;
    // Draw the frame first so every other layer sits above it, module last.
    this.layers = layers.sort((a, b) => rank(a.info) - rank(b.info));
    this.ready = true;
  }

  resize(cssW: number, cssH: number, mode: Mode) {
    this.mode = mode;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    const pad = STAGE_PAD[mode];
    if (mode === 'desktop') {
      this.scale = Math.min((cssW * 0.78) / (IMG_W + 2 * pad.x), (cssH * 0.9) / (IMG_H + 2 * pad.y));
      this.ox = cssW * 0.58 - (IMG_W / 2) * this.scale;
      this.oy = cssH * 0.53 - (IMG_H / 2) * this.scale;
    } else {
      this.scale = Math.min((cssW * 0.98) / (IMG_W + 2 * pad.x), (cssH * 0.6) / (IMG_H + 2 * pad.y));
      this.ox = cssW * 0.5 - (IMG_W / 2) * this.scale;
      this.oy = cssH * 0.36 - (IMG_H / 2) * this.scale;
    }
  }

  /** Image px → CSS px. */
  toScreen(x: number, y: number) {
    return { x: this.ox + x * this.scale, y: this.oy + y * this.scale };
  }

  /** Where a layer is drawn for the given state: top-left (image px) and scale. */
  private placement(l: Loaded, s: ExplodeState) {
    const f = EXPLODE_FACTOR[this.mode];
    const k = staggered(s.sep, l.delay);
    let x = l.info.x + l.info.explode[0] * f.x * k;
    let y = l.info.y + l.info.explode[1] * f.y * k;
    let sc = 1;
    if (l.info.id === MODULE_ID && s.focus > 0) {
      const t = easeInOut(s.focus);
      const target = FOCUS[this.mode];
      sc = 1 + (target.scale - 1) * t;
      const cx = x + l.info.w / 2 + (target.cx - (x + l.info.w / 2)) * t;
      const cy = y + l.info.h / 2 + (target.cy - (y + l.info.h / 2)) * t;
      x = cx - (l.info.w / 2) * sc;
      y = cy - (l.info.h / 2) * sc;
    }
    return { x, y, sc };
  }

  draw(s: ExplodeState) {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.ready || !this.original) return;
    const k = this.dpr * this.scale;
    ctx.setTransform(k, 0, 0, k, this.dpr * this.ox, this.dpr * this.oy);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const assembled = s.sep <= 0.0005 && s.focus <= 0.0005;
    const placements = new Map<string, { x: number; y: number; sc: number }>();
    for (const l of this.layers) placements.set(l.info.id, this.placement(l, s));

    if (assembled) {
      // The original photograph, untouched.
      ctx.globalAlpha = 1;
      ctx.drawImage(this.original, 0, 0, IMG_W, IMG_H);
    } else {
      for (const l of this.layers) {
        const p = placements.get(l.info.id)!;
        ctx.globalAlpha = l.info.id === MODULE_ID ? 1 : 1 - 0.8 * s.dim;
        ctx.drawImage(l.img, p.x, p.y, l.info.w * p.sc, l.info.h * p.sc);
      }
    }

    // Component outlines (highlighting) — drawn from the layers' own silhouettes.
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
      ctx.strokeStyle = '#7fb2ff';
      ctx.fillStyle = '#9cc4ff';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * 0.55, by);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, 3.2 / this.scale, 0, Math.PI * 2);
      ctx.fill();
    };

    GROUPS.forEach((g, i) => {
      const l = this.layers.find((x) => x.info.id === g.anchorLayer);
      const out = this.groupLabels[i];
      // labels follow the active highlight only (residual outlines stay unlabelled);
      // on phones the exploded-view label set is reduced to the IroNav module.
      const hlA = clamp((s.hl[g.id] - 0.35) / 0.65);
      const exA = this.mode === 'mobile' && g.id !== 'ironav' ? 0 : s.labels;
      const a = Math.max(hlA, exA) * (1 - s.dim);
      out.a = a;
      if (!l || a <= 0.01) return;
      const p = placements.get(l.info.id)!;
      const ax = p.x + (l.info.anchor[0] - l.info.x) * p.sc;
      const ay = p.y + (l.info.anchor[1] - l.info.y) * p.sc;
      const bx = ax + g.labelOffset[0] * (this.mode === 'mobile' ? 0.6 : 1);
      const by = ay + g.labelOffset[1];
      line(ax, ay, bx, by, a);
      const sp = this.toScreen(bx, by);
      out.x = sp.x;
      out.y = sp.y;
    });

    const mod = this.layers.find((x) => x.info.id === MODULE_ID);
    MODULE_NOTES.forEach((n, i) => {
      const out = this.noteLabels[i];
      out.a = this.mode === 'mobile' ? 0 : s.notes;
      if (!mod || out.a <= 0.01) return;
      const p = placements.get(MODULE_ID)!;
      const ax = p.x + (n.at[0] - mod.info.x) * p.sc;
      const ay = p.y + (n.at[1] - mod.info.y) * p.sc;
      const m = this.mode === 'mobile' ? 0.55 : 1;
      const bx = ax + n.offset[0] * m;
      const by = ay + n.offset[1] * m;
      line(ax, ay, bx, by, s.notes);
      const sp = this.toScreen(bx, by);
      out.x = sp.x;
      out.y = sp.y;
    });
    ctx.globalAlpha = 1;
  }
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function rank(l: LayerInfo) {
  if (l.group === 'frame') return 0;
  if (l.group === 'ironav') return 3;
  if (l.group === 'propellers') return 2;
  return 1;
}
