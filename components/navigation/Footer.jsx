import React from 'react';
import Link from 'next/link';
import { Wordmark } from '../core/Wordmark.jsx';
import { SocialIcon } from '../core/SocialIcon.jsx';

// Every link here is a real URL (crawlable, not a click handler on "#"), so
// the footer doubles as a site map on every page: each service, each project
// type, each blog post, the company pages, the privacy policy, the BIM Pulse
// login and the social channels. A link is { label, href, external? }; a
// hash link (/services#bom-estimation) is a plain <a> so landing on the same
// page still fires the hashchange the page listens for.
const DEFAULT_SOCIAL = [];

function FooterLink({ link }) {
  const style = { fontSize: 'var(--fs-body-sm)', lineHeight: 1.5, color: 'var(--text-body)', borderBottom: 'none', display: 'inline-block', padding: '2px 0', minHeight: 24 };
  if (link.external) {
    return <a href={link.href} target="_blank" rel="noopener noreferrer" style={style}>{link.label}<span className="ubc-visually-hidden"> (opens in a new tab)</span></a>;
  }
  if (link.href.includes('#')) return <a href={link.href} style={style}>{link.label}</a>;
  return <Link href={link.href} style={style}>{link.label}</Link>;
}

export function Footer({ columns = [], social = DEFAULT_SOCIAL, legal = [], style, ...rest }) {
  return (
    // Blue on every page: .ubc-frame-blue (responsive.css) re-scopes the
    // text and border tokens to their white-on-blue values, so every
    // var(--text-*) below reads white without touching each style.
    <footer {...rest} className={['ubc-frame-blue', 'ubc-footer', rest.className].filter(Boolean).join(' ')} style={{
      background: 'var(--frame-blue)', color: 'var(--white)',
      marginTop: 'var(--s-10)', ...style
    }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'var(--s-9) var(--gutter) var(--s-6)' }}>
        <div className="ubc-footer-grid">
          <div>
            <Wordmark size={24} tone="inverse" />
            <p style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', maxWidth: '30ch', margin: 'var(--s-4) 0 var(--s-5)' }}>
              BIM services for wood-frame and light-gauge-steel construction. Framing models, detailing, permit sets and machine files.
            </p>
            {social.length > 0 && (
              <ul className="ubc-footer-social" aria-label="UBC BIM on social media">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer me" title={s.label}>
                      <SocialIcon name={s.label} />
                      <span className="ubc-visually-hidden">{s.label} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {columns.map((c) => (
            <nav key={c.head} aria-label={c.head}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 'var(--s-4)'
              }}>{c.head}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                {c.links.map((l) => <li key={l.href + l.label}><FooterLink link={l} /></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div style={{
          marginTop: 'var(--s-8)', paddingTop: 'var(--s-5)', borderTop: 'var(--bw-hair) solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--s-4)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)'
        }}>
          <span>© {new Date().getFullYear()} UBC BIM</span>
          {legal.length > 0 && (
            <span style={{ display: 'flex', gap: 'var(--s-5)', flexWrap: 'wrap' }}>
              {legal.map((l) => <FooterLink key={l.href} link={l} />)}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
