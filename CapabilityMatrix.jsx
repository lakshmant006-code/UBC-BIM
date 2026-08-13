import React from 'react';

/* The brief's capability matrix: machines and software supported, and file outputs clients receive. */
export function CapabilityMatrix({ columns = [], rows = [], style, ...rest }) {
  return (
    <div {...rest} style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c} style={{
                textAlign: 'left', padding: 'var(--s-3) var(--s-4)',
                borderBottom: 'var(--bw-hair) solid var(--border-strong)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'var(--fw-medium)',
                width: i === 0 ? '30%' : undefined
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? 'var(--surface-sunken)' : 'transparent' }}>
              {r.map((cell, ci) => (
                <td key={ci} style={{
                  padding: 'var(--s-3) var(--s-4)',
                  borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
                  fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-normal)',
                  color: ci === 0 ? 'var(--text-strong)' : 'var(--text-body)',
                  fontWeight: ci === 0 ? 'var(--fw-medium)' : 'var(--fw-regular)',
                  verticalAlign: 'top'
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
