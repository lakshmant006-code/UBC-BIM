#!/usr/bin/env node
// One-time Zoho CRM setup: swap a Self Client grant code for the long-lived
// refresh token app/api/project/zoho.js needs.
//
// 1. https://api-console.zoho.com (or .eu / .in / .com.au ... for your data
//    centre) -> Add Client -> Self Client. Copy its Client ID and Secret.
// 2. Self Client -> Generate Code, scope:
//      ZohoCRM.modules.leads.CREATE
//    duration 10 minutes. Copy the code.
// 3. Within those 10 minutes:
//      node tools/zoho_refresh_token.mjs CLIENT_ID CLIENT_SECRET CODE [dc]
//    dc is com (default), eu, in, com.au, jp, ca, sa or com.cn.
// 4. Put ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN and ZOHO_DC in
//    Vercel (Project -> Settings -> Environment Variables) and redeploy.

const [id, secret, code, dc = 'com'] = process.argv.slice(2);
if (!id || !secret || !code) {
  console.error('usage: node tools/zoho_refresh_token.mjs CLIENT_ID CLIENT_SECRET GRANT_CODE [dc]');
  process.exit(1);
}
const q = new URLSearchParams({ grant_type: 'authorization_code', client_id: id, client_secret: secret, code });
const res = await fetch('https://accounts.zoho.' + dc + '/oauth/v2/token?' + q.toString(), { method: 'POST' });
const j = await res.json();
if (!j.refresh_token) {
  console.error('Zoho answered:', j);
  console.error('A grant code works once and only for 10 minutes; generate a new one if it expired.');
  process.exit(1);
}
console.log('ZOHO_REFRESH_TOKEN=' + j.refresh_token);
console.log('ZOHO_DC=' + dc);
