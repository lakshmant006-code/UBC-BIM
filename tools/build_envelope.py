"""Step 2 of the hero envelope: build the architectural model of the M2 house
(public/assets/models/mocking-bird-lot-2-envelope.glb) from els.pkl.

Walls come from the floor-standing stud lines (a line wider than 0.5 m is two
walls and is split); an opening is a gap between full-height studs bridged by
a header (a sill below makes it a window, no sill a door; wide doors become
sliding glass). Exterior faces are found against the roof footprint, and each
wall runs to the face of the wall it meets so the corners close.

The roof is three true planes read off the members, not fitted to a height
map: the left block's flat joist roof, and the gable's two 6:12 slopes from
the truss top chords. Its outline is squared to the wall faces, with a 0.45 m
overhang (the higher roof runs over the lower at an inside corner), fascia on
open edges and a closing face wherever two planes meet at a step.

The fireplace chimney is a free-standing brick box with a crown and flue: its
studs make no wall, and the roof stops around it. A 0.28 m concrete slab sits
under the whole footprint and the chimney.

Materials are named (siding, trim, roof, fascia, window_frame, glass, door,
door_frame, chimney, slab); SceneHero.jsx textures them. Output is in the
frame GLB's own coordinates, centred on the frame's raw bounding box.
"""
import pickle, numpy as np, json, trimesh
from scipy import ndimage
from shapely.geometry import Polygon, box as sbox
d=pickle.load(open('els.pkl','rb')); els=d['els']
LO=np.array([e['lo'] for e in els]); HI=np.array([e['hi'] for e in els]); C=(LO+HI)/2; EXT=HI-LO
T=np.array([e['type'] for e in els])
CB=(LO.min(0)+HI.max(0))/2        # frame bbox centre (the GLB's raw bbox)
Z2Y=np.array([[1,0,0],[0,0,1],[0,-1,0]],float)

# ---------- chimney (fireplace): a free-standing box, not part of the roof ----------
# The tall box at the back. Everything inside its footprint belongs to it.
# Everything that rises above the ridge (~4.4 m) is the chimney.
_tall=np.where(HI[:,2]>4.55)[0]
CH0=LO[_tall,:2].min(0)-0.03; CH1=HI[_tall,:2].max(0)+0.03
in_ch=(C[:,0]>CH0[0]-0.1)&(C[:,0]<CH1[0]+0.1)&(C[:,1]>CH0[1]-0.1)&(C[:,1]<CH1[1]+0.1)
CH_TOP=float(HI[in_ch,2].max())
print('chimney', CH0.round(2), CH1.round(2), 'top', round(CH_TOP,2))

# ---------- roof footprint: everything framed above the walls ----------
cell=0.15
x0,y0=LO[:,0].min()-1.5, LO[:,1].min()-1.5
nx=int((HI[:,0].max()+1.5-x0)/cell)+1; ny=int((HI[:,1].max()+1.5-y0)/cell)+1
H=np.full((nx,ny),-np.inf)
for k,(e,lo,hi) in enumerate(zip(els,LO,HI)):
    if hi[2]<2.6 or in_ch[k] or e['type'] in ('IfcBuildingElementProxy','IfcBuildingElementPart'): continue
    v=e['v']; v=v[v[:,2]>2.5]
    if len(v)==0: continue
    np.maximum.at(H,(((v[:,0]-x0)/cell).astype(int),((v[:,1]-y0)/cell).astype(int)),v[:,2])
raw=np.isfinite(H)
foot=ndimage.binary_fill_holes(ndimage.binary_closing(raw,iterations=3))
XI=x0+(np.arange(nx)+0.5)*cell; YJ=y0+(np.arange(ny)+0.5)*cell
GX,GY=np.meshgrid(XI,YJ,indexing='ij')
# The roof is three true planes, read off the members rather than fitted to
# the height map (the trusses' terraced tops fool a free fit):
#   0  the left block's flat joist roof (all joists top out at one height)
#   1  the south slope of the gable, 2  the north slope: the top chords of
#      the trusses, all at 6:12, give each slope's exact line z = m*y + D.
def chord_plane(sg):
    rows=[]
    for k,e in enumerate(els):
        if e['type'] not in ('IfcMember','IfcBeam') or in_ch[k]: continue
        v=e['v']
        if len(v)<6 or EXT[k,1]<0.8 or HI[k,2]<4.3: continue
        m,_=np.linalg.lstsq(np.c_[v[:,1],np.ones(len(v))],v[:,2],rcond=None)[0]
        if abs(m-0.5*sg)>0.03: continue
        rows.append((float((v[:,2]-0.5*sg*v[:,1]).max()),LO[k,0],HI[k,0],LO[k,1],HI[k,1]))
    r=np.array(rows)
    return 0.5*sg, float(r[:,0].max()), (r[:,1].min(),r[:,2].max(),r[:,3].min(),r[:,4].max())
mS,DS,bS=chord_plane(1); mN,DN,bN=chord_plane(-1)
flat=[HI[k,2] for k,e in enumerate(els) if e['type'] in ('IfcMember','IfcBeam') and 3.3<HI[k,2]<3.9 and not in_ch[k]]
FLAT=float(np.median(flat))
SKIN=0.04                          # sheathing + shingles on top of the members
PL=np.array([[0,0,FLAT+SKIN],[0,mS,DS+SKIN],[0,mN,DN+SKIN]])
print('roof planes: flat',round(FLAT,3),'south',mS,round(DS,3),bS,'north',mN,round(DN,3),bN)
def plane_z(k,x,y): return PL[k,0]*x+PL[k,1]*y+PL[k,2]
def _inb(b,X,Y,pad=0.05): return (X>b[0]-pad)&(X<b[1]+pad)&(Y>b[2]-pad)&(Y<b[3]+pad)
ridge=(DN-DS)/(mS-mN)
lab=np.zeros((nx,ny),int)
lab[_inb(bS,GX,GY)&(GY<=ridge)]=1
lab[_inb(bN,GX,GY)&(GY>ridge)]=2
# West of the full trusses the south slope's trusses run a short way past the
# ridge, so the north slope starts there too and stops at a framed step wall
# down to the flat roof. Find where those short trusses end.
_short=np.where((C[:,0]>bS[0]-0.05)&(C[:,0]<bN[0])&(LO[:,1]>ridge-0.05)&(HI[:,2]>FLAT+0.4)&~in_ch)[0]
YN_W=float(HI[_short,1].max()) if len(_short) else ridge
lab[(GX>bS[0]-0.05)&(GX<bN[0])&(GY>ridge)&(GY<YN_W+0.05)]=2
print('north slope west of the full trusses ends at y',round(YN_W,2))
OVER=3   # 0.45 m overhang (covers the truss tails)
# Square off the outline first: joist ends and studs poking out by a cell
# would otherwise leave teeth along every eave.
SQ=np.ones((3,3),bool)
foot=ndimage.binary_opening(foot,SQ,iterations=2)
roofmask=ndimage.binary_dilation(foot,SQ,iterations=OVER)
_, (fi, fj) = ndimage.distance_transform_edt(~foot, return_indices=True)
lab=np.where(foot,lab,lab[fi,fj])
def roof_at(x,y):
    """Roof surface height at (x,y): the plane of the nearest roofed cell."""
    i=min(max(int((x-x0)/cell),0),nx-1); j=min(max(int((y-y0)/cell),0),ny-1)
    if not roofmask[i,j]:
        i,j=fi[i,j],fj[i,j]
    return float(plane_z(lab[i,j],x,y))
outside_mask=~ndimage.binary_erosion(foot,iterations=2)
_ci=slice(int((CH0[0]-x0)/cell),int((CH1[0]-x0)/cell)+1); _cj=slice(int((CH0[1]-y0)/cell),int((CH1[1]-y0)/cell)+1)
outside_mask[_ci,_cj]=True
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
    # A wall is at most ~0.5 m thick: a wider cluster is two stud lines that
    # chained together, so split it at its widest gap until each part fits.
    def split(g):
        g=sorted(g,key=lambda i:C[i,axis])
        if len(g)<2 or HI[g,axis].max()-LO[g,axis].min()<=0.5: return [g]
        cs=C[g,axis]; k=int(np.argmax(np.diff(cs)))+1
        return split(g[:k])+split(g[k:])
    cl=[h for g in cl for h in split(g)]
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
            lo_=[0,0]; hi_=[0,0]; lo_[axis]=n0; hi_[axis]=n1; lo_[other]=s0; hi_[other]=s1
            if lo_[0]>CH0[0]-0.2 and hi_[0]<CH1[0]+0.2 and lo_[1]>CH0[1]-0.2 and hi_[1]<CH1[1]+0.2: continue   # chimney's own studs
            if s1-s0<0.6: continue
            # exterior side, per 0.3 m sample
            ss=np.arange(s0+0.15,s1-0.1,0.3)
            side=[]
            for s in ss:
                p_lo=[0,0]; p_lo[axis]=n0-0.6; p_lo[other]=s
                p_hi=[0,0]; p_hi[axis]=n1+0.6; p_hi[other]=s
                ol,oh=is_out(*p_lo),is_out(*p_hi)
                side.append(-1 if ol and not oh else (1 if oh and not ol else 0))
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
# Close the corners: each end of a piece runs to the outer face of the wall it
# meets, so no frame shows through a slot at the corner. At an outside corner
# it also wraps the other wall's siding edge; at an inside corner it stops on
# the other wall's face.
def face(p): return (p['n1']+0.012) if p['sgn']>0 else (p['n0']-0.012)
for p in pieces:
    P=face(p)
    for q in pieces:
        if q['axis']==p['axis']: continue
        if not (q['a']-0.5<P<q['b']+0.5): continue
        Q=face(q)
        for end in ('a','b'):
            if abs(Q-p[end])>0.5: continue
            convex=(end=='b')==(q['sgn']>0)
            p[end]=Q+q['sgn']*0.026 if convex else Q
print(len(pieces),'exterior pieces')

# ---------- square the roof footprint to the walls ----------
# The raster footprint steps diagonally wherever the framing does; cut the
# plan into rectangles along every exterior wall face instead and keep the
# ones over the footprint, so every eave and inside corner is straight.
fx=sorted({face(p) for p in pieces if p['axis']==0}); fy=sorted({face(p) for p in pieces if p['axis']==1})
gx=[x0]+fx+[x0+nx*cell]; gy=[y0]+fy+[y0+ny*cell]
rects=[]
for xa,xb in zip(gx[:-1],gx[1:]):
    for ya,yb in zip(gy[:-1],gy[1:]):
        if foot[int(((xa+xb)/2-x0)/cell),int(((ya+yb)/2-y0)/cell)]: rects.append((xa,ya,xb,yb))
foot=np.zeros_like(foot)
for xa,ya,xb,yb in rects: foot[(GX>xa)&(GX<xb)&(GY>ya)&(GY<yb)]=True
roofmask=ndimage.binary_dilation(foot,SQ,iterations=OVER)
# Each overhang cell takes the highest roof that reaches it, so at an inside
# corner the upper eave runs straight over the lower one.
_reach=[]
for k in range(len(PL)):
    m=foot&(lab==k)
    d=ndimage.distance_transform_edt(~m) if m.any() else np.full(foot.shape,np.inf)
    side=(GY<=ridge) if k==1 else (GY>ridge) if k==2 else np.ones_like(foot)   # a slope never crosses its ridge
    _reach.append(np.where((d<=OVER*1.5)&side,plane_z(k,GX,GY),-np.inf))
_reach=np.stack(_reach)
lab=np.where(foot,lab,np.argmax(_reach,axis=0))
_, (fi, fj) = ndimage.distance_transform_edt(~foot, return_indices=True)
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
    for s_ in ss:
        q=[0,0]; q[ax]=plane+sgn*0.03; q[other]=s_
        tops.append(max(p['top'], roof_at(*q)-0.08))
    tops=np.array(tops)
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
inch=np.zeros_like(roofmask)
inch[int((CH0[0]-x0)/cell):int((CH1[0]-x0)/cell)+1, int((CH0[1]-y0)/cell):int((CH1[1]-y0)/cell)+1]=True
roofmask=roofmask&~inch          # the roof stops around the chimney
STEP=0.25                        # a bigger jump between planes is a real step
def cell_corner(i,j,ci,cj):
    """Corner (ci,cj) of cell (i,j): its own plane, raised to a neighbour's
    plane where they meet within STEP (a sharp ridge), never across a step."""
    x=x0+ci*cell; y=y0+cj*cell; own=float(plane_z(lab[i,j],x,y)); z=own
    for a_ in (ci-1,ci):
        for b_ in (cj-1,cj):
            if 0<=a_<nx and 0<=b_<ny and roofmask[a_,b_]:
                v=float(plane_z(lab[a_,b_],x,y))
                if own<v<own+STEP: z=max(z,v)
    return z
V=[];F=[];UV=[];FV=[];FF=[]
cz={}
for i in range(nx):
    for j in range(ny):
        if not roofmask[i,j]: continue
        q=[(i,j),(i+1,j),(i+1,j+1),(i,j+1)]
        zs=[cell_corner(i,j,*c) for c in q]; cz[(i,j)]=zs
        k=len(V)
        for (ci,cj),z in zip(q,zs): V.append((x0+ci*cell,y0+cj*cell,z)); UV.append((x0+ci*cell,y0+cj*cell))
        F+=[(k,k+1,k+2),(k,k+2,k+3)]
meshes['roof'].append((np.array(V),np.array(F),np.array(UV)))
# fascia: a 0.22 m board on every open roof edge, and a closing face on any
# step down to a neighbouring roof plane
for (i,j),zs in cz.items():
    edges=((1,0,1,2),(-1,0,3,0),(0,1,2,3),(0,-1,0,1))
    q=[(i,j),(i+1,j),(i+1,j+1),(i,j+1)]
    for di,dj,e0,e1 in edges:
        n_=(i+di,j+dj)
        p0=(x0+q[e0][0]*cell,y0+q[e0][1]*cell,zs[e0]); p1=(x0+q[e1][0]*cell,y0+q[e1][1]*cell,zs[e1])
        if n_ in cz:
            # Between two roof planes: close the gap with a face that runs
            # exactly from this cell's edge to the neighbour's (no sawtooth).
            if lab[i,j]==lab[n_] or (i,j)>n_: continue
            qn=[n_,(n_[0]+1,n_[1]),(n_[0]+1,n_[1]+1),(n_[0],n_[1]+1)]
            zn0=cz[n_][qn.index(q[e0])]; zn1=cz[n_][qn.index(q[e1])]
            if max(abs(zs[e0]-zn0),abs(zs[e1]-zn1))<0.01: continue
            k=len(FV); FV+=[p0,p1,(p1[0],p1[1],zn1),(p0[0],p0[1],zn0)]; FF+=[(k,k+1,k+2),(k,k+2,k+3)]
            continue
        k=len(FV); FV+=[p0,p1,(p1[0],p1[1],p1[2]-0.22),(p0[0],p0[1],p0[2]-0.22)]; FF+=[(k,k+1,k+2),(k,k+2,k+3)]
meshes['fascia'].append((np.array(FV),np.array(FF),np.array(FV)[:,:2]))

# ---------- chimney ----------
def quadbox(lo,hi,key):
    """Box with its own UVs per face (metres), so textures don't smear."""
    (x0_,y0_,z0_),(x1_,y1_,z1_)=lo,hi
    faces=[((x0_,y0_,z0_),(x1_,y0_,z0_),(x1_,y0_,z1_),(x0_,y0_,z1_),'xz'),
           ((x1_,y1_,z0_),(x0_,y1_,z0_),(x0_,y1_,z1_),(x1_,y1_,z1_),'xz'),
           ((x0_,y1_,z0_),(x0_,y0_,z0_),(x0_,y0_,z1_),(x0_,y1_,z1_),'yz'),
           ((x1_,y0_,z0_),(x1_,y1_,z0_),(x1_,y1_,z1_),(x1_,y0_,z1_),'yz'),
           ((x0_,y0_,z1_),(x1_,y0_,z1_),(x1_,y1_,z1_),(x0_,y1_,z1_),'xy'),
           ((x0_,y1_,z0_),(x1_,y1_,z0_),(x1_,y0_,z0_),(x0_,y0_,z0_),'xy')]
    vs=[];fs=[];uv=[]
    for q in faces:
        pts=np.array(q[:4]); k=len(vs)
        ax={'xz':(0,2),'yz':(1,2),'xy':(0,1)}[q[4]]
        vs+=list(pts); uv+=[(pt[ax[0]],pt[ax[1]]) for pt in pts]
        fs+=[(k,k+1,k+2),(k,k+2,k+3)]
    meshes[key].append((np.array(vs),np.array(fs),np.array(uv)))
meshes.setdefault('chimney',[]); meshes.setdefault('slab',[])
top=CH_TOP+0.15
quadbox((CH0[0]-0.03,CH0[1]-0.03,-0.05),(CH1[0]+0.03,CH1[1]+0.03,top),'chimney')
quadbox((CH0[0]-0.1,CH0[1]-0.1,top),(CH1[0]+0.1,CH1[1]+0.1,top+0.1),'trim')            # crown
cx,cy=(CH0+CH1)/2
quadbox((cx-0.18,cy-0.14,top+0.1),(cx+0.18,cy+0.14,top+0.45),'door')                    # flue

# ---------- slab under the footprint ----------
from shapely.ops import unary_union
# The same wall-face rectangles as the roof, plus a pad under the
# free-standing chimney.
rects=[sbox(*r) for r in rects]
rects.append(sbox(CH0[0]-0.1,CH0[1]-0.1,CH1[0]+0.1,CH1[1]+0.1))
outline=unary_union(rects).simplify(0.01).buffer(0.12,join_style=2)
for poly in (outline.geoms if outline.geom_type=='MultiPolygon' else [outline]):
    m=trimesh.creation.extrude_polygon(poly,0.28)
    v=m.vertices.copy(); v[:,2]-=0.33
    meshes['slab'].append((v,m.faces.copy(),v[:,:2].copy()))

# ---------- export, same space as the frame GLB ----------
scene=trimesh.Scene()
COL={'siding':[232,228,218,255],'trim':[250,250,247,255],'roof':[74,79,87,255],'fascia':[250,250,247,255],
     'window_frame':[248,248,246,255],'glass':[150,180,205,140],'door':[47,58,69,255],'door_frame':[248,248,246,255],'chimney':[150,96,78,255],'slab':[200,198,192,255]}
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
