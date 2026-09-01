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

Alongside OUTPUT.glb this also writes OUTPUT.views.json: a camera-framing
manifest keyed by IFC class ("IfcWall" -> centre + radius of every wall in the
model, in the same transformed coordinate space as the GLB) and, for a curated
set of classes worth navigating at the instance level (fixtures, furniture),
by cleaned type name ("Sink - Bathroom" -> centre + radius of every sink). A
caller — the Services model explorer — uses this to fly the camera to "the
walls" or "the bathroom sinks" without knowing anything about the model either.
"""

import argparse
import json
import os
from collections import defaultdict

import numpy as np

import ifcopenshell
import ifcopenshell.geom

# Anything without an explicit IFC colour gets the kit's steel grey.
DEFAULT_RGBA = (0.42, 0.49, 0.58, 1.0)

# Classes worth a camera preset by instance type, not just by IFC class — a
# named fixture or furniture piece is a meaningful "click and see it" target;
# an assembly's individual bolts and plates are not.
TYPE_LEVEL_CLASSES = {"IfcFlowTerminal", "IfcFurnishingElement", "IfcDistributionPort"}


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


def type_family(name):
    """'Sink - Bathroom (2):Sink - Bathroom 200:1077929' -> 'Sink - Bathroom (2)'."""
    if not name:
        return None
    return name.split(":")[0].strip() or None


def convert(src, dst, deflection):
    model = ifcopenshell.open(src)
    settings = ifcopenshell.geom.settings()
    settings.set("use-world-coords", True)
    settings.set("weld-vertices", True)
    settings.set("mesher-linear-deflection", deflection)

    groups = defaultdict(lambda: {"v": [], "f": [], "n": 0})
    # Raw-space (untransformed) per-element bounding boxes, one entry per
    # element — cheap to keep even for a model with thousands of parts, unlike
    # keeping every vertex. Transformed into the GLB's coordinate space, and
    # trimmed of outsized elements, at the end.
    by_class = defaultdict(list)
    by_type = defaultdict(list)
    type_class = {}

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
            elo, ehi = verts.min(axis=0), verts.max(axis=0)
            by_class[shape.type].append((elo, ehi))
            fam = type_family(shape.name)
            if shape.type in TYPE_LEVEL_CLASSES and fam:
                by_type[fam].append((elo, ehi))
                type_class[fam] = shape.type

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

    def transform_bbox(blo, bhi):
        """8 corners of a raw-space bbox, through the same centre+rotate the
        mesh gets, back down to a transformed-space centre + radius."""
        corners = np.array(np.meshgrid(*zip(blo, bhi))).T.reshape(-1, 3)
        tc = (corners - centre) @ z_to_y.T
        tlo, thi = tc.min(axis=0), tc.max(axis=0)
        return ((tlo + thi) / 2.0), float(np.linalg.norm(thi - tlo) / 2.0)

    def views_of(bucket, min_n=1):
        # A class can mix normal building elements with a handful of huge
        # site/civil ones — a lawn or a road slab sharing IfcSlab with every
        # floor plate — that would blow the whole class's frame out past the
        # building. Drop elements whose own bounding diagonal dwarfs the
        # class's typical one before combining, rather than trusting every
        # element's extent equally.
        out = {}
        for key, boxes in bucket.items():
            if len(boxes) < min_n:
                continue
            diags = np.array([np.linalg.norm(hi - lo) for lo, hi in boxes])
            median = float(np.median(diags))
            keep = [b for b, d in zip(boxes, diags) if median <= 0 or d <= 4 * median]
            if not keep:
                keep = boxes
            los = np.vstack([b[0] for b in keep])
            his = np.vstack([b[1] for b in keep])
            c, r = transform_bbox(los.min(axis=0), his.max(axis=0))
            out[key] = {"center": [round(float(x), 3) for x in c],
                        "radius": round(max(r, 0.3), 3), "count": len(boxes)}
            if key in type_class:
                out[key]["ifcClass"] = type_class[key]
        return out

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

    views = {
        "whole": {"center": [0.0, 0.0, 0.0], "radius": round(radius, 3)},
        "byClass": views_of(by_class),
        # A type is only worth its own preset once there are few enough of it
        # to actually be "the sinks" rather than a generic scatter — five
        # bathroom sinks is a place to look; four hundred bolts is not.
        "byType": views_of(by_type, min_n=1),
    }
    views_path = os.path.splitext(dst)[0] + ".views.json"
    with open(views_path, "w") as f:
        json.dump(views, f, indent=1)

    size = os.path.getsize(dst) / 1e6
    ext = (hi - lo)
    print(f"{os.path.basename(dst)}: {elements} elements, {tris} triangles, "
          f"{len(groups)} colour groups, {size:.1f} MB")
    print(f"    frame radius {radius:.1f} m, extent "
          f"{ext[0]:.1f} x {ext[1]:.1f} x {ext[2]:.1f} m (w x d x h, IFC axes)")
    print(f"    {os.path.basename(views_path)}: {len(views['byClass'])} classes, "
          f"{len(views['byType'])} named types")
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
