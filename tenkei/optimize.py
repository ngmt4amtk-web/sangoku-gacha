#!/usr/bin/env python3
"""img/*.png -> img/opt/*.webp (resized, quality-tuned for data-URI embedding)"""
import pathlib, sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent; SRC=ROOT/'img'; OPT=SRC/'opt'; OPT.mkdir(exist_ok=True)
SPEC={'altar':(720,72),'card_ur':(640,74),'card_ssr':(640,74),'card_sr':(560,70),'card_r':(560,70),'card_n':(560,68),'burst_ur':(640,72),'burst_ssr':(640,72)}
for p in sorted(SRC.glob('*')):
    if p.suffix.lower() not in ('.png','.jpg','.jpeg','.webp') or p.stem not in SPEC: continue
    maxw,q=SPEC[p.stem]
    im=Image.open(p).convert('RGB')
    if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    out=OPT/(p.stem+'.webp')
    try: im.save(out,'WEBP',quality=q,method=6)
    except Exception as e:
        out=OPT/(p.stem+'.jpg'); im.save(out,'JPEG',quality=q+8,optimize=True,progressive=True)
    print(f'{p.name} -> {out.name} {im.width}x{im.height} {out.stat().st_size//1024}KB')
