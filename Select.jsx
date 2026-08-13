import React from 'react';

export function Select({ options = [], placeholder, invalid, style, ...rest }) {
  const [f, setF] = React.useState(false);
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <select {...rest}
        onFocus={(e) => { setF(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={(e) => { setF(false); rest.onBlur && rest.onBlur(e); }}
        style={{
          ...{
  width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)',
  color: 'var(--text-strong)', background: 'var(--white)',
  border: 'var(--bw-hair) solid var(--border-subtle)', borderRadius: 'var(--r-2)',
  padding: '11px 12px', outline: 'none', transition: 'var(--t-hover)'
},
          appearance: 'none', paddingRight: 34, cursor: 'pointer',
          borderColor: invalid ? 'var(--danger)' : (f ? 'var(--accent)' : 'var(--border-subtle)'),
          boxShadow: f ? '0 0 0 3px var(--focus-ring)' : 'none',
          ...style
        }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
      <span aria-hidden="true" style={{
        position: 'absolute', right: 12, top: '50%', width: 8, height: 8,
        borderRight: '1.5px solid var(--text-muted)', borderBottom: '1.5px solid var(--text-muted)',
        transform: 'translateY(-70%) rotate(45deg)', pointerEvents: 'none'
      }} />
    </div>
  );
}
