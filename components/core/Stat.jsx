import React from 'react';

export function Stat({ value, label, unit, inverse, size = 'md', style, ...rest }) {
  const fs = { sm: 'var(--fs-h2)', md: 'var(--fs-h1)', lg: 'var(--fs-display-2)' }[size];
  return (
    <div {...rest} style={{ borderTop: 'var(--bw-2) solid var(--accent)', paddingTop: 'var(--s-3)', ...style }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: fs,
        letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)',
        color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)'
      }}>
        {value}
        {unit && <span style={{ fontSize: '0.44em', fontWeight: 'var(--fw-medium)', marginLeft: 4, color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase', color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)',
        marginTop: 'var(--s-2)'
      }}>{label}</div>
    </div>
  );
}
