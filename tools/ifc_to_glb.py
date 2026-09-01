#!/usr/bin/env python3
"""Convert an IFC model to a web-ready GLB for the Projects model viewer.

IFC files are large and parsing them in the browser needs a multi-megabyte WASM
build plus a long wait on a phone. Tessellating once here and shipping glTF
instead means the viewer is plain three.js and the model streams in as one
binary.

    python3 tools/ifc_to_glb.py INPUT.ifc OUTPUT.glb [--deflection 0.02]

Elements are tessellated in world coordinates and merged by colour, so a model
of ten thousand steel studs arrives as a handful of draw calls rather than ten
thousand. The mesh is recentred on its own footprint and Z-up IFC is rotated to
the Y-up glTF convention, so the viewer can frame any model without knowing
anything about it.
"""

import argparse
import os
import sys
from collections import defaultdict

import numpy as np

import ifcopenshell
import ifcopenshell.geom

# Anything without an explicit IFC colour gets the kit's steel grey.
DEFAULT_RGBA = (0.42, 0.49, 0.58, 1.0)


def rgba_of(material):
    """One IfcOpenShell surface style as an RGBA tuple."""
    if material is None:
        return DEFAULT_RGBA
    d = material.diffuse
    r, g, b = d.r(), d.g(), d.b()
    # A pure white default is what IfcOpenShell reports for unstyled geometry;
    # the kit's steel grey reads better than a flat white model.
    if (r, g, b) == (1.0, 1.0, 1.0):
        return DEFAULT_RGBA
    a = 1.0
    if material.has_transparency():
        t = material.transparency
        if t == t and 0.0 <= t <= 1.0:   # t == t rejects NaN
            a = 1.0 - t
    return (r, g, b, a)


def convert(src, dst, deflection):
    model = ifcopenshell.open(src)
    settings = ifcopenshell.geom.settings()
    settings.set("use-world-coords", True)
    settings.set("weld-vertices", True)
    settings.set("mesher-linear-deflection", deflection)

    groups = defaultdict(lambda: {"v": [], "f": [], "n": 0})
    it = ifcopenshell.geom.iterator(settings, model, os.cpu_count() or 2)
    if not it.initialize():
        raise SystemExit("no geometry in " + src)

    elements = 0
    while True:
        shape = it.get()
        geo = shape.geometry
        verts = np.asarray(geo.verts, dtype=np.float64).reshape(-1, 3)
        faces = np.asarray(geo.faces, dtype=np.int64).reshape(-1, 3)
        if len(verts) and len(faces):
            mats = geo.materials
            mids = np.asarray(geo.material_ids, dtype=np.int64)
            if len(mids) != len(faces):
                mids = np.full(len(faces), -1, dtype=np.int64)
            # A shape can carry several styles, one per face; split it so each
            # colour lands in its own group rather than the whole element
            # taking the colour of its first face.
            for mid in np.unique(mids):
                sub = faces[mids == mid]
                key = rgba_of(mats[mid] if 0 <= mid < len(mats) else None)
                g = groups[key]
                g["v"].append(verts)
                g["f"].append(sub + g["n"])
                g["n"] += len(verts)
            elements += 1
        if not it.next():
            break

    if not groups:
        raise SystemExit("nothing tessellated in " + src)

    import trimesh

    # One shared transform for every group: IFC is Z-up and often sits far from
    # the origin, glTF is Y-up and the viewer expects a centred model.
    #
    # Exports routinely carry a handful of strays — survey points, a grid, a
    # linked site — kilometres from the building, which would put the building
    # in a corner of its own bounding box. Centre and frame on the 1st-99th
    # percentile of vertices instead, so the building itself decides where the
    # camera looks. Nothing is discarded; the strays simply sit off-screen.
    allv = np.vstack([np.vstack(g["v"]) for g in groups.values()])
    lo, hi = np.percentile(allv, 1, axis=0), np.percentile(allv, 99, axis=0)
    centre = (lo + hi) / 2.0
    radius = float(np.linalg.norm(hi - lo) / 2.0)
    z_to_y = np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], dtype=np.float64)

    scene = trimesh.Scene()
    tris = 0
    for i, (rgba, g) in enumerate(groups.items()):
        v = (np.vstack(g["v"]) - centre) @ z_to_y.T
        f = np.vstack(g["f"])
        mesh = trimesh.Trimesh(vertices=v, faces=f, process=False)
        mesh.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(
                baseColorFactor=[int(round(c * 255)) for c in rgba],
                metallicFactor=0.15, roughnessFactor=0.75, doubleSided=True,
            )
        )
        scene.add_geometry(mesh, geom_name=f"part_{i:02d}")
        tris += len(f)

    scene.export(dst)
    size = os.path.getsize(dst) / 1e6
    ext = (hi - lo)
    print(f"{os.path.basename(dst)}: {elements} elements, {tris} triangles, "
          f"{len(groups)} colour groups, {size:.1f} MB")
    print(f"    frame radius {radius:.1f} m, extent "
          f"{ext[0]:.1f} x {ext[1]:.1f} x {ext[2]:.1f} m (w x d x h, IFC axes)")
    return size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--deflection", type=float, default=0.02,
                    help="mesher linear deflection in model units; larger is coarser and smaller")
    a = ap.parse_args()
    convert(a.src, a.dst, a.deflection)


if __name__ == "__main__":
    main()
