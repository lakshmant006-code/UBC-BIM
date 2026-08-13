import React from 'react';
import { SpecRow } from '../core/SpecRow.jsx';
import { Icon } from '../core/Icon.jsx';

export function SpecPanel({ eyebrow, title, specs = [], tags, actions, open = true, onClose, inverse, style, ...rest }) {
  return (
    <aside {...rest} style={{
      width: 340, maxWidth: '100%',
      background: inverse ? 'rgba(16,18,21,.72)' : 'var(--surface-card)',
      backdropFilter: inverse ? 'var(--blur-panel)' : undefined,
      border: 'var(--bw-hair) solid ' + (inverse ? 'rgba(245,244,241,.22)' : 'var(--border-subtle)'),
      borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-3)', padding: 'var(--s-5)',
      opacity: open ? 1 : 0,
      transform: open ? 'translateX(0)' : 'translateX(16px)',
      pointerEvents: open ? 'auto' : 'none',
      transition: 'opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out)',
      ...style
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-4)' }}>
        <div style={{ flex: 1 }}>
          {eyebrow && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase', color: 'var(--accent)'
            }}>{eyebrow}</div>
          )}
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)',
            letterSpacing: 'var(--ls-heading)', lineHeight: 'var(--lh-snug)',
            color: inverse ? 'var(--text-inverse)' : 'var(--text-strong)', margin: 'var(--s-2) 0 0'
          }}>{title}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: inverse ? 'rgba(245,244,241,.7)' : 'var(--text-muted)'
          }}>
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
      <div style={{ marginTop: 'var(--s-4)', borderTop: 'var(--bw-hair) solid ' + (inverse ? 'rgba(245,244,241,.16)' : 'var(--border-subtle)') }}>
        {specs.map((s) => <SpecRow key={s.label} label={s.label} value={s.value} inverse={inverse} dense />)}
      </div>
      {tags && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>{tags}</div>}
      {actions && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', marginTop: 'var(--s-5)' }}>{actions}</div>}
    </aside>
  );
}
