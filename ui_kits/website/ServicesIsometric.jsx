'use client';
/*
  ServicesIsometric: one hairline isometric LGSF building that every
  service on the Services page points at. The building is generated from a
  few dimensions (no image asset), projected with a standard 30° isometric,
  and split into layers; each service lights up its own layer(s), which
  draw themselves in (stroke-dashoffset over a pathLength of 1) while the
  rest of the building stays as a faint hairline.

    drafting-architectural  floor-plan partitions, openings, dimensions
    modeling-detailing      wall panels (studs, tracks) and roof trusses
    engineering             load paths down to hold-downs and anchors
    permit-sets             the lot line and a stamped sheet set
    bom-estimation          exploded members with tags and a take-off list
    manufacturing           a roll-former running a stud toward the walls

  Purely illustrative: the service write-ups below carry the real content.
*/
import React from 'react';

const U = 22;                       // px per metre before the viewBox fit
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
const L = 10, W = 6, H = 3.2, R = 2.1;   // building length, width, wall height, roof rise

const P = (x, y, z) => [(x - y) * C30 * U, ((x + y) * S30 - z) * U];
const seg = (a, b) => [P(...a), P(...b)];
const poly = (pts, close) => { const out = []; for (let i = 0; i < pts.length - 1; i++) out.push(seg(pts[i], pts[i + 1])); if (close) out.push(seg(pts[pts.length - 1], pts[0])); return out; };
const rectXZ = (y, x0, x1, z0, z1) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
// Ground-plane arc (door swing), centre (cx, cy), radius r, angles in degrees.
const arc = (cx, cy, r, a0, a1, z = 0) => {
  const pts = []; for (let i = 0; i <= 10; i++) { const a = (a0 + (a1 - a0) * i / 10) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); }
  return poly(pts, false);
};

// Openings on the front wall (y = W): [x0, x1, z0, z1]
const WINDOW = [1.6, 3.6, 1.0, 2.2];
const DOOR = [6.4, 7.5, 0, 2.2];
const inOpening = (x) => [WINDOW, DOOR].some(([a, b]) => x > a + 0.05 && x < b - 0.05);

function buildLayers() {
  const L_ = {};

  // Slab: always shown, faint.
  L_.slab = [...poly([[-0.3, -0.3, 0], [L + 0.3, -0.3, 0], [L + 0.3, W + 0.3, 0], [-0.3, W + 0.3, 0]], true)];

  // Wall panels: studs at 0.6 m, top and bottom tracks, opening framing.
  const walls = [];
  walls.push(...poly([[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0]], true));
  walls.push(...poly([[0, 0, H], [L, 0, H], [L, W, H], [0, W, H]], true));
  for (let x = 0; x <= L + 1e-6; x += 0.6) {
    const xx = Math.min(x, L);
    walls.push(seg([xx, 0, 0], [xx, 0, H]));                       // back wall
    if (!inOpening(xx)) walls.push(seg([xx, W, 0], [xx, W, H]));   // front wall
  }
  for (let y = 0.6; y < W; y += 0.6) {
    walls.push(seg([0, y, 0], [0, y, H]));
    walls.push(seg([L, y, 0], [L, y, H]));
  }
  [WINDOW, DOOR].forEach(([a, b, z0, z1]) => {
    walls.push(seg([a, W, 0], [a, W, H]), seg([b, W, 0], [b, W, H]));        // king studs
    walls.push(seg([a, W, z1], [b, W, z1]), seg([a, W, z1 + 0.25], [b, W, z1 + 0.25])); // header
    if (z0 > 0) walls.push(seg([a, W, z0], [b, W, z0]));                      // sill
    for (let x = a + 0.6; x < b; x += 0.6) { walls.push(seg([x, W, z1 + 0.25], [x, W, H])); if (z0 > 0) walls.push(seg([x, W, 0], [x, W, z0])); }
  });
  walls.push(seg([0, 0, H / 2], [L, 0, H / 2]), seg([L, 0, H / 2], [L, W, H / 2])); // bridging
  L_.walls = walls;

  // Roof trusses every metre: chords, king post and webs, plus the ridge.
  const trusses = [];
  for (let x = 0; x <= L + 1e-6; x += 1) {
    const top = [x, W / 2, H + R];
    trusses.push(seg([x, 0, H], top), seg(top, [x, W, H]), seg([x, 0, H], [x, W, H]));
    trusses.push(seg([x, W / 2, H], top));
    trusses.push(seg([x, W / 4, H], [x, W / 4, H + R / 2]), seg([x, W / 4, H], top));
    trusses.push(seg([x, (3 * W) / 4, H], [x, (3 * W) / 4, H + R / 2]), seg([x, (3 * W) / 4, H], top));
  }
  trusses.push(seg([0, W / 2, H + R], [L, W / 2, H + R]));
  trusses.push(seg([0, 0, H], [L, 0, H]), seg([0, W, H], [L, W, H]));
  L_.trusses = trusses;

  // Architectural: plan partitions, door swings, openings and a dimension line.
  const arch = [];
  arch.push(seg([0, 3, 0.02], [5.2, 3, 0.02]), seg([5.2, 0, 0.02], [5.2, W, 0.02]), seg([7.8, 3, 0.02], [7.8, W, 0.02]), seg([7.8, 3, 0.02], [L, 3, 0.02]));
  arch.push(...arc(5.2, 3, 0.9, 90, 180), ...arc(7.8, 4.2, 0.9, 180, 270), ...arc(6.4, W, 1.1, 270, 360));
  arch.push(...rectXZ(W, WINDOW[0], WINDOW[1], WINDOW[2], WINDOW[3]), ...rectXZ(W, DOOR[0], DOOR[1], DOOR[2], DOOR[3]));
  arch.push(seg([WINDOW[0], W, (WINDOW[2] + WINDOW[3]) / 2], [WINDOW[1], W, (WINDOW[2] + WINDOW[3]) / 2]));
  const dy = W + 1.4;
  arch.push(seg([0, dy, 0], [L, dy, 0]), seg([0, W + 0.4, 0], [0, dy + 0.3, 0]), seg([L, W + 0.4, 0], [L, dy + 0.3, 0]), seg([5.2, dy - 0.2, 0], [5.2, dy + 0.2, 0]));
  arch.push(seg([-0.15, dy - 0.15, 0], [0.15, dy + 0.15, 0]), seg([L - 0.15, dy - 0.15, 0], [L + 0.15, dy + 0.15, 0]));
  L_.arch = arch;

  // Engineering: load paths from the ridge down each corner to hold-downs.
  const eng = [];
  const arrowDown = (x, y, zTop, zBot) => {
    eng.push(seg([x, y, zTop], [x, y, zBot]));
    eng.push(seg([x, y, zBot], [x - 0.18, y, zBot + 0.35]), seg([x, y, zBot], [x + 0.18, y, zBot + 0.35]));
  };
  [[2.5, W / 2], [7.5, W / 2]].forEach(([x, y]) => arrowDown(x, y, H + R + 1.4, H + R + 0.15));
  [[0, 0], [L, 0], [L, W], [0, W]].forEach(([x, y]) => {
    arrowDown(x, y, H - 0.2, 0.75);
    eng.push(...poly([[x - 0.18, y, 0], [x + 0.18, y, 0], [x + 0.18, y, 0.6], [x - 0.18, y, 0.6]], true)); // hold-down
    eng.push(seg([x, y, 0], [x, y, -0.7]), seg([x - 0.15, y, -0.7], [x + 0.15, y, -0.7]));               // anchor
  });
  eng.push(seg([0, W, H + 0.35], [L, W, H + 0.35]), seg([0, W, H + 0.35], [0, W, H + 0.6]), seg([L, W, H + 0.35], [L, W, H + 0.6]));
  L_.eng = eng;

  // Permit sets: the lot line on the ground (screen-space sheets are added
  // separately in the component, since they face the viewer).
  const permit = [];
  const lot = [[-2.2, -2.2, 0], [L + 2.2, -2.2, 0], [L + 2.2, W + 2.2, 0], [-2.2, W + 2.2, 0]];
  for (let i = 0; i < 4; i++) {
    const a = lot[i], b = lot[(i + 1) % 4], n = 14;
    for (let k = 0; k < n; k += 2) {
      const t0 = k / n, t1 = (k + 1) / n;
      permit.push(seg([a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, 0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, 0]));
    }
  }
  L_.permit = permit;

  // BOM: one stud and one track pulled out of the front wall, with leaders.
  const bom = [];
  const ox = -3.2;
  bom.push(...poly([[ox, W + 1.2, 0.2], [ox, W + 1.2, H + 0.2], [ox + 0.12, W + 1.2, H + 0.2], [ox + 0.12, W + 1.2, 0.2]], true));
  bom.push(...poly([[ox - 1.2, W + 2.2, 0.1], [ox + 2.2, W + 2.2, 0.1], [ox + 2.2, W + 2.2, 0.25], [ox - 1.2, W + 2.2, 0.25]], true));
  bom.push(seg([ox + 0.06, W + 1.2, H + 0.2], [0.6, W, H - 0.4]));
  bom.push(seg([ox + 2.2, W + 2.2, 0.25], [1.2, W, 0.05]));
  L_.bom = bom;

  // Manufacturing: a roll-former and coil feeding a stud toward the wall.
  const mfg = [];
  const mx = 12.6, my = 1.2;
  const box = (x0, y0, z0, x1, y1, z1) => {
    const c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b]) => seg(c[a], c[b]));
  };
  mfg.push(...box(mx, my, 0, mx + 3.6, my + 1.2, 1.1));
  for (let x = mx + 0.4; x < mx + 3.6; x += 0.5) mfg.push(seg([x, my, 1.1], [x, my + 1.2, 1.1]));
  const coil = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; coil.push([mx + 4.6, my + 0.6 + 0.8 * Math.cos(a), 0.9 + 0.8 * Math.sin(a)]); }
  mfg.push(...poly(coil, false));
  const coil2 = coil.map(([x, y, z]) => [x + 0.5, y, z]);
  mfg.push(...poly(coil2, false), seg(coil[6], coil2[6]), seg(coil[18], coil2[18]));
  mfg.push(seg([mx, my + 0.6, 0.7], [L + 0.6, my + 0.6, 0.7]), seg([mx, my + 0.75, 0.7], [L + 0.6, my + 0.75, 0.7]));
  mfg.push(seg([L + 0.6, my + 0.6, 0.7], [L + 0.6, my + 0.75, 0.7]));
  L_.mfg = mfg;

  return L_;
}

// Which layers each service lights up.
export const SERVICE_LAYERS = {
  'drafting-architectural': ['arch'],
  'modeling-detailing': ['walls', 'trusses'],
  engineering: ['eng'],
  'permit-sets': ['permit'],
  'bom-estimation': ['bom'],
  manufacturing: ['mfg']
};
const BASE_LAYERS = ['walls', 'trusses'];   // always present, faint when not the focus

const toD = (segs) => segs.map(([[x1, y1], [x2, y2]]) => `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`).join('');

export function ServicesIsometric({ serviceId, label }) {
  const layers = React.useMemo(buildLayers, []);
  const paths = React.useMemo(() => Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, toD(v)])), [layers]);
  const box = React.useMemo(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    Object.values(layers).forEach((segs) => segs.forEach((s) => s.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); })));
    const pad = 28;
    return { x: x0 - pad, y: y0 - pad - 40, w: x1 - x0 + pad * 2 + 120, h: y1 - y0 + pad * 2 + 40 };
  }, [layers]);
  const on = SERVICE_LAYERS[serviceId] || [];

  // Screen-space props for the services whose output faces the viewer.
  const sheetX = box.x + box.w - 150, sheetY = box.y + 30;
  const listX = box.x + 10, listY = box.y + box.h - 150;

  return (
    <svg className="ubc-iso" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <path d={paths.slab} className="ubc-iso-faint" />
      {BASE_LAYERS.map((k) => !on.includes(k) && <path key={k} d={paths[k]} className="ubc-iso-faint" />)}
      {on.map((k) => <path key={serviceId + k} d={paths[k]} pathLength="1" className="ubc-iso-on" />)}

      {serviceId === 'permit-sets' && (
        <g key="sheets" className="ubc-iso-pop">
          {[2, 1, 0].map((i) => (
            <g key={i} transform={`translate(${sheetX + i * 10} ${sheetY + i * 10})`}>
              <rect width="120" height="160" rx="3" className="ubc-iso-sheet" />
              {i === 0 && (
                <g className="ubc-iso-ink">
                  <path d="M12 18H70M12 30H96M12 42H84M12 120H108M12 132H80" />
                  <rect x="12" y="56" width="96" height="52" />
                  <path d="M20 100L40 70L60 88L76 64L100 100" />
                  <circle cx="96" cy="140" r="12" className="ubc-iso-stamp" />
                </g>
              )}
            </g>
          ))}
        </g>
      )}
      {serviceId === 'bom-estimation' && (
        <g key="list" className="ubc-iso-pop" transform={`translate(${listX} ${listY})`}>
          <rect width="150" height="112" rx="3" className="ubc-iso-sheet" />
          <g className="ubc-iso-ink">
            <path d="M12 22H138M12 46H138M12 70H138M12 94H138M60 10V102M104 10V102" />
          </g>
          <text x="12" y="18" className="ubc-iso-text">MEMBER</text>
          <text x="66" y="18" className="ubc-iso-text">SIZE</text>
          <text x="110" y="18" className="ubc-iso-text">QTY</text>
        </g>
      )}
    </svg>
  );
}
