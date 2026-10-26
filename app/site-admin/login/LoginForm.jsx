'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/core/Button.jsx';
import { FormField } from '../../../components/forms/FormField.jsx';
import { Input } from '../../../components/forms/Input.jsx';

const MESSAGES = {
  invalid: 'That email and password do not match.',
  locked: 'Too many attempts. Try again in 15 minutes.',
  'not-configured': 'Sign-in is not set up on this site yet.',
  origin: 'The sign-in request was refused. Reload the page and try again.'
};

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/site-admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { router.push('/site-admin'); router.refresh(); return; }
      setError(MESSAGES[data.reason] || 'Sign-in failed. Try again.');
    } catch { setError('Could not reach the site. Check your connection and try again.'); }
    setBusy(false);
  };
  return (
    <form onSubmit={onSubmit} className="adm-form">
      <FormField label="Email" required htmlFor="adm-email"><Input id="adm-email" name="email" type="email" autoComplete="username" required /></FormField>
      <FormField label="Password" required htmlFor="adm-pass"><Input id="adm-pass" name="password" type="password" autoComplete="current-password" required /></FormField>
      {error && <p role="alert" className="adm-error">{error}</p>}
      <div><Button pill type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></div>
    </form>
  );
}
