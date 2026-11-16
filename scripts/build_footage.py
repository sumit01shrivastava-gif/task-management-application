"""
Builds the two environmental video sequences from LICENSED aerial footage.

Sources (Wikimedia Commons, downloaded as the 1080p VP9 derivatives):
  • "The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video"
    — Third Coast Drone, CC BY 3.0
    https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm
  • "Sondermunitionslager Dülmen-Visbeck" (former Bundeswehr special ammunition
    storage site, filmed July 2024) — Dietmar Rabich, CC BY-SA 4.0
    https://commons.wikimedia.org/wiki/File:Sondermunitionslager_D%C3%BClmen-Visbeck.webm
    The derived installation film is shared under CC BY-SA 4.0 as the licence requires.

Changes made (as CC BY requires us to indicate): trimmed, re-sequenced, digitally
reframed (crop windows within the original frame — never upscaled), colour-graded,
and overlaid with illustrative graphics. The overlays are graphics only: the
tracked boxes and reference points are computed from the footage itself with
template matching / optical flow; nothing is generated.

Usage: python3 scripts/build_footage.py <dir-with-source-webms> [vehicle] [building]
Output: public/media/footage/{vehicle,installation}-{desktop,mobile}.{mp4,webm} + posters
Phone files (-sm): the -mobile render re-encoded lighter for phones, then the -mobile files removed:
  ffmpeg -i NAME-mobile.mp4 -vf fps=24 -c:v libx264 -profile:v main -level 3.1 -preset slow -crf 27/28
         -maxrate 1200k/950k -bufsize 2x -g 48 -pix_fmt yuv420p -movflags +faststart -an NAME-sm.mp4
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


XF = 16  # crossfade length between shots (frames)


def plate_color(fr):
    """Mean colour of the upper third of a plate: used to sit the composite in the same air."""
    return fr[: fr.shape[0] // 3].reshape(-1, 3).mean(0)


def match_sprite(sprite, haze, amount):
    """Atmospheric match: pull the sprite towards the plate's haze colour and soften contrast."""
    a = np.asarray(sprite).astype(np.float32)
    rgb = a[..., :3]
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    rgb = rgb * 0.9 + lum[..., None] * 0.1
    rgb = rgb * (1 - amount) + np.asarray(haze, np.float32) * amount
    a[..., :3] = rgb
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def compose(shots, mode, name, out_size, with_drone, crf=23, vp9crf=34):
    """Join shots with crossfades and draw overlays on top of the joined plate.
    Each shot: dict(plates=[...], boxes=[(L,T,R,B)...] in output px, label, sub, drone=(fx,fy)).
    The composited aircraft is one continuous layer that glides between shot positions
    during each crossfade, so cuts never make it jump or double."""
    W, H = out_size
    K = 1.0 if mode == 'desktop' else 1.45  # overlay scale: mobile type must stay legible on a phone
    f_lab = font(int(22 * K))
    f_small = font(int(17 * K))
    PW = int(246 * K)  # label plate width
    if with_drone:
        sprite0, sh0, origin0 = ironav_sprite(300 if mode == 'desktop' else 240)
    ph = int(52 * K)

    def label_cands(L, T, R, B, pw, ph):
        return [(R + 12, T - 4), (L - pw - 14, T - 4), (L, B + 12), (L, T - ph - 16), (R + 12, B - ph), (L - pw - 14, B - ph)]

    def drone_rect(k):
        if not with_drone:
            return None
        x, y = W * shots[k]['drone'][0] - sprite0.width / 2, H * shots[k]['drone'][1] - sprite0.height / 2
        return (x - 14, y - 14, x + sprite0.width + 14, y + sprite0.height + 14)

    def place_label(k, d):
        """One label placement per shot, chosen so that over the whole shot the plate stays
        inside the frame and never covers the composited aircraft."""
        sh = shots[k]
        pw = int(max(PW, d.textlength(sh['label'], font=f_lab), d.textlength(sh['sub'], font=f_small)) + 10)
        dr = drone_rect(k)

        def ok(c):
            x, y = c
            if not (22 <= x and x + pw <= W - 14 and 14 <= y and y + ph <= H - int(70 * K)):
                return False
            return dr is None or x + pw < dr[0] or x - 8 > dr[2] or y + ph < dr[1] or y - 6 > dr[3]

        for ci in range(6):
            if all(ok(label_cands(*b, pw, ph)[ci]) for b in sh['boxes']):
                return ci, pw, ph
        # fall back to the candidate valid for most frames
        best = max(range(6), key=lambda ci: sum(ok(label_cands(*b, pw, ph)[ci]) for b in sh['boxes']))
        return best, pw, ph

    placement = {}
    # timeline: shot k occupies [start_k, start_k + n_k); consecutive shots overlap by XF
    starts, t = [], 0
    for k, sh in enumerate(shots):
        starts.append(t)
        t += len(sh['plates']) - XF
    total = t  # last XF frames of the final shot crossfade into the first shot (seamless loop)

    def frame_refs(i):
        refs = []
        for k, sh in enumerate(shots):
            j = i - starts[k]
            n = len(sh['plates'])
            if 0 <= j < n:
                refs.append((k, j))
            elif k == 0 and 0 <= i + total - starts[0] < n and i + total - starts[0] >= total - starts[0]:
                pass
        # loop: the tail of the last shot overlaps the head of the first
        k = len(shots) - 1
        j = i + total - starts[k]
        if 0 <= j < len(shots[k]['plates']) and i < XF:
            refs.append((k, j))
        return refs

    def weight(k, j):
        n = len(shots[k]['plates'])
        w = 1.0
        if j < XF:
            w = min(w, (j + 0.5) / XF)
        if j >= n - XF:
            w = min(w, (n - j - 0.5) / XF)
        return ease(w)

    def gen():
        for i in range(total):
            refs = frame_refs(i)
            ws = [weight(k, j) for k, j in refs]
            sw = sum(ws) or 1
            plate = sum(shots[k]['plates'][j].astype(np.float32) * (w / sw) for (k, j), w in zip(refs, ws))
            im = Image.fromarray(plate.clip(0, 255).astype(np.uint8)).convert('RGBA')
            # drone position: weighted blend of the shots' anchor positions
            if with_drone:
                dx = sum(shots[k]['drone'][0] * w for (k, _), w in zip(refs, ws)) / sw
                dy = sum(shots[k]['drone'][1] * w for (k, _), w in zip(refs, ws)) / sw
                haze = sum(shots[k]['haze'] * w for (k, _), w in zip(refs, ws)) / sw
                sx_ = W * dx - sprite0.width / 2
                sy_ = H * dy - sprite0.height / 2 + math.sin(i / 16) * 3
                ox, oy = sx_ + origin0[0], sy_ + origin0[1]
                for (k, j), w in zip(refs, ws):
                    ov = max(0.0, (w / sw - 0.4) / 0.6)
                    if ov <= 0:
                        continue
                    L, T, R, B = shots[k]['boxes'][j]
                    draw_beam(im, (ox, oy), (L - 6, T - 6, R + 6, B + 6), ov, i / FPS)
                sp = match_sprite(sprite0, haze, 0.16)
                im.alpha_composite(sh0, (int(sx_ + 10), int(sy_ + 22)))
                im.alpha_composite(sp, (int(sx_), int(sy_)))
            d = ImageDraw.Draw(im, 'RGBA')
            for (k, j), w in zip(refs, ws):
                # overlays hand over at the middle of a crossfade instead of doubling up
                w = max(0.0, (w / sw - 0.4) / 0.6)
                if w <= 0:
                    continue
                L, T, R, B = shots[k]['boxes'][j]
                c = max(10, min(22, (R - L) * 0.25))
                col = INK + (int(230 * w),)
                for (x1, y1, ddx, ddy) in [(L, T, 1, 1), (R, T, -1, 1), (L, B, 1, -1), (R, B, -1, -1)]:
                    d.line([(x1, y1), (x1 + c * ddx, y1)], fill=col, width=2)
                    d.line([(x1, y1), (x1, y1 + c * ddy)], fill=col, width=2)
                if k not in placement:
                    placement[k] = place_label(k, d)
                ci, pw, ph = placement[k]
                lx, ly = label_cands(L, T, R, B, pw, ph)[ci]
                lx = max(14, min(W - pw - 14, lx))
                ly = max(14, min(H - int(80 * K), ly))
                d.rectangle([lx - 8, ly - 6, lx + pw, ly + ph], fill=(3, 15, 53, int(170 * w)))
                d.text((lx, ly), shots[k]['label'], font=f_lab, fill=INK + (int(240 * w),))
                d.text((lx, ly + int(28 * K)), shots[k]['sub'], font=f_small, fill=AMBER + (int(235 * w),))
            m = 26
            d.text((m, H - m - int(20 * K)), 'ILLUSTRATIVE COMPOSITE · NOT A PRODUCT DEMONSTRATION', font=f_small, fill=INK + (170,))
            yield np.asarray(im.convert('RGB'))
    write_video(gen(), out_size, name, total, crf=crf, vp9crf=vp9crf)


def vehicle(src_dir, mode):
    src = os.path.join(src_dir, 'atch1080.webm')
    out_size = (1280, 720) if mode == 'desktop' else (960, 540)
    W, H = out_size
    shots = []
    for si, shot in enumerate(VEHICLE_SHOTS):
        fr = read_frames(src, shot['t0'], shot['t1'] + XF / FPS * 0.5)
        boxes = track(fr, shot['box'])
        cen = smooth([(x + w / 2, y + h / 2) for x, y, w, h in boxes], k=7)
        n = len(fr)
        plates, obox = [], []
        for i in range(n):
            t = i / max(1, n - 1)
            z = shot['z'][0] + (shot['z'][1] - shot['z'][0]) * ease(t)
            cx, cy = cen[i]
            vx = cen[min(n - 1, i + 6)][0] - cen[max(0, i - 6)][0]
            vy = cen[min(n - 1, i + 6)][1] - cen[max(0, i - 6)][1]
            lead = 1.5
            view, (x0, y0, s) = crop_view(grade(fr[i]), cx + vx * lead, cy + vy * lead * 0.6, 1920 / z, out_size)
            plates.append(view)
            bx, by, bw, bh = boxes[i]
            obox.append(((bx - x0) * s - 8, (by - y0) * s - 8, (bx + bw - x0) * s + 8, (by + bh - y0) * s + 8))
        drone = shot['drone']
        shots.append(dict(plates=plates, boxes=obox, label='GROUND VEHICLE', sub=f'IN VIEW · {shot["label"]}', drone=drone, haze=plate_color(plates[0])))
    compose(shots, mode, f'vehicle-{mode}', out_size, True)


def installation(src_dir, mode, shot_list):
    src = os.path.join(src_dir, 'depot1080.webm')
    out_size = (1280, 720) if mode == 'desktop' else (960, 540)
    shots = []
    for sh in shot_list:
        fr = read_frames(src, sh['t0'], sh['t1'] + XF / FPS * 0.5)
        n = len(fr)
        boxes = [tuple(v) for v in smooth(track_flow(fr, sh['box']), k=6)]
        plates, obox = [], []
        for i in range(n):
            t = ease(i / max(1, n - 1))
            z = sh['z'][0] + (sh['z'][1] - sh['z'][0]) * t
            bx, by, bw, bh = boxes[i]
            cx, cy = bx + bw / 2, by + bh / 2
            if True:  # same full composition on every device
                cx = cx * 0.35 + fr.shape[2] / 2 * 0.65
                cy = cy * 0.35 + fr.shape[1] / 2 * 0.65
                cw = fr.shape[2] / z
            else:
                cw = fr.shape[1] * 0.75 / z
            view, (x0, y0, s) = crop_view(grade(fr[i]), cx, cy, cw, out_size)
            plates.append(view)
            obox.append(((bx - x0) * s - 8, (by - y0) * s - 8, (bx + bw - x0) * s + 8, (by + bh - y0) * s + 8))
        # aircraft composite takes the upper corner opposite the structure, so it never covers it
        L, T, R, B = obox[len(obox) // 2]
        drone = (0.2, 0.17) if (L + R) / 2 > out_size[0] / 2 else (0.8, 0.17)
        shots.append(dict(plates=plates, boxes=obox, label=sh['label'], sub=sh['sub'], drone=drone, haze=plate_color(plates[0])))
    compose(shots, mode, f'installation-{mode}', out_size, True, crf=27, vp9crf=44)


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
    if 'installation' in which:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from installation_shots import SHOTS  # noqa: E402
        for m in ('desktop', 'mobile'):
            installation(src_dir, m, SHOTS)
