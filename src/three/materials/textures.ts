import * as THREE from 'three';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

/** 2×2 twill carbon-fibre weave, tileable. Returns colour + roughness maps. */
export function carbonTextures(size = 256) {
  const [c, g] = canvas(size, size);
  const [r, rg] = canvas(size, size);
  const cells = 16;
  const s = size / cells;
  g.fillStyle = '#0b0c0e';
  g.fillRect(0, 0, size, size);
  rg.fillStyle = '#777';
  rg.fillRect(0, 0, size, size);

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // twill: tows alternate direction on a diagonal offset of 2
      const horizontal = ((x + y) >> 1) % 2 === 0;
      const grad = horizontal
        ? g.createLinearGradient(x * s, y * s, x * s, (y + 1) * s)
        : g.createLinearGradient(x * s, y * s, (x + 1) * s, y * s);
      grad.addColorStop(0, '#0d0f12');
      grad.addColorStop(0.5, horizontal ? '#2a2e34' : '#1d2026');
      grad.addColorStop(1, '#0d0f12');
      g.fillStyle = grad;
      g.fillRect(x * s + 0.5, y * s + 0.5, s - 1, s - 1);

      // fibre striations
      g.strokeStyle = 'rgba(255,255,255,0.035)';
      g.lineWidth = 1;
      for (let k = 1; k < 5; k++) {
        g.beginPath();
        if (horizontal) {
          g.moveTo(x * s, y * s + (k * s) / 5);
          g.lineTo((x + 1) * s, y * s + (k * s) / 5);
        } else {
          g.moveTo(x * s + (k * s) / 5, y * s);
          g.lineTo(x * s + (k * s) / 5, (y + 1) * s);
        }
        g.stroke();
      }
      rg.fillStyle = horizontal ? '#5a5a5a' : '#808080';
      rg.fillRect(x * s, y * s, s, s);
    }
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(r);
  for (const t of [map, roughnessMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  }
  return { map, roughnessMap };
}

/** Dark solder-mask PCB with gold traces — purely illustrative artwork. */
export function pcbTexture(size = 512) {
  const [c, g] = canvas(size, size);
  g.fillStyle = '#07100d';
  g.fillRect(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.lineCap = 'round';
  for (let i = 0; i < 140; i++) {
    g.strokeStyle = rnd() > 0.85 ? 'rgba(201,163,92,0.85)' : 'rgba(150,128,80,0.45)';
    g.lineWidth = rnd() > 0.8 ? 3 : 1.4;
    let x = rnd() * size;
    let y = rnd() * size;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      if (rnd() > 0.5) x += (rnd() - 0.5) * 180;
      else y += (rnd() - 0.5) * 180;
      g.lineTo(x, y);
      if (rnd() > 0.6) {
        const d = (rnd() - 0.5) * 40;
        x += d;
        y += d;
        g.lineTo(x, y);
      }
    }
    g.stroke();
    g.fillStyle = '#c9a35c';
    g.beginPath();
    g.arc(x, y, 2.6, 0, Math.PI * 2);
    g.fill();
  }
  // pad rows
  g.fillStyle = 'rgba(201,163,92,0.9)';
  for (let row = 0; row < 6; row++) {
    const y0 = 30 + row * 80;
    for (let k = 0; k < 14; k++) g.fillRect(24 + k * 8, y0, 4, 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Small engraved product label for the IroNav enclosure. */
export function labelTexture(text: string, sub?: string) {
  const [c, g] = canvas(512, 160);
  g.clearRect(0, 0, 512, 160);
  g.fillStyle = 'rgba(214,220,228,0.92)';
  g.font = '600 74px "Inter Tight Variable", "Inter Tight", Arial, sans-serif';
  g.textBaseline = 'middle';
  g.fillText(text, 26, sub ? 66 : 80);
  if (sub) {
    g.fillStyle = 'rgba(160,170,182,0.75)';
    g.font = '500 24px "JetBrains Mono", monospace';
    g.fillText(sub, 30, 124);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Soft radial sprite used for the IroNav illumination halo. */
export function glowTexture() {
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(90,160,255,0.9)');
  grad.addColorStop(0.35, 'rgba(60,130,255,0.25)');
  grad.addColorStop(1, 'rgba(40,100,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
