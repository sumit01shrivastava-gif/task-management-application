"""
Derived media built ONLY from the original product photograph and its layers.

Nothing here is generated or invented: every output is a deterministic
transformation (edge tracing, cropping, re-positioning of the photo's own
pixels) of public/media/ironav-original.png.

Outputs (public/media/derived/):
  lineart.png            white technical line trace of the photograph (transparent)
  crop-module.png        native-resolution crop around the IroNav module
  clips/<name>.mp4|webm  short loops (H.264 + VP9) with matching posters (.jpg)

Usage: python3 scripts/build_media.py
"""
import json, os, subprocess, shutil, tempfile
import numpy as np
from PIL import Image, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/media/ironav-original.png')
LAYERS = os.path.join(ROOT, 'public/media/ironav-layers')
OUT = os.path.join(ROOT, 'public/media/derived')
CLIPS = os.path.join(OUT, 'clips')
BG = (11, 13, 17)  # matches --graphite in the site CSS (#0b0d11)
FPS = 30


def lineart(src: Image.Image) -> Image.Image:
    """Sobel edge trace of the photograph, gated by its alpha, as white lines."""
    rgba = np.asarray(src).astype(np.float32)
    a = rgba[..., 3] / 255.0
    lum = (0.299 * rgba[..., 0] + 0.587 * rgba[..., 1] + 0.114 * rgba[..., 2]) * a
    img = Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    g = np.asarray(img).astype(np.float32)
    kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], np.float32)
    pad = np.pad(g, 1, mode='edge')
    gx = sum(kx[i, j] * pad[i:i + g.shape[0], j:j + g.shape[1]] for i in range(3) for j in range(3))
    gy = sum(kx.T[i, j] * pad[i:i + g.shape[0], j:j + g.shape[1]] for i in range(3) for j in range(3))
    mag = np.hypot(gx, gy)
    # silhouette edge from alpha
    ap = np.pad(a * 255, 1, mode='edge')
    sx = sum(kx[i, j] * ap[i:i + g.shape[0], j:j + g.shape[1]] for i in range(3) for j in range(3))
    sy = sum(kx.T[i, j] * ap[i:i + g.shape[0], j:j + g.shape[1]] for i in range(3) for j in range(3))
    sil = np.hypot(sx, sy)
    edge = np.clip((mag - 60) / 140, 0, 1) * 0.8 + np.clip((sil - 120) / 300, 0, 1)
    edge = np.clip(edge, 0, 1)
    out = np.zeros((*g.shape, 4), np.uint8)
    out[..., 0:3] = 236
    out[..., 3] = (edge * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def write_clip(name, frames_dir, size, n_frames):
    w, h = size
    mp4 = os.path.join(CLIPS, f'{name}.mp4')
    webm = os.path.join(CLIPS, f'{name}.webm')
    pattern = os.path.join(frames_dir, '%04d.png')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', pattern,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', mp4], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', pattern,
                    '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', webm], check=True)
    shutil.copy(os.path.join(frames_dir, '0001.png'), os.path.join(CLIPS, f'{name}-poster.png'))
    Image.open(os.path.join(CLIPS, f'{name}-poster.png')).convert('RGB').save(os.path.join(CLIPS, f'{name}-poster.jpg'), quality=86)
    os.remove(os.path.join(CLIPS, f'{name}-poster.png'))
    print(f'{name}: {n_frames} frames {w}x{h}  mp4 {os.path.getsize(mp4)//1024}KB  webm {os.path.getsize(webm)//1024}KB')


def ease(t):
    return 0.5 - 0.5 * np.cos(np.pi * t)


def clip_scan(src, art):
    """A scan line sweeps across: photograph on one side, its own line trace on the other."""
    W, H = 1160, 558
    photo = src.crop((0, 0, W, H))
    trace = art.crop((0, 0, W, H))
    n = FPS * 6
    tmp = tempfile.mkdtemp()
    for i in range(n):
        t = i / n
        p = ease(t * 2) if t < 0.5 else ease((1 - t) * 2)  # ping-pong 0→1→0
        x = int(-40 + p * (W + 80))
        frame = Image.new('RGBA', (W, H), BG + (255,))
        mask_photo = Image.new('L', (W, H), 0)
        mask_photo.paste(255, (0, 0, max(0, x), H))
        frame.alpha_composite(Image.composite(photo, Image.new('RGBA', (W, H), (0, 0, 0, 0)), mask_photo))
        dim_trace = trace.copy()
        dim_trace.putalpha(ImageChops.multiply(trace.split()[3], ImageChops.invert(mask_photo)).point(lambda v: int(v * 0.75)))
        frame.alpha_composite(dim_trace)
        # scan line
        line = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        for dx, al in [(0, 210), (1, 120), (-1, 120), (3, 40), (-3, 40)]:
            if 0 <= x + dx < W:
                line.paste((242, 169, 59, al), (x + dx, 0, x + dx + 1, H))
        frame.alpha_composite(line)
        frame.convert('RGB').save(os.path.join(tmp, f'{i + 1:04d}.png'))
    write_clip('scan', tmp, (W, H), n)
    shutil.rmtree(tmp)


def clip_module(src):
    """Slow camera approach towards the IroNav module (limited zoom to respect source resolution)."""
    OW, OH = 960, 540
    W, H = src.size
    bg = Image.new('RGBA', (W + 400, H + 400), BG + (255,))
    bg.alpha_composite(src, (200, 200))
    start = (200 + W / 2, 200 + H / 2, W * 1.0)  # cx, cy, region width
    end = (200 + 562, 200 + 362, 620)           # module centre, region width (≈1.5× max magnification)
    n = FPS * 8
    tmp = tempfile.mkdtemp()
    for i in range(n):
        t = i / n
        p = ease(t * 2) if t < 0.5 else ease((1 - t) * 2)
        cx = start[0] + (end[0] - start[0]) * p
        cy = start[1] + (end[1] - start[1]) * p
        rw = start[2] + (end[2] - start[2]) * p
        rh = rw * OH / OW
        box = (cx - rw / 2, cy - rh / 2, cx + rw / 2, cy + rh / 2)
        frame = bg.transform((OW, OH), Image.EXTENT, box, Image.BICUBIC)
        frame.convert('RGB').save(os.path.join(tmp, f'{i + 1:04d}.png'))
    write_clip('module', tmp, (OW, OH), n)
    shutil.rmtree(tmp)


def clip_layers():
    """The photograph's own layers drift a short distance apart and return."""
    man = json.load(open(os.path.join(LAYERS, 'manifest.json')))
    W, H = 1160, 558
    M = 150  # room for movement (image px)
    S = min(W / (man['width'] + 2 * M), H / (man['height'] + 2 * M))
    OX = (W - (man['width'] + 2 * M) * S) / 2
    OY = (H - (man['height'] + 2 * M) * S) / 2
    layers = [(l, Image.open(os.path.join(LAYERS, l['file'])).convert('RGBA')) for l in man['layers']]
    order = {'frame': 0, 'ironav': 3, 'propellers': 2}
    layers.sort(key=lambda x: order.get(x[0]['group'], 1))
    n = FPS * 7
    tmp = tempfile.mkdtemp()
    for i in range(n):
        t = i / n
        p = ease(t * 2) if t < 0.5 else ease((1 - t) * 2)
        frame = Image.new('RGBA', (W, H), BG + (255,))
        for l, im in layers:
            k = 0.45 * p
            x = OX + (M + l['x'] + l['explode'][0] * k) * S
            y = OY + (M + l['y'] + l['explode'][1] * k) * S
            w, h = max(1, round(im.width * S)), max(1, round(im.height * S))
            sm = im.resize((w, h), Image.LANCZOS)
            frame.alpha_composite(sm, (round(x), round(y)))
        frame.convert('RGB').save(os.path.join(tmp, f'{i + 1:04d}.png'))
    write_clip('layers', tmp, (W, H), n)
    shutil.rmtree(tmp)


FX_PAD = 24


def layer_effects():
    """Pre-rendered depth effects per layer (desktop only): a defocused copy and a
    soft contact shadow, both derived from the layer's own pixels/silhouette."""
    man = json.load(open(os.path.join(LAYERS, 'manifest.json')))
    fx = os.path.join(LAYERS, 'fx')
    os.makedirs(fx, exist_ok=True)
    for l in man['layers']:
        im = Image.open(os.path.join(LAYERS, l['file'])).convert('RGBA')
        w, h = im.size
        canvas = Image.new('RGBA', (w + 2 * FX_PAD, h + 2 * FX_PAD), (0, 0, 0, 0))
        canvas.alpha_composite(im, (FX_PAD, FX_PAD))
        # premultiply-safe blur
        r, g, b, a = canvas.split()
        pm = Image.merge('RGB', [ImageChops.multiply(c, a) for c in (r, g, b)]).filter(ImageFilter.GaussianBlur(3))
        ab = a.filter(ImageFilter.GaussianBlur(3))
        A = np.asarray(ab).astype(np.float32)
        P = np.asarray(pm).astype(np.float32)
        rgb = np.where(A[..., None] > 0, np.clip(P * 255.0 / np.maximum(A[..., None], 1), 0, 255), 0)
        blur = Image.fromarray(np.dstack([rgb, A]).astype(np.uint8), 'RGBA')
        blur.save(os.path.join(fx, f"{l['id']}-blur.webp"), quality=82, method=6)
        sh = a.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.85))
        shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
        shadow.putalpha(sh)
        shadow.save(os.path.join(fx, f"{l['id']}-shadow.webp"), quality=70, method=6)
    print('layer fx written for', len(man['layers']), 'layers')


def main():
    os.makedirs(CLIPS, exist_ok=True)
    src = Image.open(SRC).convert('RGBA')
    art = lineart(src)
    art.save(os.path.join(OUT, 'lineart.png'), optimize=True)
    src.crop((392, 250, 752, 478)).save(os.path.join(OUT, 'crop-module.png'), optimize=True)
    import sys
    only = sys.argv[1:] or ['scan', 'module', 'layers']
    if 'scan' in only: clip_scan(src, art)
    if 'module' in only: clip_module(src)
    if 'layers' in only: clip_layers()
    if 'fx' in only or not sys.argv[1:]: layer_effects()


if __name__ == '__main__':
    main()
