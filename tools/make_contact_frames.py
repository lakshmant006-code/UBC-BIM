#!/usr/bin/env python3
"""Build the Contact page frame sequence from the two welcome clips.

Takes the two 15-second shots — met at the door, then walked into the studio —
joins them with a short crossfade and writes the JPEG sequences the Contact
scene scrubs:

    ui_kits/website/assets/seq-contact/f_001.jpg ...   1280px, desktop
    ui_kits/website/assets/seq-contact-m/f_001.jpg ... 640px,  phones

Usage:
    python3 tools/make_contact_frames.py CLIP_A.mp4 CLIP_B.mp4

Then set `count` on window.UBC_DATA.contactScene.seq (and .seqMobile) in
ui_kits/website/data.js to the number this prints, and re-check the card
`frame` numbers against the contact sheet it writes next to the sequence.
"""

import os
import shutil
import subprocess
import sys

import imageio_ffmpeg
from PIL import Image

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "ui_kits", "website", "assets", "seq-contact")
OUT_M = OUT + "-m"

FPS = 8            # frames per second of source -> 240 frames from 30s
WIDTH = 1280       # desktop frame width
WIDTH_M = 640      # phone frame width
QUALITY = 78
QUALITY_M = 72
XFADE = 0.6        # crossfade between the two shots, seconds


def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)


def duration(path):
    out = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise SystemExit("could not read duration of " + path)


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    a, b = sys.argv[1], sys.argv[2]
    for p in (a, b):
        if not os.path.exists(p):
            raise SystemExit("missing input: " + p)

    tmp = os.path.join(ROOT, ".contact-scene.tmp.mp4")
    offset = max(0.0, duration(a) - XFADE)
    # One continuous file: shot A, a short dissolve, shot B. The dissolve reads
    # as a cut you can scrub through rather than a jump.
    run([
        FFMPEG, "-y", "-i", a, "-i", b,
        "-filter_complex",
        f"[0:v][1:v]xfade=transition=fade:duration={XFADE}:offset={offset},format=yuv420p[v]",
        "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "slow", tmp,
    ])

    for out_dir, width, q in ((OUT, WIDTH, QUALITY), (OUT_M, WIDTH_M, QUALITY_M)):
        if os.path.isdir(out_dir):
            shutil.rmtree(out_dir)
        os.makedirs(out_dir)
        run([
            FFMPEG, "-y", "-i", tmp,
            "-vf", f"fps={FPS},scale={width}:-2:flags=lanczos",
            "-q:v", "3", os.path.join(out_dir, "f_%03d.png"),
        ])
        pngs = sorted(f for f in os.listdir(out_dir) if f.endswith(".png"))
        for f in pngs:
            src = os.path.join(out_dir, f)
            Image.open(src).convert("RGB").save(src[:-4] + ".jpg", "JPEG", quality=q, optimize=True)
            os.remove(src)
        print(f"{out_dir}: {len(pngs)} frames")

    os.remove(tmp)

    # Contact sheet, so the card `frame` numbers can be picked by eye.
    frames = sorted(f for f in os.listdir(OUT_M) if f.endswith(".jpg"))
    cols, thumb = 10, 160
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb, rows * (thumb * 9 // 16 + 14)), "white")
    for i, f in enumerate(frames):
        im = Image.open(os.path.join(OUT_M, f))
        im.thumbnail((thumb, thumb))
        sheet.paste(im, ((i % cols) * thumb, (i // cols) * (thumb * 9 // 16 + 14)))
    sheet_path = os.path.join(ROOT, "contact-contact-sheet.jpg")
    sheet.save(sheet_path, "JPEG", quality=80)
    print("contact sheet:", sheet_path)
    print("set contactScene.seq.count =", len(frames))


if __name__ == "__main__":
    main()
