import React from 'react';
import { Icon } from '../core/Icon.jsx';

/* The dark stage a 3D model (e.g. an embedded Sketchfab viewer) sits on.
   No model files were supplied, so children default to a labelled placeholder. */
export function ModelStage({ caption, tools = true, height = 520, footer, children, style, ...rest }) {
  return (
    <div {...rest} style={{
      position: 'relative', background: 'var(--surface-inverse)', overflow: 'hidden',
      minHeight: height, display: 'flex', flexDirection: 'column', ...style
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(245,244,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,244,241,.05) 1px, transparent 1px)',
        backgroundSize: 'var(--s-6) var(--s-6)'
      }} />
      <div style={{ position: 'relative', flex: 1, display: 'grid', placeItems: 'center', padding: 'var(--s-7)' }}>
        {children || (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase', color: 'rgba(245,244,241,.42)', textAlign: 'center', maxWidth: '44ch',
            lineHeight: 1.9
          }}>Interactive 3D model embeds here — Revit export pending</span>
        )}
      </div>
      {tools && (
        <div style={{
          position: 'absolute', right: 'var(--s-5)', top: 'var(--s-5)',
          display: 'flex', flexDirection: 'column', gap: 'var(--s-2)'
        }}>
          {['rotate-3d', 'zoom-in', 'maximize'].map((n) => (
            <button key={n} aria-label={n} style={{
              width: 36, height: 36, cursor: 'pointer', borderRadius: 'var(--r-2)',
              background: 'rgba(16,18,21,.72)', backdropFilter: 'var(--blur-panel)',
              border: 'var(--bw-hair) solid rgba(245,244,241,.22)', color: 'var(--paper)',
              display: 'grid', placeItems: 'center'
            }}>
              <Icon name={n} size={17} />
            </button>
          ))}
        </div>
      )}
      {caption && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'var(--s-8) var(--s-5) var(--s-4)',
          background: 'var(--scrim-bottom)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'rgba(245,244,241,.82)'
        }}>{caption}</div>
      )}
      {footer}
    </div>
  );
}
