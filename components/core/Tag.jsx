import React from 'react';

const tones = {
  neutral: { color: 'var(--text-body)', borderColor: 'var(--border-subtle)', background: 'var(--white)' },
  accent: { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-tint)' },
  steel: { color: 'var(--steel)', borderColor: 'var(--steel)', background: 'var(--steel-tint)' },
  ok: { color: 'var(--ok)', borderColor: 'var(--ok)', background: 'transparent' },
  danger: { color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent' },
  inverse: { color: 'var(--text-inverse)', borderColor: 'rgba(245,244,241,.34)', background: 'transparent' }
};

export function Tag({ tone = 'neutral', mono = true, dot, style, children, ...rest }) {
  return (
    <span {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)',
      font: mono ? 'var(--type-label)' : undefined,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: mono ? 'var(--fs-label)' : 'var(--fs-caption)',
      letterSpacing: mono ? 'var(--ls-label)' : 'var(--ls-body)',
      textTransform: mono ? 'uppercase' : 'none',
      padding: '5px 10px', borderRadius: 'var(--r-pill)',
      border: 'var(--bw-hair) solid', lineHeight: 1.2,
      ...tones[tone], ...style
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />}
      {children}
    </span>
  );
}
