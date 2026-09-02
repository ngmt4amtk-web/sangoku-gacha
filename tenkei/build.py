#!/usr/bin/env python3
"""天啓召喚 build: src/* + img/opt/* -> index.html (standalone) & artifact.html (body only)"""
import base64, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
SRC=ROOT/'src'; OPT=ROOT/'img'/'opt'
tpl=(SRC/'template.html').read_text(encoding='utf-8')
js='\n'.join((SRC/f).read_text(encoding='utf-8') for f in ['01_core.js','02_audio.js','03_fx.js','04_summon.js','05_ui.js'])
MIME={'.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'}
def uri(stem):
    for ext in ('.webp','.jpg','.jpeg','.png'):
        p=OPT/(stem+ext)
        if p.exists():
            return f'data:{MIME[ext]};base64,'+base64.b64encode(p.read_bytes()).decode()
    return ''
img={'altar':uri('altar'),'card':{t:uri('card_'+t.lower()) for t in ['N','R','SR','SSR','UR']},'burst':{t:uri('burst_'+t.lower()) for t in ['SSR','UR']}}
img['card']={k:v for k,v in img['card'].items() if v}; img['burst']={k:v for k,v in img['burst'].items() if v}
script="'use strict';\nconst IMG="+json.dumps(img,ensure_ascii=False)+';\n'+js
page=tpl.replace('/*__JS__*/',script)
head,body=page.split('<!--/HEAD-->',1)
head=head.replace('<!--HEAD-->','').strip()
body=body.strip()
standalone=('<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="theme-color" content="#070914">\n'+head+'\n</head>\n<body>\n'+body+'\n</body>\n</html>\n')
(ROOT/'index.html').write_text(standalone,encoding='utf-8')
(ROOT/'artifact.html').write_text(head+'\n'+body+'\n',encoding='utf-8')
have=[k for k,v in [('altar',img['altar'])]+list(img['card'].items())+list(img['burst'].items()) if v]
print('built index.html %.1f KB, artifact.html %.1f KB; images: %s'%(len(standalone.encode())/1024,len((head+body).encode())/1024,', '.join(have) or 'none (gradient fallback)'))
