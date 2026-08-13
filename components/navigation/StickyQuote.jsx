import React from 'react';
import { Button } from '../core/Button.jsx';
import { Icon } from '../core/Icon.jsx';

export function StickyQuote({ onQuote, onChat, label = 'Request a quote', style, ...rest }) {
  return (
    <div {...rest} style={{
      position: 'fixed', right: 'var(--s-6)', bottom: 'var(--s-6)', zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 'var(--s-3)', ...style
    }}>
      {onChat && (
        <button onClick={onChat} aria-label="Live chat" style={{
          width: 44, height: 44, borderRadius: 'var(--r-pill)', cursor: 'pointer',
          background: 'var(--white)', border: 'var(--bw-hair) solid var(--border-strong)',
          color: 'var(--text-strong)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-2)'
        }}>
          <Icon name="message-square" size={20} />
        </button>
      )}
      <Button pill size="md" onClick={onQuote} icon={<Icon name="file-text" size={18} />} style={{ boxShadow: 'var(--shadow-3)' }}>
        {label}
      </Button>
    </div>
  );
}
