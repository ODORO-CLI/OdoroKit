#!/usr/bin/env python3
"""
Pose (ou retire) le badge ODORO dans chaque Section.

    python3 odoro-badge.py            # injecte, ou remplace le badge existant
    python3 odoro-badge.py --remove   # retire proprement le badge de tous les fichiers

Le badge est délimité par des marqueurs ODORO-BADGE:START / :END, donc le script est
idempotent : le relancer remplace le bloc au lieu d'en empiler un second. Rien d'autre
dans les fichiers n'est touché.

Trois précautions dictées par ce que contiennent réellement ces Sections :

  pointer-events: none   plusieurs Sections se pilotent à la souris (mirror-hall,
                         slider-spectra, carousel-spotlight se tirent au drag). Un badge
                         qui intercepte le pointeur casserait le geste.
  z-index très haut      le maximum trouvé dans le lot est 200, sur les rideaux de loader.
                         Le badge passe au-dessus, y compris pendant le chargement.
  décalages par fichier  le coin haut-gauche est libre partout sauf deux fichiers, voir
                         OFFSETS plus bas.
"""

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

BRAND = "#F57423"

# Le coin haut-gauche est occupé dans ces deux fichiers, on descend le badge sous l'occupant.
#   loader-flowstate      : bouton de rejeu de développement, 30px de haut à partir de 14px
#   loader-gravity-webgl  : barre d'en-tête réelle, 80px de haut, 96px au-delà de 768px
OFFSETS = {
    "loader-flowstate.html": "58px",
    "loader-gravity-webgl.html": "clamp(96px, 11vh, 112px)",
}

START = "<!-- ODORO-BADGE:START -->"
END = "<!-- ODORO-BADGE:END -->"

STYLE = """{start}
<style>
  /* Badge de marque ODORO. Bloc autonome, retirable d'un bloc sans rien casser. */
  .odoro-badge {{
    position: fixed;
    top: var(--odoro-top, clamp(14px, 2.2vw, 26px));
    left: clamp(14px, 2.2vw, 26px);
    z-index: 2147483000;
    display: flex; align-items: center; gap: .24em;
    color: {brand};
    font: 600 clamp(15px, 1.45vw, 19px)/1 Poppins, "Nunito Sans", "Avenir Next",
          -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    letter-spacing: -.012em;
    /* Ne jamais intercepter le pointeur : plusieurs Sections se pilotent au drag. */
    pointer-events: none;
    user-select: none; -webkit-user-select: none;
  }}
  .odoro-badge svg {{ width: 1.45em; height: 1.45em; display: block; flex: none; }}
  .odoro-badge span {{ padding-bottom: .05em; }}
  @media (prefers-reduced-motion: reduce) {{ .odoro-badge {{ transition: none; }} }}
</style>
{end}"""

MARKUP = """{start}
<div class="odoro-badge" role="img" aria-label="Odoro">
  <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path d="M10 10 H50 A40 40 0 1 1 10 50 Z"
          fill="none" stroke="currentColor" stroke-width="14" stroke-linejoin="miter"/>
  </svg>
  <span>odoro</span>
</div>
{end}"""

BLOCK_RE = re.compile(
    re.escape(START) + r".*?" + re.escape(END) + r"\n?",
    re.DOTALL,
)


def targets():
    return sorted(p for p in HERE.glob("*.html"))


def strip(text):
    return BLOCK_RE.sub("", text)


def inject(path):
    text = path.read_text(encoding="utf-8")
    text = strip(text)

    style = STYLE.format(start=START, brand=BRAND, end=END)
    markup = MARKUP.format(start=START, end=END)

    # Décalage vertical propre au fichier, s'il en faut un.
    off = OFFSETS.get(path.name)
    if off:
        style = style.replace(
            ".odoro-badge {",
            ".odoro-badge { --odoro-top: %s;" % off,
            1,
        )

    if "</head>" not in text or "</body>" not in text:
        return False, "pas de </head> ou </body>"

    text = text.replace("</head>", style + "\n</head>", 1)
    text = text.replace("</body>", markup + "\n</body>", 1)
    path.write_text(text, encoding="utf-8")
    return True, "decale sous l'occupant du coin" if off else "coin haut-gauche"


def remove(path):
    text = path.read_text(encoding="utf-8")
    out = strip(text)
    if out == text:
        return False, "aucun badge"
    path.write_text(out, encoding="utf-8")
    return True, "retire"


def main():
    removing = "--remove" in sys.argv
    action = remove if removing else inject
    done = 0
    for path in targets():
        ok, note = action(path)
        if ok:
            done += 1
        print("%-32s %-4s %s" % (path.name, "ok" if ok else "--", note))
    print("---")
    print("%d fichier(s) %s" % (done, "nettoye(s)" if removing else "traite(s)"))


if __name__ == "__main__":
    main()
