/*
  Construction figures for the Services cards, on the Hairline engine
  (core.js). Each one takes the physics of a package figure and puts it on a
  construction subject, so the motion is the package's and the drawing is
  ours:

    drafting       Exploded  — a drawing set in four layers (site, floor,
                               framing, roof plan); across opens the gaps,
                               up/down picks a sheet
    bom            Cabinet   — a material rack; the pointer's height pulls the
                               nearest bundles out on their arms
    permit         Keyboard  — a tray of permit sheets; the sheet under the
                               pointer rises, its neighbours less
    modeling       Keyboard  — a wall panel on a framing table; the member
                               under the pointer lifts, neighbours follow
    engineering    Terrain   — a floor deck under a point load; the bays
                               deflect around it, a load arrow rides above
    manufacturing  Slow      — a roll-former feeding studs onto a run-out
                               table; hovering slows the line

  Every engine is (els, value) => { set, destroy }, the package's FigureMount
  contract, and draws into a 400 × 320 viewBox.
*/
import {
  Cam, clamp, extremes, facing, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, run, seg, unproj,
  spring, stepS, reducedMotion, disposer, mk, place, pointer, put, register, solid, flatDot
} from './core.js';

/** Even-odd point-in-polygon. */
function inside(pt, pg) {
  let c = false;
  for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) {
    const [xi, yi] = pg[i], [xj, yj] = pg[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** A plate standing in the x-z plane from y0 to y1 (Cabinet's slab). */
const frontInner = (q) => 0.375 * q.nu + 0.307 * q.nv > 0;
function slab(P, ring, inset, y0, y1) {
  const at = (r, y) => r.map((q) => P(q.u, y, q.v));
  return { sil: poly(hull(at(ring, y0).concat(at(ring, y1)))), crease: inset ? open(at(run(inset, frontInner), y1)) : '' };
}

/** The world point under a screen point on the plane where `axis` = c (Cabinet's hit test). */
function planeHit(P) {
  const o0 = P(0, 0, 0), E = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o0[0], p[1] - o0[1]]);
  return (p, axis, c) => {
    const [a, k] = [0, 1, 2].filter((n) => n !== axis), ea = E[a], ek = E[k];
    const rx = p[0] - o0[0] - c * E[axis][0], ry = p[1] - o0[1] - c * E[axis][1], det = ea[0] * ek[1] - ea[1] * ek[0];
    const w = [0, 0, 0];
    w[axis] = c; w[a] = (rx * ek[1] - ry * ek[0]) / det; w[k] = (ea[0] * ry - ea[1] * rx) / det;
    return w;
  };
}

/* ---------- Drafting & architectural: a drawing set, exploded ---------- */

const SHEETS = [
  { name: 'Site plan', r: [0, 0, 132, 96], rad: 7,
    segs: [[[36, 24], [96, 24]], [[96, 24], [96, 72]], [[96, 72], [36, 72]], [[36, 72], [36, 24]], [[60, 72], [60, 94]], [[72, 72], [72, 94]], [[8, 10], [20, 10]], [[8, 86], [20, 86]]] },
  { name: 'Floor plan', r: [16, 10, 116, 86], rad: 5,
    segs: [[[62, 10], [62, 48]], [[62, 58], [62, 86]], [[16, 46], [50, 46]], [[84, 48], [116, 48]], [[84, 48], [84, 70]], [[22, 20], [40, 20]], [[96, 76], [110, 76]]] },
  { name: 'Framing plan', r: [22, 16, 110, 80], rad: 4, segs: [] },
  { name: 'Roof plan', r: [18, 12, 114, 84], rad: 3,
    segs: [[[42, 48], [90, 48]], [[18, 12], [42, 48]], [[114, 12], [90, 48]], [[18, 84], [42, 48]], [[114, 84], [90, 48]]] }
];
// Framing plan: stud ticks round the wall line, every 6 units.
for (let x = 26; x <= 106; x += 6) SHEETS[2].segs.push([[x, 16], [x, 20]], [[x, 76], [x, 80]]);
for (let y = 22; y <= 74; y += 6) SHEETS[2].segs.push([[22, y], [26, y]], [[106, y], [110, y]]);

export function drafting({ stage, svg, read }, value) {
  const bag = disposer(), REST = 0.18, TK = 2.4;
  let GAP = value, act = -1, lastP = null;
  const e = spring(REST, { eps: 0.002 });
  const C = Cam(45, 0.5, 1.42);
  fit(C, [[0, 0, 0], [132, 96, 0], [132, 0, 0], [0, 96, 0], [0, 0, 3 * 34 + TK], [132, 0, 3 * 34 + TK]], 180, 166);
  const P = proj(C), front = facing(C), g = mk('g', {}, svg);
  const els = SHEETS.map((L, i) => {
    const [ring, inner] = rings(...L.r, L.rad, 1.3);
    const guide = i > 0 ? mk('path', { class: 'nf dash' }, g) : null;
    const el = solid(g);
    return { ring, inner, ext: extremes(P, ring), guide, el, marks: mk('path', { class: 'nf' }, el.g) };
  });
  const corners = ([x0, y0, x1, y1], z) => [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)];
  const pick = (p) => {
    if (!p) return -1;
    for (let i = SHEETS.length - 1; i >= 0; i--) if (inside(p, corners(SHEETS[i].r, i * GAP * e.t + TK))) return i;
    return -1;
  };
  const setAct = (a) => { if (a === act) return; act = a; els.forEach((E, i) => E.el.sil.classList.toggle('hi', i === a)); B.wake(); };
  const B = register(stage, (dt) => {
    const m = stepS(e, dt), z = (i) => i * GAP * e.x;
    SHEETS.forEach((L, i) => {
      const E = els[i], zi = z(i), zt = zi + TK;
      put(E.el, prism(P, front, E.ring, E.inner, zi, zt));
      E.marks.setAttribute('d', L.segs.map(([a, b]) => seg(P(a[0], a[1], zt), P(b[0], b[1], zt))).join(''));
      if (E.guide) { const zp = z(i - 1) + TK; E.guide.setAttribute('d', E.ext.map((q) => seg(P(q.u, q.v, zi), P(q.u, q.v, zp))).join('')); }
    });
    read.textContent = act >= 0 ? `0${act + 1} · ${SHEETS[act].name}` : 'Drawing set';
    return m;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage, {
    move: (p) => { lastP = p; e.t = REST + (1 - REST) * clamp((p[0] - 60) / 280, 0, 1); setAct(pick(p)); B.wake(); },
    leave: () => { lastP = null; e.t = REST; setAct(-1); B.wake(); }
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { GAP = v; if (lastP) setAct(pick(lastP)); B.wake(); }, destroy: bag.dispose };
}

/* ---------- Bill of material & estimation: a material rack ---------- */

const ITEMS = ['Studs', 'Tracks', 'Headers', 'Blocking', 'Bridging', 'Clip angles', 'Straps', 'Hold-downs', 'Anchors', 'Fasteners', 'Sheathing', 'Truss chords'];

export function bom({ stage, svg, read }, value) {
  const bag = disposer();
  const N = 12, U = 10.4, BH = 9.6, W = 84, EAR = 4, FT = 2, D = 44, OUT = 26;
  const X0 = -10, X1 = W + 10, Z0 = 6, ZB = 11, ZT = ZB + (N - 1) * U + BH, H = ZT + 6;
  const REST = [0, 0, 0.2, 0, 0, 0.3, 0.58, 0.26, 0, 0, 0.13, 0], LIT = 6;
  const falloff = (u) => (u >= 1 ? 0 : (1 - u) * (1 - u));
  const C = Cam(45, 0.5, 1.5), yo = D + FT + OUT;
  fit(C, [[X0, 0, 0], [X1, 0, H], [X1, D, 0], [X0, 0, H], [-EAR, yo, ZB], [-EAR, yo, ZT], [W + EAR, yo, ZB]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value, over = null, lit = null;
  const g = mk('g', {}, svg);
  const [pr, pi] = rings(X0 + 3, 3, X1 - 3, D - 3, 3, 1.2);
  put(solid(g), prism(P, front, pr, pi, 0, Z0));
  // the rack's two uprights, with the arm holes up the front
  for (const [a, b] of [[X0, X0 + 7], [X1 - 7, X1]]) { const [ur, ui] = rings(a, 2, b, D - 2, 1.6, 0.8); put(solid(g), prism(P, front, ur, ui, Z0, H)); }
  for (let i = 0; i < N; i++) for (const x of [X0 + 3.5, X1 - 3.5]) place(mk('circle', { r: 0.75, class: 'dot off' }, g), P(x, D - 2, ZB + i * U + BH / 2));
  const bundles = [];
  for (let i = 0; i < N; i++) {
    const z = ZB + i * U, gi = mk('g', {}, g);
    bundles.push({
      i, z, body: rrect(0, z + 0.4, W, z + BH - 0.4, 1.6, 4), face: rrect(-EAR, z, W + EAR, z + BH, 2, 4),
      faceIn: rrect(-EAR + 0.8, z + 0.8, W + EAR - 0.8, z + BH - 0.8, 1.2, 4),
      chassis: solid(gi), plate: solid(gi), marks: mk('path', { class: 'lo nf' }, gi), tag: mk('circle', { r: 1.1, class: 'dot off' }, gi),
      sp: spring(OUT * REST[i], { eps: 0.02 }), drawn: NaN
    });
  }
  // the bundle's end: a row of C-sections, each a lipped channel
  function marks(b, y) {
    const z = b.z, F = (r) => poly(r.map((q) => P(q.u, y, q.v)));
    let d = '';
    for (let k = 0; k < 8; k++) {
      const x = 3 + k * 9.6;
      d += F(rrect(x, z + 1.8, x + 6.4, z + BH - 1.8, 0.5, 2));
      d += seg(P(x + 1.6, y, z + 3.2), P(x + 1.6, y, z + BH - 3.2));
    }
    return d;
  }
  function draw(b) {
    const o = b.sp.x;
    if (o === b.drawn) return;
    b.drawn = o;
    const yf = D + o + FT, zm = b.z + BH / 2, ch = slab(P, b.body, null, D, D + o + 0.5);
    put(b.chassis, { sil: ch.sil, crease: seg(P(W, D, zm), P(W, D + o, zm)) });
    put(b.plate, slab(P, b.face, b.faceIn, D + o, yf));
    b.marks.setAttribute('d', marks(b, yf));
    place(b.tag, P(W + 1.5, yf, zm));
  }
  function light(b) {
    if (b === lit) return;
    if (lit) { lit.plate.sil.classList.remove('hi'); lit.tag.setAttribute('class', 'dot off'); }
    lit = b; lit.plate.sil.classList.add('hi'); lit.tag.setAttribute('class', 'dot');
  }
  const B = register(stage, (dt) => { let m = false; for (const b of bundles) { if (stepS(b.sp, dt)) m = true; draw(b); } return m; });
  bag.add(B.unregister);
  const onPlane = planeHit(P);
  function hit(p) {
    for (let i = N - 1; i >= 0; i--) {
      const q = onPlane(p, 1, D + FT + OUT * REST[i]), z = (q[2] - ZB - BH / 2) / U;
      if (q[0] >= -EAR && q[0] <= W + EAR && Math.abs(z - i) <= 0.5) return z;
    }
    const f = onPlane(p, 1, D + FT), s = onPlane(p, 0, X1);
    let z = null;
    if (f[0] >= X0 - OUT - 4 && f[0] <= X1 && f[2] >= -OUT * 0.8 && f[2] <= H) z = f[2];
    else if (s[1] >= 0 && s[1] <= D && s[2] >= 0 && s[2] <= H + 4) z = s[2];
    return z === null ? null : clamp((z - ZB - BH / 2) / U, 0, N - 1);
  }
  function retarget() {
    if (over === null) { for (const b of bundles) b.sp.t = OUT * REST[b.i]; light(bundles[LIT]); read.textContent = 'Take-off'; }
    else {
      for (const b of bundles) b.sp.t = OUT * falloff(Math.max(0, Math.abs(b.i - over) - 0.5) / R);
      const a = Math.round(over); light(bundles[a]); read.textContent = ITEMS[N - 1 - a] || 'Item';
    }
    B.wake();
  }
  light(bundles[LIT]);
  bag.add(pointer(stage, { move: (p) => { over = hit(p); retarget(); }, leave: () => { over = null; retarget(); } }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { R = v; if (over !== null) retarget(); }, destroy: bag.dispose };
}

/* ---------- Lot-specific permit sets: a tray of sheets ---------- */

const PERMIT = ['A-001 Cover', 'A-101 Floor plan', 'A-201 Elevations', 'A-301 Sections', 'S-101 Framing plan', 'S-501 Details', 'M-101 MEP', 'S-001 Calculations'];

export function permit({ stage, svg, read }, value) {
  const bag = disposer();
  const N = PERMIT.length, SW = 104, SH = 74, GAP = 8.5, T = 1.2, Y0 = 8, LIFT = 30;
  const falloff = (u) => clamp(1 - u, 0, 1) ** 2;
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[-8, 0, -6], [SW + 8, Y0 + N * GAP + 8, -6], [SW + 8, 0, -6], [-8, Y0 + N * GAP + 8, -6], [0, Y0, SH + LIFT * 0.6]], 200, 168);
  const P = proj(C), front = facing(C), onPlane = planeHit(P);
  let R = value, over = null, lit = null;
  const g = mk('g', {}, svg);
  const [tr, ti] = rings(-8, 0, SW + 8, Y0 + N * GAP + 8, 4, 1.4);
  put(solid(g), prism(P, front, tr, ti, -6, 0));
  const yOf = (i) => Y0 + i * GAP;
  // back to front: a nearer sheet covers a farther one
  const sheets = PERMIT.map((name, i) => {
    const gi = mk('g', {}, g);
    return { i, name, el: solid(gi), marks: mk('path', { class: 'nf lo' }, gi), stamp: mk('ellipse', { class: 'nf' }, gi), sp: spring(i === 1 ? LIFT * 0.45 : 0, { eps: 0.02 }), drawn: NaN };
  });
  function draw(s) {
    const l = s.sp.x;
    if (l === s.drawn) return;
    s.drawn = l;
    const y0 = yOf(s.i), y1 = y0 + T, ring = rrect(0, l, SW, l + SH, 2, 3), inn = rrect(1.2, l + 1.2, SW - 1.2, l + SH - 1.2, 1.2, 3);
    put(s.el, slab(P, ring, inn, y0, y1));
    const F = (x0, z0, x1, z1) => poly([P(x0, y1, l + z0), P(x1, y1, l + z0), P(x1, y1, l + z1), P(x0, y1, l + z1)]);
    // drawing frame, a plan sketch, and the title block bottom-right
    let d = F(6, 6, SW - 6, SH - 6) + F(SW - 40, 8, SW - 8, 22);
    d += seg(P(14, y1, l + 30), P(54, y1, l + 30)) + seg(P(54, y1, l + 30), P(54, y1, l + 58)) + seg(P(14, y1, l + 58), P(70, y1, l + 58)) + seg(P(14, y1, l + 30), P(14, y1, l + 58));
    d += seg(P(SW - 38, y1, l + 15), P(SW - 10, y1, l + 15));
    s.marks.setAttribute('d', d);
    const c = P(SW - 18, y1, l + 40);
    s.stamp.setAttribute('cx', c[0].toFixed(2)); s.stamp.setAttribute('cy', c[1].toFixed(2));
    s.stamp.setAttribute('rx', (5 * C.S * 0.72).toFixed(2)); s.stamp.setAttribute('ry', (5 * C.S * 0.86).toFixed(2));
  }
  function light(s) {
    if (s === lit) return;
    if (lit) { lit.el.sil.classList.remove('hi'); lit.stamp.classList.remove('hi'); }
    lit = s; s.el.sil.classList.add('hi'); s.stamp.classList.add('hi');
  }
  const B = register(stage, (dt) => { let m = false; for (const s of sheets) { if (stepS(s.sp, dt)) m = true; draw(s); } return m; });
  bag.add(B.unregister);
  // the sheet under the pointer: front to back on each sheet's face where it is heading
  function hit(p) {
    for (let i = N - 1; i >= 0; i--) {
      const q = onPlane(p, 1, yOf(i) + T), l = sheets[i].sp.t;
      if (q[0] >= 0 && q[0] <= SW && q[2] >= l && q[2] <= l + SH) return i;
    }
    const q = unproj(C, p[0], p[1], 0);
    if (q[0] < -8 || q[0] > SW + 8) return null;
    return clamp(Math.round((q[1] - Y0) / GAP), 0, N - 1);
  }
  function retarget() {
    if (over === null) { sheets.forEach((s) => { s.sp.t = s.i === 1 ? LIFT * 0.45 : 0; }); light(sheets[1]); read.textContent = 'Permit set'; }
    else { sheets.forEach((s) => { s.sp.t = LIFT * (s.i === over ? 1 : falloff(Math.abs(s.i - over) / (R + 0.5))); }); light(sheets[over]); read.textContent = PERMIT[over]; }
    B.wake();
  }
  light(sheets[1]);
  bag.add(pointer(stage, { move: (p) => { over = hit(p); retarget(); }, leave: () => { over = null; retarget(); } }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { R = v; if (over !== null) retarget(); }, destroy: bag.dispose };
}

/* ---------- Modeling & detailing: a wall panel on a framing table ---------- */

export function modeling({ stage, svg, read }, value) {
  const bag = disposer();
  const W = 156, H = 78, TH = 3.6, LIFT = 16, STEP = 12;
  const falloff = (u) => clamp(1 - u, 0, 1);
  const C = Cam(45, 0.5, 1.32);
  fit(C, [[-10, -10, -7], [W + 10, H + 10, -7], [W + 10, -10, -7], [-10, H + 10, -7], [0, 0, LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value, over = null, lit = null;
  const g = mk('g', {}, svg);
  const [tr, ti] = rings(-10, -10, W + 10, H + 10, 5, 1.8);
  put(solid(g), prism(P, front, tr, ti, -7, 0));
  // members as [name, x0, y0, x1, y1]; a window opening between the king studs at 48 and 96
  const M = [['Bottom track', 0, 0, W, 3], ['Top track', 0, H - 3, W, H]];
  for (let x = 0; x <= W - 2.6; x += STEP) {
    if (x > 48 && x < 96) { M.push(['Cripple stud', x, 3, x + 2.6, 22], ['Cripple stud', x, 52, x + 2.6, H - 3]); continue; }
    M.push([x === 48 || x === 96 ? 'King stud' : 'Stud', x, 3, x + 2.6, H - 3]);
  }
  M.push(['Sill', 48, 22, 98.6, 25], ['Header', 48, 46, 98.6, 52]);
  // paint far to near: depth is x + y at 45°
  M.sort((a, b) => (a[1] + a[3]) / 2 + (a[2] + a[4]) / 2 - ((b[1] + b[3]) / 2 + (b[2] + b[4]) / 2));
  const parts = M.map(([name, x0, y0, x1, y1]) => {
    const [ring, inner] = rings(x0, y0, x1, y1, 0.8, 0.5);
    return { name, x0, y0, x1, y1, ring, inner, el: solid(g), sp: spring(0, { eps: 0.02 }), drawn: NaN };
  });
  const header = parts.find((p) => p.name === 'Header');
  const draw = (p) => { const l = p.sp.x; if (l === p.drawn) return; p.drawn = l; put(p.el, prism(P, front, p.ring, p.inner, l, l + TH)); };
  function light(p) { if (p === lit) return; lit?.el.sil.classList.remove('hi'); lit = p; p.el.sil.classList.add('hi'); }
  const dist = (p, at) => Math.hypot(Math.max(p.x0 - at[0], 0, at[0] - p.x1), Math.max(p.y0 - at[1], 0, at[1] - p.y1));
  function retarget() {
    if (!over) { parts.forEach((p) => { p.sp.t = p === header ? LIFT * 0.5 : 0; }); light(header); read.textContent = 'Wall panel'; }
    else {
      let best = parts[0], bd = 1e9;
      parts.forEach((p) => { const d = dist(p, over); if (d < bd) { bd = d; best = p; } });
      parts.forEach((p) => { p.sp.t = p === best ? LIFT : LIFT * falloff(dist(p, over) / (R * STEP)); });
      light(best); read.textContent = best.name;
    }
    B.wake();
  }
  parts.forEach((p) => { p.sp.x = p.sp.t = p === header ? LIFT * 0.5 : 0; });
  const B = register(stage, (dt) => { let m = false; for (const p of parts) { if (stepS(p.sp, dt)) m = true; draw(p); } return m; });
  bag.add(B.unregister);
  light(header);
  bag.add(pointer(stage, {
    move: (p) => { const q = unproj(C, p[0], p[1], TH); over = q[0] < -10 || q[0] > W + 10 || q[1] < -10 || q[1] > H + 10 ? null : q; retarget(); },
    leave: () => { over = null; retarget(); }
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { R = v; if (over) retarget(); }, destroy: bag.dispose };
}

/* ---------- Engineering: a floor deck under a point load ---------- */

export function engineering({ stage, svg, read }, value) {
  const bag = disposer();
  const N = 9, CELL = 14, FOOT = 12.4, H0 = 16, SAG = 12, EXT = N * CELL, PB = 6;
  const falloff = (u) => (u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094);
  const C = Cam(45, 0.5, 1.58);
  fit(C, [[-6, -6, -PB], [EXT + 6, EXT + 6, -PB], [EXT + 6, -6, -PB], [-6, EXT + 6, -PB], [0, 0, H0 + 46]], 200, 170);
  const P = proj(C), front = facing(C);
  let R = value * CELL, at = null;
  const g = mk('g', {}, svg), bays = [];
  const [pr, pi] = rings(-6, -6, EXT + 6, EXT + 6, 9, 2.2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const x0 = i * CELL + (CELL - FOOT) / 2, y0 = j * CELL + (CELL - FOOT) / 2;
    const [ring, inner] = rings(x0, y0, x0 + FOOT, y0 + FOOT, 1.6, 0.8);
    bays.push({ i, j, ring, inner, el: solid(g), sp: spring(H0, { eps: 0.04 }), drawn: NaN });
  }
  // the load: an arrow standing over the loaded bay, painted last
  const arrow = mk('path', { class: 'nf hi' }, g), puck = flatDot(g, C, 2.4, 'dot');
  const restAt = [EXT / 2, EXT / 2];
  const B = register(stage, (dt) => {
    let m = false;
    for (const b of bays) {
      if (stepS(b.sp, dt)) m = true;
      const h = b.sp.x;
      if (h !== b.drawn) { b.drawn = h; put(b.el, prism(P, front, b.ring, b.inner, 0, h)); b.el.sil.classList.toggle('hi', H0 - h > SAG * 0.45); }
    }
    const p = at || restAt, i = clamp(Math.floor(p[0] / CELL), 0, N - 1), j = clamp(Math.floor(p[1] / CELL), 0, N - 1);
    const top = bays.find((b) => b.i === i && b.j === j).sp.x;
    arrow.setAttribute('d', seg(P(p[0], p[1], top + 40), P(p[0], p[1], top + 3)) + seg(P(p[0], p[1], top + 3), P(p[0] - 3, p[1] + 3, top + 10)) + seg(P(p[0], p[1], top + 3), P(p[0] + 3, p[1] - 3, top + 10)));
    place(puck, P(p[0], p[1], top + 40));
    return m;
  });
  bag.add(B.unregister);
  function retarget() {
    const p = at || restAt, load = at ? 1 : 0.45;
    for (const b of bays) {
      const dx = (b.i + 0.5) * CELL - p[0], dy = (b.j + 0.5) * CELL - p[1];
      b.sp.t = H0 - SAG * load * falloff(Math.hypot(dx, dy) / R);
    }
    if (at) {
      const i = clamp(Math.floor(at[0] / CELL), 0, N - 1), j = clamp(Math.floor(at[1] / CELL), 0, N - 1);
      read.textContent = `Point load · bay ${'ABCDEFGHI'[i]}${j + 1}`;
    } else read.textContent = 'Load path';
    B.wake();
  }
  retarget();
  for (const b of bays) b.sp.x = b.sp.t;
  bag.add(pointer(stage, {
    move: (p) => { const q = unproj(C, p[0], p[1], H0); at = q[0] < -6 || q[0] > EXT + 6 || q[1] < -6 || q[1] > EXT + 6 ? null : [clamp(q[0], 0, EXT - 0.01), clamp(q[1], 0, EXT - 0.01)]; retarget(); },
    leave: () => { at = null; retarget(); }
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { R = v * CELL; retarget(); }, destroy: bag.dispose };
}

/* ---------- Manufacturing: a roll-former feeding a run-out table ---------- */

export function manufacturing({ stage, svg, read }, value) {
  const bag = disposer();
  const L = 230, BW = 22, BT = 5, MX = 52, MH = 30, SL = 34, SWD = 7, SHT = 4.5, NS = 5, SPEED = 1 / 10;
  let slow = value, over = null, clock = 1.7;
  const rate = spring(1, { eps: 0.002 });
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[0, -6, 0], [L, BW + 6, 0], [L, -6, 0], [0, BW + 6, 0], [0, -6, MH], [MX, BW + 6, MH]], 200, 168);
  const P = proj(C), front = facing(C), g = mk('g', {}, svg);
  // run-out table, then the roll-former housing over its start, rollers on its lid
  const [tR, tI] = rings(0, 0, L, BW, 4, 1.3);
  put(solid(g), prism(P, front, tR, tI, 0, BT));
  const [mR, mI] = rings(0, -6, MX, BW + 6, 3, 1.4);
  put(solid(g), prism(P, front, mR, mI, BT, MH));
  const rollers = []; for (let x = 8; x < MX - 4; x += 8) rollers.push(seg(P(x, -4, MH), P(x, BW + 4, MH)));
  mk('path', { d: rollers.join(''), class: 'nf lo' }, g);
  const slats = mk('path', { class: 'nf lo' }, g), layer = mk('g', {}, g);
  const pool = Array.from({ length: NS }, () => solid(layer));
  const lifts = Array.from({ length: NS }, () => spring(0, { eps: 0.03 }));
  const B = register(stage, (dt) => {
    let m = stepS(rate, dt);
    if (!over) rate.t = reducedMotion() ? 0 : 1;
    clock += dt * rate.x;
    let hot = -1, best = 30;
    const items = [];
    for (let j = 0; j < NS; j++) {
      const q = j / NS + clock * SPEED, u = q - Math.floor(q);
      const xe = MX + u * (L - MX + SL);          // the stud's leading end
      const x0 = Math.max(MX, xe - SL), x1 = Math.min(L - 2, xe);
      items.push({ j, x0, x1 });
      if (over && x1 - x0 > 6 && Math.abs((x0 + x1) / 2 - over[0]) < best) { best = Math.abs((x0 + x1) / 2 - over[0]); hot = j; }
    }
    lifts.forEach((sp, j) => { sp.t = j === hot ? 10 : 0; if (stepS(sp, dt)) m = true; });
    items.forEach((it, k) => {
      const el = pool[k];
      if (it.x1 - it.x0 < 1) { el.g.setAttribute('visibility', 'hidden'); return; }
      el.g.removeAttribute('visibility');
      const z0 = BT + lifts[it.j].x, y0 = BW / 2 - SWD / 2;
      const [rg, ig] = rings(it.x0, y0, it.x1, y0 + SWD, 0.8, 0.5);
      put(el, prism(P, front, rg, ig, z0, z0 + SHT));
      el.sil.classList.toggle('hi', it.j === hot);
    });
    const off = (((clock * SPEED * (L - MX + SL)) % 18) + 18) % 18, sl = [];
    for (let x = MX + off; x < L - 4; x += 18) sl.push(seg(P(x, 3, BT), P(x, BW - 3, BT)));
    slats.setAttribute('d', sl.join(''));
    read.textContent = `Line rate ${rate.x.toFixed(2)}×`;
    if (reducedMotion() && !over && rate.x === 0) return m;
    return true;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], BT); rate.t = slow; B.wake(); },
    leave: () => { over = null; B.wake(); }
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { slow = v; if (over) rate.t = v; B.wake(); }, destroy: bag.dispose };
}

/** Each figure's number at intensity 0, 0.5 and 1 (the package's TABLE, for these engines). */
export const TABLE = {
  drafting: [12, 28, 40], bom: [1.5, 3, 5], permit: [0.6, 1.4, 3], modeling: [0.6, 1.4, 3], engineering: [1.5, 3, 5], manufacturing: [0.6, 0.2, 0.05]
};
export const ENGINES = { drafting, bom, permit, modeling, engineering, manufacturing };
