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

## Films (`footage/`)

Built by `scripts/build_footage.py` (shot list for the installation film in
`scripts/installation_shots.py`). Shots are joined with crossfades; overlays hand over at
the midpoint of each cut. **Not recordings of an IroNav demonstration.**

| File | Source | Author | Licence |
| ---- | ------ | ------ | ------- |
| `vehicle-{desktop,sm}.*` | [The Atchafalaya Basin Bridge And Whiskey Bay Pilot Channel Drone Video](https://commons.wikimedia.org/wiki/File:The_Atchafalaya_Basin_Bridge_And_Whiskey_Bay_Pilot_Channel_Drone_Video.webm) | Third Coast Drone | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `installation-{desktop,sm}.*` | [Sondermunitionslager Dülmen-Visbeck](https://commons.wikimedia.org/wiki/File:Sondermunitionslager_D%C3%BClmen-Visbeck.webm) (former Bundeswehr special ammunition storage site, filmed July 2024) | Dietmar Rabich | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — the adapted film is shared under the same licence |
| `../derived/context-plate*.webp` | Still frame from the Dülmen-Visbeck film (operational-context scene) | Dietmar Rabich | CC BY-SA 4.0 |

The truck film composites the original IroNav photograph, colour-matched to each shot, with
an illustrative field-of-view graphic (not an emitted laser). The installation film has no
composite aircraft. Credits appear on the page under each film.

## Brand (`brand/`)

`globaz-logo.png`, `globaz-facility.webp` — from globaztechnologies.com, unmodified (the logo
is displayed white with the same CSS filter the official site uses).
