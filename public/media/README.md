# Media

Every product visual on the site comes from ONE source: the client's original photograph.

| Path | What it is |
| ---- | ---------- |
| `ironav-original.png` | Original product photograph (IMG_5771.png), byte-identical. SHA-256 `d9518ea4597063b2144ec092028e0b5afb49d659af2f9c56d41fafca91026d54`. Never modified. |
| `ironav-layers/*.webp` | 23 component layers cut from the original (`scripts/segment_layers.py`, lossless WebP). They re-composite to the original bit-for-bit. |
| `ironav-layers/*-outline.webp` | Highlight rings from each layer's own silhouette. |
| `ironav-layers/fx/*` | Desktop depth effects per layer: defocused copy and soft contact shadow (`scripts/build_media.py`). |
| `derived/lineart.png` | Technical line trace (Sobel edges) of the original photograph. |
| `derived/crop-module.png` | Native-resolution crop around the IroNav module. |
| `derived/clips/*.{mp4,webm,jpg}` | Motion studies rendered from the photograph and its layers (H.264 + VP9, posters). |
| `brand/globaz-mark.png` | Globaz "G" mark, cropped from the logo on globaztechnologies.com. |
| `film/` *(optional)* | Slot for an authorised IroNav film: `ironav-film.mp4`, `ironav-film.webm`, `ironav-film-poster.jpg`; then set `AUTHORISED_FILM` in `src/components/sections/Film.tsx`. |

No imagery is generated, redrawn or in-filled.
