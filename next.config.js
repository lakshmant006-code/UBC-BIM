/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip Next.js 16's auto-generated AGENTS.md/CLAUDE.md agent-rules files —
  // unrelated to this migration and just noise in the diff.
  agentRules: false,
  // BIM Pulse is the team's project platform; /admin is a short, memorable
  // way in that always lands on its login.
  async redirects() {
    return [{ source: '/admin', destination: 'https://app.bimpulse.world/login', permanent: false }];
  }
};

module.exports = nextConfig;
