import { Portfolio } from '../../ui_kits/website/Portfolio.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'CFS, LGSF & Wood Framing Projects in 3D | UBC BIM',
  description: 'Rotate real light-gauge steel and wood-frame projects in 3D: residential, commercial and multi-family, each with its specification and deliverables.',
  path: '/projects'
});

export default function ProjectsPage() {
  return <Portfolio />;
}
