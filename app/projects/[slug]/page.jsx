import { notFound } from 'next/navigation';
import { UBC_DATA } from '../../../ui_kits/website/data.js';
import { ProjectPage } from '../../../ui_kits/website/Portfolio.jsx';
import { projectSlug, projectBySlug, projectHref, pageMeta, breadcrumbSchema, SITE_NAME } from '../../../ui_kits/website/site.js';

// One static page per project, named generically (no client project
// names, per the director), e.g. /projects/single-family-home-two-storeys-lgsf.
export const dynamicParams = false;
export function generateStaticParams() {
  return (UBC_DATA.projects || []).map((p) => ({ slug: projectSlug(p) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const desc = p.name + ': a ' + p.system.toLowerCase() + ' ' + p.type.toLowerCase() + ' project with a live 3D model you can rotate. ' + p.delivered + ' (' + p.software.join(', ') + ').';
  return pageMeta({ title: p.name + ' \u00b7 ' + p.system + ' | ' + SITE_NAME, description: desc, path: projectHref(p) });
}

export default async function ProjectRoute({ params }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const crumbs = breadcrumbSchema([['Home', '/'], ['Projects', '/projects'], [p.name, projectHref(p)]]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <ProjectPage slug={slug} />
    </>
  );
}
