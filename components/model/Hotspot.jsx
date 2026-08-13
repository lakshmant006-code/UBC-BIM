import React from 'react';

export function Hotspot({ x, y, label, active, leader = 'right', onClick, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const on = active || h;
  const flip = leader === 'left';
  return (
    <button {...rest} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', flexDirection: flip ? 'row-reverse' : 'row',
        gap: 0, ...style
      }}>
      <span style={{
        width: 12, height: 12, borderRadius: 999, flex: '0 0 auto',
        background: 'var(--accent)',
        boxShadow: on ? '0 0 0 9px rgba(255,77,20,.20)' : 'var(--shadow-hotspot)',
        transition: 'box-shadow var(--dur-2) var(--ease-out)'
      }} />
      {label && (
        <>
          <span style={{
            width: on ? 56 : 34, height: 1, background: 'rgba(245,244,241,.5)',
            transition: 'width var(--dur-2) var(--ease-out)'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            color: on ? 'var(--paper)' : 'rgba(245,244,241,.72)',
            background: 'rgba(16,18,21,.72)', backdropFilter: 'var(--blur-panel)',
            border: 'var(--bw-hair) solid ' + (on ? 'var(--accent)' : 'rgba(245,244,241,.22)'),
            padding: '5px 9px', borderRadius: 'var(--r-1)', transition: 'var(--t-hover)'
          }}>{label}</span>
        </>
      )}
    </button>
  );
}
