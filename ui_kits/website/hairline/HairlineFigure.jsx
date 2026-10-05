'use client';
/*
  HairlineFigure: mounts one of the construction engines (figures.js) the
  way @lucasmarkes/hairline mounts its own: the shared stylesheet, an
  aria-labelled box at 5:4, an aria-hidden 400 × 320 svg, a caption read-out
  passed to onRead, and intensity mapped through the figure's table.
*/
import React from 'react';
import { inject } from './core.js';
import { ENGINES, TABLE } from './figures.js';

const NS = 'http://www.w3.org/2000/svg';

function parameter(id, intensity) {
  const [lo, mid, hi] = TABLE[id];
  const i = Math.min(1, Math.max(0, typeof intensity === 'number' ? intensity : 0.5));
  return i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid);
}

export function HairlineFigure({ figure, intensity = 0.5, label, onRead, className, style }) {
  const ref = React.useRef(null);
  const engineRef = React.useRef(null);
  const readRef = React.useRef(onRead);
  readRef.current = onRead;

  React.useEffect(() => {
    const el = ref.current, mount = ENGINES[figure];
    if (!el || !mount) return undefined;
    inject(el.ownerDocument);
    const svg = el.ownerDocument.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 320');
    svg.setAttribute('aria-hidden', 'true');
    el.appendChild(svg);
    let text = null;
    const read = {
      get textContent() { return text; },
      set textContent(v) { const next = v || ''; if (next === text) return; text = next; if (readRef.current) readRef.current(next); }
    };
    const engine = mount({ stage: el, svg, read }, parameter(figure, intensity));
    engineRef.current = engine;
    return () => { engine.destroy(); svg.remove(); engineRef.current = null; };
    // mounts once per figure; intensity changes go through set() below
  }, [figure]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { if (engineRef.current) engineRef.current.set(parameter(figure, intensity)); }, [figure, intensity]);

  return <div ref={ref} data-hairline={figure} data-hairline-theme="light" role="img" aria-label={label} className={className} style={{ aspectRatio: '5 / 4', ...style }} />;
}
