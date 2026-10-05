"""Step 1 of the hero envelope: read the M2 (Mocking Bird Lot 2) source IFC
from the `mocking-bird-source` GitHub release and pickle every element's
world-space bounding box plus a sample of its vertices to els.pkl.

Usage: python tools/envelope_extract.py   (run next to "MOCKING BIRD LOT-2.ifc")
Then: python tools/build_envelope.py
"""
import ifcopenshell, ifcopenshell.geom, numpy as np, os, pickle, time
t0=time.time()
f=ifcopenshell.open('MOCKING BIRD LOT-2.ifc')
parent={}
for rel in f.by_type('IfcRelAggregates'):
    nm=rel.RelatingObject.Name or ''
    for o in rel.RelatedObjects: parent[o.GlobalId]=nm
st=ifcopenshell.geom.settings(); st.set('use-world-coords',True); st.set('weld-vertices',True); st.set('mesher-linear-deflection',0.01)
it=ifcopenshell.geom.iterator(st,f,os.cpu_count() or 2)
assert it.initialize()
els=[]; allv=[]
while True:
    sh=it.get(); g=sh.geometry
    v=np.asarray(g.verts,dtype=np.float64).reshape(-1,3)
    if len(v):
        els.append(dict(guid=sh.guid,type=sh.type,name=sh.name,parent=parent.get(sh.guid,''),lo=v.min(0),hi=v.max(0),
                        v=v[::max(1,len(v)//400)] ))
        allv.append(v[::7])
    if not it.next(): break
allv=np.vstack(allv)
lo,hi=np.percentile(allv,1,axis=0),np.percentile(allv,99,axis=0)
pickle.dump(dict(els=els,p1=lo,p99=hi),open('els.pkl','wb'))
print(len(els),'elements', round(time.time()-t0),'s', 'p1',lo.round(3),'p99',hi.round(3))
