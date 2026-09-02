/* Schematic framing line work: deliberately a diagram, not a render.
   Real UBC BIM model exports replace this. */
const framingLine = (o) => ({ position: 'absolute', background: 'rgba(245,244,241,.42)', ...o });
const framingActive = { background: 'var(--accent)' };

function FramingSchematic({ layer = 0 }) {
  const on = (i) => layer >= i;
  const cur = (i) => layer === i;
  const fade = (i) => ({
    opacity: on(i) ? 1 : 0,
    transform: on(i) ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity var(--dur-cine) var(--ease-out), transform var(--dur-cine) var(--ease-out)'
  });
  const studs = Array.from({ length: 13 }, (_, i) => 6 + i * 7.2);
  const trusses = Array.from({ length: 7 }, (_, i) => 10 + i * 13.2);
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 720, aspectRatio: '16 / 9', margin: '0 auto' }}>
      {/* 01 slab */}
      <div style={{ ...fade(0), position: 'absolute', inset: 0 }}>
        <div style={framingLine({ left: '4%', right: '4%', bottom: '13%', height: 2, background: cur(0) ? 'var(--accent)' : 'rgba(245,244,241,.6)' })} />
        <div style={framingLine({ left: '4%', right: '4%', bottom: '9%', height: 1, opacity: .5 })} />
        <div style={framingLine({ left: '4%', bottom: '9%', width: 1, height: '4%', opacity: .5 })} />
        <div style={framingLine({ right: '4%', bottom: '9%', width: 1, height: '4%', opacity: .5 })} />
      </div>
      {/* 02 walls */}
      <div style={{ ...fade(1), position: 'absolute', inset: 0 }}>
        {studs.map((l, i) => (
          <div key={i} style={framingLine({
            left: l + '%', bottom: '13%', width: cur(1) && i % 4 === 1 ? 2 : 1, height: '38%',
            ...(cur(1) && i % 4 === 1 ? framingActive : null)
          })} />
        ))}
        <div style={framingLine({ left: '4%', right: '4%', bottom: '51%', height: 2, background: cur(1) ? 'var(--accent)' : 'rgba(245,244,241,.6)' })} />
        {/* openings */}
        <div style={framingLine({ left: '20%', bottom: '22%', width: '13%', height: '20%', background: 'transparent', border: '1px solid rgba(245,244,241,.55)' })} />
        <div style={framingLine({ left: '58%', bottom: '13%', width: '9%', height: '27%', background: 'transparent', border: '1px solid rgba(245,244,241,.55)' })} />
      </div>
      {/* 03 trusses */}
      <div style={{ ...fade(2), position: 'absolute', inset: 0 }}>
        <div style={framingLine({ left: '4%', bottom: '51%', width: '48%', height: 2, transformOrigin: 'left bottom', transform: 'rotate(-28deg)', background: cur(2) ? 'var(--accent)' : 'rgba(245,244,241,.7)' })} />
        <div style={framingLine({ right: '4%', bottom: '51%', width: '48%', height: 2, transformOrigin: 'right bottom', transform: 'rotate(28deg)', background: cur(2) ? 'var(--accent)' : 'rgba(245,244,241,.7)' })} />
        {trusses.map((l, i) => {
          const d = Math.abs(l - 50) / 50;
          return <div key={i} style={framingLine({ left: l + '%', bottom: '51%', width: 1, height: (1 - d) * 25 + '%', opacity: .55 })} />;
        })}
      </div>
      {/* 04 MEP */}
      <div style={{ ...fade(3), position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: '10%', right: '30%', bottom: '30%', height: 0, borderTop: '2px dashed ' + (cur(3) ? 'var(--accent)' : 'rgba(245,244,241,.5)') }} />
        <div style={{ position: 'absolute', left: '38%', bottom: '30%', height: '18%', width: 0, borderLeft: '2px dashed ' + (cur(3) ? 'var(--accent)' : 'rgba(245,244,241,.5)') }} />
        <div style={{ position: 'absolute', left: '62%', right: '10%', bottom: '44%', height: 0, borderTop: '2px dashed rgba(245,244,241,.5)' }} />
        {cur(3) && (
          <div style={{ position: 'absolute', left: '38%', bottom: '47%', width: 14, height: 14, borderRadius: 999, border: '2px solid var(--danger)', transform: 'translate(-50%,0)' }} />
        )}
      </div>
      <div style={{
        position: 'absolute', left: 0, bottom: 0, fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,244,241,.34)'
      }}>Schematic line work · real model export pending</div>
    </div>
  );
}
Object.assign(window, { FramingSchematic });
