import { zohoConfigured, createZohoLead } from './zoho.js';

// Project intake ("Start Your Next Project →", on Contact and in the slide-in
// panel) and careers applications (source 'careers', from Careers.jsx).
// Every submission becomes a Lead in Zoho CRM through its API (zoho.js, set
// up with the ZOHO_* variables in Vercel). PROJECT_WEBHOOK_URL is still
// honoured as an alternative (e.g. a Zoho Flow webhook). With neither set
// there is nowhere real to send a lead, so this answers 503 and the form says
// so plainly instead of pretending the enquiry was logged.
// Uploaded files are not forwarded: drawings and RVT/IFC models routinely
// exceed a serverless request body, so only their names travel with the
// lead until a file store is chosen.
export async function POST(request) {
  const target = process.env.PROJECT_WEBHOOK_URL;
  if (!zohoConfigured() && !target) {
    return Response.json({ ok: false, reason: 'not-configured' }, { status: 503 });
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 });
  }
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }
  const lead = {
    name,
    email,
    machine: String(form.get('machine') || ''),
    files: form.getAll('fileNames').map(String).slice(0, 50),
    source: String(form.get('source') || 'website'),
    // Careers applications (source 'careers') also carry the role applied
    // for and a short note; both are empty for project enquiries.
    role: String(form.get('role') || '').slice(0, 120),
    message: String(form.get('message') || '').slice(0, 4000),
    // Quote requests (source 'quote', the floating "Request Quote" button)
    // also carry the scope; every field is optional and empty elsewhere.
    company: String(form.get('company') || '').slice(0, 160),
    phone: String(form.get('phone') || '').slice(0, 40),
    buildingType: String(form.get('buildingType') || '').slice(0, 60),
    framing: String(form.get('framing') || '').slice(0, 60),
    services: form.getAll('services').map(String).slice(0, 20),
    size: String(form.get('size') || '').slice(0, 120),
    timeline: String(form.get('timeline') || '').slice(0, 60),
    submittedAt: new Date().toISOString()
  };
  if (zohoConfigured()) {
    try {
      await createZohoLead(lead);
    } catch (e) {
      console.error(e && e.message);
      return Response.json({ ok: false, reason: 'upstream' }, { status: 502 });
    }
    return Response.json({ ok: true });
  }
  try {
    const res = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
    if (!res.ok) return Response.json({ ok: false, reason: 'upstream' }, { status: 502 });
  } catch {
    return Response.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
