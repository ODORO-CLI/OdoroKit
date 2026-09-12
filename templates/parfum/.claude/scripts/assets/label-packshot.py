"""Pose le vrai texte d'etiquette sur un packshot detoure.
usage: label.py in.png out.png "OMBRE D'OUD"
Detecte la zone creme (le papier) la plus grande dans le flacon, y dessine
ODORO + le nom en 3270, puis recadre en 1080x1080 sur transparence."""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
src, dst, name = sys.argv[1], sys.argv[2], sys.argv[3]
import os; FONT=os.path.join(os.path.dirname(__file__),"../../../src/app/fonts/3270-Regular.otf")
im=Image.open(src).convert("RGBA"); a=np.array(im).astype(int)
r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
# cream paper: bright, low saturation, warm, opaque
cream=(al>200)&(r>190)&(g>175)&(b>140)&((r-b)<70)&((np.maximum(r,np.maximum(g,b))-np.minimum(r,np.minimum(g,b)))<60)
lab,n=ndimage.label(cream)
if n==0: raise SystemExit("aucune zone creme trouvee")
# the label is a paper RECTANGLE: wider than tall, under a third of the bottle's
# height, dense (filled). A pale liquid can be cream too — that is what this rejects.
bys,bxs=np.where(al>8); bh=bys.max()-bys.min()
best=None
for k in range(1,n+1):
    ys,xs=np.where(lab==k)
    if len(xs)<400: continue
    w,h=xs.max()-xs.min()+1, ys.max()-ys.min()+1
    aspect=w/h; fill=len(xs)/(w*h)
    if not (1.15<=aspect<=2.4): continue
    if h>0.36*bh or fill<0.75: continue
    if best is None or len(xs)>best[0]: best=(len(xs),k)
if best is None:
    # Fallback: the four packshots share one framing, so the label sits where it
    # sits on its siblings. Mean rectangle of the three that detected cleanly.
    if len(sys.argv)<5: raise SystemExit("aucune etiquette plausible et pas de rectangle de repli")
    x0,y0,x1,y1=map(int,sys.argv[4].split(","))
    print("repli sur le rectangle des freres")
else:
    k=best[1]; ys,xs=np.where(lab==k); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
# shrink to the label's core (drop soft edges)
pad=int((x1-x0)*0.04); x0+=pad; x1-=pad; y0+=pad; y1-=pad
W,H=x1-x0,y1-y0
# the paper is opaque whatever the glass behind it was cut to — a pale liquid
# comes back semi-transparent from the background remover and the page's cream
# would otherwise wash the type out
a2=np.array(im); a2[y0:y1+1,x0:x1+1,3]=255; im=Image.fromarray(a2,"RGBA")
d=ImageDraw.Draw(im)
# repaint the paper flat, hairline in olive, then type
d.rectangle([x0,y0,x1,y1],fill=(239,224,205,255))
d.rectangle([x0+H*0.06,y0+H*0.06,x1-H*0.06,y1-H*0.06],outline=(96,117,86,128),width=max(1,int(H*0.012)))
def fit(text,maxw,px):
    f=ImageFont.truetype(FONT,px)
    while f.getlength(text)>maxw and px>6: px-=1; f=ImageFont.truetype(FONT,px)
    return f
f1=fit("ODORO",W*0.7,int(H*0.34)); f2=fit(name,W*0.8,int(H*0.14))
cx=(x0+x1)/2
d.text((cx,y0+H*0.40),"ODORO",font=f1,fill=(11,11,14,255),anchor="mm")
d.text((cx,y0+H*0.71),name,font=f2,fill=(11,11,14,255),anchor="mm")
# square crop on transparency
ys,xs=np.where(al>8); crop=im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
side=int(max(crop.size)*1.18); out=Image.new("RGBA",(side,side),(0,0,0,0))
out.paste(crop,((side-crop.width)//2,(side-crop.height)//2)); out.resize((1080,1080),Image.LANCZOS).save(dst)
print(f"{dst}: etiquette {W}x{H} a ({x0},{y0}) -> texte pose")
