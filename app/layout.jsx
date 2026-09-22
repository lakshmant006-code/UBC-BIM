import '../styles.css';
import '../ui_kits/website/responsive.css';
import { AppChrome } from './AppChrome.jsx';

// The site-wide defaults index.html's single shared <title>/meta block used
// to carry for every "page" of the old SPA; each route below now sets its
// own, more specific metadata, which Next.js merges over these.
export const metadata = {
  title: 'CFS & LGSF BIM Detailing Services | UBC BIM',
  description: 'Outsourced CFS and LGSF detailing: panel layouts, truss layouts, shop drawings, BOM and machine files from one coordinated model. 783 projects, 12 countries.'
};

// Same keyframes index.html's own inline <style> block defined, for the
// Contact page's bell (ubcRing/ubcPulse), the ChatBot quick-answers caret
// nobody currently uses (ubcCaret, left as-is for parity), and the two logo
// / testimonial marquees (ubcMarqueeV/ubcMarqueeH) and hotspot pulse
// (ubcHotspotPulse) used across Home, Portfolio, MockingBirdModel.
const KEYFRAMES = `@keyframes ubcRing{0%{transform:translateX(-50%) rotate(0)}18%{transform:translateX(-50%) rotate(-13deg)}38%{transform:translateX(-50%) rotate(11deg)}58%{transform:translateX(-50%) rotate(-7deg)}78%{transform:translateX(-50%) rotate(4deg)}100%{transform:translateX(-50%) rotate(0)}}@keyframes ubcPulse{0%{opacity:.9;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(2.6)}}@keyframes ubcCaret{0%,49%{opacity:1}50%,100%{opacity:0}}@keyframes ubcMarqueeV{from{transform:translateY(0)}to{transform:translateY(calc(-100% - var(--ubc-mq-gap)))}}@keyframes ubcMarqueeH{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes ubcHotspotPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(2.2)}}`;

// The same ProfessionalService JSON-LD index.html already carried — Phase 1
// preserves existing schema as-is; adding anything beyond this is Phase 4.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'UBC BIM',
  description: 'CFS and LGSF (light-gauge steel framing) and wood-frame BIM detailing: wall panels, roof and floor trusses, MEP coordination, permit sets and machine files.',
  url: 'https://ubc-bim.vercel.app/',
  image: 'https://ubc-bim.vercel.app/ui_kits/website/assets/frames/05-facade.jpg',
  areaServed: 'Worldwide',
  knowsAbout: ['Building Information Modelling', 'Cold-formed steel (CFS) framing', 'Light-gauge steel framing (LGSF)', 'Wood frame construction', 'Roof and floor trusses', 'MEP clash detection', 'Permit documentation'],
  serviceType: ['Wall panel detailing', 'Roof and floor trusses', 'Engineering of walls and trusses', 'MEP detailing and clash detection', 'Permit documents', 'Bill of Materials and machine CSV', 'Architectural drafting']
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
