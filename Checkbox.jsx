import React from 'react';

export function Checkbox({ label, checked, onChange, disabled, style, ...rest }) {
  return (
    <label style={{
      display: 'flex', gap: 'var(--s-3)', alignItems: 'flex-start',
      cursor: disabled ? 'default' : 'pointer', ...style
    }}>
      <input {...rest} type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 18, height: 18, margin: 0 }} />
      <span aria-hidden="true" style={{
        width: 18, height: 18, flex: '0 0 auto', marginTop: 1,
        borderRadius: 'var(--r-1)',
        border: 'var(--bw-hair) solid ' + (checked ? 'var(--accent)' : 'var(--border-strong)'),
        background: checked ? 'var(--accent)' : 'var(--white)',
        display: 'grid', placeItems: 'center', transition: 'var(--t-hover)'
      }}>
        {checked && (
          <span style={{
            width: 9, height: 5, marginTop: -2,
            borderLeft: '2px solid var(--white)', borderBottom: '2px solid var(--white)',
            transform: 'rotate(-45deg)'
          }} />
        )}
      </span>
      <span style={{
        fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-normal)',
        color: disabled ? 'var(--text-faint)' : 'var(--text-body)'
      }}>{label}</span>
    </label>
  );
}
