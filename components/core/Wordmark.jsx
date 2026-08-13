import React from 'react';

/* No logo file was supplied. This renders the brand name in display type and
   picks up assets/logo.svg automatically if it is ever added. */
export function Wordmark({ size = 20, tone = 'ink', src, boxed, style, ...rest }) {
  const color = { ink: 'var(--ink)', inverse: 'var(--paper)', accent: 'var(--accent)' }[tone];
  const inner = src
    ? <img src={src} alt="UBC BIM" style={{ height: size * 1.2, display: 'block' }} />
    : (
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: size,
        letterSpacing: '-0.03em', lineHeight: 1, color: boxed ? 'var(--paper)' : color,
        whiteSpace: 'nowrap'
      }}>UBC BIM</span>
    );
  return (
    <span {...rest} aria-label="UBC BIM" style={{
      display: 'inline-flex', alignItems: 'center',
      ...(boxed ? { background: 'var(--ink)', padding: '8px 12px' } : null), ...style
    }}>{inner}</span>
  );
}
