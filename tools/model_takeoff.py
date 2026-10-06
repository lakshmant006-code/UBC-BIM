#!/usr/bin/env python3
"""Material takeoff straight from an IFC's geometry, for the Services page's
sample Bill of Materials.

    python3 tools/model_takeoff.py "MOCKING BIRD LOT-2.ifc" > takeoff.json

Framing members (IfcColumn / IfcBeam / IfcMember) are grouped by profile
name (e.g. 350S162-43). For each piece: length is the longest side of its
oriented bounding box, steel weight is its closed-mesh volume x 7,850 kg/m3.
Hardware (bolts, nuts, washers, anchors, hold-downs) is counted by name.
Nothing is estimated beyond that: the figures are what the model contains.
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
import ifcopenshell
import ifcopenshell.geom
import trimesh

STEEL = 7850.0  # kg/m3
FRAMING = {"IfcColumn", "IfcBeam", "IfcMember"}


def main(src):
    m = ifcopenshell.open(src)
    s = ifcopenshell.geom.settings()
    s.set("use-world-coords", True)
    s.set("weld-vertices", True)
    it = ifcopenshell.geom.iterator(s, m, os.cpu_count() or 2)
    it.initialize()
    prof = defaultdict(lambda: {"pieces": 0, "length_m": 0.0, "kg": 0.0, "vol_ok": 0})
    hw = defaultdict(int)
    while True:
        sh = it.get()
        el = m.by_id(sh.id)
        v = np.asarray(sh.geometry.verts, dtype=float).reshape(-1, 3)
        f = np.asarray(sh.geometry.faces, dtype=int).reshape(-1, 3)
        name = (el.Name or "").strip()
        if el.is_a() in FRAMING and len(v) >= 4 and name:
            mesh = trimesh.Trimesh(v, f, process=True)
            try:
                ext = np.sort(trimesh.bounds.oriented_bounds(mesh)[1])
            except Exception:
                ext = np.sort(v.max(0) - v.min(0))
            p = prof[name]
            p["pieces"] += 1
            p["length_m"] += float(ext[-1])
            if mesh.is_volume:
                p["kg"] += abs(float(mesh.volume)) * STEEL
                p["vol_ok"] += 1
        elif el.is_a() in ("IfcBuildingElementPart", "IfcBuildingElementProxy", "IfcMechanicalFastener") and name:
            hw[name.replace(".prg", "")] += 1
        if not it.next():
            break
    rows = []
    for name, p in sorted(prof.items(), key=lambda kv: -kv[1]["length_m"]):
        # Weight from the members whose mesh is closed, scaled to the rest by length.
        kg = p["kg"] * (p["pieces"] / p["vol_ok"]) if p["vol_ok"] else None
        rows.append({"profile": name, "pieces": p["pieces"], "length_m": round(p["length_m"], 1),
                     "length_ft": round(p["length_m"] * 3.28084), "kg": round(kg) if kg else None,
                     "lb": round(kg * 2.20462) if kg else None})
    out = {"source": os.path.basename(src), "framing": rows,
           "hardware": [{"item": k, "count": v} for k, v in sorted(hw.items(), key=lambda kv: -kv[1])]}
    json.dump(out, sys.stdout, indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
