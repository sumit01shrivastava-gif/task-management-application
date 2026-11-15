"""
Splits the original product photograph into aligned component layers.

Method: hand-authored polygons (measured on a pixel grid over the photo) are
assigned in priority order, so every opaque pixel of the original belongs to
exactly ONE layer. Layers therefore re-composite to the original bit-for-bit.
Nothing is painted, generated or in-filled: hidden areas behind a component
stay empty when it moves.

Usage:  python3 scripts/segment_layers.py [--review out.png]
Input:  public/media/ironav-original.png   (never modified)
Output: public/media/ironav-layers/<id>.webp (+ <id>-outline.webp), manifest.json
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/media/ironav-original.png')
OUT = os.path.join(ROOT, 'public/media/ironav-layers')

def band(points, r):
    """Thick polyline → polygon list (for thin cables)."""
    return [('line', points, r)]

# (id, group, label, shapes) — FIRST MATCH WINS (priority order).
# shapes: list of polygons [(x,y),...] or ('line', pts, halfwidth) or ('rect', x0,y0,x1,y1)
LAYERS = [
    # ── cables & connectors (thin, highest priority) ──────────────────────
    ('cable-helix', 'cables', 'Helical antenna & RF lead', ['copper',
        ('rect', 414, 424, 488, 500),
        ('line', [(470, 449), (520, 421), (560, 399), (602, 377)], 7),
    ]),
    ('cable-lead-left', 'cables', 'RF lead & connector', ['copper',
        ('line', [(252, 246), (243, 262), (238, 290), (236, 330), (235, 372)], 8),
        ('rect', 225, 368, 246, 416),
    ]),
    ('cable-top-antenna', 'cables', 'Copper coil antenna', ['copper',
        ('rect', 474, 146, 532, 236),
    ]),
    ('cable-black', 'cables', 'Shielded cable', [
        [(668, 343), (720, 348), (770, 368), (808, 392), (836, 425), (850, 458), (828, 468), (808, 436), (782, 408), (748, 390), (700, 382), (668, 380)],
    ]),
    # ── IroNav module ─────────────────────────────────────────────────────
    ('ironav-module', 'ironav', 'IroNav module', [
        [(452, 288), (560, 280), (640, 280), (672, 290), (672, 432), (600, 438), (470, 436), (452, 420)],
    ]),
    # ── motor assemblies (incl. X-plate mounts & clamp blocks) ────────────
    ('motor-front-left-upper', 'motors', 'Motor assembly', [[(140, 104), (242, 104), (242, 268), (126, 268), (126, 194), (140, 194)]]),
    ('motor-front-left-lower', 'motors', 'Motor assembly', [[(136, 268), (242, 268), (242, 336), (216, 362), (160, 362), (136, 336)]]),
    ('motor-front-right-upper', 'motors', 'Motor assembly', [[(884, 14), (1003, 14), (1003, 233), (878, 233), (868, 150), (884, 120)]]),
    ('motor-front-right-lower', 'motors', 'Motor assembly', [[(884, 233), (1003, 233), (1003, 330), (966, 342), (924, 342), (884, 322)]]),
    ('motor-rear-right-upper', 'motors', 'Motor assembly', [[(1034, 156), (1122, 156), (1122, 236), (1137, 236), (1137, 300), (1003, 300), (1003, 236), (1034, 236)]]),
    ('motor-rear-right-lower', 'motors', 'Motor assembly', [[(1038, 300), (1124, 300), (1124, 380), (1038, 380)]]),
    # ── landing gear ──────────────────────────────────────────────────────
    ('gear-left', 'gear', 'Landing gear', [
        [(412, 296), (450, 296), (440, 340), (418, 410), (398, 480), (392, 516), (344, 516), (352, 500), (372, 460), (395, 380)],
        ('rect', 176, 490, 524, 557),
    ]),
    ('gear-right', 'gear', 'Landing gear', [
        [(788, 286), (834, 286), (862, 358), (886, 410), (924, 460), (928, 514), (866, 514), (860, 470), (838, 412), (810, 352)],
        ('rect', 740, 490, 1034, 557),
    ]),
    # ── upper electronic enclosure (boxes + vertical antennas) ────────────
    ('electronics', 'electronics', 'Upper electronic enclosure', [
        [(456, 56), (490, 56), (490, 78), (742, 78), (744, 60), (770, 60), (770, 176), (744, 176), (742, 190), (488, 196), (456, 202)],
    ]),
    # ── carbon-fibre arms ─────────────────────────────────────────────────
    ('arm-front-left', 'arms', 'Carbon-fibre arm', [('rect', 242, 210, 428, 270)]),
    ('arm-front-right', 'arms', 'Carbon-fibre arm', [[(712, 184), (760, 170), (868, 146), (884, 150), (884, 224), (800, 232), (726, 248), (712, 246)]]),
    ('arm-rear-right', 'arms', 'Carbon-fibre arm', [('rect', 836, 240, 884, 296)]),
    # ── propellers (broad regions; everything above already claimed) ──────
    ('prop-front-left-upper', 'propellers', 'Propeller', [('rect', 0, 88, 300, 162), [(240, 104), (300, 60), (412, 60), (412, 112), (300, 112)]]),
    ('prop-front-left-lower', 'propellers', 'Propeller', [('rect', 0, 312, 398, 392)]),
    ('prop-front-right-upper', 'propellers', 'Propeller', [('rect', 600, 0, 1161, 72)]),
    ('prop-rear-right-upper', 'propellers', 'Propeller', [('rect', 990, 140, 1161, 212)]),
    ('prop-rear-right-lower', 'propellers', 'Propeller', [('rect', 840, 336, 1161, 400)]),
    # everything left over → central frame
]
FRAME = ('frame', 'frame', 'Central carbon-fibre frame')

# Exploded-view direction for each layer, in original-image pixels.
EXPLODE = {
    'prop-front-left-upper': (-150, -95), 'prop-front-left-lower': (-150, 85), 'prop-front-right-upper': (95, -120),
    'prop-rear-right-upper': (170, -70), 'prop-rear-right-lower': (170, 85),
    'motor-front-left-upper': (-95, -45), 'motor-front-left-lower': (-95, 45), 'motor-front-right-upper': (70, -65),
    'motor-front-right-lower': (70, 50), 'motor-rear-right-upper': (125, -25), 'motor-rear-right-lower': (125, 50),
    'arm-front-left': (-48, 0), 'arm-front-right': (40, -22), 'arm-rear-right': (55, 8),
    'electronics': (0, -95),
    'gear-left': (-40, 85), 'gear-right': (40, 85),
    'cable-helix': (-95, 55), 'cable-lead-left': (-70, 30), 'cable-top-antenna': (-40, -75), 'cable-black': (80, 55),
    'ironav-module': (0, 70),
    'frame': (0, 0),
}

def copper_mask(src):
    """Pixels whose colour reads as copper / gold (cables, SMA connectors, antennas)."""
    r, g, b, a = src.split()
    rp, gp, bp = r.load(), g.load(), b.load()
    W, H = src.size
    m = Image.new('L', (W, H), 0); mp = m.load()
    for y in range(H):
        for x in range(W):
            R, G, B = rp[x, y], gp[x, y], bp[x, y]
            if R > 85 and R - B > 38 and R >= G:
                mp[x, y] = 255
    return m.filter(ImageFilter.MaxFilter(3))   # keep anti-aliased edges with the cable

def mask_for(shapes, size, copper=None):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    use_copper = bool(shapes) and shapes[0] == 'copper'
    if use_copper:
        shapes = shapes[1:]
    for s in shapes:
        if isinstance(s, tuple) and s[0] == 'rect':
            d.rectangle(s[1:], fill=255)
        elif isinstance(s, tuple) and s[0] == 'line':
            pts, r = s[1], s[2]
            d.line(pts, fill=255, width=r * 2, joint='curve')
            for p in pts:
                d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=255)
        else:
            d.polygon(s, fill=255)
    if use_copper:
        m = ImageChops.multiply(m, copper)
    return m

def main():
    src = Image.open(SRC).convert('RGBA')
    W, H = src.size
    os.makedirs(OUT, exist_ok=True)
    alpha = src.split()[3]
    claimed = Image.new('L', (W, H), 0)
    entries = []
    masks = []
    copper = copper_mask(src)
    # Near-transparent haze in the cut-out (alpha < 16) stays with the stationary
    # frame layer, so moving components carry only their own visible pixels.
    solid = alpha.point(lambda v: 255 if v >= 16 else 0)
    for lid, group, label, shapes in LAYERS:
        m = ImageChops.multiply(mask_for(shapes, (W, H), copper), solid)
        m = ImageChops.subtract(m, claimed)            # first match wins
        claimed = ImageChops.lighter(claimed, m)
        masks.append((lid, group, label, m))
    masks.append((FRAME[0], FRAME[1], FRAME[2], ImageChops.invert(claimed)))

    total = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for lid, group, label, m in masks:
        a = ImageChops.multiply(alpha, m)              # original alpha × binary mask
        layer = src.copy(); layer.putalpha(a)
        bbox = a.getbbox()
        if not bbox:
            continue
        x0, y0, x1, y1 = bbox
        crop = layer.crop(bbox)
        crop.save(os.path.join(OUT, f'{lid}.webp'), lossless=True, quality=100, method=6, exact=True)
        # outline: dilated silhouette minus silhouette, blurred — used for highlighting only
        pad = 8
        sil = Image.new('L', (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), 0)
        sil.paste(a.crop(bbox).point(lambda v: 255 if v > 40 else 0), (pad, pad))
        ring = ImageChops.subtract(sil.filter(ImageFilter.MaxFilter(5)), sil).filter(ImageFilter.GaussianBlur(1.2))
        glow = Image.new('RGBA', sil.size, (110, 170, 255, 0)); glow.putalpha(ring)
        glow.save(os.path.join(OUT, f'{lid}-outline.webp'), lossless=True, method=6)
        # anchor for callouts: centre of mass of the layer
        px = a.crop(bbox).load(); sx = sy = n = 0
        for yy in range(0, y1 - y0, 2):
            for xx in range(0, x1 - x0, 2):
                if px[xx, yy] > 128: sx += xx; sy += yy; n += 1
        ax, ay = (x0 + sx / n, y0 + sy / n) if n else ((x0 + x1) / 2, (y0 + y1) / 2)
        ex, ey = EXPLODE.get(lid, (0, 0))
        entries.append({'id': lid, 'group': group, 'label': label, 'file': f'{lid}.webp', 'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0,
                        'outline': {'file': f'{lid}-outline.webp', 'x': x0 - pad, 'y': y0 - pad, 'w': x1 - x0 + 2 * pad, 'h': y1 - y0 + 2 * pad},
                        'anchor': [round(ax, 1), round(ay, 1)], 'explode': [ex, ey]})
        total.alpha_composite(crop, (x0, y0))

    # Verification: re-composite must equal the original exactly.
    diff = ImageChops.difference(total, src).getbbox()
    print('re-composite identical to original:', diff is None)
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump({'source': 'ironav-original.png', 'width': W, 'height': H, 'layers': entries}, f, indent=1)

    if '--review' in sys.argv:
        out = sys.argv[sys.argv.index('--review') + 1]
        colors = {'propellers': (255, 80, 80), 'motors': (255, 200, 0), 'arms': (60, 220, 120), 'frame': (150, 150, 150),
                  'gear': (80, 160, 255), 'ironav': (255, 0, 255), 'cables': (0, 255, 255), 'electronics': (255, 140, 40)}
        bg = Image.new('RGBA', (W, H), (40, 40, 48, 255)); bg.alpha_composite(src)
        tint = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        for lid, group, label, m in masks:
            c = Image.new('RGBA', (W, H), colors[group] + (0,)); c.putalpha(ImageChops.multiply(ImageChops.multiply(alpha, m), Image.new('L', (W, H), 110)))
            tint.alpha_composite(c)
        bg.alpha_composite(tint)
        d = ImageDraw.Draw(bg)
        for e in entries:
            d.text((e['anchor'][0] - 20, e['anchor'][1]), e['id'].replace('motor-', 'm-').replace('prop-', 'p-'), fill=(255, 255, 255))
        bg.convert('RGB').resize((W * 2, H * 2)).save(out)

if __name__ == '__main__':
    main()
