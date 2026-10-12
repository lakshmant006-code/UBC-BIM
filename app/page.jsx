import { Home } from '../ui_kits/website/Home.jsx';
import { UBC_DATA } from '../ui_kits/website/data.js';
import { pageMeta } from '../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'CFS, LGSF & Wood Detailing, Engineered for Construction | UBC BIM',
  description: 'BIM modeling, engineering, permit sets, BOM and shop drawings for CFS, LGSF and wood manufacturers, contractors and builders. 783 projects in 12 countries.',
  path: '/'
});

// FAQPage schema built from the same list the homepage FAQ accordion renders.
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (UBC_DATA.faq || []).map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <Home />
    </>
  );
}
