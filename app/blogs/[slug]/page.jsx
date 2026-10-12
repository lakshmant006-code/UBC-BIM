import { notFound } from 'next/navigation';
import { UBC_DATA } from '../../../ui_kits/website/data.js';
import { BlogPost } from '../../../ui_kits/website/Blogs.jsx';
import { postBySlug, postHref, pageMeta, breadcrumbSchema, abs, SITE_NAME } from '../../../ui_kits/website/site.js';

// One static page per post (team SEO audit: each post its own URL).
export const dynamicParams = false;
export function generateStaticParams() {
  return (UBC_DATA.blogPosts || []).map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return {};
  return pageMeta({ title: p.title + ' | ' + SITE_NAME, description: p.excerpt || p.title, path: postHref(p), image: p.image, type: 'article' });
}

export default async function BlogPostRoute({ params }) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  const published = p.date ? new Date(p.date + ' UTC') : null;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      image: p.image ? abs(p.image) : undefined,
      datePublished: published && !isNaN(published) ? published.toISOString().slice(0, 10) : undefined,
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: abs('/assets/brand/ubc-logo.png') } },
      mainEntityOfPage: abs(postHref(p))
    },
    breadcrumbSchema([['Home', '/'], ['Blog', '/blogs'], [p.shortTitle || p.title, postHref(p)]])
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BlogPost id={p.id} />
    </>
  );
}
