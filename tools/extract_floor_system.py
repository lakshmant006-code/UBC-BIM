#!/usr/bin/env python3
"""Cut one floor system out of a timber-frame IFC as a web-ready GLB.

The Services page "Explore in 3D" row has wall panels and roof trusses; the
director asked for floor trusses too. The Millbrook Plots 20 & 21 model
carries a real first-floor deck: Posi-Joist metal-web floor trusses, floor
beams, edge beams and Kerto-S joists, filed under its first-floor joist
storeys. This keeps only those elements (nothing else in the building), in
the same centred, Y-up form tools/ifc_to_glb.py produces, merged by colour.

    python3 tools/extract_floor_system.py INPUT.ifc OUTPUT.glb

Prints the model radius for the viewer's `radius` setting.
"""

import os
import re
import sys
from collections import defaultdict

import numpy as np
import ifcopenshell
import ifcopenshell.geom
import trimesh

NAME = re.compile(r"Posi_Joist|Floor_Beam|Floor_Edge_Beam|KertoS-Joist", re.I)
STOREY = re.compile(r"first floor joist", re.I)

# Timber floor members read as timber; the Posi-Joist steel webs are not
# separate IFC elements here, so everything takes one of two tones.
JOIST = (0.80, 0.66, 0.46, 1.0)
BEAM = (0.69, 0.53, 0.35, 1.0)


def main(src, dst):
    model = ifcopenshell.open(src)
    keep = []
    for e in model.by_type("IfcProduct"):
        if not NAME.search(e.Name or ""):
            continue
        rel = e.ContainedInStructure
        if rel and STOREY.search(rel[0].RelatingStructure.Name or ""):
            keep.append(e)
    if not keep:
        raise SystemExit("no first-floor joist elements found")

    s = ifcopenshell.geom.settings()
    s.set("use-world-coords", True)
    s.set("weld-vertices", True)
    groups = defaultdict(lambda: {"v": [], "f": [], "n": 0})
    it = ifcopenshell.geom.iterator(s, model, os.cpu_count() or 2, include=keep)
    if not it.initialize():
        raise SystemExit("no geometry")
    while True:
        sh = it.get()
        v = np.asarray(sh.geometry.verts, dtype=np.float64).reshape(-1, 3)
        f = np.asarray(sh.geometry.faces, dtype=np.int64).reshape(-1, 3)
        if len(v) and len(f):
            key = BEAM if re.search(r"beam", sh.name or "", re.I) else JOIST
            g = groups[key]
            g["v"].append(v)
            g["f"].append(f + g["n"])
            g["n"] += len(v)
        if not it.next():
            break

    allv = np.vstack([np.vstack(g["v"]) for g in groups.values()])
    lo, hi = allv.min(axis=0), allv.max(axis=0)
    centre = (lo + hi) / 2.0
    radius = float(np.linalg.norm(hi - lo) / 2.0)
    z_to_y = np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], dtype=np.float64)

    scene = trimesh.Scene()
    for i, (rgba, g) in enumerate(groups.items()):
        mesh = trimesh.Trimesh(vertices=(np.vstack(g["v"]) - centre) @ z_to_y.T,
                               faces=np.vstack(g["f"]), process=False)
        mesh.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            baseColorFactor=[int(round(c * 255)) for c in rgba],
            metallicFactor=0.0, roughnessFactor=0.8, doubleSided=True))
        scene.add_geometry(mesh, geom_name=f"part_{i:02d}")
    scene.export(dst)
    print(f"{len(keep)} elements, radius {radius:.2f} m, {os.path.getsize(dst) // 1024} KB -> {dst}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
