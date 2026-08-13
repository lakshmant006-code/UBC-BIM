import React from 'react';

const DEFAULT = ['All', 'Residential', 'Commercial', 'Multifamily', 'Light-gauge steel', 'Wood'];

export function FilterBar({ options = DEFAULT, value, onChange, count, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div {...rest} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--s-5)', flexWrap: 'wrap',
      borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      borderBottom: 'var(--bw-hair) solid var(--border-subtle)',
      padding: 'var(--s-3) 0', ...style
    }}>
      <div style={{ display: 'flex', gap: 'var(--s-5)', flexWrap: 'wrap' }}>
        {options.map((o) => {
          const on = o === value;
          return (
            <button key={o} onClick={() => onChange && onChange(o)}
              onMouseEnter={() => setHover(o)} onMouseLeave={() => setHover(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: on ? 'var(--text-strong)' : (hover === o ? 'var(--accent)' : 'var(--text-muted)'),
                borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'),
                transition: 'var(--t-hover)'
              }}>{o}</button>
          );
        })}
      </div>
      {count !== undefined && (
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>
          {count} {count === 1 ? 'project' : 'projects'}
        </span>
      )}
    </div>
  );
}
