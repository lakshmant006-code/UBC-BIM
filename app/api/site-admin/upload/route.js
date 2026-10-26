import { getSession, sameOrigin } from '../../../../lib/admin/auth.js';
import { getStore } from '../../../../lib/admin/store.js';

const ALLOWED = { '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };
const MAX = 25 * 1024 * 1024;

// One file per request. Signed-in admin only; the file type is decided by
// its extension against a short allow-list, never trusted from the browser.
export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: 'origin' }, { status: 403 });
  if (!(await getSession())) return Response.json({ ok: false, reason: 'auth' }, { status: 401 });
  const store = getStore();
  if (!store) return Response.json({ ok: false, reason: 'no-store' }, { status: 503 });
  let form;
  try { form = await request.formData(); } catch { return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 }); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 });
  const name = String(file.name || '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+/, '');
  const ext = name.slice(name.lastIndexOf('.'));
  if (!ALLOWED[ext]) return Response.json({ ok: false, reason: 'type' }, { status: 415 });
  if (file.size > MAX) return Response.json({ ok: false, reason: 'size' }, { status: 413 });
  try {
    const path = await store.putFile(name, Buffer.from(await file.arrayBuffer()), ALLOWED[ext]);
    return Response.json({ ok: true, path });
  } catch (e) {
    console.error('admin upload error', e && e.message);
    return Response.json({ ok: false, reason: 'store-error' }, { status: 502 });
  }
}
