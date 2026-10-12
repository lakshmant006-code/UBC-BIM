import { notFound } from 'next/navigation';
import { UBC_DATA } from '../../../ui_kits/website/data.js';
import { ServicePage } from '../../../ui_kits/website/ServicePage.jsx';
import { serviceSlug, serviceBySlug, serviceHref, pageMeta, breadcrumbSchema, abs, SITE_NAME } from '../../../ui_kits/website/site.js';

// One static page per service (team SEO audit: each service its own URL).
export const dynamicParams = false;
export function generateStaticParams() {
  return (UBC_DATA.serviceArticles || []).map((a) => ({ slug: serviceSlug(a) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = serviceBySlug(slug);
  if (!a) return {};
  return pageMeta({
    title: a.title + ' for CFS, LGSF & Wood | ' + SITE_NAME,
    description: a.summary,
    path: serviceHref(a)
  });
}

export default async function ServiceRoute({ params }) {
  const { slug } = await params;
  const a = serviceBySlug(slug);
  if (!a) notFound();
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: a.title,
      serviceType: a.title,
      description: a.summary,
      url: abs(serviceHref(a)),
      provider: { '@type': 'ProfessionalService', name: SITE_NAME, url: abs('/') },
      areaServed: a.regions || 'Worldwide'
    },
    breadcrumbSchema([['Home', '/'], ['Services', '/services'], [a.title, serviceHref(a)]])
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ServicePage id={a.id} />
    </>
  );
}
