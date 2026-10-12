import { Blogs } from '../../ui_kits/website/Blogs.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'Blog: LGSF & Wood Framing Insights | UBC BIM',
  description: 'Technical write-ups, project stories and behind-the-scenes notes from the UBC BIM team on CFS, LGSF and wood-frame detailing and engineering.',
  path: '/blogs'
});

export default function BlogsPage() {
  return <Blogs />;
}
