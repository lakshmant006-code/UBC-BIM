import React from 'react';
import { Button } from '../core/Button.jsx';

// Floating "Start Your Next Project →" button plus the chat assistant toggle,
// a labelled "Chat" pill (its icon is inline, so it shows even when the
// icon CDN is slow). Below 640px (responsive.css, .ubc-sticky) it becomes a
// full-width bottom bar with the chat toggle folded into its left edge.
export function StickyQuote({ onQuote, onChat, chatOpen = false, label = 'Start Your Next Project →', style, ...rest }) {
  return (
    <div {...rest} className="ubc-sticky" style={{
      position: 'fixed', right: 'var(--s-6)', bottom: 'var(--s-6)', zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 'var(--s-3)', ...style
    }}>
      {onChat && (
        <button type="button" onClick={onChat} aria-expanded={chatOpen} aria-controls="ubc-chat-panel" className="ubc-sticky-chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat</span>
        </button>
      )}
      <Button pill size="md" onClick={onQuote} className="ubc-sticky-cta" style={{ boxShadow: 'var(--shadow-3)' }}>
        {label}
      </Button>
    </div>
  );
}
