#!/usr/bin/env python3
"""
Dessine un bonhomme baton, a la main, pour remplacer la photo d'illustration.

Le trait est trace point par point avec un bruit lent : un simple jitter par
pixel donne un rendu velu, pas un rendu manuel. On perturbe donc la trajectoire
avec deux sinusoides dephasees dont la periode est longue devant l'epaisseur du
trait, ce qui produit une ligne qui ondule comme un geste plutot qu'une ligne
qui grelotte.

Chaque trait est repasse deux fois avec un decalage different, comme on repasse
un feutre : c'est ce doublage qui donne l'irregularite d'epaisseur.

Le fond reste transparent : la carte qui accueille l'image a son propre fond.
"""
import math
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

L, H = 842, 1025          # dimensions exactes de l'image remplacee
ENCRE = (28, 28, 30, 255)
random.seed(7)            # rendu reproductible


def trace(points, n=220):
    """Interpole une polyligne / courbe en un chemin dense, via Catmull-Rom."""
    if len(points) == 2:
        (x0, y0), (x1, y1) = points
        return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n + 1)]
    p = [points[0]] + list(points) + [points[-1]]
    sortie = []
    for i in range(len(p) - 3):
        p0, p1, p2, p3 = p[i], p[i + 1], p[i + 2], p[i + 3]
        for j in range(n):
            t = j / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t
                       + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                       + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t
                       + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                       + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            sortie.append((x, y))
    return sortie


def main(chemin, epaisseur=13, amplitude=3.4):
    """Repasse chaque trait deux fois, avec un tremble different a chaque passe."""
    img = Image.new("RGBA", (L, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def trait(points, ep=None, passes=2, tremble=1.0):
        """`tremble` attenue l'ondulation : un cercle la montre bien plus qu'un
        segment, une meme amplitude y devient du crenelage."""
        ep = ep or epaisseur
        base = trace(points)
        for k in range(passes):
            phase = random.uniform(0, math.tau)
            periode = random.uniform(55, 95) / max(tremble, 0.35)
            derive = random.uniform(-1.6, 1.6)
            ondule = []
            for i, (x, y) in enumerate(base):
                a = amplitude * tremble * (0.55 + 0.45 * math.sin(i / periode + phase))
                ondule.append((
                    x + a * math.sin(i / (periode * 0.6) + phase) + derive,
                    y + a * math.cos(i / (periode * 0.8) + phase * 1.3) + derive,
                ))
            d.line(ondule, fill=ENCRE, width=max(2, ep - k * 3), joint="curve")

    cx = L / 2

    # Tete — un cercle ferme, dessine comme un trait qui revient a son depart.
    r, ty = 118, 232
    cercle = [(cx + r * math.cos(a), ty + r * math.sin(a) * 1.06)
              for a in [i / 40 * math.tau for i in range(41)]]
    trait(cercle, ep=epaisseur, tremble=0.42)

    # Tronc, legerement penche : une verticale parfaite fait imprime, pas main.
    trait([(cx + 4, ty + r), (cx - 6, 690)])

    # Bras, en deux segments chacun pour un coude.
    trait([(cx + 2, 452), (cx - 150, 520), (cx - 232, 470)])
    trait([(cx + 2, 452), (cx + 158, 505), (cx + 246, 452)])

    # Jambes.
    trait([(cx - 6, 686), (cx - 96, 830), (cx - 128, 968)])
    trait([(cx - 6, 686), (cx + 92, 826), (cx + 132, 962)])

    # Pieds.
    trait([(cx - 128, 968), (cx - 196, 984)], ep=epaisseur - 2)
    trait([(cx + 132, 962), (cx + 200, 980)], ep=epaisseur - 2)

    # Visage : deux yeux et un sourire, minimalistes.
    for dx in (-42, 42):
        d.ellipse([cx + dx - 9, ty - 32 - 9, cx + dx + 9, ty - 32 + 9], fill=ENCRE)
    trait([(cx - 52, ty + 34), (cx, ty + 66), (cx + 52, ty + 34)],
          ep=epaisseur - 4, passes=1)

    # Un souffle de flou puis un seuil : le trait garde un bord legerement
    # irregulier, comme un feutre sur du papier, au lieu d'un bord vectoriel.
    alpha = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.7))
    img.putalpha(alpha.point(lambda v: 255 if v > 105 else int(v * 0.85)))

    img.save(chemin)
    print(f"ecrit {chemin}  {img.size}")


if __name__ == "__main__":
    main(sys.argv[1])
