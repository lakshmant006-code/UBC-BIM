import '../styles.css';
import '../ui_kits/website/responsive.css';
import { AppChrome } from './AppChrome.jsx';
import { UBC_DATA } from '../ui_kits/website/data.js';
import { SITE_URL, SITE_NAME, SHARE_IMAGE, abs, serviceHref } from '../ui_kits/website/site.js';
import { Archivo, IBM_Plex_Sans } from 'next/font/google';

// Fonts are downloaded at build time and served from this site (next/font),
// not @imported from fonts.googleapis.com: no render-blocking third-party
// stylesheet, no extra connection chain before text can paint. The CSS
// variables they set feed --font-display / --font-body in tokens/fonts.css.
const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-archivo' });
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-plex-sans' });

// The site-wide defaults index.html's single shared <title>/meta block used
// to carry for every "page" of the old SPA; each route below now sets its
// own, more specific metadata, which Next.js merges over these.
// metadataBase makes every page's canonical and preview-image path absolute
// on the launch domain (site.js SITE_URL).
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'CFS, LGSF & Wood BIM Detailing Services | UBC BIM',
  description: 'CFS, LGSF and wood-frame detailing: panel layouts, truss layouts, shop drawings, BOM and machine files from one coordinated model.',
  openGraph: { siteName: SITE_NAME, type: 'website', images: [{ url: SHARE_IMAGE, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: [SHARE_IMAGE] }
};

// Same keyframes index.html's own inline <style> block defined, for the
// Contact page's bell (ubcRing/ubcPulse), the ChatBot quick-answers caret
// nobody currently uses (ubcCaret, left as-is for parity), the logo
// carousels (ubcMarqueeH) and hotspot pulse (ubcHotspotPulse) used across
// Home, Portfolio, MockingBirdModel;
// ubcWayFill (The UBC Way progress bars) on Home.
const KEYFRAMES = `@keyframes ubcRing{0%{transform:translateX(-50%) rotate(0)}18%{transform:translateX(-50%) rotate(-13deg)}38%{transform:translateX(-50%) rotate(11deg)}58%{transform:translateX(-50%) rotate(-7deg)}78%{transform:translateX(-50%) rotate(4deg)}100%{transform:translateX(-50%) rotate(0)}}@keyframes ubcPulse{0%{opacity:.9;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(2.6)}}@keyframes ubcCaret{0%,49%{opacity:1}50%,100%{opacity:0}}@keyframes ubcMarqueeH{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes ubcHotspotPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(2.2)}}@keyframes ubcWayFill{from{width:0}to{width:100%}}`;

// Organisation schema on every page. Address is the US office the site
// already names (About: Fort Mill, South Carolina); sameAs is the company's
// own social channels. Phone and email are left out until supplied.
// The one Organization entity every page points at (service pages name it
// as their provider by @id). Per the team's SEO handoff (15 Oct 2026); the
// address, phone and email are UBC_DATA.contact, which that handoff asks
// the director to confirm before launch.
const C = UBC_DATA.contact;
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': abs('/#organization'),
  name: 'UBC BIM',
  alternateName: 'Unique Building Concepts',
  legalName: C.legalName,
  description: 'BIM, engineering, permit documentation and manufacturing for CFS, LGSF and wood-frame construction: drafting, bills of material and estimation, permit sets, modeling and detailing, structural engineering, and manufacture and supply of building components.',
  url: abs('/'),
  logo: abs('/assets/brand/ubc-logo.png'),
  image: abs(SHARE_IMAGE),
  telephone: C.phone,
  email: C.email,
  address: { '@type': 'PostalAddress', streetAddress: C.address.street, addressLocality: C.address.city, addressRegion: C.address.region, postalCode: C.address.postalCode, addressCountry: C.address.country },
  areaServed: ['US', 'CA', 'AU', 'NZ', 'CL', 'IN', 'AE'],
  knowsAbout: ['Cold-formed steel framing', 'Light-gauge steel framing', 'Wood-frame construction', 'BIM modeling', 'Permit drawings', 'Bill of materials', 'Roll-former machine files'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: (UBC_DATA.serviceArticles || []).map((a) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: a.title, url: abs(serviceHref(a)) } }))
  },
  sameAs: (UBC_DATA.social || []).map((s) => s.href)
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={archivo.variable + ' ' + plexSans.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      </head>
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
