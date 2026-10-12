import { Careers } from '../../ui_kits/website/Careers.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'Careers | UBC BIM',
  description: 'Join the UBC BIM team: open roles for BIM modellers, truss designers and coordinators, plus a place to send a speculative application.',
  path: '/careers'
});

export default function CareersPage() {
  return <Careers />;
}
