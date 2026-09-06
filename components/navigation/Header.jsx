import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Button } from '../core/Button.jsx';
import { Icon } from '../core/Icon.jsx';

const NAV = [
  { label: 'Services', id: 'services' },
  { label: 'Projects', id: 'projects' },
  { label: 'About', id: 'about' },
  { label: 'Careers', id: 'careers' },
  { label: 'Contact', id: 'contact' }
];
const SOCIAL = ['linkedin', 'youtube', 'message-circle'];

export function Header({ items = NAV, active, onNavigate, scrolled, onQuote, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <header {...rest} style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: scrolled ? 'rgba(245,244,241,.82)' : 'var(--surface-page)',
      backdropFilter: scrolled ? 'var(--blur-panel)' : 'none',
      WebkitBackdropFilter: scrolled ? 'var(--blur-panel)' : 'none',
      borderBottom: 'var(--bw-hair) solid ' + (scrolled ? 'var(--border-subtle)' : 'transparent'),
      transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out)',
      ...style
    }}>
      <div style={{
        maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)',
        height: scrolled ? 64 : 76, display: 'flex', alignItems: 'center', gap: 'var(--s-7)',
        transition: 'height var(--dur-2) var(--ease-out)'
      }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}
           style={{ borderBottom: 'none', display: 'flex' }}>
          <Wordmark size={21} />
        </a>
        <nav style={{ display: 'flex', gap: 'var(--s-6)', marginLeft: 'var(--s-4)' }}>
          {items.map((it) => {
            const on = active === it.id;
            // A nav item can carry its own `dropdown` (an array of
            // {label, onClick}), e.g. the service categories under
            // "Services": hovering the whole wrapper (link + panel), not
            // just the link, keeps the panel open while the cursor moves
            // down into it. Clicking the link itself still navigates
            // normally; the dropdown is a hover-only shortcut into one
            // part of wherever that navigation lands.
            const showDropdown = hover === it.id && it.dropdown && it.dropdown.length > 0;
            return (
              <div key={it.id} style={{ position: 'relative' }}
                onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}>
                <a href={'#' + it.id}
                   onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(it.id); }}
                   style={{
                     fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-medium)',
                     color: on ? 'var(--text-strong)' : (hover === it.id ? 'var(--accent)' : 'var(--text-muted)'),
                     paddingBottom: 4, borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'),
                     transition: 'var(--t-hover)'
                   }}>{it.label}</a>
                {showDropdown && (
                  <div className="ubc-nav-dropdown" style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 'var(--s-4)', minWidth: 280,
                    background: 'var(--surface-page)', border: 'var(--bw-hair) solid var(--border-subtle)',
                    borderRadius: 'var(--r-3)', boxShadow: 'var(--shadow-2)', padding: 'var(--s-2)', zIndex: 50
                  }}>
                    {it.dropdown.map((d) => (
                      <a key={d.label} href="#" className="ubc-nav-dropdown-item"
                         onClick={(e) => { e.preventDefault(); setHover(null); d.onClick && d.onClick(); }}
                         style={{
                           display: 'block', padding: '10px 12px', borderRadius: 'var(--r-2)',
                           fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', borderBottom: 'none'
                         }}>{d.label}</a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--s-5)' }}>
          <div style={{ display: 'flex', gap: 'var(--s-4)', color: 'var(--text-muted)' }}>
            {SOCIAL.map((n) => (
              <a key={n} href="#" onClick={(e) => e.preventDefault()} aria-label={n}
                 style={{ borderBottom: 'none', color: 'inherit', display: 'flex' }}>
                <Icon name={n} size={18} />
              </a>
            ))}
          </div>
          <span style={{ width: 1, height: 22, background: 'var(--border-subtle)' }} />
          <Button size="sm" variant="secondary" onClick={() => onNavigate && onNavigate('contact')}>Book a call</Button>
          <Button size="sm" onClick={onQuote}>Request a quote</Button>
        </div>
      </div>
    </header>
  );
}
