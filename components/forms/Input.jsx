import React from 'react';

export function Input({ invalid, style, ...rest }) {
  const [f, setF] = React.useState(false);
  return (
    <input {...rest}
      onFocus={(e) => { setF(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setF(false); rest.onBlur && rest.onBlur(e); }}
      style={{
        ...{
  width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)', background: 'var(--white)',
  border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)',
  padding: '11px 12px', outline: 'none', transition: 'var(--t-hover)'
},
        borderColor: invalid ? 'var(--danger)' : (f ? 'var(--accent)' : 'var(--border-subtle)'),
        boxShadow: f ? '0 0 0 3px var(--focus-ring)' : 'none',
        ...style
      }} />
  );
}
