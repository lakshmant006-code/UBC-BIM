// Zoho CRM: every website form submission becomes a Lead.
//
// Uses Zoho's own REST API (Leads module, v8) with a long-lived OAuth refresh
// token from a Zoho "Self Client", so nothing on the page talks to Zoho
// directly and no secret reaches the browser. Configure in Vercel:
//
//   ZOHO_CLIENT_ID       Self Client id      (api-console.zoho.<dc>)
//   ZOHO_CLIENT_SECRET   Self Client secret
//   ZOHO_REFRESH_TOKEN   from tools/zoho_refresh_token.mjs
//   ZOHO_DC              data centre of the Zoho account: com (default), eu,
//                        in, com.au, jp, ca, sa or com.cn
//   ZOHO_LEAD_SOURCE     optional: a value that already exists in the Lead
//                        Source picklist (e.g. "Website"); left unset, the
//                        source is written into the description instead
//
// The access token Zoho hands back lives an hour; it is cached for the life
// of the serverless instance and refreshed a minute before it expires.

export function zohoConfigured() {
  return Boolean(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_REFRESH_TOKEN);
}

function hosts() {
  const dc = (process.env.ZOHO_DC || 'com').replace(/^\.+/, '');
  return { accounts: 'https://accounts.zoho.' + dc, api: 'https://www.zohoapis.' + dc };
}

let cached = { token: null, until: 0 };
async function accessToken() {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const q = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token'
  });
  const res = await fetch(hosts().accounts + '/oauth/v2/token?' + q.toString(), { method: 'POST' });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) throw new Error('zoho-token: ' + (j.error || res.status));
  cached = { token: j.access_token, until: Date.now() + Math.max(60, (j.expires_in || 3600) - 60) * 1000 };
  return cached.token;
}

const SOURCE_LABEL = { contact: 'Contact page', drawer: 'Start Your Next Project panel', careers: 'Careers application', chat: 'Website chat assistant', website: 'Website form' };

// Map one form submission onto Zoho's standard Lead fields. Last_Name and
// Company are mandatory in Zoho's default Lead layout; the forms don't ask
// for a company, so that field says so rather than guessing one.
export function leadRecord(lead) {
  const parts = lead.name.split(/\s+/).filter(Boolean);
  const last = parts.pop();                       // a one-word name is the last name
  const first = parts.length ? parts.join(' ') : undefined;
  const where = SOURCE_LABEL[lead.source] || lead.source;
  const lines = [
    'Submitted from: ' + where,
    lead.role && 'Role applied for: ' + lead.role,
    lead.machine && 'Machine or software: ' + lead.machine,
    lead.files.length && 'Files named: ' + lead.files.join(', '),
    lead.message && '\n' + lead.message,
    '\nReceived ' + lead.submittedAt
  ].filter(Boolean);
  const rec = {
    Last_Name: last,
    Email: lead.email,
    Company: 'Not provided (website form)',
    Description: lines.join('\n')
  };
  if (first) rec.First_Name = first;
  if (process.env.ZOHO_LEAD_SOURCE) rec.Lead_Source = process.env.ZOHO_LEAD_SOURCE;
  return rec;
}

export async function createZohoLead(lead) {
  const token = await accessToken();
  const res = await fetch(hosts().api + '/crm/v8/Leads', {
    method: 'POST',
    headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' },
    // trigger: run the account's own workflow rules (e.g. an email alert to
    // the sales team) exactly as for a lead entered by hand.
    body: JSON.stringify({ data: [leadRecord(lead)], trigger: ['workflow', 'approval', 'blueprint'] })
  });
  const j = await res.json().catch(() => ({}));
  const row = j.data && j.data[0];
  if (!res.ok || !row || row.code !== 'SUCCESS') {
    throw new Error('zoho-lead: ' + ((row && (row.code + ' ' + JSON.stringify(row.details || {}))) || j.code || res.status));
  }
  return row.details && row.details.id;
}
