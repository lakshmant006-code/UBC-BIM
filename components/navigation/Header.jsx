'use client';
import React from 'react';
import Link from 'next/link';

const NAV = [
  { label: 'Services', id: 'services' },
  { label: 'Projects', id: 'projects' },
  { label: 'About', id: 'about' },
  { label: 'Careers', id: 'careers' },
  { label: 'Contact', id: 'contact' }
];

// A nav item's `id` (services/projects/about/careers/blogs/contact) doubles
// as its real route segment now that every page has a real URL — 'home' is
// the one exception, for the logo link back to '/'.
const idToHref = (id) => (id === 'home' ? '/' : '/' + id);

// The nav links sit in a pill with a small mark at each end; it stays the
// same open pill at any scroll position. The standalone "Start Your Next Project"
// button sits just right of it (Header below). Styles: .ubc-navpill-* and
// .ubc-header-cta in ui_kits/website/responsive.css.
// The "⋯" at the pill's left end is a small menu: the BIM Pulse client
// platform login (also at ubcbim.../admin and in the footer).
const MORE = [{ label: 'BIM Pulse login', href: 'https://app.bimpulse.world/login', external: true }];

function MoreMenu() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className="ubc-navpill-more">
      <button type="button" className="ubc-navpill-end ubc-navpill-menu" aria-label="More" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)}>
        <svg width="18" height="18" viewBox="0 0 18 18" focusable="false" aria-hidden="true">
          <circle cx="4" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" /><circle cx="14" cy="9" r="1.6" />
        </svg>
      </button>
      {open && (
        <ul className="ubc-navpill-pop">
          {MORE.map((m) => (
            <li key={m.href}>
              <a href={m.href} target={m.external ? '_blank' : undefined} rel={m.external ? 'noopener noreferrer' : undefined} onClick={() => setOpen(false)}>
                {m.label}{m.external ? ' \u2197' : ''}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NavPill({ items, active }) {
  return (
    <nav aria-label="Main" className="ubc-navpill">
      <MoreMenu />
      <ul className="ubc-navpill-list">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <li key={it.id}>
              <Link href={idToHref(it.id)} className={'ubc-navpill-link' + (on ? ' is-on' : '')}
                aria-current={on ? 'page' : undefined}>{it.label}</Link>
            </li>
          );
        })}
      </ul>
      <span className="ubc-navpill-end ubc-navpill-dot" aria-hidden="true"><span /></span>
    </nav>
  );
}

export function Header({ items = NAV, active, scrolled, onQuote, style, ...rest }) {
  return (
    <header {...rest} style={{
      position: 'sticky', top: 0, zIndex: 40,
      // No bar behind the header: the logo, nav pill and button float.
      background: 'transparent', pointerEvents: 'none',
      ...style
    }}>
      <div className="ubc-header-row" style={{
        maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)',
        height: 76
      }}>
        <Link href="/" aria-label="UBC BIM home" style={{ borderBottom: 'none', display: 'flex', alignItems: 'center', minHeight: 44 }}>
          {/* Client logo: Unique Building Concepts, BIM Services */}
          <img src="/assets/brand/ubc-logo.webp" srcSet="/assets/brand/ubc-logo-1x.webp 1x, /assets/brand/ubc-logo.webp 2x" alt="UBC: Unique Building Concepts, BIM Services" width={228} height={40} className="ubc-header-logo" />
        </Link>
        <NavPill items={items} active={active} />
        <button type="button" className="ubc-header-cta" onClick={onQuote}>Start Your Next Project<span className="ubc-header-cta-arrow" aria-hidden="true">{'\u00a0\u2192'}</span></button>
      </div>
    </header>
  );
}
