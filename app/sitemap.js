import { UBC_DATA } from '../ui_kits/website/data.js';
import { abs, serviceHref, projectHref, postHref } from '../ui_kits/website/site.js';

// Generated from the routes themselves, so every service, project and blog
// post page is listed on the launch domain (site.js SITE_URL).
export default function sitemap() {
  const now = new Date();
  const page = (path, priority, changeFrequency = 'monthly') => ({ url: abs(path), lastModified: now, changeFrequency, priority });
  return [
    page('/', 1.0),
    page('/services', 0.9),
    ...(UBC_DATA.serviceArticles || []).map((a) => page(serviceHref(a), 0.9)),
    page('/projects', 0.8),
    ...(UBC_DATA.projects || []).map((p) => page(projectHref(p), 0.6)),
    page('/about', 0.7),
    page('/blogs', 0.7, 'weekly'),
    ...(UBC_DATA.blogPosts || []).map((p) => page(postHref(p), 0.6)),
    page('/careers', 0.5),
    page('/contact', 0.8),
    page('/privacy', 0.2, 'yearly')
  ];
}
