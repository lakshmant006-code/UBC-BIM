import React from 'react';
import { Button } from '../core/Button.jsx';
import { Icon } from '../core/Icon.jsx';

// Floating "Send Your Project →" button plus the quick-answers chat toggle.
// Below 640px (responsive.css, .ubc-sticky) it becomes a full-width bottom
// bar with the chat toggle folded into its left edge.
export function StickyQuote({ onQuote, onChat, label = 'Send Your Project →', style, ...rest }) {
  return (
    <div {...rest} className="ubc-sticky" style={{
      position: 'fixed', right: 'var(--s-6)', bottom: 'var(--s-6)', zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 'var(--s-3)', ...style
    }}>
      {onChat && (
        <button onClick={onChat} aria-label="Quick answers" className="ubc-sticky-chat" style={{
          width: 44, height: 44, borderRadius: 'var(--r-pill)', cursor: 'pointer',
          background: 'var(--white)', border: 'var(--bw-hair) solid var(--border-strong)',
          color: 'var(--text-strong)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-2)', flexShrink: 0
        }}>
          <Icon name="message-square" size={20} />
        </button>
      )}
      <Button pill size="md" onClick={onQuote} className="ubc-sticky-cta" style={{ boxShadow: 'var(--shadow-3)' }}>
        {label}
      </Button>
    </div>
  );
}
