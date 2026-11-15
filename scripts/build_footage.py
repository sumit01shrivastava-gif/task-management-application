"""
Builds the two environmental video sequences from LICENSED aerial footage.

Sources (Wikimedia Commons, downloaded as the 1080p VP9 derivatives):
  • "The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video"
    — Third Coast Drone, CC BY 3.0
    https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm
  • "Cape Neddick Nubble Lighthouse - York, Maine 4k Drone flight - DJI Air2S"
    — Dave Halter, CC BY 3.0
    https://commons.wikimedia.org/wiki/File:Cape_Neddick_Nubble_Lighthouse_-_York,_Maine_4k_Drone_flight_-_DJI_Air2S.webm

Changes made (as CC BY requires us to indicate): trimmed, re-sequenced, digitally
reframed (crop windows within the original frame — never upscaled), colour-graded,
and overlaid with illustrative graphics. The overlays are graphics only: the
tracked boxes and reference points are computed from the footage itself with
template matching / optical flow; nothing is generated.

Usage: python3 scripts/build_footage.py <dir-with-source-webms> [vehicle] [building]
Output: public/media/footage/{vehicle,building}-{desktop,mobile}.{mp4,webm} + posters
"""
import os, subprocess, sys, json, math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/media/footage')
FPS = 30
BLUE = (159, 182, 255)
AMBER = (242, 169, 59)
INK = (236, 235, 230)
MONO = os.path.join(ROOT, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')


def font(px):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', '/usr/share/fonts/dejavu/DejaVuSansMono.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, px)
    return ImageFont.load_default()


def read_frames(path, t0, t1, fps=FPS):
    """Decode [t0, t1) at a fixed frame rate as RGB uint8 arrays."""
    cmd = ['ffmpeg', '-loglevel', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', path,
           '-vf', f'fps={fps}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path],
                           capture_output=True, text=True).stdout.strip().split(',')
    w, h = int(probe[0]), int(probe[1])
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw, np.uint8)[: n * w * h * 3].reshape(n, h, w, 3)


def track(frames, box, search=90, scales=(0.96, 1.0, 1.04)):
    """Template-matching tracker with a local search window and scale search.
    Returns one (x, y, w, h) per frame."""
    x, y, w, h = box
    gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in frames]
    tpl = gray[0][y:y + h, x:x + w].astype(np.float32)
    out = [(x, y, w, h)]
    H, W = gray[0].shape
    for g in gray[1:]:
        best = None
        for s in scales:
            tw, th = max(12, int(w * s)), max(12, int(h * s))
            t = cv2.resize(tpl, (tw, th))
            sx0, sy0 = max(0, x - search), max(0, y - search)
            sx1, sy1 = min(W, x + w + search), min(H, y + h + search)
            region = g[sy0:sy1, sx0:sx1].astype(np.float32)
            if region.shape[0] < th or region.shape[1] < tw:
                continue
            r = cv2.matchTemplate(region, t, cv2.TM_CCOEFF_NORMED)
            _, mv, _, ml = cv2.minMaxLoc(r)
            if best is None or mv > best[0]:
                best = (mv, sx0 + ml[0], sy0 + ml[1], tw, th)
        _, x, y, w, h = best
        x, y = int(np.clip(x, 0, W - w)), int(np.clip(y, 0, H - h))
        # slow template refresh keeps lock as the vehicle's appearance changes
        cur = g[y:y + h, x:x + w].astype(np.float32)
        tpl = cv2.resize(tpl, (w, h)) * 0.85 + cur * 0.15
        out.append((x, y, w, h))
    return out


def track_flow(frames, box):
    """Optical-flow box tracker: follows corner features inside the box with
    pyramidal Lucas-Kanade; the box moves by their median motion and scales by the
    median change in their spread. Robust to the fast scale changes of aerial moves."""
    x, y, w, h = map(float, box)
    gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in frames]
    def seed(g, x, y, w, h):
        m = np.zeros_like(g)
        m[int(max(0, y)):int(y + h), int(max(0, x)):int(x + w)] = 255
        p = cv2.goodFeaturesToTrack(g, maxCorners=120, qualityLevel=0.01, minDistance=5, mask=m)
        return p.reshape(-1, 2).astype(np.float32) if p is not None else np.zeros((0, 2), np.float32)
    pts = seed(gray[0], x, y, w, h)
    out = [(x, y, w, h)]
    for i in range(1, len(gray)):
        if len(pts) < 8:
            pts = seed(gray[i - 1], x, y, w, h)
        nxt, st, _ = cv2.calcOpticalFlowPyrLK(gray[i - 1], gray[i], pts.reshape(-1, 1, 2), None, winSize=(25, 25), maxLevel=4)
        back, st2, _ = cv2.calcOpticalFlowPyrLK(gray[i], gray[i - 1], nxt, None, winSize=(25, 25), maxLevel=4)
        nxt = nxt.reshape(-1, 2)
        ok = (st.reshape(-1) == 1) & (st2.reshape(-1) == 1) & (np.linalg.norm(back.reshape(-1, 2) - pts, axis=1) < 1.0)
        a, b = pts[ok], nxt[ok]
        if len(a) >= 4:
            ca, cb = np.median(a, 0), np.median(b, 0)
            da, db = np.linalg.norm(a - ca, axis=1), np.linalg.norm(b - cb, axis=1)
            sc = float(np.median(db[da > 1] / da[da > 1])) if (da > 1).sum() >= 3 else 1.0
            sc = float(np.clip(sc, 0.9, 1.1))
            cx, cy = x + w / 2, y + h / 2
            # box centre keeps its offset from the feature median, scaled
            cx = cb[0] + (cx - ca[0]) * sc
            cy = cb[1] + (cy - ca[1]) * sc
            w, h = w * sc, h * sc
            x, y = cx - w / 2, cy - h / 2
            pts = b
        out.append((x, y, w, h))
        if i % 15 == 0:
            pts = seed(gray[i], x, y, w, h)
    return [tuple(int(round(v)) for v in o) for o in out]


def smooth(vals, k=9):
    v = np.array(vals, np.float64)
    pad = np.pad(v, ((k, k), (0, 0)), mode='edge')
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    return np.stack([np.convolve(pad[:, i], ker, mode='valid') for i in range(v.shape[1])], 1)


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, t)))


def write_video(frames_iter, size, name, n, crf=23, vp9crf=34):
    w, h = size
    os.makedirs(OUT, exist_ok=True)
    tmp = os.path.join(OUT, f'.{name}.y4m')
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(FPS), '-i', '-',
                          '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    first = None
    for i, fr in enumerate(frames_iter):
        if i == 0:
            first = fr
        p.stdin.write(np.ascontiguousarray(fr).tobytes())
    p.stdin.close()
    p.wait()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high',
                    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', os.path.join(OUT, f'{name}.mp4')], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-c:v', 'libvpx-vp9', '-crf', str(vp9crf), '-b:v', '0', '-row-mt', '1',
                    '-pix_fmt', 'yuv420p', '-an', os.path.join(OUT, f'{name}.webm')], check=True)
    os.remove(tmp)
    # poster from frame 40 (frame 0 is the fade-in)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(OUT, f'{name}.mp4'), '-vf', "select='eq(n\\,40)'",
                    '-frames:v', '1', '-q:v', '3', os.path.join(OUT, f'{name}-poster.jpg')], check=True)
    sizes = {e: os.path.getsize(os.path.join(OUT, f'{name}.{e}')) // 1024 for e in ('mp4', 'webm')}
    print(f'{name}: {n} frames {w}x{h}  mp4 {sizes["mp4"]}KB  webm {sizes["webm"]}KB')


def grade(fr):
    """Gentle cinematic grade: slight contrast, cooler shadows, mild desaturation."""
    f = fr.astype(np.float32) / 255.0
    lum = f @ np.array([0.299, 0.587, 0.114], np.float32)
    f = f * 0.88 + lum[..., None] * 0.12
    f = np.clip((f - 0.5) * 1.08 + 0.5, 0, 1)
    f[..., 2] = np.clip(f[..., 2] + 0.03 * (1 - lum), 0, 1)
    return (f * 255).astype(np.uint8)


def crop_view(fr, cx, cy, cw, out_size):
    """Crop a window of width cw (aspect of out_size) centred on (cx, cy), clamped to the
    frame, and resample to out_size. cw is never smaller than out_size[0]: no upscaling."""
    H, W = fr.shape[:2]
    ow, oh = out_size
    cw = max(cw, ow)
    ch = cw * oh / ow
    if ch > H:
        ch = H
        cw = ch * ow / oh
    x0 = float(np.clip(cx - cw / 2, 0, W - cw))
    y0 = float(np.clip(cy - ch / 2, 0, H - ch))
    M = np.array([[ow / cw, 0, -x0 * ow / cw], [0, oh / ch, -y0 * oh / ch]], np.float32)
    return cv2.warpAffine(fr, M, (ow, oh), flags=cv2.INTER_AREA if cw > ow * 1.2 else cv2.INTER_CUBIC), (x0, y0, ow / cw)


# ─────────────────────────────────────────────────────────────────────────────
# VIDEO 01 — moving vehicle / visual observation
# ─────────────────────────────────────────────────────────────────────────────
VEHICLE_SHOTS = [
    # (t0, t1, initial truck box in source px at t0, zoom start→end, label)
    # drone: where the composited IroNav aircraft hovers (fractions of the output frame)
    dict(t0=106.0, t1=109.2, box=(330, 580, 60, 70), z=(1.0, 1.32), label='WIDE', drone=(0.74, 0.17)),
    dict(t0=49.4, t1=51.9, box=(1752, 560, 135, 66), z=(1.15, 1.45), label='MID', drone=(0.26, 0.16)),
    dict(t0=44.45, t1=46.3, box=(1440, 868, 170, 150), z=(1.0, 1.12), label='CLOSE', drone=(0.24, 0.16)),
]


def ironav_sprite(width):
    """The ORIGINAL product photograph, scaled down, slightly matched to overcast footage.
    Returns the sprite and the module's underside point (beam origin) in sprite px."""
    src = Image.open(os.path.join(ROOT, 'public/media/ironav-original.png')).convert('RGBA')
    man = json.load(open(os.path.join(ROOT, 'public/media/ironav-layers/manifest.json')))
    mod = next(l for l in man['layers'] if l['id'] == 'ironav-module')
    k = width / src.width
    sp = src.resize((width, round(src.height * k)), Image.LANCZOS)
    a = np.asarray(sp).astype(np.float32)
    lum = a[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32)
    a[..., :3] = a[..., :3] * 0.85 + lum[..., None] * 0.15
    sp = Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
    origin = ((mod['x'] + mod['w'] * 0.45) * k, (mod['y'] + mod['h'] * 0.95) * k)
    shadow = Image.new('RGBA', sp.size, (0, 0, 0, 0))
    shadow.putalpha(sp.split()[3].point(lambda v: int(v * 0.45)).filter(ImageFilter.GaussianBlur(6)))
    return sp, shadow, origin


def draw_beam(im, origin, box, a_in, t):
    """Illustrative tracking beam from the module to the tracked box (soft-edged)."""
    W, H = im.size
    L, T, R, B = box
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ox, oy = origin
    poly = [(ox - 3, oy), (ox + 3, oy), (R, B), (L, B)] if oy < T else [(ox - 3, oy), (ox + 3, oy), (R, T), (L, T)]
    d.polygon(poly, fill=AMBER + (int(70 * a_in),))
    d.polygon([(ox - 1, oy), (ox + 1, oy), ((L + R) / 2 + (R - L) * 0.18, (T + B) / 2), ((L + R) / 2 - (R - L) * 0.18, (T + B) / 2)], fill=(255, 214, 150, int(90 * a_in)))
    layer = layer.filter(ImageFilter.GaussianBlur(2.2))
    d = ImageDraw.Draw(layer)
    d.line([poly[0], poly[3]], fill=AMBER + (int(170 * a_in),), width=1)
    d.line([poly[1], poly[2]], fill=AMBER + (int(170 * a_in),), width=1)
    # scan pulse travelling down the beam
    for ph in (0.0, 0.5):
        u = (t * 2.2 + ph) % 1.0
        px, py = ox + ((L + R) / 2 - ox) * u, oy + ((T + B) / 2 - oy) * u
        r = 3 + 10 * u
        d.ellipse([px - r, py - r * 0.5, px + r, py + r * 0.5], outline=(255, 226, 180, int(200 * a_in * (1 - u))), width=2)
    # target footprint
    d.rectangle([L, T, R, B], fill=AMBER + (int(38 * a_in),))
    im.alpha_composite(layer)


def vehicle(src_dir, mode):
    src = os.path.join(src_dir, 'atch1080.webm')
    out_size = (1280, 720) if mode == 'desktop' else (720, 960)
    f_lab = font(22 if mode == 'desktop' else 24)
    f_small = font(17 if mode == 'desktop' else 19)
    frames_out = []
    sprite, sprite_sh, origin0 = ironav_sprite(330 if mode == 'desktop' else 300)
    for si, shot in enumerate(VEHICLE_SHOTS):
        fr = read_frames(src, shot['t0'], shot['t1'])
        boxes = track(fr, shot['box'])
        cen = smooth([(x + w / 2, y + h / 2) for x, y, w, h in boxes], k=7)
        n = len(fr)
        # reference points: real image features, followed with optical flow
        g0 = cv2.cvtColor(fr[0], cv2.COLOR_RGB2GRAY)
        pts = cv2.goodFeaturesToTrack(g0, maxCorners=40, qualityLevel=0.05, minDistance=90, blockSize=9)
        pts = pts.reshape(-1, 2) if pts is not None else np.zeros((0, 2), np.float32)
        prev = g0
        # keep the points away from the tracked vehicle
        bx, by, bw, bh = boxes[0]
        keep = [(px < bx - 60 or px > bx + bw + 60 or py < by - 60 or py > by + bh + 60) for px, py in pts]
        pts = pts[np.array(keep, bool)][:14].astype(np.float32) if len(pts) else pts
        alive = np.ones(len(pts), bool)
        for i in range(n):
            g = cv2.cvtColor(fr[i], cv2.COLOR_RGB2GRAY)
            if i > 0 and len(pts):
                nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts.reshape(-1, 1, 2), None, winSize=(21, 21), maxLevel=3)
                pts = nxt.reshape(-1, 2)
                alive &= st.reshape(-1).astype(bool)
            prev = g
            t = i / max(1, n - 1)
            z = shot['z'][0] + (shot['z'][1] - shot['z'][0]) * ease(t)
            if mode == 'mobile':
                z *= 1.0  # portrait window already frames tighter horizontally
            cx, cy = cen[i]
            # camera leads slightly in the direction of travel
            vx = cen[min(n - 1, i + 6)][0] - cen[max(0, i - 6)][0]
            vy = cen[min(n - 1, i + 6)][1] - cen[max(0, i - 6)][1]
            lead = 1.5 if mode == 'desktop' else 0.4
            view, (x0, y0, s) = crop_view(grade(fr[i]), cx + vx * lead, cy + vy * lead * 0.6, 1920 / z if mode == 'desktop' else 1080 * 0.75 / z, out_size)
            im = Image.fromarray(view)
            d = ImageDraw.Draw(im, 'RGBA')
            W, H = out_size
            bxo, byo, bwo, bho = [(boxes[i][0] - x0) * s, (boxes[i][1] - y0) * s, boxes[i][2] * s, boxes[i][3] * s]
            tx, ty = bxo + bwo / 2, byo + bho / 2
            a_in = min(1, i / 10) * min(1, (n - 1 - i) / 10)
            # composited IroNav aircraft (original photograph) hovering with a gentle bob
            gfx = (0.5, 0.13) if mode == 'mobile' else shot['drone']
            sx_ = W * gfx[0] - sprite.width / 2
            sy_ = H * gfx[1] - sprite.height / 2 + math.sin((si * 40 + i) / 14) * 4
            ox, oy = sx_ + origin0[0], sy_ + origin0[1]
            im = im.convert('RGBA')
            draw_beam(im, (ox, oy), (bxo - 6, byo - 6, bxo + bwo + 6, byo + bho + 6), a_in, i / FPS)
            im.alpha_composite(sprite_sh, (int(sx_ + 10), int(sy_ + 26)))
            im.alpha_composite(sprite, (int(sx_), int(sy_)))
            d = ImageDraw.Draw(im, 'RGBA')
            tag_x = sx_ + sprite.width + 10 if sx_ + sprite.width + 230 < W else sx_ - 230
            if mode == 'mobile':
                tag_x = 26
            tag_y = sy_ + sprite.height * 0.3 if mode == 'desktop' else sy_ + sprite.height + 6
            d.rectangle([tag_x - 8, tag_y - 6, tag_x + 200, tag_y + 52], fill=(8, 10, 14, 150))
            d.text((tag_x, tag_y), 'IRONAV', font=f_lab, fill=INK + (240,))
            d.text((tag_x, tag_y + 28), 'VISUAL TRACKING', font=f_small, fill=AMBER + (230,))
            # reference points on the scene
            for (px, py), ok in zip(pts, alive):
                if not ok:
                    continue
                qx, qy = (px - x0) * s, (py - y0) * s
                if 0 <= qx < W and 0 <= qy < H:
                    d.rectangle([qx - 4, qy - 4, qx + 4, qy + 4], outline=AMBER + (int(150 * a_in),), width=1)
            # tracking brackets around the vehicle
            pad = 8
            L, T, R, B = bxo - pad, byo - pad, bxo + bwo + pad, byo + bho + pad
            c = max(10, min(22, (R - L) * 0.25))
            col = INK + (int(230 * a_in),)
            for (x1, y1, dx, dy) in [(L, T, 1, 1), (R, T, -1, 1), (L, B, 1, -1), (R, B, -1, -1)]:
                d.line([(x1, y1), (x1 + c * dx, y1)], fill=col, width=2)
                d.line([(x1, y1), (x1, y1 + c * dy)], fill=col, width=2)
            d.line([(tx - 5, ty), (tx + 5, ty)], fill=AMBER + (int(220 * a_in),), width=1)
            d.line([(tx, ty - 5), (tx, ty + 5)], fill=AMBER + (int(220 * a_in),), width=1)
            lx, ly = R + 12, T - 4
            if lx + 240 > W:
                lx = L - 250
            # small plate behind the label for legibility over bright terrain
            d.rectangle([lx - 8, ly - 6, lx + 236, ly + 52], fill=(8, 10, 14, int(150 * a_in)))
            d.text((lx, ly), 'GROUND VEHICLE', font=f_lab, fill=INK + (int(240 * a_in),))
            d.text((lx, ly + 28), f'IN VIEW · {shot["label"]}', font=f_small, fill=BLUE + (int(230 * a_in),))
            # frame furniture
            m = 26
            d.text((m, H - m - 20), 'COMPOSITE · ILLUSTRATIVE VISUALISATION', font=f_small, fill=INK + (170,))
            d.text((m, m), f'0{si + 1} / 03', font=f_small, fill=AMBER + (220,))
            frames_out.append(np.asarray(im.convert('RGB')))
    # short dip between shots and a seamless loop (fade in/out to the page graphite)
    n = len(frames_out)
    bounds = np.cumsum([0] + [int(round((s['t1'] - s['t0']) * FPS)) for s in VEHICLE_SHOTS])
    bg = np.array([11, 13, 17], np.float32)

    def gen():
        for i, fr in enumerate(frames_out):
            k = min([abs(i - b) for b in bounds])
            a = min(1.0, k / 6.0)
            yield (fr.astype(np.float32) * a + bg * (1 - a)).astype(np.uint8)
    write_video(gen(), out_size, f'vehicle-{mode}', n)


# ─────────────────────────────────────────────────────────────────────────────
# VIDEO 02 — one building, multiple viewpoints
# ─────────────────────────────────────────────────────────────────────────────
def building(src_dir, mode, shots):
    src = os.path.join(src_dir, 'nubble1080.webm')
    out_size = (1280, 720) if mode == 'desktop' else (720, 960)
    f_small = font(17 if mode == 'desktop' else 19)
    f_lab = font(22 if mode == 'desktop' else 24)
    sprite, sprite_sh, origin0 = ironav_sprite(300 if mode == 'desktop' else 280)
    BAR = 60  # pillarbox in the source frame
    frames_out, bounds = [], [0]
    for si, sh in enumerate(shots):
        fr = read_frames(src, sh['t0'], sh['t1'])[:, :, BAR:-BAR]
        n = len(fr)
        bx0, by0, bw0, bh0 = sh['box']
        boxes = track_flow(fr, (bx0 - BAR, by0, bw0, bh0))
        sm = smooth(boxes, k=6)
        boxes = [tuple(v) for v in sm]
        cen = [(x + w / 2, y + h / 2) for x, y, w, h in boxes]
        for i in range(n):
            t = ease(i / max(1, n - 1))
            z = sh['z'][0] + (sh['z'][1] - sh['z'][0]) * t
            cx, cy = cen[i]
            if mode == 'desktop':
                cx = cx * 0.35 + fr.shape[2] / 2 * 0.65  # keep the composition, drift towards the structure
                cw = fr.shape[2] / z
            else:
                cw = fr.shape[1] * 0.75 / z
            view, (x0, y0, s) = crop_view(grade(fr[i]), cx, cy, cw, out_size)
            W, H = out_size
            im = Image.fromarray(view).convert('RGBA')
            a_in = min(1, i / 12) * min(1, (n - 1 - i) / 12)
            bx, by, bw, bh = boxes[i]
            L, T = (bx - x0) * s - 10, (by - y0) * s - 10
            R, B = L + bw * s + 20, T + bh * s + 20
            # IroNav composite observing the structure from alternating sides
            if mode == 'mobile':
                gfx = (0.5, 0.12)
            else:
                gfx = (0.2, 0.17) if (L + R) / 2 > W * 0.5 else (0.8, 0.17)
            sx_ = W * gfx[0] - sprite.width / 2
            sy_ = H * gfx[1] - sprite.height / 2 + math.sin((si * 37 + i) / 15) * 4
            draw_beam(im, (sx_ + origin0[0], sy_ + origin0[1]), (L, T, R, B), a_in * 0.85, i / FPS)
            im.alpha_composite(sprite_sh, (int(sx_ + 10), int(sy_ + 24)))
            im.alpha_composite(sprite, (int(sx_), int(sy_)))
            d = ImageDraw.Draw(im, 'RGBA')
            c = 18
            col = INK + (int(220 * a_in),)
            for (x1, y1, dx, dy) in [(L, T, 1, 1), (R, T, -1, 1), (L, B, 1, -1), (R, B, -1, -1)]:
                d.line([(x1, y1), (x1 + c * dx, y1)], fill=col, width=2)
                d.line([(x1, y1), (x1, y1 + c * dy)], fill=col, width=2)
            lx = R + 12 if R + 250 < W else L - 250
            lx = max(12, min(W - 250, lx))
            ly = max(12, min(H - 70, T))
            d.rectangle([lx - 8, ly - 6, lx + 236, ly + 52], fill=(8, 10, 14, int(150 * a_in)))
            d.text((lx, ly), 'STRUCTURE', font=f_lab, fill=INK + (int(240 * a_in),))
            d.text((lx, ly + 28), f'VIEWPOINT 0{sh["vp"]}', font=f_small, fill=BLUE + (int(230 * a_in),))
            m = 26
            d.text((m, m), sh['label'], font=f_small, fill=AMBER + (220,))
            d.text((m, H - m - 20), 'COMPOSITE · ILLUSTRATIVE VISUALISATION', font=f_small, fill=INK + (170,))
            frames_out.append(np.asarray(im.convert('RGB')))
        bounds.append(len(frames_out))
    bg = np.array([11, 13, 17], np.float32)

    def gen():
        for i, fr in enumerate(frames_out):
            k = min([abs(i - b) for b in bounds])
            a = min(1.0, k / 7.0)
            yield (fr.astype(np.float32) * a + bg * (1 - a)).astype(np.uint8)
    write_video(gen(), out_size, f'building-{mode}', len(frames_out), crf=27, vp9crf=40)


def debug_track(src_dir, name, t0, t1, box, out):
    fr = read_frames(os.path.join(src_dir, name), t0, t1)
    boxes = track(fr, box)
    idx = np.linspace(0, len(fr) - 1, 8).astype(int)
    tiles = []
    for i in idx:
        im = Image.fromarray(fr[i])
        d = ImageDraw.Draw(im)
        x, y, w, h = boxes[i]
        d.rectangle([x, y, x + w, y + h], outline=(255, 0, 0), width=4)
        tiles.append(im.resize((480, int(480 * fr.shape[1] / fr.shape[2]))))
    sheet = Image.new('RGB', (480 * 4, tiles[0].height * 2))
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % 4) * 480, (k // 4) * t.height))
    sheet.save(out)


if __name__ == '__main__':
    src_dir = sys.argv[1]
    which = sys.argv[2:] or ['vehicle', 'building']
    if 'debug-vehicle' in which:
        for k, s in enumerate(VEHICLE_SHOTS):
            debug_track(src_dir, 'atch1080.webm', s['t0'], s['t1'], s['box'], os.path.join(os.environ.get('DEBUG_DIR', '.'), f'vtrack{k}.png'))
    if 'vehicle' in which:
        for m in ('desktop', 'mobile'):
            vehicle(src_dir, m)
    if 'building' in which:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from building_shots import SHOTS  # noqa: E402
        for m in ('desktop', 'mobile'):
            building(src_dir, m, SHOTS)
