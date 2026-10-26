import { redirect } from 'next/navigation';
import { getSession, authConfigured } from '../../../lib/admin/auth.js';
import { LoginForm } from './LoginForm.jsx';

export default async function LoginPage() {
  if (await getSession()) redirect('/site-admin');
  return (
    <div className="adm-narrow">
      <p className="adm-eyebrow">Admin</p>
      <h1>Sign in</h1>
      <p className="adm-lede">For the UBC BIM team. Add and edit projects, blog posts and services.</p>
      {authConfigured() ? <LoginForm /> : (
        <div className="adm-note" role="status">
          <strong>Sign-in isn't set up yet.</strong>
          <p>Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET in the host's environment variables. Run <code>node tools/admin_hash_password.mjs</code> to make the last two. Until then nobody can sign in.</p>
        </div>
      )}
    </div>
  );
}
