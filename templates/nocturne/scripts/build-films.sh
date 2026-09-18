#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
# Encode the ODORO films for SCRUBBING.
#
#   scripts/build-films.sh <flotte.mp4> <details.mp4>
#
# Two single-take films as rendered by Seedance (HEVC, 1920×1080, 24 fps).
#
# Why the settings are what they are:
#
# · -g 5 / -keyint_min 5 / -sc_threshold 0 — a keyframe every five frames.
#   Scrubbing means seeking on nearly every scroll frame, and a decoder asked
#   for a frame far from a keyframe has to decode everything in between. A
#   dense GOP costs bytes and buys a seek that lands immediately. This is the
#   single setting that decides whether the film feels attached to the wheel.
# · -crf 19 — night footage with large near-black areas and small bright
#   specular highlights is where banding shows first, and there is no bright
#   field to hide it in.
# · -an — there is no audio and there never will be.
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail

flotte=${1:?usage: build-films.sh <flotte.mp4> <details.mp4>}
details=${2:?usage: build-films.sh <flotte.mp4> <details.mp4>}
here=$(cd "$(dirname "$0")/.." && pwd)
out="$here/public/video"
assets="$here/public/assets"
mkdir -p "$out" "$assets"

encode() {
  local src=$1 name=$2 width=$3 crf=$4
  ffmpeg -v error -y -i "$src" \
    ${width:+-vf "scale=$width:-2"} \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf "$crf" -preset slow -g 5 -keyint_min 5 -sc_threshold 0 \
    -movflags +faststart -an \
    "$out/$name"
  echo "→ $name : $(du -h "$out/$name" | cut -f1)"
}

encode "$flotte"  "odoro-flotte.mp4"      ""    19
encode "$flotte"  "odoro-flotte-720.mp4"  1280  22
encode "$details" "odoro-details.mp4"     ""    19
encode "$details" "odoro-details-720.mp4" 1280  22

# Each poster IS frame 0 of its film, so the hero cannot disagree with the
# first frame the reader is handed.
ffmpeg -v error -y -i "$flotte"  -frames:v 1 -q:v 2 "$assets/film-poster.jpg"
ffmpeg -v error -y -i "$details" -frames:v 1 -q:v 2 "$assets/details-poster.jpg"
echo "→ posters : $(du -h "$assets/film-poster.jpg" | cut -f1), $(du -h "$assets/details-poster.jpg" | cut -f1)"
