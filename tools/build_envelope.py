"""Step 2 of the hero envelope: build the architectural model of the M2 house
(public/assets/models/mocking-bird-lot-2-envelope.glb) from els.pkl.

Walls come from the floor-standing stud lines; an opening is a gap between
full-height studs bridged by a header (a sill below makes it a window, no sill
a door; wide doors become sliding glass). Exterior faces are found against
the roof footprint. The roof follows the trusses/joists (gap-closed, then a
local plane fit so each slope is flat) with a 0.3 m overhang and fascia.
Materials are named (siding, roof, trim, fascia, window_frame, glass, door,
door_frame); SceneHero.jsx textures them. Output is in the frame GLB's own
coordinates, centred on the frame's raw bounding box.
"""
import pickle, numpy as np, json, trimesh
from scipy import ndimage
from shapely.geometry import Polygon, box as sbox
d=pickle.load(open('els.pkl','rb')); els=d['els']
LO=np.array([e['lo'] for e in els]); HI=np.array([e['hi'] for e in els]); C=(LO+HI)/2; EXT=HI-LO
T=np.array([e['type'] for e in els])
CB=(LO.min(0)+HI.max(0))/2        # frame bbox centre (the GLB's raw bbox)
Z2Y=np.array([[1,0,0],[0,0,1],[0,-1,0]],float)

# ---------- roof heightfield ----------
cell=0.15
x0,y0=LO[:,0].min()-1.5, LO[:,1].min()-1.5
nx=int((HI[:,0].max()+1.5-x0)/cell)+1; ny=int((HI[:,1].max()+1.5-y0)/cell)+1
H=np.full((nx,ny),-np.inf)
for e,lo,hi in zip(els,LO,HI):
    if hi[2]<2.6 or e['type'] in ('IfcBuildingElementProxy','IfcBuildingElementPart'): continue
    v=e['v']; v=v[v[:,2]>2.5]
    if len(v)==0: continue
    np.maximum.at(H,(((v[:,0]-x0)/cell).astype(int),((v[:,1]-y0)/cell).astype(int)),v[:,2])
raw=np.isfinite(H)
foot=ndimage.binary_fill_holes(ndimage.binary_closing(raw,iterations=3))
# Height everywhere = the nearest real structure cell's height (no zeros
# leaking in), then lightly smoothed; the overhang ring takes its edge value.
_, (ii, jj) = ndimage.distance_transform_edt(~raw, return_indices=True)
Hn=np.where(raw,H,H[ii,jj])
# Bridge the gaps between trusses (~0.6 m): a 1 m grey closing fills them
# while leaving each sloped roof plane flat and the ridge line sharp.
Hc=ndimage.grey_closing(Hn,size=(7,7))   # bridge the gaps between trusses
# Purlins sit on the top chords in bands along the ridge; a local plane fit
# (least squares over a ~1.35 m window) turns each slope into one flat plane.
def local_plane(Z, w=9):
    I,J=np.meshgrid(np.arange(Z.shape[0]),np.arange(Z.shape[1]),indexing='ij')
    I=I.astype(float); J=J.astype(float)
    m=lambda A: ndimage.uniform_filter(A,size=w,mode='nearest')
    mi,mj,mz=m(I),m(J),m(Z)
    cii=m(I*I)-mi*mi; cjj=m(J*J)-mj*mj; cij=m(I*J)-mi*mj
    ciz=m(I*Z)-mi*mz; cjz=m(J*Z)-mj*mz
    det=cii*cjj-cij*cij; det=np.where(np.abs(det)<1e-9,1e-9,det)
    a=(ciz*cjj-cjz*cij)/det; b=(cjz*cii-ciz*cij)/det
    return mz+a*(I-mi)+b*(J-mj)
Hv=np.maximum(local_plane(Hc), Hc-0.12)   # never sink below the structure
OVER=2   # 0.30 m overhang
roofmask=ndimage.binary_dilation(foot,iterations=OVER)
_, (fi, fj) = ndimage.distance_transform_edt(~foot, return_indices=True)
Hroof=np.where(foot,Hv,Hv[fi,fj])
def hf(x,y,M=Hv):
    ix=int((x-x0)/cell); iy=int((y-y0)/cell)
    if 0<=ix<nx and 0<=iy<ny: return float(M[ix,iy])
    return 0.0
outside_mask=~ndimage.binary_fill_holes(ndimage.binary_closing(raw,iterations=2))
def is_out(x,y):
    ix=int((x-x0)/cell); iy=int((y-y0)/cell)
    if ix<0 or iy<0 or ix>=nx or iy>=ny: return True
    return bool(outside_mask[ix,iy])

# ---------- walls + openings ----------
st=(T=='IfcColumn')&(LO[:,2]<0.3)
full=st&(EXT[:,2]>2.0)
alongY=EXT[:,0]>EXT[:,1]
beams=np.where((T=='IfcBeam')|(T=='IfcMember'))[0]
pieces=[]   # exterior wall pieces
for axis in (0,1):
    other=1-axis
    mask=full&(alongY if axis==0 else ~alongY)
    idx=np.where(mask)[0]; order=idx[np.argsort(C[idx,axis])]
    cl=[]; cur=[order[0]]
    for a,b in zip(order[:-1],order[1:]):
        if C[b,axis]-C[a,axis]<0.45: cur.append(b)
        else: cl.append(cur); cur=[b]
    cl.append(cur)
    for g in cl:
        if len(g)<3: continue
        g=np.array(g); n0,n1=LO[g,axis].min(),HI[g,axis].max(); nm=(n0+n1)/2
        pos=np.sort(np.unique(np.round(C[g,other],3)))
        top=float(np.median(HI[g,2]))
        runs=[]; start=pos[0]; prev=pos[0]; ops=[]
        for p in pos[1:]:
            gap=p-prev
            if gap>0.7:
                a,b=prev+0.03,p-0.03
                inplane=beams[(np.abs(C[beams,axis]-nm)<0.45)&(LO[beams,other]<a+0.05)&(HI[beams,other]>b-0.05)&(EXT[beams,other]>EXT[beams,axis])]
                heads=[i for i in inplane if 1.6<LO[i,2]<3.1]
                if heads:
                    hz=min(LO[i,2] for i in heads)
                    sills=[i for i in inplane if 0.25<HI[i,2]<1.5]
                    sz=max(HI[i,2] for i in sills) if sills else 0.0
                    ops.append(dict(a=float(a),b=float(b),z0=float(sz),z1=float(min(hz,2.75)),kind='window' if sills else 'door'))
                else:
                    runs.append((start,prev,ops)); start=p; ops=[]
            prev=p
        runs.append((start,prev,ops))
        for s0,s1,ops in runs:
            s0-=0.05; s1+=0.05
            if s1-s0<0.6: continue
            # exterior side, per 0.3 m sample
            ss=np.arange(s0+0.15,s1-0.1,0.3)
            side=[]
            for s in ss:
                p_lo=[0,0]; p_lo[axis]=n0-0.6; p_lo[other]=s
                p_hi=[0,0]; p_hi[axis]=n1+0.6; p_hi[other]=s
                ol,oh=is_out(*p_lo),is_out(*p_hi)
                side.append(-1 if ol and not oh else (1 if oh and not ol else 0))
            # The little tower's side walls sit inside the filled outline: a short
            # run that rises well above the eaves faces away from the tower centre.
            if top>3.4 and s1-s0<1.5 and side.count(0)*2>=len(side):
                tall=[(LO[k,axis]+HI[k,axis])/2 for k in np.where(full&(HI[:,2]>3.4))[0]]
                mid_n=float(np.mean(tall)) if tall else nm
                side=[-1 if nm<mid_n else 1]*len(ss)
            # contiguous exterior pieces
            i=0
            while i<len(ss):
                if side[i]==0: i+=1; continue
                j=i
                while j+1<len(ss) and side[j+1]==side[i]: j+=1
                a=s0 if i==0 else max(s0,ss[i]-0.15)
                b=s1 if j==len(ss)-1 else min(s1,ss[j]+0.15)
                if b-a>0.5:
                    pops=[o for o in ops if o['a']>=a-0.3 and o['b']<=b+0.3]
                    pieces.append(dict(axis=axis,n0=float(n0),n1=float(n1),a=float(a),b=float(b),sgn=side[i],top=top,ops=pops))
                i=j+1
print(len(pieces),'exterior pieces')
for p in pieces: print('xy'[p['axis']], round(p['n0'],2), 'sgn',p['sgn'], round(p['a'],2), round(p['b'],2), [(o['kind'],round(o['b']-o['a'],2)) for o in p['ops']])

# ---------- mesh helpers ----------
meshes={k:[] for k in ('siding','trim','roof','fascia','window_frame','glass','door','door_frame')}
def place(v2, axis, plane, sgn, t):
    """2D (s,z) + offset t (outward) -> raw xyz"""
    out=np.zeros((len(v2),3))
    out[:,axis]=plane+sgn*t; out[:,1-axis]=v2[:,0]; out[:,2]=v2[:,1]
    return out
def slab(poly, axis, plane, sgn, t0, t1, key, uvmode='sz'):
    m=trimesh.creation.extrude_polygon(poly, t1-t0)
    v=m.vertices.copy()
    xyz=place(v[:,:2],axis,plane,sgn,t0+v[:,2])
    uv=np.c_[v[:,0],v[:,1]]
    meshes[key].append((xyz,m.faces.copy() if sgn>0 else m.faces[:,::-1].copy(),uv))
def boxmesh(lo,hi,key):
    m=trimesh.creation.box(bounds=[lo,hi]); meshes[key].append((m.vertices.copy(),m.faces.copy(),m.vertices[:,:2].copy()))

for p in pieces:
    ax,sgn=p['axis'],p['sgn']; plane=(p['n1'] if sgn>0 else p['n0'])+0.012
    if sgn<0: plane=p['n0']-0.012
    other=1-ax
    # top profile follows the roof just inside the wall (gables rise)
    ss=np.linspace(p['a'],p['b'],max(2,int((p['b']-p['a'])/0.15)+1))
    tops=[]
    for s in ss:
        q=[0,0]; q[ax]=(p['n0'] if sgn>0 else p['n1'])-sgn*0.35; q[other]=s
        tops.append(max(p['top'], hf(*q)))
    tops=ndimage.median_filter(np.array(tops),size=5)
    outline=[(p['a'],-0.05),(p['b'],-0.05)]+[(s,z) for s,z in zip(ss[::-1],tops[::-1])]
    wall=Polygon(outline).buffer(0)
    for o in p['ops']:
        wall=wall.difference(sbox(o['a'],o['z0'] if o['kind']=='window' else -0.06,o['b'],o['z1']))
    for poly in (wall.geoms if wall.geom_type=='MultiPolygon' else [wall]):
        if poly.area>0.05: slab(poly,ax,plane,sgn,0,0.025,'siding')
    # corner trims
    for s in (p['a'],p['b']):
        tp=float(np.interp(s,ss,tops))
        slab(sbox(s-0.06,-0.05,s+0.06,tp),ax,plane,sgn,0.02,0.05,'trim')
    for o in p['ops']:
        a,b,z0,z1=o['a'],o['b'],o['z0'],o['z1']; w=b-a
        ring=sbox(a-0.08,(z0-0.08) if o['kind']=='window' else -0.05,b+0.08,z1+0.08).difference(sbox(a,z0 if o['kind']=='window' else -0.06,b,z1))
        slab(ring,ax,plane,sgn,0.0,0.05,'trim')
        if o['kind']=='window':
            fr=sbox(a,z0,b,z1).difference(sbox(a+0.06,z0+0.06,b-0.06,z1-0.06))
            slab(fr,ax,plane,sgn,-0.08,-0.01,'window_frame')
            mid=(z0+z1)/2
            slab(sbox(a+0.06,mid-0.035,b-0.06,mid+0.035),ax,plane,sgn,-0.07,-0.02,'window_frame')   # meeting rail
            slab(sbox(a+0.06,z0+0.06,b-0.06,z1-0.06),ax,plane,sgn,-0.06,-0.055,'glass')
            slab(sbox(a-0.12,z0-0.1,b+0.12,z0-0.03),ax,plane,sgn,0.0,0.09,'trim')   # sill
        elif w<1.6:
            slab(sbox(a,0,b,z1).difference(sbox(a+0.05,0.01,b-0.05,z1-0.05)),ax,plane,sgn,-0.1,-0.01,'door_frame')
            slab(sbox(a+0.05,0.01,b-0.05,z1-0.05),ax,plane,sgn,-0.09,-0.05,'door')
        else:
            n=2 if w<3.2 else 3
            fr=sbox(a,0,b,z1).difference(sbox(a+0.06,0.06,b-0.06,z1-0.06))
            slab(fr,ax,plane,sgn,-0.1,-0.01,'window_frame')
            xs=np.linspace(a+0.06,b-0.06,n+1)
            for xm in xs[1:-1]: slab(sbox(xm-0.04,0.06,xm+0.04,z1-0.06),ax,plane,sgn,-0.09,-0.02,'window_frame')
            slab(sbox(a+0.06,0.06,b-0.06,z1-0.06),ax,plane,sgn,-0.07,-0.065,'glass')

# ---------- roof ----------
V=[];F=[];UV=[]; vid={}
def corner(i,j):
    k=(i,j)
    if k in vid: return vid[k]
    zs=[Hroof[a,b] for a in (i-1,i) for b in (j-1,j) if 0<=a<nx and 0<=b<ny and roofmask[a,b]]
    z=float(np.mean(zs))+0.06
    x=x0+i*cell; y=y0+j*cell
    vid[k]=len(V); V.append((x,y,z)); UV.append((x,y)); return vid[k]
for i in range(nx):
    for j in range(ny):
        if not roofmask[i,j]: continue
        a,b,c,d=corner(i,j),corner(i+1,j),corner(i+1,j+1),corner(i,j+1)
        F+=[(a,b,c),(a,c,d)]
meshes['roof'].append((np.array(V),np.array(F),np.array(UV)))
# fascia skirt on the roof boundary
FV=[];FF=[]
for i in range(nx):
    for j in range(ny):
        if not roofmask[i,j]: continue
        for di,dj,e in ((1,0,((i+1,j),(i+1,j+1))),(-1,0,((i,j+1),(i,j))),(0,1,((i+1,j+1),(i,j+1))),(0,-1,((i,j),(i+1,j)))):
            a2,b2=i+di,j+dj
            if 0<=a2<nx and 0<=b2<ny and roofmask[a2,b2]: continue
            p,q=V[vid[e[0]]],V[vid[e[1]]]
            k=len(FV); FV+=[p,q,(q[0],q[1],q[2]-0.22),(p[0],p[1],p[2]-0.22)]; FF+=[(k,k+1,k+2),(k,k+2,k+3)]
meshes['fascia'].append((np.array(FV),np.array(FF),np.array(FV)[:,:2]))

# ---------- export, same space as the frame GLB ----------
scene=trimesh.Scene()
COL={'siding':[232,228,218,255],'trim':[250,250,247,255],'roof':[74,79,87,255],'fascia':[250,250,247,255],
     'window_frame':[248,248,246,255],'glass':[150,180,205,140],'door':[47,58,69,255],'door_frame':[248,248,246,255]}
tot=0
for k,parts in meshes.items():
    if not parts: continue
    vs=[];fs=[];uvs=[];n=0
    for v,f,uv in parts: vs.append(v); fs.append(f+n); uvs.append(uv); n+=len(v)
    v=(np.vstack(vs)-CB)@Z2Y.T; f=np.vstack(fs); uv=np.vstack(uvs)
    # Flat-shaded: split vertices per face so each face carries its own normal.
    vv=v[f].reshape(-1,3); uu=uv[f].reshape(-1,2); ff=np.arange(len(vv)).reshape(-1,3)
    v,f,uv=vv,ff,uu
    m=trimesh.Trimesh(vertices=v,faces=f,process=False)
    _=m.vertex_normals
    mat=trimesh.visual.material.PBRMaterial(name=k,baseColorFactor=COL[k],metallicFactor=0.0,roughnessFactor=0.8,doubleSided=True,alphaMode='BLEND' if k=='glass' else None)
    m.visual=trimesh.visual.TextureVisuals(uv=uv,material=mat)
    scene.add_geometry(m,geom_name=k,node_name=k); tot+=len(f)
open('envelope.glb','wb').write(trimesh.exchange.gltf.export_glb(scene,include_normals=True))
import os; print('triangles',tot,'size',os.path.getsize('envelope.glb'))
json.dump(dict(frameBoxRaw=[LO.min(0).tolist(),HI.max(0).tolist()]),open('envelope_meta.json','w'))
