import { clearSessionCookie, sameOrigin } from '../../../../lib/admin/auth.js';

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  await clearSessionCookie();
  return Response.json({ ok: true });
}
