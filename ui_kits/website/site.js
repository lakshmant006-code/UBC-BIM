/*
  Site-wide SEO helpers: the canonical domain, URL slugs for services,
  projects and blog posts, and one metadata builder every route uses, so
  each page gets its own title, description, canonical URL and link-preview
  (Open Graph / Twitter) tags without repeating them.

  SITE_URL is the final public domain the canonical tags, sitemap and
  structured data point at (the team's SEO audit: ubcbim.com, not the
  vercel.app preview). Override it with NEXT_PUBLIC_SITE_URL if the
  launch domain differs (e.g. https://www.ubcbim.com).
*/
import { UBC_DATA } from './data.js';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ubcbim.com').replace(/\/+$/, '');
export const SITE_NAME = 'UBC BIM';
export const SHARE_IMAGE = '/og/ubc-bim-share.jpg';

export const abs = (path) => SITE_URL + (path.startsWith('/') ? path : '/' + path);

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Services: an explicit `slug` in data.js wins (descriptive URLs such as
// bill-of-materials-estimation); otherwise the article id.
export const serviceSlug = (a) => a.slug || a.id;
export const serviceHref = (a) => '/services/' + serviceSlug(a);
export const serviceById = (id) => (UBC_DATA.serviceArticles || []).find((a) => a.id === id);
export const serviceBySlug = (slug) => (UBC_DATA.serviceArticles || []).find((a) => serviceSlug(a) === slug);

// Projects: from the generic name plus framing system, never the internal
// id (ids still carry client project names, which the director asked to
// keep off the site), e.g. /projects/single-family-home-two-storeys-lgsf.
const SYSTEM_SLUG = { 'Light-gauge steel': 'lgsf', 'Wood frame': 'wood', 'Mixed construction': 'mixed' };
export const projectSlug = (p) => slugify(p.name) + (SYSTEM_SLUG[p.system] ? '-' + SYSTEM_SLUG[p.system] : '');
export const projectHref = (p) => '/projects/' + projectSlug(p);
export const projectBySlug = (slug) => (UBC_DATA.projects || []).find((p) => projectSlug(p) === slug);

// Blog posts: the post id is already a readable slug (climbing-wall-lgsf).
export const postHref = (p) => '/blogs/' + p.id;
export const postBySlug = (slug) => (UBC_DATA.blogPosts || []).find((p) => p.id === slug);

// Descriptions are cut at a word boundary to 155 characters, the length
// search results show in full.
export function clip(text, max = 155) {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]+$/, '') + '…';
}

// One metadata object per route: title, description, canonical, and the
// link-preview tags LinkedIn, X and messaging apps read.
export function pageMeta({ title, description, path, image, type = 'website' }) {
  const desc = clip(description);
  const img = image || SHARE_IMAGE;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, siteName: SITE_NAME, type, images: [{ url: img }] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img] }
  };
}

// BreadcrumbList for a page's trail, e.g. [['Home','/'],['Services','/services'],[title, path]].
export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) }))
  };
}
