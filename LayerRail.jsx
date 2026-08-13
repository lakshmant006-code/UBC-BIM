import React from 'react';

/* Drives the home page's layer-by-layer assembly: slab -> walls -> trusses -> MEP. */
export function LayerRail({ layers = [], active = 0, onSelect, inverse, style, ...rest }) {
  const [h, setH] = React.useState(null);
  const dim = inverse ? 'rgba(245,244,241,.5)' : 'var(--text-muted)';
  const fg = inverse ? 'var(--text-inverse)' : 'var(--text-strong)';
  return (
    <div {...rest} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {layers.map((l, i) => {
        const on = i === active;
        const done = i < active;
        const name = typeof l === 'string' ? l : l.label;
        const note = typeof l === 'string' ? null : l.note;
        return (
          <button key={name} onClick={() => onSelect && onSelect(i)}
            onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}
            style={{
              textAlign: 'left', background: 'none', cursor: 'pointer',
              border: 'none', borderLeft: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : (inverse ? 'rgba(245,244,241,.2)' : 'var(--border-subtle)')),
              padding: 'var(--s-3) var(--s-4)', transition: 'var(--t-hover)',
              display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)'
            }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
              color: on ? 'var(--accent)' : dim, minWidth: 22
            }}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span style={{
                display: 'block', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h4)',
                fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-heading)',
                color: on ? fg : (h === i ? 'var(--accent)' : (done ? fg : dim)),
                transition: 'var(--t-hover)'
              }}>{name}</span>
              {note && (
                <span style={{ display: 'block', fontSize: 'var(--fs-caption)', color: dim, marginTop: 2 }}>{note}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
