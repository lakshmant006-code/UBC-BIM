import { MockingBirdModel } from '../../ui_kits/website/MockingBirdModel.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'CFS, LGSF & Wood BIM Services | UBC BIM',
  description: 'Drafting, BOM and estimation, permit sets, modeling and detailing, engineering and manufacturing for CFS, LGSF and wood, all from one coordinated model.',
  path: '/services'
});

export default function ServicesPage() {
  return <MockingBirdModel />;
}
