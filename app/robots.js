import { abs } from '../ui_kits/website/site.js';

// Open to crawlers; the vercel.app preview is kept out of the index by an
// X-Robots-Tag: noindex header instead (next.config.js), so this file can
// stay the same for launch.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] }],
    sitemap: abs('/sitemap.xml')
  };
}
