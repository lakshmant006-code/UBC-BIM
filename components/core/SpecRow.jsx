import React from 'react';

export function SpecRow({ label, value, inverse, dense, style, ...rest }) {
  const line = inverse ? 'rgba(245,244,241,.16)' : 'var(--border-subtle)';
  return (
    <div {...rest} style={{
      display: 'grid', gridTemplateColumns: 'minmax(96px, 38%) 1fr', gap: 'var(--s-4)',
      padding: (dense ? 'var(--s-2)' : 'var(--s-3)') + ' 0',
      borderBottom: 'var(--bw-hair) solid ' + line, alignItems: 'baseline', ...style
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase', color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)'
      }}>{label}</span>
      <span style={{
        fontSize: 'var(--fs-body-sm)', color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)',
        lineHeight: 'var(--lh-normal)'
      }}>{value}</span>
    </div>
  );
}
