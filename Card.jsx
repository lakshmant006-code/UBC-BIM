import React from 'react';

export function Card({ as: As = 'div', href, interactive, media, mediaLabel, eyebrow, title, meta, tags, footer, padding = 'var(--s-5)', style, children, ...rest }) {
  const [h, setH] = React.useState(false);
  const hot = interactive || href;
  const Tag = href ? 'a' : As;
  return (
    <Tag
      {...rest}
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'block', background: 'var(--surface-card)',
        border: 'var(--bw-hair) solid ' + (h && hot ? 'var(--border-strong)' : 'var(--border-subtle)'),
        borderRadius: 'var(--r-2)',
        boxShadow: h && hot ? 'var(--shadow-2)' : 'var(--shadow-1)',
        transform: h && hot ? 'translateY(-1px)' : 'none',
        transition: 'var(--t-hover), box-shadow var(--dur-2) var(--ease-out)',
        textDecoration: 'none', color: 'inherit', overflow: 'hidden',
        ...style
      }}
    >
      {media !== undefined ? (
        <div style={{
          aspectRatio: '16 / 10', background: 'var(--surface-sunken)',
          borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
          display: 'grid', placeItems: 'center', position: 'relative'
        }}>
          {media || (
            <span style={{
              font: 'var(--type-label)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)',
              letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)',
              textAlign: 'center', padding: '0 var(--s-4)'
            }}>{mediaLabel || 'Model render — asset pending'}</span>
          )}
        </div>
      ) : null}
      <div style={{ padding }}>
        {eyebrow && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase', color: h && hot ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'var(--t-hover)'
          }}>{eyebrow}</div>
        )}
        {title && (
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-semibold)',
            letterSpacing: 'var(--ls-heading)', lineHeight: 'var(--lh-snug)',
            color: 'var(--text-strong)', margin: eyebrow ? 'var(--s-2) 0 0' : 0
          }}>{title}</h3>
        )}
        {children && (
          <div style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>{children}</div>
        )}
        {tags && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>{tags}</div>}
        {meta && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)', marginTop: 'var(--s-3)' }}>{meta}</div>
        )}
      </div>
      {footer && (
        <div style={{ padding: 'var(--s-3) var(--s-5)', borderTop: 'var(--bw-hair) solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>{footer}</div>
      )}
    </Tag>
  );
}
