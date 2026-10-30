// Sends one lead to UBC's Zoho CRM through its Web-to-Lead form, from the
// server: the same public form the site's enquiry forms post to
// (ui_kits/website/zoho-config.js), so no Zoho API keys are needed.
import { ZOHO } from '../../../ui_kits/website/zoho-config.js';

export async function sendWebLead({ name, email, description }) {
  const body = new URLSearchParams({ ...ZOHO.hidden, [ZOHO.honeypot]: '', 'Last Name': name, Email: email, Description: description });
  const res = await fetch(ZOHO.action, { method: 'POST', body, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  // Zoho answers a an accepted form with its thank-you page (200) or a redirect.
  if (!(res.ok || (res.status >= 300 && res.status < 400))) throw new Error('zoho-weblead: ' + res.status);
}
