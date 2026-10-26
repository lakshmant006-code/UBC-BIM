/*
  Admin sign-in (server only). One admin account, set in the host's
  environment variables, never in the repository:

    ADMIN_EMAIL            the admin's email address
    ADMIN_PASSWORD_HASH    scrypt$<salt>$<hash>, made by
                           `node tools/admin_hash_password.mjs`
    ADMIN_SESSION_SECRET   a long random string (same tool prints one)

  With any of them missing, nobody can sign in: there is no default or
  fallback password. A successful sign-in sets a signed, HTTP-only,
  SameSite=Strict cookie that lasts eight hours. Every admin page and every
  /api/site-admin route checks it on the server.
*/
import { scryptSync, timingSafeEqual, createHmac, createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const COOKIE = 'ubc_admin';
const MAX_AGE = 60 * 60 * 8;

export function authConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

const digest = (s) => createHash('sha256').update(String(s)).digest();
const safeEqual = (a, b) => timingSafeEqual(digest(a), digest(b));

// Always runs the (slow) scrypt step, so a wrong email takes as long as a
// wrong password and the response doesn't reveal which one was wrong.
export function checkCredentials(email, password) {
  const [scheme, salt, hash] = String(process.env.ADMIN_PASSWORD_HASH || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  let derived;
  try { derived = scryptSync(String(password), Buffer.from(salt, 'hex'), 64); } catch { return false; }
  const stored = Buffer.from(hash, 'hex');
  const passOk = stored.length === derived.length && timingSafeEqual(stored, derived);
  const mailOk = safeEqual(String(email).trim().toLowerCase(), String(process.env.ADMIN_EMAIL).trim().toLowerCase());
  return passOk && mailOk;
}

const sign = (body) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(body).digest('base64url');

export function makeToken() {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000, n: randomBytes(8).toString('hex') })).toString('base64url');
  return body + '.' + sign(body);
}

export function tokenValid(token) {
  if (!authConfigured() || !token) return false;
  const [body, sig] = String(token).split('.');
  if (!body || !sig || !safeEqual(sig, sign(body))) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

export async function getSession() {
  const jar = await cookies();
  const c = jar.get(COOKIE);
  return tokenValid(c && c.value) ? { email: process.env.ADMIN_EMAIL } : null;
}

// For admin pages: send anyone not signed in to the login page.
export async function requireSession() {
  const s = await getSession();
  if (!s) redirect('/site-admin/login');
  return s;
}

export async function setSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE });
}
export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}

// State-changing requests must come from this site's own pages.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}

// Five wrong attempts per address per 15 minutes. Held in memory, so on a
// serverless host each instance counts separately: it slows guessing down,
// but the password hash and the long random secret are what protect the
// account.
const attempts = new Map();
export function rateLimited(ip) {
  const now = Date.now();
  const rec = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  attempts.set(ip, rec);
  return rec.length >= 5;
}
export function recordFailure(ip) { attempts.set(ip, [...(attempts.get(ip) || []), Date.now()]); }
export function clearFailures(ip) { attempts.delete(ip); }
export const clientIp = (request) => (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
