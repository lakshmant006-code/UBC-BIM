/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip Next.js 16's auto-generated AGENTS.md/CLAUDE.md agent-rules files —
  // unrelated to this migration and just noise in the diff.
  agentRules: false,
  // Keep the vercel.app preview out of search results until launch (team SEO
  // audit): every response on a *.vercel.app host carries noindex, so Google
  // never indexes the preview as the original and the launch domain as the
  // copy. The launch domain gets no such header.
  //
  // Images, models, video and fonts under /assets never change in place (a
  // new version gets a new file name), so browsers may keep them for a year.
  async headers() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: '(?<host>.*\\.vercel\\.app)' }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    }, {
      source: '/assets/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    }];
  },
  // BIM Pulse is the team's project platform; /admin is a short, memorable
  // way in that always lands on its login.
  async redirects() {
    return [{ source: '/admin', destination: 'https://app.bimpulse.world/login', permanent: false }];
  }
};

module.exports = nextConfig;
