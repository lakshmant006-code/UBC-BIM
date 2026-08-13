import React from 'react';

const base = {
  fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-medium)',
  letterSpacing: 'var(--ls-body)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 'var(--s-2)', border: 'var(--bw-hair) solid transparent', borderRadius: 'var(--r-2)',
  cursor: 'pointer', textDecoration: 'none', transition: 'var(--t-hover)', whiteSpace: 'nowrap'
};
const sizes = {
  sm: { padding: '7px 12px', fontSize: 'var(--fs-caption)' },
  md: { padding: '11px 18px' },
  lg: { padding: '15px 26px', fontSize: 'var(--fs-body)' }
};

export function Button({
  variant = 'primary', size = 'md', href, icon, iconRight, disabled,
  full, pill, type = 'button', onClick, style, children, ...rest
}) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);

  const skin = {
    primary: {
      background: p ? 'var(--accent-press)' : 'var(--accent)',
      color: 'var(--white)',
      borderColor: p ? 'var(--accent-press)' : 'var(--accent)'
    },
    secondary: {
      background: h ? 'var(--paper-2)' : 'var(--white)',
      color: 'var(--text-strong)',
      borderColor: h ? 'var(--border-strong)' : 'var(--border-subtle)'
    },
    ghost: {
      background: 'transparent',
      color: h ? 'var(--accent)' : 'var(--text-strong)',
      borderColor: 'transparent',
      paddingLeft: 0, paddingRight: 0
    },
    inverse: {
      background: h ? 'rgba(245,244,241,.14)' : 'transparent',
      color: 'var(--text-inverse)',
      borderColor: 'rgba(245,244,241,.34)'
    }
  }[variant] || {};

  const s = {
    ...base, ...sizes[size], ...skin,
    ...(pill ? { borderRadius: 'var(--r-pill)' } : null),
    ...(full ? { width: '100%' } : null),
    ...(disabled ? {
      background: 'var(--surface-sunken)', color: 'var(--text-faint)',
      borderColor: 'var(--border-subtle)', cursor: 'default'
    } : null),
    transform: p && !disabled ? 'translateY(0)' : undefined,
    ...style
  };

  const Tag = href && !disabled ? 'a' : 'button';
  return (
    <Tag
      {...rest}
      href={href}
      type={Tag === 'button' ? type : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => { setH(false); setP(false); }}
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      style={s}
    >
      {icon}{children}{iconRight}
    </Tag>
  );
}
