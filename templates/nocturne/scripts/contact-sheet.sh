#!/usr/bin/env bash
# A contact sheet of the finished film — one frame per second, tiled, with the
# second burned into each tile.
#
#   scripts/contact-sheet.sh [dossier-de-sortie] [film]
#
# This is what the chapter timings in src/data/content.ts are measured against.
# Guessing where the camera parks produces copy that arrives mid-move, and a
# line that arrives mid-move reads as a mistake no amount of easing hides.
set -euo pipefail

here=$(cd "$(dirname "$0")/.." && pwd)
master=${2:-"$here/public/video/odoro-flotte.mp4"}
out=${1:-"$here/.film-sheet"}
[ -f "$master" ] || { echo "film introuvable — lancer build-films.sh d'abord" >&2; exit 1; }
mkdir -p "$out"

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$master")
echo "→ film de ${dur}s"

# One frame per second, five across. No timestamp is burned in — this ffmpeg
# is built without drawtext — so the grid IS the clock: sheet N, row R, column
# C is second (N-1)*20 + R*5 + C, counting from zero.
ffmpeg -v error -y -i "$master" \
  -vf "fps=1,scale=480:-1,tile=5x4" \
  "$out/sheet-%02d.jpg"

echo "→ 5 colonnes × 4 rangées = 20 secondes par planche"
echo "   seconde = (planche-1)*20 + rangée*5 + colonne, à partir de zéro"
ls "$out"
