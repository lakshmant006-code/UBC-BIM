import { UBC_DATA } from '../ui_kits/website/data.js';
import { abs, serviceHref, projectHref, postHref } from '../ui_kits/website/site.js';

// Generated from the routes themselves, so every service, project and blog
// post page is listed on the launch domain (site.js SITE_URL).
//
// lastModified is the date each page's content last changed (team SEO
// handoff: not the build time). Service pages carry their own `updated`
// date (UBC_DATA.servicePages, also shown on the page); the rest are listed
// here and should be bumped by hand when that page's content changes.
const CHANGED = {
  home: '2026-10-18',
  services: '2026-10-12',
  projects: '2026-10-18',
  about: '2026-10-18',
  blogs: '2026-10-18',
  posts: '2026-10-18',
  careers: '2026-10-05',
  contact: '2026-10-18',
  privacy: '2026-10-12'
};

export default function sitemap() {
  const page = (path, date, priority, changeFrequency = 'monthly') => ({ url: abs(path), lastModified: new Date(date + 'T00:00:00Z'), changeFrequency, priority });
  const svc = UBC_DATA.servicePages || {};
  return [
    page('/', CHANGED.home, 1.0),
    page('/services', CHANGED.services, 0.9),
    ...(UBC_DATA.serviceArticles || []).map((a) => page(serviceHref(a), (svc[a.id] && svc[a.id].updated) || CHANGED.services, 0.9)),
    page('/projects', CHANGED.projects, 0.8),
    ...(UBC_DATA.projects || []).map((p) => page(projectHref(p), CHANGED.projects, 0.6)),
    page('/about', CHANGED.about, 0.7),
    page('/blogs', CHANGED.blogs, 0.7, 'weekly'),
    ...(UBC_DATA.blogPosts || []).map((p) => page(postHref(p), CHANGED.posts, 0.6)),
    page('/careers', CHANGED.careers, 0.5),
    page('/contact', CHANGED.contact, 0.8),
    page('/privacy', CHANGED.privacy, 0.2, 'yearly')
  ];
}
