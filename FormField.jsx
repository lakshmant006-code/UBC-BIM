import React from 'react';

export function FormField({ label, hint, error, required, htmlFor, children, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', ...style }}>
      {label && (
        <label htmlFor={htmlFor} style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase', color: 'var(--text-muted)'
        }}>
          {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span style={{
          fontSize: 'var(--fs-caption)', lineHeight: 'var(--lh-normal)',
          color: error ? 'var(--danger)' : 'var(--text-faint)'
        }}>{error || hint}</span>
      )}
    </div>
  );
}
