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

## Environmental footage (`footage/`)

Built by `scripts/build_footage.py` (shot lists in the script and `scripts/building_shots.py`)
from licensed Wikimedia Commons footage, composited with the original IroNav photograph and
illustrative overlays (tracking brackets from template / optical-flow tracking, an
illustrative field-of-view beam). These are **not recordings of an IroNav demonstration**,
and the beam does not depict an emitted laser.

| File | Source | Author | Licence |
| ---- | ------ | ------ | ------- |
| `vehicle-{desktop,mobile}.*` | [The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video](https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm) | Third Coast Drone | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `building-{desktop,mobile}.*` | [Cape Neddick Nubble Lighthouse - York, Maine 4k Drone flight - DJI Air2S](https://commons.wikimedia.org/wiki/File:Cape_Neddick_Nubble_Lighthouse_-_York,_Maine_4k_Drone_flight_-_DJI_Air2S.webm) | Dave Halter | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

Changes: trimmed, re-sequenced, reframed (crop windows only, never upscaled), colour-graded,
composited. Attribution is shown on the page under each video. Desktop versions are
1280×720, mobile versions 720×960; H.264 + VP9, muted, looping, with posters.

To replace with client-approved footage, re-run `build_footage.py` on new sources or drop
pre-cut files with the same names into this folder.
