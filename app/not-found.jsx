import Link from 'next/link';
import { Page, Section } from '../ui_kits/website/shared.jsx';

// Our own 404 replaces Next's default one, whose built-in <title> sat beside
// the layout's and gave the page two title tags.
export const metadata = { title: 'Page not found | UBC BIM', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <Section>
      <Page>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>404</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '0.12em', lineHeight: 'var(--lh-heading)', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--text-strong)', margin: 'var(--s-3) 0 0' }}>We couldn't find that page</h1>
          <p style={{ lineHeight: 'var(--lh-relaxed)', color: 'var(--text-body)', margin: 'var(--s-4) 0 var(--s-6)' }}>It may have moved when the site was rebuilt. These will get you back on track:</p>
          <p style={{ display: 'flex', gap: 'var(--s-5)', justifyContent: 'center', flexWrap: 'wrap', margin: 0 }}>
            {[['/', 'Home'], ['/services', 'Services'], ['/projects', 'Projects'], ['/contact', 'Contact']].map(([h, l]) => (
              <Link key={h} href={h} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 600, color: 'var(--text-accent)' }}>{l} {'→'}</Link>
            ))}
          </p>
        </div>
      </Page>
    </Section>
  );
}
