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

// The nav links sit in a pill with a small mark at the right end; the
// standalone "Start Your Next Project" button sits just right of it. The
// BIM Pulse client login is a visible link at the end of the pill (it used
// to hide under a "..." menu). Styles: .ubc-navpill-* and .ubc-header-cta
// in ui_kits/website/responsive.css.
const CLIENT_LOGIN = { label: 'Client login', href: 'https://app.bimpulse.world/login' };

function NavPill({ items, active }) {
  return (
    <nav aria-label="Main" className="ubc-navpill">
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
        <li>
          <a href={CLIENT_LOGIN.href} target="_blank" rel="noopener noreferrer" className="ubc-navpill-link ubc-navpill-login">
            {CLIENT_LOGIN.label}<span aria-hidden="true">{' \u2197'}</span><span className="ubc-visually-hidden"> (BIM Pulse, opens in a new tab)</span>
          </a>
        </li>
      </ul>
      <span className="ubc-navpill-end ubc-navpill-dot" aria-hidden="true"><span /></span>
    </nav>
  );
}

// Phones and tablets (1000px and below): a menu button opens a full-height
// panel with every page, the six services, the project CTA, the client
// login and a tap-to-call link. Escape, the close button or choosing a link
// closes it; focus moves into the panel and back to the button.
function MobileMenu({ items, active, services, phone, onQuote }) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef(null);
  const panelRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement, prev = root.style.overflow;
    root.style.overflow = 'hidden';
    root.classList.add('ubc-menu-open');
    root.classList.add('ubc-menu-open');
    const first = panelRef.current && panelRef.current.querySelector('a, button');
    if (first) first.focus();
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => {
      root.style.overflow = prev;
      root.classList.remove('ubc-menu-open');
      root.classList.remove('ubc-menu-open');
      document.removeEventListener('keydown', esc);
      if (btnRef.current) btnRef.current.focus({ preventScroll: true });
    };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <>
      <button ref={btnRef} type="button" className="ubc-menu-btn" aria-expanded={open} aria-controls="ubc-mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div id="ubc-mobile-menu" ref={panelRef} className={'ubc-mobile-menu' + (open ? ' is-open' : '')} hidden={!open}>
        <nav aria-label="Mobile">
          <ul className="ubc-mm-pages">
            <li><Link href="/" onClick={close} aria-current={active === 'home' ? 'page' : undefined}>Home</Link></li>
            {items.map((it) => (
              <li key={it.id}><Link href={idToHref(it.id)} onClick={close} aria-current={active === it.id ? 'page' : undefined}>{it.label}</Link></li>
            ))}
          </ul>
          {services && services.length > 0 && (
            <>
              <div className="ubc-mm-head">Services</div>
              <ul className="ubc-mm-services">
                {services.map((sv) => <li key={sv.href}><Link href={sv.href} onClick={close}>{sv.label}</Link></li>)}
              </ul>
            </>
          )}
        </nav>
        <div className="ubc-mm-actions">
          <button type="button" className="ubc-btn-solid" onClick={(e) => { close(); if (onQuote) onQuote(e); }}>Start Your Next Project {'\u2192'}</button>
          {phone && <a className="ubc-mm-call" href={'tel:' + phone.replace(/[^+\d]/g, '')}>Call {phone}</a>}
          <a className="ubc-mm-call" href={CLIENT_LOGIN.href} target="_blank" rel="noopener noreferrer" onClick={close}>{CLIENT_LOGIN.label} (BIM Pulse) {'\u2197'}</a>
        </div>
      </div>
    </>
  );
}

export function Header({ items = NAV, active, scrolled, onQuote, services, phone, style, ...rest }) {
  return (
    // A solid white bar, so the logo never sits over page content; a light
    // shadow appears once the page scrolls (.ubc-header.is-scrolled).
    <header {...rest} className={'ubc-header' + (scrolled ? ' is-scrolled' : '')} style={style}>
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
        <MobileMenu items={items} active={active} services={services} phone={phone} onQuote={onQuote} />
      </div>
    </header>
  );
}
