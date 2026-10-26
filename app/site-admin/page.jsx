import Link from 'next/link';
import { requireSession } from '../../lib/admin/auth.js';
import { TYPES, TYPE_KEYS } from '../../lib/admin/schema.js';
import { listEntries, storeConnected } from '../../lib/admin/store.js';
import { StoreNotice } from './StoreNotice.jsx';

export default async function AdminHome() {
  await requireSession();
  const counts = await Promise.all(TYPE_KEYS.map(async (k) => (await listEntries(k)).length));
  return (
    <>
      <p className="adm-eyebrow">Admin</p>
      <h1>What do you want to manage?</h1>
      <StoreNotice connected={storeConnected()} />
      <ul className="adm-grid">
        {TYPE_KEYS.map((k, i) => (
          <li key={k}>
            <Link href={'/site-admin/' + k} className="adm-card">
              <span className="adm-count">{counts[i]}</span>
              <span className="adm-card-title">{TYPES[k].label}</span>
              <span className="adm-card-sub">Add, edit or remove</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
