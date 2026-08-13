import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Icon } from '../core/Icon.jsx';

const COLS = [
  { head: 'Services', links: ['Wall detailing', 'Truss detailing', 'MEP & clash detection', 'Permit sets', 'Bill of Materials', 'Architectural drafting'] },
  { head: 'Company', links: ['About us', 'Careers', 'Contact', 'Resources'] },
  { head: 'Capability', links: ['Machines supported', 'Software supported', 'File outputs', 'Associations'] }
];

export function Footer({ columns = COLS, onNavigate, style, ...rest }) {
  return (
    <footer {...rest} style={{
      background: 'var(--surface-sunken)', borderTop: 'var(--bw-hair) solid var(--border-subtle)',
      marginTop: 'var(--s-10)', ...style
    }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'var(--s-9) var(--gutter) var(--s-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: 'var(--s-8)' }}>
          <div>
            <Wordmark size={24} />
            <p style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '30ch', margin: 'var(--s-4) 0 var(--s-5)' }}>
              BIM services for wood-frame and light-gauge-steel construction. Framing models, detailing, permit sets and machine files.
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-4)', color: 'var(--text-muted)' }}>
              {['linkedin', 'youtube', 'message-circle', 'mail'].map((n) => (
                <a key={n} href="#" aria-label={n} onClick={(e) => e.preventDefault()} style={{ borderBottom: 'none', color: 'inherit', display: 'flex' }}>
                  <Icon name={n} size={20} />
                </a>
              ))}
            </div>
          </div>
          {columns.map((c) => (
            <div key={c.head}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 'var(--s-4)'
              }}>{c.head}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(l); }}
                       style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', borderBottom: 'none' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 'var(--s-8)', paddingTop: 'var(--s-5)', borderTop: 'var(--bw-hair) solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s-4)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)'
        }}>
          <span>© 2026 UBC BIM</span>
          <span>Latest LinkedIn and YouTube content embeds here — feed pending</span>
        </div>
      </div>
    </footer>
  );
}
