# Walkthrough assets — drop-in slots

The scroll-scrubbed construction walkthrough (`VideoWalkthrough.jsx`, configured
in `data.js` under `window.UBC_DATA.walkthrough`) upgrades itself as you add
files here. Nothing else needs to change.

## 1. The video (primary)

Drop the finished clip at:

```
assets/walkthrough.mp4
```

- One continuous **16:9** clip, foundation → steel → sheathing → finished
  facade → living room → kitchen → open doors → backyard/pool.
- Web-friendly H.264 MP4, ideally faststart (`-movflags +faststart`).
- Keep it lean (target < ~15 MB) — the whole clip is scrubbed client-side, so a
  long GOP / high bitrate makes scrubbing stutter. 720p is plenty.
- When present, scroll position drives `video.currentTime` and the stills below
  are not shown.

## 2. The 9 stage frames (fallback + posters)

Until the video exists, these crossfade as you scroll. They also serve as the
video poster and as per-stage reference. Drop them at:

```
assets/frames/01-foundation.jpg      (03_17_02  Foundation poured)
assets/frames/02-steel-begins.jpg    (03_17_08  Steel framing begins)
assets/frames/03-steel-skeleton.jpg  (03_17_13  Full steel skeleton)
assets/frames/04-sheathing.jpg       (03_17_20  Sheathing + roof)
assets/frames/05-facade.jpg          (03_41_14  Finished facade — doorbell)
assets/frames/06-living-room.jpg     (03_19_34  Living room)
assets/frames/07-kitchen.jpg         (03_19_41  Kitchen / dining)
assets/frames/08-open-doors.jpg      (03_22_10  Open doors to pool)
assets/frames/09-backyard.jpg        (03_23_22  Backyard / pool)
```

16:9, same crop as the video. If a frame is missing, that stage renders a
brand-compliant labelled placeholder saying which file belongs there.

## Doorbell position

The bell hotspot sits on the finished-facade stage. Nudge it over the real door
by editing `bellX` / `bellY` in `data.js` (percentages of the frame).

## Timeline

Nine frames are evenly spaced (`t` 0.00 → 1.00) in `data.js`. To dwell longer on
a stage (e.g. the facade before entering), adjust its neighbours' `t` values.
