import Link from 'next/link';
import { LeadConversion } from './LeadConversion.jsx';

// Reached only after a form submission was accepted. Kept out of search
// results here and out of the sitemap (app/sitemap.js lists routes by hand).
export const metadata = {
  title: 'Thank you | UBC BIM',
  robots: { index: false, follow: false }
};

export default function ThankYouPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--s-10, 96px) var(--gutter, 24px)', minHeight: '60vh' }}>
      <LeadConversion />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2, 36px)', fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Thank you, your project is with us</h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-body)', margin: 'var(--s-4, 16px) 0 var(--s-6, 32px)' }}>
        A detailer will reply with a scope, price and timeline within one working day.
      </p>
      <Link href="/" className="ubc-btn-solid">Back to home</Link>
    </main>
  );
}
