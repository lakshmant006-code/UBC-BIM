import { Home } from '../ui_kits/website/Home.jsx';
import { UBC_DATA } from '../ui_kits/website/data.js';

export const metadata = {
  title: 'CFS & LGSF Detailing, Engineered for Construction | UBC BIM',
  description: 'Estimating, BIM modeling, engineering, permit sets and shop drawings for CFS and LGSF manufacturers, contractors, builders and fabricators. 783 projects, 12 countries.'
};

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
