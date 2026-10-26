import { getSession, sameOrigin } from '../../../../lib/admin/auth.js';
import { getStore } from '../../../../lib/admin/store.js';
import { TYPES, validateFields } from '../../../../lib/admin/schema.js';

// Save or delete one project, blog post or service. Signed-in admin only;
// answers 503 'no-store' until the company database is connected.
export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: 'origin' }, { status: 403 });
  if (!(await getSession())) return Response.json({ ok: false, reason: 'auth' }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 }); }
  const { action, type, id, fields } = body || {};
  if (!TYPES[type] || (action !== 'save' && action !== 'delete')) return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 });
  const store = getStore();
  if (!store) return Response.json({ ok: false, reason: 'no-store' }, { status: 503 });
  try {
    if (action === 'delete') {
      await store.remove(type, String(id));
      return Response.json({ ok: true });
    }
    const problems = validateFields(type, fields, id);
    if (problems.length) return Response.json({ ok: false, reason: 'invalid', problems }, { status: 400 });
    await store.save(type, id, { id, ...TYPES[type].toEntry(fields) });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('admin store error', e && e.message);
    return Response.json({ ok: false, reason: 'store-error' }, { status: 502 });
  }
}
