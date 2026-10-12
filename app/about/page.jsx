import { About } from '../../ui_kits/website/About.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'About UBC BIM | CFS, LGSF & Wood Engineering Team',
  description: 'Meet the UBC BIM engineering, BIM, detailing, coordination and QA team supporting CFS, LGSF and wood-framed projects for clients in 12 countries.',
  path: '/about'
});

export default function AboutPage() {
  return <About />;
}
