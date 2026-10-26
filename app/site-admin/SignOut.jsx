'use client';
import { useRouter } from 'next/navigation';

export function SignOut() {
  const router = useRouter();
  const out = async () => {
    await fetch('/api/site-admin/logout', { method: 'POST' });
    router.push('/site-admin/login');
    router.refresh();
  };
  return <button type="button" className="adm-linkbtn" onClick={out}>Sign out</button>;
}
