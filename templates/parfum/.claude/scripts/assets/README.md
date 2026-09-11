# Scripts d'assets

- `label-packshot.py` — écrit la vraie étiquette (ODORO + nom, police 3270) sur un
  packshot détouré à étiquette vierge, puis recadre en 1080×1080 sur transparence.
  Dépend de Pillow, numpy et scipy. Sources dans `assets-source/packshots/`.
  Usage : `python3 .claude/scripts/assets/label-packshot.py src.webp public/assets/collections/flacon-x.png "NOM" [x0,y0,x1,y1]`
