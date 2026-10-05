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
// same open pill at any scroll position. The standalone "Request Quote"
// button sits just right of it (Header below). Styles: .ubc-navpill-* and
// .ubc-header-cta in ui_kits/website/responsive.css.
function NavPill({ items, active }) {
  return (
    <nav aria-label="Main" className="ubc-navpill">
      <span className="ubc-navpill-end ubc-navpill-menu" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" focusable="false">
          <circle cx="4" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" /><circle cx="14" cy="9" r="1.6" />
        </svg>
      </span>
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
          <img src="/assets/brand/ubc-logo.png" alt="UBC: Unique Building Concepts, BIM Services" width={228} height={40} className="ubc-header-logo" />
        </Link>
        <NavPill items={items} active={active} />
        <button type="button" className="ubc-header-cta" onClick={onQuote}>Request Quote {'\u2192'}</button>
      </div>
    </header>
  );
}
