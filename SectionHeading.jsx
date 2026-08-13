import React from 'react';

const sizes = { sm: 'var(--fs-h3)', md: 'var(--fs-h2)', lg: 'var(--fs-h1)', xl: 'var(--fs-display-2)' };

export function SectionHeading({ eyebrow, title, standfirst, size = 'md', align = 'left', inverse, action, rule = true, style, ...rest }) {
  const fg = inverse ? 'var(--text-inverse)' : 'var(--text-strong)';
  return (
    <div {...rest} style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 'var(--s-6)', flexWrap: 'wrap', textAlign: align, ...style
    }}>
      <div style={{ maxWidth: 'var(--content-max)', marginInline: align === 'center' ? 'auto' : undefined }}>
        {eyebrow && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase', color: inverse ? 'rgba(245,244,241,.62)' : 'var(--text-muted)',
            marginBottom: 'var(--s-4)'
          }}>
            {rule && <span style={{ width: 24, height: 2, background: 'var(--accent)' }} />}
            {eyebrow}
          </div>
        )}
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: sizes[size], fontWeight: 'var(--fw-semibold)',
          letterSpacing: size === 'xl' ? 'var(--ls-display)' : 'var(--ls-heading)',
          lineHeight: size === 'xl' ? 'var(--lh-tight)' : 'var(--lh-snug)',
          color: fg, margin: 0
        }}>{title}</h2>
        {standfirst && (
          <p style={{
            fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-relaxed)',
            color: inverse ? 'rgba(245,244,241,.74)' : 'var(--text-muted)',
            margin: 'var(--s-4) 0 0', maxWidth: '62ch'
          }}>{standfirst}</p>
        )}
      </div>
      {action}
    </div>
  );
}
