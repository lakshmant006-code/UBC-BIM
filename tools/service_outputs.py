#!/usr/bin/env python3
"""Sample output drawings for the Services page, all drawn from the Mocking
Bird Lot 2 model itself (nothing hand-drawn or invented):

  plan.png         floor plan: a horizontal cut through the house model at
                   1.2 m (walls, glazing, frames)
  elevation.png    south elevation: the house model seen square-on
  wall-panel.png   one wall panel's framing elevation (studs, tracks,
                   header) from the frame IFC, plus wall-panel.json, its
                   cut list (profile, length, quantity)
  truss.png        one scissor roof truss in elevation, member by member
  permit-sheet.png a sample sheet: plan + elevation in a title block

    python3 tools/service_outputs.py els.pkl envelope.glb OUT_DIR

els.pkl is tools/envelope_extract.py's output (per-element bounding boxes
and sampled vertices of the frame IFC); envelope.glb is the house model
(public/assets/models/mocking-bird-lot-2-envelope.glb), whose coordinates
are the frame's, centred on the frame bounding box.
"""
import json
import os
import pickle
import sys
from collections import Counter

import numpy as np
import trimesh
from scipy.spatial import ConvexHull
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MPoly, Rectangle
from matplotlib.collections import PolyCollection, LineCollection

INK, MUTED, ACCENT, STEEL, GLASS = "#101215", "#5A6069", "#D7331E", "#3C4A5A", "#5B8DB8"
plt.rcParams.update({"font.family": "DejaVu Sans Mono", "font.size": 9, "text.color": INK, "axes.edgecolor": INK})


def hull(pts):
    pts = np.unique(np.round(pts, 4), axis=0)
    if len(pts) < 3:
        return pts
    try:
        return pts[ConvexHull(pts).vertices]
    except Exception:
        return pts


def label(ax, xy, text, xytext, ha="left"):
    ax.annotate(text, xy=xy, xytext=xytext, ha=ha, va="center", fontsize=8.5, color=INK,
                arrowprops=dict(arrowstyle="-", color=ACCENT, lw=0.9, shrinkA=0, shrinkB=2))
    ax.plot(*xy, "o", ms=3.5, color=ACCENT)


def dim(ax, a, b, off, text, vertical=False):
    if vertical:
        x = off
        ax.plot([x, x], [a, b], color=MUTED, lw=0.7)
        for y in (a, b):
            ax.plot([x - 0.08, x + 0.08], [y - 0.08, y + 0.08], color=MUTED, lw=0.7)
        ax.text(x - 0.15, (a + b) / 2, text, rotation=90, ha="right", va="center", fontsize=8, color=MUTED)
    else:
        y = off
        ax.plot([a, b], [y, y], color=MUTED, lw=0.7)
        for x in (a, b):
            ax.plot([x - 0.08, x + 0.08], [y - 0.08, y + 0.08], color=MUTED, lw=0.7)
        ax.text((a + b) / 2, y - 0.15, text, ha="center", va="top", fontsize=8, color=MUTED)


def ft_in(m):
    inches = int(round(m / 0.0254))
    return "%d'-%d\"" % (inches // 12, inches % 12)


def save(fig, path):
    fig.savefig(path, dpi=160, facecolor="white", bbox_inches="tight", pad_inches=0.15)
    plt.close(fig)


def load_envelope(path):
    sc = trimesh.load(path)
    parts = {}
    for name, g in sc.geometry.items():
        mat = getattr(g.visual, "material", None)
        key = getattr(mat, "name", None) or name
        parts[key] = g
    return parts


def plan(parts, out, ax=None):
    own = ax is None
    if own:
        fig, ax = plt.subplots(figsize=(9, 6.2))
    style = {"siding": (INK, 2.2), "trim": (INK, 0.6), "glass": (GLASS, 1.6), "window_frame": (MUTED, 0.6),
             "door": (INK, 1.2), "door_frame": (MUTED, 0.6), "chimney": (INK, 2.2)}
    allxy = []
    for key, (col, lw) in style.items():
        g = parts.get(key)
        if g is None:
            continue
        # GLB is Y-up; cut at 1.2 m above the slab top (y = -0.05 in raw z).
        y0 = g.vertices[:, 1].min() if key == "siding" else None
        segs = trimesh.intersections.mesh_plane(g, plane_normal=[0, 1, 0], plane_origin=[0, CUT_Y, 0])
        if len(segs) == 0:
            continue
        xy = segs[:, :, [0, 2]] * np.array([1, -1])   # plan: x right, raw y up
        ax.add_collection(LineCollection(xy, colors=col, linewidths=lw))
        allxy.append(xy.reshape(-1, 2))
    slab = parts.get("slab")
    if slab is not None:
        segs = trimesh.intersections.mesh_plane(slab, plane_normal=[0, 1, 0], plane_origin=[0, slab.vertices[:, 1].max() - 0.01, 0])
        if len(segs):
            ax.add_collection(LineCollection(segs[:, :, [0, 2]] * np.array([1, -1]), colors="#B8B3A8", linewidths=0.8, linestyles="--"))
    pts = np.vstack(allxy)
    lo, hi = pts.min(0), pts.max(0)
    dim(ax, lo[0], hi[0], lo[1] - 0.9, "%.2f m  (%s)" % (hi[0] - lo[0], ft_in(hi[0] - lo[0])))
    dim(ax, lo[1], hi[1], lo[0] - 0.9, "%.2f m  (%s)" % (hi[1] - lo[1], ft_in(hi[1] - lo[1])), vertical=True)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_xlim(lo[0] - 1.8, hi[0] + 0.6); ax.set_ylim(lo[1] - 1.6, hi[1] + 0.6)
    if own:
        ax.text(lo[0] - 1.8, hi[1] + 0.9, "FLOOR PLAN  ·  cut at 1.2 m  ·  Mocking Bird Lot 2", fontsize=10, weight="bold")
        save(fig, out)


def elevation(parts, out, ax=None):
    own = ax is None
    if own:
        fig, ax = plt.subplots(figsize=(9, 4.2))
    colours = {"siding": "#ECE8DF", "trim": "#FBFBF8", "fascia": "#FBFBF8", "roof": "#5D6570", "glass": "#A9BFD2",
               "window_frame": "#F2F2EF", "door": "#2F3A45", "door_frame": "#F2F2EF", "chimney": "#A5644E", "slab": "#C9C7C1"}
    polys, cols, depth = [], [], []
    light = np.array([0.35, 0.8, 0.5]); light /= np.linalg.norm(light)
    for key, g in parts.items():
        base = np.array(matplotlib.colors.to_rgb(colours.get(key, "#DDDDDD")))
        tri = g.vertices[g.faces]
        n = g.face_normals
        keep = n[:, 2] > 0.05                       # faces turned towards a viewer on the south (+z)
        tri, n = tri[keep], n[keep]
        shade = 0.72 + 0.28 * np.clip(n @ light, 0, 1)
        polys.append(tri[:, :, [0, 1]]); depth.append(tri[:, :, 2].mean(1))
        cols.append(np.clip(base[None, :] * shade[:, None], 0, 1))
    polys, cols, depth = np.vstack(polys), np.vstack(cols), np.concatenate(depth)
    order = np.argsort(depth)
    ax.add_collection(PolyCollection(polys[order], facecolors=cols[order], edgecolors=cols[order], linewidths=0.3))
    lo, hi = polys.reshape(-1, 2).min(0), polys.reshape(-1, 2).max(0)
    ax.plot([lo[0] - 0.5, hi[0] + 0.5], [lo[1], lo[1]], color=INK, lw=1.2)
    dim(ax, lo[1], hi[1], lo[0] - 0.6, "%.2f m" % (hi[1] - lo[1]), vertical=True)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_xlim(lo[0] - 1.3, hi[0] + 0.5); ax.set_ylim(lo[1] - 0.4, hi[1] + 0.3)
    if own:
        ax.text(lo[0] - 1.3, hi[1] + 0.6, "SOUTH ELEVATION  ·  Mocking Bird Lot 2", fontsize=10, weight="bold")
        save(fig, out)


def wall_panel(els, out_png, out_json, along=1, at=3.55, span=(17.4, 23.2), title="west wall"):
    LO = np.array([e["lo"] for e in els]); HI = np.array([e["hi"] for e in els]); C = (LO + HI) / 2
    T = np.array([e["type"] for e in els])
    sel = [i for i in range(len(els)) if T[i] in ("IfcColumn", "IfcBeam", "IfcMember")
           and abs(C[i, 1 - along] - at) < 0.25 and span[0] < C[i, along] < span[1] and LO[i, 2] > -0.2 and HI[i, 2] < 3.4]
    fig, ax = plt.subplots(figsize=(9, 4.6))
    rows = Counter()
    for i in sel:
        v = els[i]["v"]
        poly = hull(v[:, [along, 2]])
        ext = HI[i] - LO[i]
        vertical = ext[2] >= max(ext[along], 0.01)
        col = STEEL if vertical else "#5E7186"
        ax.add_patch(MPoly(poly, closed=True, facecolor=col, edgecolor="white", lw=0.25))
        length = float(ext[2] if vertical else ext[along])
        kind = "Stud" if vertical and ext[2] > 2.0 else ("Cripple / jack" if vertical else ("Track / header" if ext[along] > 0.6 else "Blocking / bridging"))
        rows[(kind, els[i]["name"], int(round(length * 1000 / 5) * 5))] += 1
    x0, x1 = LO[sel, along].min(), HI[sel, along].max(); z1 = HI[sel, 2].max()
    dim(ax, x0, x1, -0.35, "%.2f m  (%s)" % (x1 - x0, ft_in(x1 - x0)))
    dim(ax, 0, z1, x0 - 0.35, "%.2f m" % z1, vertical=True)
    studs = sorted(C[i, along] for i in sel if (HI[i, 2] - LO[i, 2]) > 2.0)
    gaps = np.diff(studs); typical = np.median(gaps[(gaps > 0.25) & (gaps < 0.7)]) if len(gaps) else 0
    ax.set_aspect("equal"); ax.axis("off"); ax.set_xlim(x0 - 0.9, x1 + 0.3); ax.set_ylim(-0.75, z1 + 0.55)
    profiles = " / ".join(sorted({els[i]["name"] for i in sel}))
    ax.text(x0 - 0.9, z1 + 0.35, "WALL PANEL ELEVATION  \u00b7  %s, %s  \u00b7  studs at %d mm (%d\") typical"
            % (title, profiles, round(typical * 1000), round(typical / 0.0254)), fontsize=10, weight="bold")
    save(fig, out_png)
    table = [{"member": k[0], "profile": k[1], "length_mm": k[2], "qty": n} for k, n in sorted(rows.items(), key=lambda kv: (-kv[0][2], kv[0][0]))]
    json.dump({"pieces": len(sel), "rows": table}, open(out_json, "w"), indent=1)


def truss(els, out, station=12.51):
    LO = np.array([e["lo"] for e in els]); HI = np.array([e["hi"] for e in els]); C = (LO + HI) / 2
    sel = [i for i in range(len(els)) if abs(C[i, 0] - station) < 0.05 and LO[i, 2] > 2.85 and 19.9 < C[i, 1] < 25.2
           and els[i]["type"] in ("IfcColumn", "IfcBeam", "IfcMember")]
    fig, ax = plt.subplots(figsize=(9, 3.6))
    for i in sel:
        poly = hull(els[i]["v"][:, [1, 2]])
        ax.add_patch(MPoly(poly, closed=True, facecolor=STEEL, edgecolor="white", lw=0.3))
    y0, y1 = LO[sel, 1].min(), HI[sel, 1].max(); z0, z1 = LO[sel, 2].min(), HI[sel, 2].max()
    ax.plot([y0 - 0.3, y0 + 0.35], [z0, z0], color=MUTED, lw=3); ax.plot([y1 - 0.35, y1 + 0.3], [z0, z0], color=MUTED, lw=3)
    dim(ax, y0, y1, z0 - 0.25, "span %.2f m  (%s)" % (y1 - y0, ft_in(y1 - y0)))
    dim(ax, z0, z1, y1 + 0.55, "rise %.2f m" % (z1 - z0), vertical=True)
    mid = (y0 + y1) / 2
    label(ax, (y0 + 0.9, 3.15 + 0.5 * 0.93), "Top chord  6:12", (y0 - 0.2, z1 + 0.05), ha="left")
    yb = y0 + 1.6
    label(ax, (yb, 2.92 + 0.511 * (yb - 20.27)), "Scissor bottom chord", (mid, 3.2), ha="center")
    label(ax, (mid + 0.95, 3.75), "Webs", (mid + 1.7, z1 - 0.05))
    label(ax, (mid, z1 - 0.02), "Ridge", (mid + 0.5, z1 + 0.25))
    ax.set_aspect("equal"); ax.axis("off"); ax.set_xlim(y0 - 0.6, y1 + 0.9); ax.set_ylim(z0 - 0.6, z1 + 0.5)
    ax.text(y0 - 0.6, z1 + 0.42, "ROOF TRUSS T1  ·  scissor truss, 350S162-43  ·  24\" o.c.", fontsize=10, weight="bold")
    save(fig, out)


def permit_sheet(parts, out):
    fig = plt.figure(figsize=(11, 7.6))
    fig.patch.set_facecolor("white")
    frame = fig.add_axes([0.02, 0.02, 0.96, 0.96]); frame.axis("off")
    frame.add_patch(Rectangle((0, 0), 1, 1, fill=False, lw=1.6, edgecolor=INK, transform=frame.transAxes))
    frame.add_patch(Rectangle((0.78, 0), 0.22, 1, fill=False, lw=1.0, edgecolor=INK, transform=frame.transAxes))
    tb = [("PROJECT", "MOCKING BIRD LOT 2"), ("SHEET", "A-101"), ("TITLE", "FLOOR PLAN &\nSOUTH ELEVATION"), ("SCALE", "AS SHOWN"),
          ("DRAWN FROM", "COORDINATED BIM MODEL"), ("STATUS", "SAMPLE — NOT FOR\nCONSTRUCTION")]
    for k, (h, v) in enumerate(tb):
        y = 0.95 - k * 0.15
        frame.text(0.795, y, h, fontsize=7, color=MUTED, transform=frame.transAxes)
        frame.text(0.795, y - 0.035, v, fontsize=9.5, weight="bold", va="top", transform=frame.transAxes)
        frame.plot([0.78, 1.0], [y - 0.1, y - 0.1], color=INK, lw=0.5, transform=frame.transAxes)
    frame.text(0.795, 0.04, "UBC BIM", fontsize=14, weight="bold", transform=frame.transAxes)
    a1 = fig.add_axes([0.05, 0.36, 0.7, 0.58]); plan(parts, None, ax=a1)
    a1.text(0.0, 1.0, "1  FLOOR PLAN", transform=a1.transAxes, fontsize=9, weight="bold")
    a2 = fig.add_axes([0.05, 0.05, 0.7, 0.28]); elevation(parts, None, ax=a2)
    a2.text(0.0, 1.0, "2  SOUTH ELEVATION", transform=a2.transAxes, fontsize=9, weight="bold")
    fig.savefig(out, dpi=150, facecolor="white")
    plt.close(fig)


CUT_Y = 0.0


def main(els_path, glb_path, out_dir):
    global CUT_Y
    os.makedirs(out_dir, exist_ok=True)
    els = pickle.load(open(els_path, "rb"))["els"]
    for e in els:
        e["v"] = np.asarray(e["v"], dtype=float)
    parts = load_envelope(glb_path)
    floor = min(g.vertices[:, 1].min() for k, g in parts.items() if k == "siding")
    CUT_Y = floor + 0.05 + 1.2
    plan(parts, os.path.join(out_dir, "plan.png"))
    elevation(parts, os.path.join(out_dir, "elevation.png"))
    wall_panel(els, os.path.join(out_dir, "wall-panel.png"), os.path.join(out_dir, "wall-panel.json"))
    truss(els, os.path.join(out_dir, "truss.png"))
    permit_sheet(parts, os.path.join(out_dir, "permit-sheet.png"))
    print("written to", out_dir)


if __name__ == "__main__":
    main(*sys.argv[1:4])
