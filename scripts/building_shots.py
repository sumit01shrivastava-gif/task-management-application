"""Shot list for VIDEO 02 (one building, multiple viewpoints), Cape Neddick Nubble
Lighthouse footage. t0/t1 in seconds; box = structure box in source px at t0
(source frame includes 60 px pillarbox bars on each side, removed in rendering)."""
SHOTS = [
    dict(t0=75.5, t1=78.0, box=(1080, 380, 100, 72), z=(1.08, 1.16), vp=1, label='01 · WIDE AERIAL'),
    dict(t0=7.0, t1=9.6, box=(800, 290, 260, 230), z=(1.08, 1.4), vp=1, label='02 · APPROACH'),
    dict(t0=83.0, t1=85.4, box=(646, 200, 220, 570), z=(1.1, 1.2), vp=1, label='03 · CLOSE VIEW'),
    dict(t0=30.5, t1=33.0, box=(1000, 360, 410, 250), z=(1.2, 1.08), vp=1, label='04 · PULL BACK'),
    dict(t0=27.0, t1=29.4, box=(1116, 394, 176, 494), z=(1.08, 1.14), vp=2, label='05 · SECOND ANGLE'),
    dict(t0=15.0, t1=17.6, box=(628, 368, 394, 380), z=(1.08, 1.55), vp=2, label='06 · DETAIL'),
    dict(t0=99.5, t1=101.9, box=(888, 164, 176, 482), z=(1.3, 1.08), vp=2, label='07 · PULL BACK'),
    dict(t0=69.5, t1=71.9, box=(810, 460, 80, 50), z=(1.08, 1.15), vp=3, label='08 · THIRD ANGLE'),
    dict(t0=108.0, t1=110.4, box=(850, 494, 290, 128), z=(1.08, 1.16), vp=4, label='09 · FOURTH VIEW'),
    dict(t0=57.5, t1=60.5, box=(930, 380, 90, 60), z=(1.16, 1.08), vp=4, label='10 · WIDE AERIAL'),
]
