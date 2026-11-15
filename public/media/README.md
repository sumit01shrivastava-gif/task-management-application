# Media

| Path | What it is |
| ---- | ---------- |
| `ironav-original.png` | The client's original product photograph (IMG_5771.png), byte-identical copy. SHA-256 `d9518ea4597063b2144ec092028e0b5afb49d659af2f9c56d41fafca91026d54`. Never modified. |
| `ironav-layers/*.webp` | Component layers cut from the original by `scripts/segment_layers.py` (lossless WebP, exact RGB/alpha). |
| `ironav-layers/*-outline.webp` | Highlight rings derived from each layer's own silhouette. |
| `ironav-layers/manifest.json` | Layer ids, groups, pixel offsets in the original image, callout anchors and explode vectors. |

The layers partition the photograph's pixels, so stacked at their offsets they reproduce
the original exactly (the script verifies this on every run). No imagery is generated,
redrawn or in-filled.
