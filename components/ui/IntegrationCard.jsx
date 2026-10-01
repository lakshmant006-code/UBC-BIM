'use client';
import React from 'react';
import { Icon } from '../core/Icon.jsx';

/* Integration card, ported from the 21st.dev "integration-card" (shadcn +
   Tailwind + motion) into this project's plain-JSX + CSS-token idiom:
   a dotted visual panel with a hub diagram whose connectors carry an
   animated dash, a pulsing centre node and nodes that pop in on view,
   above a card body with a title, description and action.
   Styles live in ui_kits/website/responsive.css under .ubc-int-*. */

// Elbow connector between two points with rounded corners; `horizontal`
// runs along x first (side-by-side layout), otherwise along y (stacked).
function elbow(x1, y1, x2, y2, horizontal, r = 14) {
  if (horizontal) {
    if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1}H${x2}`;
    const mx = (x1 + x2) / 2, dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
    const rr = Math.min(r, Math.abs(y2 - y1) / 2, Math.abs(mx - x1));
    return `M${x1} ${y1}H${mx - dx * rr}Q${mx} ${y1} ${mx} ${y1 + dy * rr}V${y2 - dy * rr}Q${mx} ${y2} ${mx + dx * rr} ${y2}H${x2}`;
  }
  if (Math.abs(x2 - x1) < 1) return `M${x1} ${y1}V${y2}`;
  const my = (y1 + y2) / 2, dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  const rr = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(my - y1));
  return `M${x1} ${y1}V${my - dy * rr}Q${x1} ${my} ${x1 + dx * rr} ${my}H${x2 - dx * rr}Q${x2} ${my} ${x2} ${my + dy * rr}V${y2}`;
}

function Node({ item, kind, index }) {
  return (
    <li data-int={kind} className="ubc-int-node" style={{ '--d': (0.1 + index * 0.1) + 's' }}>
      <span className="ubc-int-icon"><Icon name={item.icon} size={18} /></span>
      <span>{item.label}</span>
    </li>
  );
}

// Inputs flow into the hub, the hub flows out to the outputs. Every label
// is real text in reading order; the lines are decoration.
export function FlowDiagram({ inputsTitle, inputs, hubLabel, hubItems, outputsTitle, outputs, outputsKey }) {
  const ref = React.useRef(null);
  const [paths, setPaths] = React.useState([]);
  const [anim, setAnim] = React.useState('static');

  const measure = React.useCallback(() => {
    const box = ref.current; if (!box) return;
    const o = box.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, b: r.bottom - o.top, cx: (r.left + r.right) / 2 - o.left, cy: (r.top + r.bottom) / 2 - o.top }; };
    const hubEl = box.querySelector('[data-int="hub"]'); if (!hubEl) return;
    const hub = rel(hubEl);
    const ins = [...box.querySelectorAll('[data-int="in"]')].map(rel);
    const outs = [...box.querySelectorAll('[data-int="out"]')].map(rel);
    const spread = (i, n) => (i - (n - 1) / 2) * 8;
    // Stacked (narrow) layout: one spine through every node, top to bottom.
    if (ins.length && ins[0].b <= hub.t) {
      const last = outs.length ? outs[outs.length - 1].cy : hub.b;
      setPaths([`M${hub.cx} ${ins[0].cy}V${last}`]);
      return;
    }
    const next = [];
    ins.forEach((n, i) => {
      const side = n.r <= hub.l; // side-by-side, else stacked above
      next.push(side
        ? elbow(n.r, n.cy, hub.l, hub.cy + spread(i, ins.length), true)
        : elbow(n.cx, n.b, hub.cx + spread(i, ins.length), hub.t, false));
    });
    outs.forEach((n, i) => {
      const side = n.l >= hub.r;
      next.push(side
        ? elbow(hub.r, hub.cy + spread(i, outs.length), n.l, n.cy, true)
        : elbow(hub.cx + spread(i, outs.length), hub.b, n.cx, n.t, false));
    });
    setPaths(next);
  }, []);

  React.useLayoutEffect(() => { measure(); }, [measure, outputsKey, inputs.length, outputs.length]);
  React.useEffect(() => {
    const box = ref.current; if (!box) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io;
    if (!reduce) {
      setAnim('pending');
      io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setAnim('in'); io.disconnect(); } }, { threshold: 0.25 });
      io.observe(box);
    }
    return () => { ro.disconnect(); if (io) io.disconnect(); };
  }, [measure]);

  return (
    <div ref={ref} className="ubc-int-flow" data-anim={anim}>
      <svg className="ubc-int-lines" aria-hidden="true" focusable="false">
        {paths.map((d, i) => (
          <g key={outputsKey + ':' + i}>
            <path d={d} className="ubc-int-line" />
            <path d={d} className="ubc-int-pulse" style={{ animationDelay: (i * 0.55) % 2.2 + 's' }} />
          </g>
        ))}
      </svg>
      <div className="ubc-int-col ubc-int-col-in">
        <div className="ubc-int-head">{inputsTitle}</div>
        <ul>{inputs.map((it, i) => <Node key={it.label} item={it} kind="in" index={i} />)}</ul>
      </div>
      <div className="ubc-int-hubwrap">
        <div data-int="hub" className="ubc-int-hub" aria-live="polite">
          <div className="ubc-int-hub-inner">
            <div className="ubc-int-head">{hubLabel}</div>
            <ul>{hubItems.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <span className="ubc-int-ring" aria-hidden="true" />
        </div>
      </div>
      <div className="ubc-int-col ubc-int-col-out" aria-live="polite">
        <div className="ubc-int-head">{outputsTitle}</div>
        <ul>{outputs.map((it, i) => <Node key={outputsKey + it.label} item={it} kind="out" index={i + inputs.length} />)}</ul>
      </div>
    </div>
  );
}

export function VisualContainer({ children }) {
  return (
    <div className="ubc-int-visual">
      <div className="ubc-int-dots" aria-hidden="true" />
      <div className="ubc-int-fade" aria-hidden="true" />
      <div className="ubc-int-visual-body">{children}</div>
    </div>
  );
}

export function IntegrationCard({ visual, title, description, action }) {
  return (
    <div className="ubc-int-card">
      <VisualContainer>{visual}</VisualContainer>
      <div className="ubc-int-content">
        <div>
          <h3 className="ubc-int-title">{title}</h3>
          <p className="ubc-int-desc">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
