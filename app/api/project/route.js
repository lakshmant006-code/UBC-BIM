// Project intake ("Send Your Project →") and careers applications (source
// 'careers', from Careers.jsx). Forwards the form's fields to the
// Zoho CRM webhook named by PROJECT_WEBHOOK_URL. Until that variable is set
// in Vercel there is nowhere real to send a lead, so this answers 503 and
// the form says so plainly instead of pretending the enquiry was logged.
// Uploaded files are not forwarded: drawings and RVT/IFC models routinely
// exceed a serverless request body, so only their names travel with the
// lead until a file store is chosen.
export async function POST(request) {
  const target = process.env.PROJECT_WEBHOOK_URL;
  if (!target) {
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
    submittedAt: new Date().toISOString()
  };
  try {
    const res = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
    if (!res.ok) return Response.json({ ok: false, reason: 'upstream' }, { status: 502 });
  } catch {
    return Response.json({ ok: false, reason: 'upstream' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
