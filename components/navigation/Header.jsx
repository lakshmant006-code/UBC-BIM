'use client';
import React from 'react';
import Link from 'next/link';
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

// A nav item's `id` (services/projects/about/careers/blogs/contact) doubles
// as its real route segment now that every page has a real URL — 'home' is
// the one exception, for the logo link back to '/'.
const idToHref = (id) => (id === 'home' ? '/' : '/' + id);

export function Header({ items = NAV, active, onNavigate, scrolled, onQuote, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <header {...rest} style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: scrolled ? 'rgba(255,255,255,.82)' : 'var(--surface-page)',
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
        <Link href="/" style={{ borderBottom: 'none', display: 'flex' }}>
          <Wordmark size={21} />
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--s-6)', marginLeft: 'var(--s-4)' }}>
          {items.map((it) => {
            const on = active === it.id;
            return (
              <Link key={it.id} href={idToHref(it.id)}
                 onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}
                 style={{
                   fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-medium)',
                   color: on ? 'var(--text-strong)' : (hover === it.id ? 'var(--accent)' : 'var(--text-muted)'),
                   paddingBottom: 4, borderBottom: 'var(--bw-2) solid ' + (on ? 'var(--accent)' : 'transparent'),
                   transition: 'var(--t-hover)'
                 }}>{it.label}</Link>
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
