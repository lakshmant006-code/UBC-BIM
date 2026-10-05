'use client';
import React from 'react';
import Link from 'next/link';
import { Wordmark } from '../core/Wordmark.jsx';

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

// The nav links sit in a pill. Once the page is scrolled the pill springs
// down to a compact form (the links fade out, the pill closes up to its two
// end marks); hovering it, focusing into it, tapping its menu mark or
// scrolling back to the top springs it open again. "Request Quote" is not
// here: it is the floating StickyQuote button. Styles: .ubc-navpill-* in
// ui_kits/website/responsive.css.
function NavPill({ items, active, scrolled }) {
  const listRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const el = listRef.current; if (!el) return undefined;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A tap-opened pill stays open until the page moves on again.
  React.useEffect(() => {
    if (!open) return undefined;
    const from = window.scrollY;
    const on = () => { if (Math.abs(window.scrollY - from) > 48) setOpen(false); };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [open]);
  React.useEffect(() => { if (!scrolled) setOpen(false); }, [scrolled]);

  const collapsed = scrolled && !hover && !focused && !open;
  return (
    <nav aria-label="Main" className={'ubc-navpill' + (collapsed ? ' is-collapsed' : '')}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
      <button type="button" className="ubc-navpill-end ubc-navpill-menu" aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show navigation' : 'Navigation shown'} tabIndex={scrolled ? 0 : -1}
        onClick={() => setOpen((v) => (collapsed ? true : v))}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <circle cx="4" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" /><circle cx="14" cy="9" r="1.6" />
        </svg>
      </button>
      <div className="ubc-navpill-track" style={width ? { width: collapsed ? 20 : width } : undefined}>
        <ul ref={listRef} className="ubc-navpill-list">
          {items.map((it, i) => {
            const on = active === it.id;
            return (
              <li key={it.id} style={{ '--i': i }}>
                <Link href={idToHref(it.id)} className={'ubc-navpill-link' + (on ? ' is-on' : '')}
                  aria-current={on ? 'page' : undefined}>{it.label}</Link>
              </li>
            );
          })}
        </ul>
      </div>
      <span className="ubc-navpill-end ubc-navpill-dot" aria-hidden="true"><span /></span>
    </nav>
  );
}

export function Header({ items = NAV, active, scrolled, style, ...rest }) {
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
      <div className="ubc-header-row" style={{
        maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--gutter)',
        height: scrolled ? 64 : 76, transition: 'height var(--dur-2) var(--ease-out)'
      }}>
        <Link href="/" style={{ borderBottom: 'none', display: 'flex' }}>
          <Wordmark size={21} />
        </Link>
        <NavPill items={items} active={active} scrolled={scrolled} />
      </div>
    </header>
  );
}
