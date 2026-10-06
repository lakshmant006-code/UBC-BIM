#!/usr/bin/env python3
"""Cut a few bays of real roof trusses, with the walls they bear on, out of a
whole-building IFC, for the Services page's "Roof trusses" model.

    python3 tools/extract_truss_section.py "MOCKING BIRD LOT-2.ifc" \\
        public/assets/models/m2-roof-trusses.glb --x 11.15 13.9

Every element whose bounding box meets the box (x range on the command line;
y and z default to the whole building) is tessellated in world coordinates
and trimmed to the x range, so long members that run past it (top tracks,
headers, bracing) end cleanly at the cut instead of being dropped. The
output uses the same colour grouping, centring (1st-99th percentile) and
Z-up to Y-up rotation as tools/ifc_to_glb.py, and prints each element's
centre in the GLB's own coordinates as JSON (OUTPUT.elements.json) so
hotspots can be placed on real members.
"""
import argparse
import json
import os
import sys
from collections import defaultdict

import numpy as np
import ifcopenshell
import ifcopenshell.geom
import trimesh

sys.path.insert(0, os.path.dirname(__file__))
from ifc_to_glb import rgba_of  # noqa: E402

Z2Y = np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], dtype=np.float64)


def clip_x(verts, faces, x0, x1):
    m = trimesh.Trimesh(verts, faces, process=False)
    for origin, normal in (([x0, 0, 0], [1, 0, 0]), ([x1, 0, 0], [-1, 0, 0])):
        if m.bounds[0][0] >= origin[0] if normal[0] > 0 else m.bounds[1][0] <= origin[0]:
            continue
        m = trimesh.intersections.slice_mesh_plane(m, plane_normal=normal, plane_origin=origin, cap=False)
        if m is None or len(m.faces) == 0:
            return None
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--x", nargs=2, type=float, required=True, metavar=("X0", "X1"))
    ap.add_argument("--y", nargs=2, type=float, default=(-1e9, 1e9))
    ap.add_argument("--z", nargs=2, type=float, default=(-1e9, 1e9))
    a = ap.parse_args()
    (x0, x1), (y0, y1), (z0, z1) = a.x, a.y, a.z

    model = ifcopenshell.open(a.src)
    s = ifcopenshell.geom.settings()
    s.set("use-world-coords", True)
    s.set("weld-vertices", True)
    it = ifcopenshell.geom.iterator(s, model, os.cpu_count() or 2)
    it.initialize()

    groups = defaultdict(lambda: {"v": [], "f": [], "n": 0})
    elems = []
    while True:
        sh = it.get()
        g = sh.geometry
        v = np.asarray(g.verts, dtype=np.float64).reshape(-1, 3)
        f = np.asarray(g.faces, dtype=np.int64).reshape(-1, 3)
        if len(v) and len(f):
            lo, hi = v.min(0), v.max(0)
            if hi[0] > x0 and lo[0] < x1 and hi[1] > y0 and lo[1] < y1 and hi[2] > z0 and lo[2] < z1:
                mids = np.asarray(g.material_ids, dtype=np.int64)
                if len(mids) != len(f):
                    mids = np.full(len(f), -1, dtype=np.int64)
                kept = False
                for mid in np.unique(mids):
                    m = clip_x(v, f[mids == mid], x0, x1)
                    if m is None:
                        continue
                    key = rgba_of(g.materials[mid] if 0 <= mid < len(g.materials) else None)
                    gr = groups[key]
                    gr["v"].append(np.asarray(m.vertices)); gr["f"].append(np.asarray(m.faces) + gr["n"]); gr["n"] += len(m.vertices)
                    kept = True
                if kept:
                    el = model.by_id(sh.id)
                    elems.append({"guid": el.GlobalId, "type": el.is_a(), "name": el.Name or "",
                                  "lo": np.maximum(lo, [x0, -1e9, -1e9]).tolist(), "hi": np.minimum(hi, [x1, 1e9, 1e9]).tolist()})
        if not it.next():
            break

    allv = np.vstack([np.vstack(g["v"]) for g in groups.values()])
    lo, hi = np.percentile(allv, 1, axis=0), np.percentile(allv, 99, axis=0)
    centre = (lo + hi) / 2.0
    radius = float(np.linalg.norm(hi - lo) / 2.0)
    scene = trimesh.Scene()
    tris = 0
    for i, (rgba, g) in enumerate(groups.items()):
        v = (np.vstack(g["v"]) - centre) @ Z2Y.T
        f = np.vstack(g["f"])
        mesh = trimesh.Trimesh(v, f, process=False)
        mat = trimesh.visual.material.PBRMaterial(baseColorFactor=[int(c * 255) for c in rgba], metallicFactor=0.1, roughnessFactor=0.7,
                                                  doubleSided=True, alphaMode="BLEND" if rgba[3] < 1 else None)
        mesh.visual = trimesh.visual.TextureVisuals(material=mat)
        scene.add_geometry(mesh, geom_name="part_%02d" % i)
        tris += len(f)
    open(a.dst, "wb").write(trimesh.exchange.gltf.export_glb(scene))
    for e in elems:
        c = (np.array(e["lo"]) + np.array(e["hi"])) / 2.0
        e["glb_centre"] = ((c - centre) @ Z2Y.T).round(3).tolist()
    meta = os.path.splitext(a.dst)[0] + ".elements.json"
    json.dump({"centre_raw": centre.tolist(), "radius": radius, "elements": elems}, open(meta, "w"))
    print(f"{os.path.basename(a.dst)}: {len(elems)} elements, {tris} triangles, {os.path.getsize(a.dst) / 1e6:.1f} MB, radius {radius:.2f}")


if __name__ == "__main__":
    main()
