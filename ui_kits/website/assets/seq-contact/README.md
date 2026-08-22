# Contact scene frames

`ContactScene.jsx` scrubs a JPEG sequence from this folder as you scroll:

- `seq-contact/f_001.jpg …` — 1280px wide, desktop
- `seq-contact-m/f_001.jpg …` — 640px wide, phones

Both are generated from the two welcome clips by:

```
python3 tools/make_contact_frames.py CLIP_A.mp4 CLIP_B.mp4
```

`CLIP_A` is the shot outside the studio (greeting and handshake at the door),
`CLIP_B` is the walk through the open-plan studio to the model table. The
script writes both sequences plus a contact sheet, and prints the frame count
to set on `window.UBC_DATA.contactScene.seq.count` in `data.js`.

Until the frames are here the scene removes itself and the Contact page renders
without it — nothing else needs changing.
