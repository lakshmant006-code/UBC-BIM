import { authConfigured, checkCredentials, setSessionCookie, sameOrigin, rateLimited, recordFailure, clearFailures, clientIp } from '../../../../lib/admin/auth.js';

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: 'origin' }, { status: 403 });
  if (!authConfigured()) return Response.json({ ok: false, reason: 'not-configured' }, { status: 503 });
  const ip = clientIp(request);
  if (rateLimited(ip)) return Response.json({ ok: false, reason: 'locked' }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 }); }
  if (!checkCredentials(body && body.email, body && body.password)) {
    recordFailure(ip);
    return Response.json({ ok: false, reason: 'invalid' }, { status: 401 });
  }
  clearFailures(ip);
  await setSessionCookie();
  return Response.json({ ok: true });
}
