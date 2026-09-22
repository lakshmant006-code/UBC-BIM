/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip Next.js 16's auto-generated AGENTS.md/CLAUDE.md agent-rules files —
  // unrelated to this migration and just noise in the diff.
  agentRules: false
};

module.exports = nextConfig;
